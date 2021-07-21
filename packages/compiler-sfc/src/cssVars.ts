import {
  processExpression,
  createTransformContext,
  createSimpleExpression,
  createRoot,
  NodeTypes,
  SimpleExpressionNode,
  BindingMetadata
} from '@vue/compiler-dom'
import { SFCDescriptor } from './parse'
import { PluginCreator } from 'postcss'
import { isString } from '@vue/shared'
import hash from 'hash-sum'

export const CSS_VARS_HELPER = `useCssVars`
export const cssVarRE =
  /\bv-bind\(\s*(?:'([^']+)'|"([^"]+)"|([^'"][^)]*))\s*\)/g

export function genCssVarsFromList(
  vars: string[],
  id: string,
  isProd: boolean
): string {
  return `{\n  ${vars
    .map(key => `"${genVarName(id, key, isProd)}": (${key})`)
    .join(',\n  ')}\n}`
}

function genVarName(id: string, raw: string, isProd: boolean): string {
  if (isProd) {
    return hash(id + raw)
  } else {
    return `${id}-${raw.replace(/([^\w-])/g, '_')}`
  }
}

export function parseCssVars(sfc: SFCDescriptor): string[] {
  const vars: string[] = []
  sfc.styles.forEach(style => {
    let match
    while ((match = cssVarRE.exec(style.content))) {
      const variable = match[1] || match[2] || match[3]
      if (!vars.includes(variable)) {
        vars.push(variable)
      }
    }
  })
  return vars
}

// for compileStyle
export interface CssVarsPluginOptions {
  id: string
  isProd: boolean
}

export const cssVarsPlugin: PluginCreator<CssVarsPluginOptions> = opts => {
  const { id, isProd } = opts!
  return {
    postcssPlugin: 'vue-sfc-vars',
    Declaration(decl) {
      // rewrite CSS variables
      if (cssVarRE.test(decl.value)) {
        decl.value = decl.value.replace(cssVarRE, (_, $1, $2, $3) => {
          return `var(--${genVarName(id, $1 || $2 || $3, isProd)})`
        })
      }
    }
  }
}
cssVarsPlugin.postcss = true

export function genCssVarsCode(
  vars: string[],
  bindings: BindingMetadata,
  id: string,
  isProd: boolean
) {
  const varsExp = genCssVarsFromList(vars, id, isProd)
  const exp = createSimpleExpression(varsExp, false)
  const context = createTransformContext(createRoot([]), {
    prefixIdentifiers: true,
    inline: true,
    bindingMetadata: bindings.__isScriptSetup === false ? undefined : bindings
  })
  const transformed = processExpression(exp, context)
  const transformedString =
    transformed.type === NodeTypes.SIMPLE_EXPRESSION
      ? transformed.content
      : transformed.children
          .map(c => {
            return isString(c) ? c : (c as SimpleExpressionNode).content
          })
          .join('')

  return `_${CSS_VARS_HELPER}(_ctx => (${transformedString}))`
}

// <script setup> already gets the calls injected as part of the transform
// this is only for single normal <script>
export function genNormalScriptCssVarsCode(
  cssVars: string[],
  bindings: BindingMetadata,
  id: string,
  isProd: boolean
): string {
  return (
    `\nimport { ${CSS_VARS_HELPER} as _${CSS_VARS_HELPER} } from 'vue'\n` +
    `const __injectCSSVars__ = () => {\n${genCssVarsCode(
      cssVars,
      bindings,
      id,
      isProd
    )}}\n` +
    `const __setup__ = __default__.setup\n` +
    `__default__.setup = __setup__\n` +
    `  ? (props, ctx) => { __injectCSSVars__();return __setup__(props, ctx) }\n` +
    `  : __injectCSSVars__\n`
  )
}
