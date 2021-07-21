import MagicString from 'magic-string'
import {
  BindingMetadata,
  BindingTypes,
  locStub,
  UNREF
} from '@vue/compiler-core'
import {
  ScriptSetupTextRanges,
  SFCDescriptor,
  SFCScriptBlock,
  TextRange
} from './parse'
import { parse as _parse, ParserOptions, ParserPlugin } from '@babel/parser'
import {
  babelParserDefaultPlugins,
  generateCodeFrame,
  isString
} from '@vue/shared'
import {
  Node,
  Declaration,
  ObjectPattern,
  ObjectExpression,
  ArrayPattern,
  Identifier,
  ExportSpecifier,
  Function as FunctionNode,
  TSType,
  TSTypeLiteral,
  TSFunctionType,
  ObjectProperty,
  ArrayExpression,
  Statement,
  CallExpression,
  RestElement,
  TSInterfaceBody,
  AwaitExpression,
  VariableDeclarator,
  VariableDeclaration
} from '@babel/types'
import { walk } from 'estree-walker'
import { RawSourceMap } from 'source-map'
import {
  CSS_VARS_HELPER,
  genCssVarsCode,
  genNormalScriptCssVarsCode
} from './cssVars'
import { compileTemplate, SFCTemplateCompileOptions } from './compileTemplate'
import { warnExperimental, warnOnce } from './warn'
import { rewriteDefault } from './rewriteDefault'

// Special compiler macros
const DEFINE_PROPS = 'defineProps'
const DEFINE_EMITS = 'defineEmits'
const DEFINE_EXPOSE = 'defineExpose'
const WITH_DEFAULTS = 'withDefaults'

const $REF = `$ref`
const $COMPUTED = `$computed`
const $FROM_REFS = `$fromRefs`
const $RAW = `$raw`

export interface SFCScriptCompileOptions {
  /**
   * Scope ID for prefixing injected CSS varialbes.
   * This must be consistent with the `id` passed to `compileStyle`.
   */
  id: string
  /**
   * Production mode. Used to determine whether to generate hashed CSS variables
   */
  isProd?: boolean
  /**
   * https://babeljs.io/docs/en/babel-parser#plugins
   */
  babelParserPlugins?: ParserPlugin[]
  /**
   * Enable ref: label sugar
   * https://github.com/vuejs/rfcs/pull/228
   * @default true
   */
  refSugar?: boolean
  /**
   * Compile the template and inline the resulting render function
   * directly inside setup().
   * - Only affects <script setup>
   * - This should only be used in production because it prevents the template
   * from being hot-reloaded separately from component state.
   */
  inlineTemplate?: boolean
  /**
   * Options for template compilation when inlining. Note these are options that
   * would normally be pased to `compiler-sfc`'s own `compileTemplate()`, not
   * options passed to `compiler-dom`.
   */
  templateOptions?: Partial<SFCTemplateCompileOptions>
  /**
   * Skip codegen and only return AST / binding / text range information.
   * Also makes the call error-tolerant.
   * Used for IDE support.
   */
  parseOnly?: boolean
}

interface ImportBinding {
  isType: boolean
  imported: string
  source: string
  rangeNode: Node
  isFromSetup: boolean
}

interface VariableBinding {
  type: BindingTypes
  rangeNode: Node
}

/**
 * Compile `<script setup>`
 * It requires the whole SFC descriptor because we need to handle and merge
 * normal `<script>` + `<script setup>` if both are present.
 */
export function compileScript(
  sfc: SFCDescriptor,
  options: SFCScriptCompileOptions
): SFCScriptBlock {
  let { script, scriptSetup, source, filename } = sfc
  // feature flags
  const enableRefSugar = !!options.refSugar
  const parseOnly = !!options.parseOnly

  if (parseOnly && !scriptSetup) {
    // in parse-only mode, construct a fake script setup so we still perform
    // the full parse logic.
    scriptSetup = {
      type: 'script',
      content: '',
      attrs: {},
      loc: locStub
    }
  }

  // for backwards compat
  if (!options) {
    options = { id: '' }
  }
  if (!options.id) {
    warnOnce(
      `compileScript now requires passing the \`id\` option.\n` +
        `Upgrade your vite or vue-loader version for compatibility with ` +
        `the latest experimental proposals.`
    )
  }

  const scopeId = options.id ? options.id.replace(/^data-v-/, '') : ''
  const cssVars = sfc.cssVars
  const scriptLang = script && script.lang
  const scriptSetupLang = scriptSetup && scriptSetup.lang
  const isTS =
    scriptLang === 'ts' ||
    scriptLang === 'tsx' ||
    scriptSetupLang === 'ts' ||
    scriptSetupLang === 'tsx'
  const plugins: ParserPlugin[] = [...babelParserDefaultPlugins]
  if (!isTS || scriptLang === 'tsx' || scriptSetupLang === 'tsx') {
    plugins.push('jsx')
  }
  if (options.babelParserPlugins) plugins.push(...options.babelParserPlugins)
  if (isTS) plugins.push('typescript', 'decorators-legacy')

  if (!scriptSetup) {
    if (!script) {
      throw new Error(`[@vue/compiler-sfc] SFC contains no <script> tags.`)
    }
    if (scriptLang && !isTS && scriptLang !== 'jsx') {
      // do not process non js/ts script blocks
      return script
    }
    try {
      const scriptAst = _parse(script.content, {
        plugins,
        sourceType: 'module',
        errorRecovery: parseOnly
      }).program.body
      const bindings = analyzeScriptBindings(scriptAst)
      let content = script.content
      if (cssVars.length) {
        content = rewriteDefault(content, `__default__`, plugins)
        if (cssVars.length) {
          content += genNormalScriptCssVarsCode(
            cssVars,
            bindings,
            scopeId,
            !!options.isProd
          )
        }
        content += `\nexport default __default__`
      }
      return {
        ...script,
        content,
        bindings,
        scriptAst
      }
    } catch (e) {
      // silently fallback if parse fails since user may be using custom
      // babel syntax
      return script
    }
  }

  if (script && scriptLang !== scriptSetupLang) {
    throw new Error(
      `[@vue/compiler-sfc] <script> and <script setup> must have the same ` +
        `language type.`
    )
  }

  if (scriptSetupLang && !isTS && scriptSetupLang !== 'jsx') {
    // do not process non js/ts script blocks
    return scriptSetup
  }

  // metadata that needs to be returned
  const bindingMetadata: BindingMetadata = {}
  const ranges: ScriptSetupTextRanges | undefined = parseOnly
    ? {
        scriptBindings: [],
        scriptSetupBindings: []
      }
    : undefined

  const defaultTempVar = `__default__`
  const helperImports: Set<string> = new Set()
  const userImports: Record<string, ImportBinding> = Object.create(null)
  const userImportAlias: Record<string, string> = Object.create(null)
  const setupBindings: Record<string, VariableBinding> = Object.create(null)
  const refBindings: Record<string, VariableBinding> = Object.create(null)
  const refIdentifiers: Set<Identifier> = new Set()
  let defaultExport: Node | undefined
  let hasDefinePropsCall = false
  let hasDefineEmitCall = false
  let hasDefineExposeCall = false
  let propsRuntimeDecl: Node | undefined
  let propsRuntimeDefaults: Node | undefined
  let propsTypeDecl: TSTypeLiteral | TSInterfaceBody | undefined
  let propsTypeDeclRaw: Node | undefined
  let propsIdentifier: string | undefined
  let emitsRuntimeDecl: Node | undefined
  let emitsTypeDecl:
    | TSFunctionType
    | TSTypeLiteral
    | TSInterfaceBody
    | undefined
  let emitsTypeDeclRaw: Node | undefined
  let emitIdentifier: string | undefined
  let hasAwait = false
  let hasInlinedSsrRenderFn = false
  // props/emits declared via types
  const typeDeclaredProps: Record<string, PropTypeData> = {}
  const typeDeclaredEmits: Set<string> = new Set()
  // record declared types for runtime props type generation
  const declaredTypes: Record<string, string[]> = {}

  // magic-string state
  const s = new MagicString(source)
  const startOffset = scriptSetup.loc.start.offset
  const endOffset = scriptSetup.loc.end.offset
  const scriptStartOffset = script && script.loc.start.offset
  const scriptEndOffset = script && script.loc.end.offset

  function helper(key: string): string {
    helperImports.add(key)
    return `_${key}`
  }

  function parse(
    input: string,
    options: ParserOptions,
    offset: number
  ): Statement[] {
    try {
      options.errorRecovery = parseOnly
      return _parse(input, options).program.body
    } catch (e) {
      e.message = `[@vue/compiler-sfc] ${e.message}\n\n${
        sfc.filename
      }\n${generateCodeFrame(source, e.pos + offset, e.pos + offset + 1)}`
      throw e
    }
  }

  function error(
    msg: string,
    node: Node,
    end: number = node.end! + startOffset
  ): never {
    throw new Error(
      `[@vue/compiler-sfc] ${msg}\n\n${sfc.filename}\n${generateCodeFrame(
        source,
        node.start! + startOffset,
        end
      )}`
    )
  }

  function registerUserImport(
    source: string,
    local: string,
    imported: string | false,
    isType: boolean,
    isFromSetup: boolean,
    rangeNode: Node
  ) {
    if (source === 'vue' && imported) {
      userImportAlias[imported] = local
    }
    userImports[local] = {
      isType,
      imported: imported || 'default',
      source,
      rangeNode,
      isFromSetup
    }
  }

  function processDefineProps(node: Node): boolean {
    if (!isCallOf(node, DEFINE_PROPS)) {
      return false
    }

    if (hasDefinePropsCall) {
      error(`duplicate ${DEFINE_PROPS}() call`, node)
    }
    hasDefinePropsCall = true

    propsRuntimeDecl = node.arguments[0]

    // call has type parameters - infer runtime types from it
    if (node.typeParameters) {
      if (propsRuntimeDecl) {
        error(
          `${DEFINE_PROPS}() cannot accept both type and non-type arguments ` +
            `at the same time. Use one or the other.`,
          node
        )
      }

      propsTypeDeclRaw = node.typeParameters.params[0]
      propsTypeDecl = resolveQualifiedType(
        propsTypeDeclRaw,
        node => node.type === 'TSTypeLiteral'
      ) as TSTypeLiteral | TSInterfaceBody | undefined

      if (!propsTypeDecl) {
        error(
          `type argument passed to ${DEFINE_PROPS}() must be a literal type, ` +
            `or a reference to an interface or literal type.`,
          propsTypeDeclRaw
        )
      }
    }

    return true
  }

  function processWithDefaults(node: Node): boolean {
    if (!isCallOf(node, WITH_DEFAULTS)) {
      return false
    }
    if (processDefineProps(node.arguments[0])) {
      if (propsRuntimeDecl) {
        error(
          `${WITH_DEFAULTS} can only be used with type-based ` +
            `${DEFINE_PROPS} declaration.`,
          node
        )
      }
      propsRuntimeDefaults = node.arguments[1]
    } else {
      error(
        `${WITH_DEFAULTS}' first argument must be a ${DEFINE_PROPS} call.`,
        node.arguments[0] || node
      )
    }
    return true
  }

  function processDefineEmits(node: Node): boolean {
    if (!isCallOf(node, DEFINE_EMITS)) {
      return false
    }
    if (hasDefineEmitCall) {
      error(`duplicate ${DEFINE_EMITS}() call`, node)
    }
    hasDefineEmitCall = true
    emitsRuntimeDecl = node.arguments[0]
    if (node.typeParameters) {
      if (emitsRuntimeDecl) {
        error(
          `${DEFINE_EMITS}() cannot accept both type and non-type arguments ` +
            `at the same time. Use one or the other.`,
          node
        )
      }

      emitsTypeDeclRaw = node.typeParameters.params[0]
      emitsTypeDecl = resolveQualifiedType(
        emitsTypeDeclRaw,
        node => node.type === 'TSFunctionType' || node.type === 'TSTypeLiteral'
      ) as TSFunctionType | TSTypeLiteral | TSInterfaceBody | undefined

      if (!emitsTypeDecl) {
        error(
          `type argument passed to ${DEFINE_EMITS}() must be a function type, ` +
            `a literal type with call signatures, or a reference to the above types.`,
          emitsTypeDeclRaw
        )
      }
    }
    return true
  }

  function resolveQualifiedType(
    node: Node,
    qualifier: (node: Node) => boolean
  ) {
    if (qualifier(node)) {
      return node
    }
    if (
      node.type === 'TSTypeReference' &&
      node.typeName.type === 'Identifier'
    ) {
      const refName = node.typeName.name
      const isQualifiedType = (node: Node): Node | undefined => {
        if (
          node.type === 'TSInterfaceDeclaration' &&
          node.id.name === refName
        ) {
          return node.body
        } else if (
          node.type === 'TSTypeAliasDeclaration' &&
          node.id.name === refName &&
          qualifier(node.typeAnnotation)
        ) {
          return node.typeAnnotation
        } else if (node.type === 'ExportNamedDeclaration' && node.declaration) {
          return isQualifiedType(node.declaration)
        }
      }

      for (const node of scriptSetupAst) {
        const qualified = isQualifiedType(node)
        if (qualified) {
          return qualified
        }
      }
    }
  }

  function processDefineExpose(node: Node): boolean {
    if (isCallOf(node, DEFINE_EXPOSE)) {
      if (hasDefineExposeCall) {
        error(`duplicate ${DEFINE_EXPOSE}() call`, node)
      }
      hasDefineExposeCall = true
      return true
    }
    return false
  }

  function checkInvalidScopeReference(node: Node | undefined, method: string) {
    if (!node) return
    walkIdentifiers(node, id => {
      if (setupBindings[id.name]) {
        error(
          `\`${method}()\` in <script setup> cannot reference locally ` +
            `declared variables because it will be hoisted outside of the ` +
            `setup() function. If your component options requires initialization ` +
            `in the module scope, use a separate normal <script> to export ` +
            `the options instead.`,
          id
        )
      }
    })
  }

  /**
   * await foo()
   * -->
   * (([__temp, __restore] = withAsyncContext(() => foo())),__temp=await __temp,__restore(),__temp)
   */
  function processAwait(node: AwaitExpression, isStatement: boolean) {
    s.overwrite(
      node.start! + startOffset,
      node.argument.start! + startOffset,
      `${isStatement ? `;` : ``}(([__temp,__restore]=${helper(
        `withAsyncContext`
      )}(()=>(`
    )
    s.appendLeft(
      node.end! + startOffset,
      `))),__temp=await __temp,__restore()${isStatement ? `` : `,__temp`})`
    )
  }

  function isRefSugarCall(callee: string) {
    return callee === $REF || callee === $COMPUTED || callee === $FROM_REFS
  }

  function processRefSugar(
    decl: VariableDeclarator,
    statement: VariableDeclaration
  ) {
    if (!isCallOf(decl.init, isRefSugarCall)) {
      return
    }

    if (!enableRefSugar) {
      error(
        `ref sugar is an experimental proposal and must be explicitly ` +
          `enabled via @vue/compiler-sfc options.`,
        // TODO link to RFC details
        decl.init
      )
    } else {
      warnExperimental(`ref sugar`, 0 /* TODO */)
    }

    const callee = (decl.init.callee as Identifier).name
    const start = decl.init.start! + startOffset
    if (callee === $REF) {
      if (statement.kind !== 'let') {
        error(`${$REF}() bindings can only be declared with let.`, decl)
      }
      if (decl.id.type !== 'Identifier') {
        error(
          `${$REF}() bindings cannot be used with destructuring. ` +
            `If you are trying to destructure from an object of refs, ` +
            `use \`let { x } = $fromRefs(obj)\`.`,
          decl.id
        )
      }
      registerRefBinding(decl.id)
      s.overwrite(start, start + $REF.length, helper('ref'))
    } else if (callee === $COMPUTED) {
      if (decl.id.type !== 'Identifier') {
        error(
          `${$COMPUTED}() bindings cannot be used with destructuring.`,
          decl.id
        )
      }
      registerRefBinding(decl.id)
      s.overwrite(start, start + $COMPUTED.length, helper('computed'))
    } else if (callee === $FROM_REFS) {
      if (!decl.id.type.endsWith('Pattern')) {
        error(
          `${$FROM_REFS}() declaration must be used with destructure patterns.`,
          decl
        )
      }
      if (decl.id.type === 'ObjectPattern') {
        processRefObjectPattern(decl.id, statement)
      } else if (decl.id.type === 'ArrayPattern') {
        processRefArrayPattern(decl.id, statement)
      }
      s.remove(start, start + callee.length)
    }
  }

  function registerRefBinding(id: Identifier) {
    if (id.name[0] === '$') {
      error(`ref variable identifiers cannot start with $.`, id)
    }
    refBindings[id.name] = setupBindings[id.name] = {
      type: BindingTypes.SETUP_REF,
      rangeNode: id
    }
    refIdentifiers.add(id)
  }

  function processRefObjectPattern(
    pattern: ObjectPattern,
    statement: VariableDeclaration
  ) {
    for (const p of pattern.properties) {
      let nameId: Identifier | undefined
      if (p.type === 'ObjectProperty') {
        if (p.key.start! === p.value.start!) {
          // shorthand { foo } --> { foo: __foo }
          nameId = p.key as Identifier
          s.appendLeft(nameId.end! + startOffset, `: __${nameId.name}`)
          if (p.value.type === 'AssignmentPattern') {
            // { foo = 1 }
            refIdentifiers.add(p.value.left as Identifier)
          }
        } else {
          if (p.value.type === 'Identifier') {
            // { foo: bar } --> { foo: __bar }
            nameId = p.value
            s.prependRight(nameId.start! + startOffset, `__`)
          } else if (p.value.type === 'ObjectPattern') {
            processRefObjectPattern(p.value, statement)
          } else if (p.value.type === 'ArrayPattern') {
            processRefArrayPattern(p.value, statement)
          } else if (p.value.type === 'AssignmentPattern') {
            // { foo: bar = 1 } --> { foo: __bar = 1 }
            nameId = p.value.left as Identifier
            s.prependRight(nameId.start! + startOffset, `__`)
          }
        }
      } else {
        // rest element { ...foo } --> { ...__foo }
        nameId = p.argument as Identifier
        s.prependRight(nameId.start! + startOffset, `__`)
      }
      if (nameId) {
        registerRefBinding(nameId)
        // append binding declarations after the parent statement
        s.appendLeft(
          statement.end! + startOffset,
          `\nconst ${nameId.name} = ${helper('ref')}(__${nameId.name});`
        )
      }
    }
  }

  function processRefArrayPattern(
    pattern: ArrayPattern,
    statement: VariableDeclaration
  ) {
    for (const e of pattern.elements) {
      if (!e) continue
      let nameId: Identifier | undefined
      if (e.type === 'Identifier') {
        // [a] --> [__a]
        nameId = e
      } else if (e.type === 'AssignmentPattern') {
        // [a = 1] --> [__a = 1]
        nameId = e.left as Identifier
      } else if (e.type === 'RestElement') {
        // [...a] --> [...__a]
        nameId = e.argument as Identifier
      } else if (e.type === 'ObjectPattern') {
        processRefObjectPattern(e, statement)
      } else if (e.type === 'ArrayPattern') {
        processRefArrayPattern(e, statement)
      }
      if (nameId) {
        registerRefBinding(nameId)
        // prefix original
        s.prependRight(nameId.start! + startOffset, `__`)
        // append binding declarations after the parent statement
        s.appendLeft(
          statement.end! + startOffset,
          `\nconst ${nameId.name} = ${helper('ref')}(__${nameId.name});`
        )
      }
    }
  }

  function genRuntimeProps(props: Record<string, PropTypeData>) {
    const keys = Object.keys(props)
    if (!keys.length) {
      return ``
    }

    // check defaults. If the default object is an object literal with only
    // static properties, we can directly generate more optimzied default
    // decalrations. Otherwise we will have to fallback to runtime merging.
    const hasStaticDefaults =
      propsRuntimeDefaults &&
      propsRuntimeDefaults.type === 'ObjectExpression' &&
      propsRuntimeDefaults.properties.every(
        node => node.type === 'ObjectProperty' && !node.computed
      )

    let propsDecls = `{
    ${keys
      .map(key => {
        let defaultString: string | undefined
        if (hasStaticDefaults) {
          const prop = (
            propsRuntimeDefaults as ObjectExpression
          ).properties.find(
            (node: any) => node.key.name === key
          ) as ObjectProperty
          if (prop) {
            // prop has corresponding static default value
            defaultString = `default: ${source.slice(
              prop.value.start! + startOffset,
              prop.value.end! + startOffset
            )}`
          }
        }

        if (__DEV__) {
          const { type, required } = props[key]
          return `${key}: { type: ${toRuntimeTypeString(
            type
          )}, required: ${required}${
            defaultString ? `, ${defaultString}` : ``
          } }`
        } else {
          // production: checks are useless
          return `${key}: ${defaultString ? `{ ${defaultString} }` : 'null'}`
        }
      })
      .join(',\n    ')}\n  }`

    if (propsRuntimeDefaults && !hasStaticDefaults) {
      propsDecls = `${helper('mergeDefaults')}(${propsDecls}, ${source.slice(
        propsRuntimeDefaults.start! + startOffset,
        propsRuntimeDefaults.end! + startOffset
      )})`
    }

    return `\n  props: ${propsDecls} as unknown as undefined,`
  }

  // 1. process normal <script> first if it exists
  let scriptAst
  if (script) {
    // import dedupe between <script> and <script setup>
    scriptAst = parse(
      script.content,
      {
        plugins,
        sourceType: 'module'
      },
      scriptStartOffset!
    )

    for (const node of scriptAst) {
      if (node.type === 'ImportDeclaration') {
        // record imports for dedupe
        for (const specifier of node.specifiers) {
          const imported =
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.type === 'Identifier' &&
            specifier.imported.name
          registerUserImport(
            node.source.value,
            specifier.local.name,
            imported,
            node.importKind === 'type',
            false,
            specifier.local
          )
        }
      } else if (node.type === 'ExportDefaultDeclaration') {
        // export default
        defaultExport = node
        const start = node.start! + scriptStartOffset!
        s.overwrite(
          start,
          start + `export default`.length,
          `const ${defaultTempVar} =`
        )
      } else if (node.type === 'ExportNamedDeclaration' && node.specifiers) {
        const defaultSpecifier = node.specifiers.find(
          s => s.exported.type === 'Identifier' && s.exported.name === 'default'
        ) as ExportSpecifier
        if (defaultSpecifier) {
          defaultExport = node
          // 1. remove specifier
          if (node.specifiers.length > 1) {
            s.remove(
              defaultSpecifier.start! + scriptStartOffset!,
              defaultSpecifier.end! + scriptStartOffset!
            )
          } else {
            s.remove(
              node.start! + scriptStartOffset!,
              node.end! + scriptStartOffset!
            )
          }
          if (node.source) {
            // export { x as default } from './x'
            // rewrite to `import { x as __default__ } from './x'` and
            // add to top
            s.prepend(
              `import { ${defaultSpecifier.local.name} as ${defaultTempVar} } from '${node.source.value}'\n`
            )
          } else {
            // export { x as default }
            // rewrite to `const __default__ = x` and move to end
            s.append(
              `\nconst ${defaultTempVar} = ${defaultSpecifier.local.name}\n`
            )
          }
        }
      }
    }
  }

  // 2. parse <script setup> and  walk over top level statements
  const scriptSetupAst = parse(
    scriptSetup.content,
    {
      plugins: [
        ...plugins,
        // allow top level await but only inside <script setup>
        'topLevelAwait'
      ],
      sourceType: 'module'
    },
    startOffset
  )

  for (const node of scriptSetupAst) {
    const start = node.start! + startOffset
    let end = node.end! + startOffset
    // locate comment
    if (node.trailingComments && node.trailingComments.length > 0) {
      const lastCommentNode =
        node.trailingComments[node.trailingComments.length - 1]
      end = lastCommentNode.end + startOffset
    }
    // locate the end of whitespace between this statement and the next
    while (end <= source.length) {
      if (!/\s/.test(source.charAt(end))) {
        break
      }
      end++
    }

    // (Dropped) `ref: x` bindings
    if (
      node.type === 'LabeledStatement' &&
      node.label.name === 'ref' &&
      node.body.type === 'ExpressionStatement'
    ) {
      error(
        `ref sugar using the label syntax was an experimental proposal and ` +
          `has been dropped based on community feedback.`,
        // TODO + ` Please check out the adjusted proposal at ...`,
        node
      )
    }

    if (node.type === 'ImportDeclaration') {
      // import declarations are moved to top
      s.move(start, end, 0)

      // dedupe imports
      let removed = 0
      const removeSpecifier = (i: number) => {
        const removeLeft = i > removed
        removed++
        const current = node.specifiers[i]
        const next = node.specifiers[i + 1]
        s.remove(
          removeLeft
            ? node.specifiers[i - 1].end! + startOffset
            : current.start! + startOffset,
          next && !removeLeft
            ? next.start! + startOffset
            : current.end! + startOffset
        )
      }

      for (let i = 0; i < node.specifiers.length; i++) {
        const specifier = node.specifiers[i]
        const local = specifier.local.name
        const imported =
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.type === 'Identifier' &&
          specifier.imported.name
        const source = node.source.value
        const existing = userImports[local]
        if (
          source === 'vue' &&
          (imported === DEFINE_PROPS ||
            imported === DEFINE_EMITS ||
            imported === DEFINE_EXPOSE)
        ) {
          warnOnce(
            `\`${imported}\` is a compiler macro and no longer needs to be imported.`
          )
          removeSpecifier(i)
        } else if (existing) {
          if (existing.source === source && existing.imported === imported) {
            // already imported in <script setup>, dedupe
            removeSpecifier(i)
          } else {
            error(`different imports aliased to same local name.`, specifier)
          }
        } else {
          registerUserImport(
            source,
            local,
            imported,
            node.importKind === 'type',
            true,
            specifier.local
          )
        }
      }
      if (node.specifiers.length && removed === node.specifiers.length) {
        s.remove(node.start! + startOffset, node.end! + startOffset)
      }
    }

    if (node.type === 'ExpressionStatement') {
      // process `defineProps` and `defineEmit(s)` calls
      if (
        processDefineProps(node.expression) ||
        processDefineEmits(node.expression) ||
        processWithDefaults(node.expression)
      ) {
        s.remove(node.start! + startOffset, node.end! + startOffset)
      } else if (processDefineExpose(node.expression)) {
        // defineExpose({}) -> expose({})
        const callee = (node.expression as CallExpression).callee
        s.overwrite(
          callee.start! + startOffset,
          callee.end! + startOffset,
          'expose'
        )
      }
    }

    if (node.type === 'VariableDeclaration' && !node.declare) {
      const total = node.declarations.length
      let left = total
      for (let i = 0; i < total; i++) {
        const decl = node.declarations[i]
        if (decl.init) {
          // defineProps / defineEmits
          const isDefineProps =
            processDefineProps(decl.init) || processWithDefaults(decl.init)
          if (isDefineProps) {
            propsIdentifier = scriptSetup.content.slice(
              decl.id.start!,
              decl.id.end!
            )
          }
          const isDefineEmits = processDefineEmits(decl.init)
          if (isDefineEmits) {
            emitIdentifier = scriptSetup.content.slice(
              decl.id.start!,
              decl.id.end!
            )
          }
          if (isDefineProps || isDefineEmits) {
            if (left === 1) {
              s.remove(node.start! + startOffset, node.end! + startOffset)
            } else {
              let start = decl.start! + startOffset
              let end = decl.end! + startOffset
              if (i < total - 1) {
                // not the last one, locate the start of the next
                end = node.declarations[i + 1].start! + startOffset
              } else {
                // last one, locate the end of the prev
                start = node.declarations[i - 1].end! + startOffset
              }
              s.remove(start, end)
              left--
            }
          } else {
            processRefSugar(decl, node)
          }
        }
      }
    }

    // walk decalrations to record declared bindings
    if (
      (node.type === 'VariableDeclaration' ||
        node.type === 'FunctionDeclaration' ||
        node.type === 'ClassDeclaration') &&
      !node.declare
    ) {
      walkDeclaration(node, setupBindings, userImportAlias)
    }

    // walk statements & named exports / variable declarations for top level
    // await
    if (
      (node.type === 'VariableDeclaration' && !node.declare) ||
      node.type.endsWith('Statement')
    ) {
      ;(walk as any)(node, {
        enter(child: Node, parent: Node) {
          if (isFunction(child)) {
            this.skip()
          }
          if (child.type === 'AwaitExpression') {
            hasAwait = true
            processAwait(child, parent.type === 'ExpressionStatement')
          }
        }
      })
    }

    if (
      (node.type === 'ExportNamedDeclaration' && node.exportKind !== 'type') ||
      node.type === 'ExportAllDeclaration' ||
      node.type === 'ExportDefaultDeclaration'
    ) {
      error(
        `<script setup> cannot contain ES module exports. ` +
          `If you are using a previous version of <script setup>, please ` +
          `consult the updated RFC at https://github.com/vuejs/rfcs/pull/227.`,
        node
      )
    }

    if (isTS) {
      // runtime enum
      if (node.type === 'TSEnumDeclaration') {
        registerBinding(setupBindings, node.id, BindingTypes.SETUP_CONST)
      }

      // move all Type declarations to outer scope
      if (
        node.type.startsWith('TS') ||
        (node.type === 'ExportNamedDeclaration' &&
          node.exportKind === 'type') ||
        (node.type === 'VariableDeclaration' && node.declare)
      ) {
        recordType(node, declaredTypes)
        s.move(start, end, 0)
      }
    }
  }

  // in parse only mode, we should have collected all the information we need,
  // return early.
  if (parseOnly) {
    for (const key in userImports) {
      const { rangeNode, isFromSetup } = userImports[key]
      const bindings = isFromSetup
        ? ranges!.scriptSetupBindings
        : ranges!.scriptBindings
      bindings.push(toTextRange(rangeNode))
    }
    for (const key in setupBindings) {
      ranges!.scriptSetupBindings.push(
        toTextRange(setupBindings[key].rangeNode)
      )
    }
    if (propsRuntimeDecl) {
      ranges!.propsRuntimeArg = toTextRange(propsRuntimeDecl)
    }
    if (propsTypeDeclRaw) {
      ranges!.propsTypeArg = toTextRange(propsTypeDeclRaw)
    }
    if (emitsRuntimeDecl) {
      ranges!.emitsRuntimeArg = toTextRange(emitsRuntimeDecl)
    }
    if (emitsTypeDeclRaw) {
      ranges!.emitsTypeArg = toTextRange(emitsTypeDeclRaw)
    }
    if (propsRuntimeDefaults) {
      ranges!.withDefaultsArg = toTextRange(propsRuntimeDefaults)
    }
    return {
      ...scriptSetup,
      ranges,
      scriptAst,
      scriptSetupAst
    }
  }

  // 3. Do a full walk to rewrite identifiers referencing let exports with ref
  // value access
  if (enableRefSugar && Object.keys(refBindings).length) {
    const onIdent = (id: Identifier, parent: Node, parentStack: Node[]) => {
      if (refBindings[id.name] && !refIdentifiers.has(id)) {
        if (isStaticProperty(parent) && parent.shorthand) {
          // let binding used in a property shorthand
          // { foo } -> { foo: foo.value }
          // skip for destructure patterns
          if (
            !(parent as any).inPattern ||
            isInDestructureAssignment(parent, parentStack)
          ) {
            s.appendLeft(id.end! + startOffset, `: ${id.name}.value`)
          }
        } else {
          s.appendLeft(id.end! + startOffset, '.value')
        }
      }
    }

    const onNode = (node: Node) => {
      if (isCallOf(node, $RAW)) {
        s.remove(
          node.callee.start! + startOffset,
          node.callee.end! + startOffset
        )
        return false // skip walk
      }
    }

    for (const node of scriptSetupAst) {
      if (node.type !== 'ImportDeclaration') {
        walkIdentifiers(node, onIdent, onNode)
      }
    }
  }

  // 4. extract runtime props/emits code from setup context type
  if (propsTypeDecl) {
    extractRuntimeProps(propsTypeDecl, typeDeclaredProps, declaredTypes)
  }
  if (emitsTypeDecl) {
    extractRuntimeEmits(emitsTypeDecl, typeDeclaredEmits)
  }

  // 5. check useOptions args to make sure it doesn't reference setup scope
  // variables
  checkInvalidScopeReference(propsRuntimeDecl, DEFINE_PROPS)
  checkInvalidScopeReference(propsRuntimeDefaults, DEFINE_PROPS)
  checkInvalidScopeReference(emitsRuntimeDecl, DEFINE_PROPS)

  // 6. remove non-script content
  if (script) {
    if (startOffset < scriptStartOffset!) {
      // <script setup> before <script>
      s.remove(0, startOffset)
      s.remove(endOffset, scriptStartOffset!)
      s.remove(scriptEndOffset!, source.length)
    } else {
      // <script> before <script setup>
      s.remove(0, scriptStartOffset!)
      s.remove(scriptEndOffset!, startOffset)
      s.remove(endOffset, source.length)
    }
  } else {
    // only <script setup>
    s.remove(0, startOffset)
    s.remove(endOffset, source.length)
  }

  // 7. analyze binding metadata
  if (scriptAst) {
    Object.assign(bindingMetadata, analyzeScriptBindings(scriptAst))
  }
  if (propsRuntimeDecl) {
    for (const key of getObjectOrArrayExpressionKeys(propsRuntimeDecl)) {
      bindingMetadata[key] = BindingTypes.PROPS
    }
  }
  for (const key in typeDeclaredProps) {
    bindingMetadata[key] = BindingTypes.PROPS
  }
  for (const [key, { isType, imported, source }] of Object.entries(
    userImports
  )) {
    if (isType) continue
    bindingMetadata[key] =
      (imported === 'default' && source.endsWith('.vue')) || source === 'vue'
        ? BindingTypes.SETUP_CONST
        : BindingTypes.SETUP_MAYBE_REF
  }
  for (const key in setupBindings) {
    bindingMetadata[key] = setupBindings[key].type
  }
  // known ref bindings
  for (const key in refBindings) {
    bindingMetadata[key] = BindingTypes.SETUP_REF
  }

  // 8. inject `useCssVars` calls
  if (cssVars.length) {
    helperImports.add(CSS_VARS_HELPER)
    helperImports.add('unref')
    s.prependRight(
      startOffset,
      `\n${genCssVarsCode(
        cssVars,
        bindingMetadata,
        scopeId,
        !!options.isProd
      )}\n`
    )
  }

  // 9. finalize setup() argument signature
  let args = `__props`
  if (propsTypeDecl) {
    args += `: ${scriptSetup.content.slice(
      propsTypeDecl.start!,
      propsTypeDecl.end!
    )}`
  }
  // inject user assignment of props
  // we use a default __props so that template expressions referencing props
  // can use it directly
  if (propsIdentifier) {
    s.prependRight(startOffset, `\nconst ${propsIdentifier} = __props`)
  }
  // inject temp variables for async context preservation
  if (hasAwait) {
    const any = isTS ? `:any` : ``
    s.prependRight(startOffset, `\nlet __temp${any}, __restore${any}\n`)
  }

  const destructureElements =
    hasDefineExposeCall || !options.inlineTemplate ? [`expose`] : []
  if (emitIdentifier) {
    destructureElements.push(
      emitIdentifier === `emit` ? `emit` : `emit: ${emitIdentifier}`
    )
  }
  if (destructureElements.length) {
    args += `, { ${destructureElements.join(', ')} }`
    if (emitsTypeDecl) {
      args += `: { emit: (${scriptSetup.content.slice(
        emitsTypeDecl.start!,
        emitsTypeDecl.end!
      )}), expose: any, slots: any, attrs: any }`
    }
  }

  // 10. generate return statement
  let returned
  if (options.inlineTemplate) {
    if (sfc.template && !sfc.template.src) {
      if (options.templateOptions && options.templateOptions.ssr) {
        hasInlinedSsrRenderFn = true
      }
      // inline render function mode - we are going to compile the template and
      // inline it right here
      const { code, ast, preamble, tips, errors } = compileTemplate({
        filename,
        source: sfc.template.content,
        inMap: sfc.template.map,
        ...options.templateOptions,
        id: scopeId,
        scoped: sfc.styles.some(s => s.scoped),
        isProd: options.isProd,
        ssrCssVars: sfc.cssVars,
        compilerOptions: {
          ...(options.templateOptions &&
            options.templateOptions.compilerOptions),
          inline: true,
          isTS,
          bindingMetadata
        }
      })
      if (tips.length) {
        tips.forEach(warnOnce)
      }
      const err = errors[0]
      if (isString(err)) {
        throw new Error(err)
      } else if (err) {
        if (err.loc) {
          err.message +=
            `\n\n` +
            sfc.filename +
            '\n' +
            generateCodeFrame(
              source,
              err.loc.start.offset,
              err.loc.end.offset
            ) +
            `\n`
        }
        throw err
      }
      if (preamble) {
        s.prepend(preamble)
      }
      // avoid duplicated unref import
      // as this may get injected by the render function preamble OR the
      // css vars codegen
      if (ast && ast.helpers.includes(UNREF)) {
        helperImports.delete('unref')
      }
      returned = code
    } else {
      returned = `() => {}`
    }
  } else {
    // return bindings from setup
    const allBindings: Record<string, any> = { ...setupBindings }
    for (const key in userImports) {
      if (!userImports[key].isType) {
        allBindings[key] = true
      }
    }
    returned = `{ ${Object.keys(allBindings).join(', ')} }`
  }

  if (!options.inlineTemplate && !__TEST__) {
    // in non-inline mode, the `__isScriptSetup: true` flag is used by
    // componentPublicInstance proxy to allow properties that start with $ or _
    s.appendRight(
      endOffset,
      `\nconst __returned__ = ${returned}\n` +
        `Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })\n` +
        `return __returned__` +
        `\n}\n\n`
    )
  } else {
    s.appendRight(endOffset, `\nreturn ${returned}\n}\n\n`)
  }

  // 11. finalize default export
  let runtimeOptions = ``
  if (hasInlinedSsrRenderFn) {
    runtimeOptions += `\n  __ssrInlineRender: true,`
  }
  if (propsRuntimeDecl) {
    runtimeOptions += `\n  props: ${scriptSetup.content
      .slice(propsRuntimeDecl.start!, propsRuntimeDecl.end!)
      .trim()},`
  } else if (propsTypeDecl) {
    runtimeOptions += genRuntimeProps(typeDeclaredProps)
  }
  if (emitsRuntimeDecl) {
    runtimeOptions += `\n  emits: ${scriptSetup.content
      .slice(emitsRuntimeDecl.start!, emitsRuntimeDecl.end!)
      .trim()},`
  } else if (emitsTypeDecl) {
    runtimeOptions += genRuntimeEmits(typeDeclaredEmits)
  }

  // <script setup> components are closed by default. If the user did not
  // explicitly call `defineExpose`, call expose() with no args.
  const exposeCall =
    hasDefineExposeCall || options.inlineTemplate ? `` : `  expose()\n`
  if (isTS) {
    // for TS, make sure the exported type is still valid type with
    // correct props information
    // we have to use object spread for types to be merged properly
    // user's TS setting should compile it down to proper targets
    const def = defaultExport ? `\n  ...${defaultTempVar},` : ``
    // wrap setup code with function.
    // export the content of <script setup> as a named export, `setup`.
    // this allows `import { setup } from '*.vue'` for testing purposes.
    s.prependLeft(
      startOffset,
      `\nexport default ${helper(
        `defineComponent`
      )}({${def}${runtimeOptions}\n  ${
        hasAwait ? `async ` : ``
      }setup(${args}) {\n${exposeCall}`
    )
    s.appendRight(endOffset, `})`)
  } else {
    if (defaultExport) {
      // can't rely on spread operator in non ts mode
      s.prependLeft(
        startOffset,
        `\n${hasAwait ? `async ` : ``}function setup(${args}) {\n`
      )
      s.append(
        `\nexport default /*#__PURE__*/ Object.assign(${defaultTempVar}, {${runtimeOptions}\n  setup\n})\n`
      )
    } else {
      s.prependLeft(
        startOffset,
        `\nexport default {${runtimeOptions}\n  ` +
          `${hasAwait ? `async ` : ``}setup(${args}) {\n${exposeCall}`
      )
      s.appendRight(endOffset, `}`)
    }
  }

  // 12. finalize Vue helper imports
  if (helperImports.size > 0) {
    s.prepend(
      `import { ${[...helperImports]
        .map(h => `${h} as _${h}`)
        .join(', ')} } from 'vue'\n`
    )
  }

  s.trim()
  return {
    ...scriptSetup,
    bindings: bindingMetadata,
    content: s.toString(),
    map: s.generateMap({
      source: filename,
      hires: true,
      includeContent: true
    }) as unknown as RawSourceMap,
    scriptAst,
    scriptSetupAst
  }
}

function registerBinding(
  bindings: Record<string, VariableBinding>,
  node: Identifier,
  type: BindingTypes
) {
  bindings[node.name] = {
    type,
    rangeNode: node
  }
}

function walkDeclaration(
  node: Declaration,
  bindings: Record<string, VariableBinding>,
  userImportAlias: Record<string, string>
) {
  if (node.type === 'VariableDeclaration') {
    const isConst = node.kind === 'const'
    // export const foo = ...
    for (const { id, init } of node.declarations) {
      const isDefineCall = !!(
        isConst &&
        isCallOf(
          init,
          c => c === DEFINE_PROPS || c === DEFINE_EMITS || c === WITH_DEFAULTS
        )
      )
      if (id.type === 'Identifier') {
        let bindingType
        const userReactiveBinding = userImportAlias['reactive'] || 'reactive'
        if (isCallOf(init, userReactiveBinding)) {
          // treat reactive() calls as let since it's meant to be mutable
          bindingType = BindingTypes.SETUP_LET
        } else if (
          // if a declaration is a const literal, we can mark it so that
          // the generated render fn code doesn't need to unref() it
          isDefineCall ||
          (isConst && canNeverBeRef(init!, userReactiveBinding))
        ) {
          bindingType = BindingTypes.SETUP_CONST
        } else if (isConst) {
          if (isCallOf(init, userImportAlias['ref'] || 'ref')) {
            bindingType = BindingTypes.SETUP_REF
          } else {
            bindingType = BindingTypes.SETUP_MAYBE_REF
          }
        } else {
          bindingType = BindingTypes.SETUP_LET
        }
        registerBinding(bindings, id, bindingType)
      } else if (id.type === 'ObjectPattern') {
        walkObjectPattern(id, bindings, isConst, isDefineCall)
      } else if (id.type === 'ArrayPattern') {
        walkArrayPattern(id, bindings, isConst, isDefineCall)
      }
    }
  } else if (
    node.type === 'FunctionDeclaration' ||
    node.type === 'ClassDeclaration'
  ) {
    // export function foo() {} / export class Foo {}
    // export declarations must be named.
    bindings[node.id!.name] = {
      type: BindingTypes.SETUP_CONST,
      rangeNode: node.id!
    }
  }
}

function walkObjectPattern(
  node: ObjectPattern,
  bindings: Record<string, VariableBinding>,
  isConst: boolean,
  isDefineCall = false
) {
  for (const p of node.properties) {
    if (p.type === 'ObjectProperty') {
      // key can only be Identifier in ObjectPattern
      if (p.key.type === 'Identifier') {
        if (p.key === p.value) {
          // const { x } = ...
          const type = isDefineCall
            ? BindingTypes.SETUP_CONST
            : isConst
            ? BindingTypes.SETUP_MAYBE_REF
            : BindingTypes.SETUP_LET
          registerBinding(bindings, p.key, type)
        } else {
          walkPattern(p.value, bindings, isConst, isDefineCall)
        }
      }
    } else {
      // ...rest
      // argument can only be identifer when destructuring
      const type = isConst ? BindingTypes.SETUP_CONST : BindingTypes.SETUP_LET
      registerBinding(bindings, p.argument as Identifier, type)
    }
  }
}

function walkArrayPattern(
  node: ArrayPattern,
  bindings: Record<string, VariableBinding>,
  isConst: boolean,
  isDefineCall = false
) {
  for (const e of node.elements) {
    e && walkPattern(e, bindings, isConst, isDefineCall)
  }
}

function walkPattern(
  node: Node,
  bindings: Record<string, VariableBinding>,
  isConst: boolean,
  isDefineCall = false
) {
  if (node.type === 'Identifier') {
    const type = isDefineCall
      ? BindingTypes.SETUP_CONST
      : isConst
      ? BindingTypes.SETUP_MAYBE_REF
      : BindingTypes.SETUP_LET
    registerBinding(bindings, node, type)
  } else if (node.type === 'RestElement') {
    // argument can only be identifer when destructuring
    const type = isConst ? BindingTypes.SETUP_CONST : BindingTypes.SETUP_LET
    registerBinding(bindings, node.argument as Identifier, type)
  } else if (node.type === 'ObjectPattern') {
    walkObjectPattern(node, bindings, isConst)
  } else if (node.type === 'ArrayPattern') {
    walkArrayPattern(node, bindings, isConst)
  } else if (node.type === 'AssignmentPattern') {
    if (node.left.type === 'Identifier') {
      const type = isDefineCall
        ? BindingTypes.SETUP_CONST
        : isConst
        ? BindingTypes.SETUP_MAYBE_REF
        : BindingTypes.SETUP_LET
      registerBinding(bindings, node.left, type)
    } else {
      walkPattern(node.left, bindings, isConst)
    }
  }
}

interface PropTypeData {
  key: string
  type: string[]
  required: boolean
}

function recordType(node: Node, declaredTypes: Record<string, string[]>) {
  if (node.type === 'TSInterfaceDeclaration') {
    declaredTypes[node.id.name] = [`Object`]
  } else if (node.type === 'TSTypeAliasDeclaration') {
    declaredTypes[node.id.name] = inferRuntimeType(
      node.typeAnnotation,
      declaredTypes
    )
  } else if (node.type === 'ExportNamedDeclaration' && node.declaration) {
    recordType(node.declaration, declaredTypes)
  }
}

function extractRuntimeProps(
  node: TSTypeLiteral | TSInterfaceBody,
  props: Record<string, PropTypeData>,
  declaredTypes: Record<string, string[]>
) {
  const members = node.type === 'TSTypeLiteral' ? node.members : node.body
  for (const m of members) {
    if (
      (m.type === 'TSPropertySignature' || m.type === 'TSMethodSignature') &&
      m.key.type === 'Identifier'
    ) {
      let type
      if (__DEV__) {
        if (m.type === 'TSMethodSignature') {
          type = ['Function']
        } else if (m.typeAnnotation) {
          type = inferRuntimeType(
            m.typeAnnotation.typeAnnotation,
            declaredTypes
          )
        }
      }
      props[m.key.name] = {
        key: m.key.name,
        required: !m.optional,
        type: type || [`null`]
      }
    }
  }
}

function inferRuntimeType(
  node: TSType,
  declaredTypes: Record<string, string[]>
): string[] {
  switch (node.type) {
    case 'TSStringKeyword':
      return ['String']
    case 'TSNumberKeyword':
      return ['Number']
    case 'TSBooleanKeyword':
      return ['Boolean']
    case 'TSObjectKeyword':
      return ['Object']
    case 'TSTypeLiteral':
      // TODO (nice to have) generate runtime property validation
      return ['Object']
    case 'TSFunctionType':
      return ['Function']
    case 'TSArrayType':
    case 'TSTupleType':
      // TODO (nice to have) generate runtime element type/length checks
      return ['Array']

    case 'TSLiteralType':
      switch (node.literal.type) {
        case 'StringLiteral':
          return ['String']
        case 'BooleanLiteral':
          return ['Boolean']
        case 'NumericLiteral':
        case 'BigIntLiteral':
          return ['Number']
        default:
          return [`null`]
      }

    case 'TSTypeReference':
      if (node.typeName.type === 'Identifier') {
        if (declaredTypes[node.typeName.name]) {
          return declaredTypes[node.typeName.name]
        }
        switch (node.typeName.name) {
          case 'Array':
          case 'Function':
          case 'Object':
          case 'Set':
          case 'Map':
          case 'WeakSet':
          case 'WeakMap':
            return [node.typeName.name]
          case 'Record':
          case 'Partial':
          case 'Readonly':
          case 'Pick':
          case 'Omit':
          case 'Exclude':
          case 'Extract':
          case 'Required':
          case 'InstanceType':
            return ['Object']
        }
      }
      return [`null`]

    case 'TSParenthesizedType':
      return inferRuntimeType(node.typeAnnotation, declaredTypes)
    case 'TSUnionType':
      return [
        ...new Set(
          [].concat(
            node.types.map(t => inferRuntimeType(t, declaredTypes)) as any
          )
        )
      ]
    case 'TSIntersectionType':
      return ['Object']

    default:
      return [`null`] // no runtime check
  }
}

function toRuntimeTypeString(types: string[]) {
  return types.some(t => t === 'null')
    ? `null`
    : types.length > 1
    ? `[${types.join(', ')}]`
    : types[0]
}

function extractRuntimeEmits(
  node: TSFunctionType | TSTypeLiteral | TSInterfaceBody,
  emits: Set<string>
) {
  if (node.type === 'TSTypeLiteral' || node.type === 'TSInterfaceBody') {
    const members = node.type === 'TSTypeLiteral' ? node.members : node.body
    for (let t of members) {
      if (t.type === 'TSCallSignatureDeclaration') {
        extractEventNames(t.parameters[0], emits)
      }
    }
    return
  } else {
    extractEventNames(node.parameters[0], emits)
  }
}

function extractEventNames(
  eventName: Identifier | RestElement,
  emits: Set<string>
) {
  if (
    eventName.type === 'Identifier' &&
    eventName.typeAnnotation &&
    eventName.typeAnnotation.type === 'TSTypeAnnotation'
  ) {
    const typeNode = eventName.typeAnnotation.typeAnnotation
    if (typeNode.type === 'TSLiteralType') {
      emits.add(String(typeNode.literal.value))
    } else if (typeNode.type === 'TSUnionType') {
      for (const t of typeNode.types) {
        if (t.type === 'TSLiteralType') {
          emits.add(String(t.literal.value))
        }
      }
    }
  }
}

function genRuntimeEmits(emits: Set<string>) {
  return emits.size
    ? `\n  emits: [${Array.from(emits)
        .map(p => JSON.stringify(p))
        .join(', ')}] as unknown as undefined,`
    : ``
}

function markScopeIdentifier(
  node: Node & { scopeIds?: Set<string> },
  child: Identifier,
  knownIds: Record<string, number>
) {
  const { name } = child
  if (node.scopeIds && node.scopeIds.has(name)) {
    return
  }
  if (name in knownIds) {
    knownIds[name]++
  } else {
    knownIds[name] = 1
  }
  ;(node.scopeIds || (node.scopeIds = new Set())).add(name)
}

/**
 * Walk an AST and find identifiers that are variable references.
 * This is largely the same logic with `transformExpressions` in compiler-core
 * but with some subtle differences as this needs to handle a wider range of
 * possible syntax.
 */
export function walkIdentifiers(
  root: Node,
  onIdentifier: (node: Identifier, parent: Node, parentStack: Node[]) => void,
  onNode?: (node: Node, parent: Node, parentStack: Node[]) => void | boolean
) {
  const parentStack: Node[] = []
  const knownIds: Record<string, number> = Object.create(null)
  ;(walk as any)(root, {
    enter(node: Node & { scopeIds?: Set<string> }, parent: Node | undefined) {
      parent && parentStack.push(parent)
      if (node.type.startsWith('TS')) {
        return this.skip()
      }
      if (onNode && onNode(node, parent!, parentStack) === false) {
        return this.skip()
      }
      if (node.type === 'Identifier') {
        if (
          !knownIds[node.name] &&
          isRefIdentifier(node, parent!, parentStack)
        ) {
          onIdentifier(node, parent!, parentStack)
        }
      } else if (isFunction(node)) {
        // #3445
        // should not rewrite local variables sharing a name with a top-level ref
        if (node.body.type === 'BlockStatement') {
          node.body.body.forEach(p => {
            if (p.type === 'VariableDeclaration') {
              for (const decl of p.declarations) {
                extractIdentifiers(decl.id).forEach(id => {
                  markScopeIdentifier(node, id, knownIds)
                })
              }
            }
          })
        }
        // walk function expressions and add its arguments to known identifiers
        // so that we don't prefix them
        node.params.forEach(p =>
          (walk as any)(p, {
            enter(child: Node, parent: Node) {
              if (
                child.type === 'Identifier' &&
                // do not record as scope variable if is a destructured key
                !isStaticPropertyKey(child, parent) &&
                // do not record if this is a default value
                // assignment of a destructured variable
                !(
                  parent &&
                  parent.type === 'AssignmentPattern' &&
                  parent.right === child
                )
              ) {
                markScopeIdentifier(node, child, knownIds)
              }
            }
          })
        )
      } else if (
        node.type === 'ObjectProperty' &&
        parent!.type === 'ObjectPattern'
      ) {
        // mark property in destructure pattern
        ;(node as any).inPattern = true
      }
    },
    leave(node: Node & { scopeIds?: Set<string> }, parent: Node | undefined) {
      parent && parentStack.pop()
      if (node.scopeIds) {
        node.scopeIds.forEach((id: string) => {
          knownIds[id]--
          if (knownIds[id] === 0) {
            delete knownIds[id]
          }
        })
      }
    }
  })
}

function isRefIdentifier(
  id: Identifier,
  parent: Node | null,
  parentStack: Node[]
) {
  if (!parent) {
    return true
  }

  // declaration id
  if (
    (parent.type === 'VariableDeclarator' ||
      parent.type === 'ClassDeclaration') &&
    parent.id === id
  ) {
    return false
  }

  if (isFunction(parent)) {
    // function decalration/expression id
    if ((parent as any).id === id) {
      return false
    }
    // params list
    if (parent.params.includes(id)) {
      return false
    }
  }

  // property key
  // this also covers object destructure pattern
  if (isStaticPropertyKey(id, parent)) {
    return false
  }

  // non-assignment array destructure pattern
  if (
    parent.type === 'ArrayPattern' &&
    !isInDestructureAssignment(parent, parentStack)
  ) {
    return false
  }

  // member expression property
  if (
    (parent.type === 'MemberExpression' ||
      parent.type === 'OptionalMemberExpression') &&
    parent.property === id &&
    !parent.computed
  ) {
    return false
  }

  // is a special keyword but parsed as identifier
  if (id.name === 'arguments') {
    return false
  }

  return true
}

const isStaticProperty = (node: Node): node is ObjectProperty =>
  node &&
  (node.type === 'ObjectProperty' || node.type === 'ObjectMethod') &&
  !node.computed

const isStaticPropertyKey = (node: Node, parent: Node) =>
  isStaticProperty(parent) && parent.key === node

function isFunction(node: Node): node is FunctionNode {
  return /Function(?:Expression|Declaration)$|Method$/.test(node.type)
}

function isCallOf(
  node: Node | null | undefined,
  test: string | ((id: string) => boolean)
): node is CallExpression {
  return !!(
    node &&
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    (isString(test) ? node.callee.name === test : test(node.callee.name))
  )
}

function canNeverBeRef(node: Node, userReactiveImport: string): boolean {
  if (isCallOf(node, userReactiveImport)) {
    return true
  }
  switch (node.type) {
    case 'UnaryExpression':
    case 'BinaryExpression':
    case 'ArrayExpression':
    case 'ObjectExpression':
    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
    case 'UpdateExpression':
    case 'ClassExpression':
    case 'TaggedTemplateExpression':
      return true
    case 'SequenceExpression':
      return canNeverBeRef(
        node.expressions[node.expressions.length - 1],
        userReactiveImport
      )
    default:
      if (node.type.endsWith('Literal')) {
        return true
      }
      return false
  }
}

function isInDestructureAssignment(parent: Node, parentStack: Node[]): boolean {
  if (
    parent &&
    (parent.type === 'ObjectProperty' || parent.type === 'ArrayPattern')
  ) {
    let i = parentStack.length
    while (i--) {
      const p = parentStack[i]
      if (p.type === 'AssignmentExpression') {
        const root = parentStack[0]
        // if this is a ref: destructure, it should be treated like a
        // variable decalration!
        return !(root.type === 'LabeledStatement' && root.label.name === 'ref')
      } else if (p.type !== 'ObjectProperty' && !p.type.endsWith('Pattern')) {
        break
      }
    }
  }
  return false
}

/**
 * Analyze bindings in normal `<script>`
 * Note that `compileScriptSetup` already analyzes bindings as part of its
 * compilation process so this should only be used on single `<script>` SFCs.
 */
function analyzeScriptBindings(ast: Statement[]): BindingMetadata {
  for (const node of ast) {
    if (
      node.type === 'ExportDefaultDeclaration' &&
      node.declaration.type === 'ObjectExpression'
    ) {
      return analyzeBindingsFromOptions(node.declaration)
    }
  }
  return {}
}

function analyzeBindingsFromOptions(node: ObjectExpression): BindingMetadata {
  const bindings: BindingMetadata = {}
  // #3270, #3275
  // mark non-script-setup so we don't resolve components/directives from these
  Object.defineProperty(bindings, '__isScriptSetup', {
    enumerable: false,
    value: false
  })
  for (const property of node.properties) {
    if (
      property.type === 'ObjectProperty' &&
      !property.computed &&
      property.key.type === 'Identifier'
    ) {
      // props
      if (property.key.name === 'props') {
        // props: ['foo']
        // props: { foo: ... }
        for (const key of getObjectOrArrayExpressionKeys(property.value)) {
          bindings[key] = BindingTypes.PROPS
        }
      }

      // inject
      else if (property.key.name === 'inject') {
        // inject: ['foo']
        // inject: { foo: {} }
        for (const key of getObjectOrArrayExpressionKeys(property.value)) {
          bindings[key] = BindingTypes.OPTIONS
        }
      }

      // computed & methods
      else if (
        property.value.type === 'ObjectExpression' &&
        (property.key.name === 'computed' || property.key.name === 'methods')
      ) {
        // methods: { foo() {} }
        // computed: { foo() {} }
        for (const key of getObjectExpressionKeys(property.value)) {
          bindings[key] = BindingTypes.OPTIONS
        }
      }
    }

    // setup & data
    else if (
      property.type === 'ObjectMethod' &&
      property.key.type === 'Identifier' &&
      (property.key.name === 'setup' || property.key.name === 'data')
    ) {
      for (const bodyItem of property.body.body) {
        // setup() {
        //   return {
        //     foo: null
        //   }
        // }
        if (
          bodyItem.type === 'ReturnStatement' &&
          bodyItem.argument &&
          bodyItem.argument.type === 'ObjectExpression'
        ) {
          for (const key of getObjectExpressionKeys(bodyItem.argument)) {
            bindings[key] =
              property.key.name === 'setup'
                ? BindingTypes.SETUP_MAYBE_REF
                : BindingTypes.DATA
          }
        }
      }
    }
  }

  return bindings
}

function getObjectExpressionKeys(node: ObjectExpression): string[] {
  const keys = []
  for (const prop of node.properties) {
    if (
      (prop.type === 'ObjectProperty' || prop.type === 'ObjectMethod') &&
      !prop.computed
    ) {
      if (prop.key.type === 'Identifier') {
        keys.push(prop.key.name)
      } else if (prop.key.type === 'StringLiteral') {
        keys.push(prop.key.value)
      }
    }
  }
  return keys
}

function getArrayExpressionKeys(node: ArrayExpression): string[] {
  const keys = []
  for (const element of node.elements) {
    if (element && element.type === 'StringLiteral') {
      keys.push(element.value)
    }
  }
  return keys
}

function getObjectOrArrayExpressionKeys(value: Node): string[] {
  if (value.type === 'ArrayExpression') {
    return getArrayExpressionKeys(value)
  }
  if (value.type === 'ObjectExpression') {
    return getObjectExpressionKeys(value)
  }
  return []
}

function extractIdentifiers(
  param: Node,
  nodes: Identifier[] = []
): Identifier[] {
  switch (param.type) {
    case 'Identifier':
      nodes.push(param)
      break

    case 'MemberExpression':
      let object: any = param
      while (object.type === 'MemberExpression') {
        object = object.object
      }
      nodes.push(object)
      break

    case 'ObjectPattern':
      param.properties.forEach(prop => {
        if (prop.type === 'RestElement') {
          extractIdentifiers(prop.argument, nodes)
        } else {
          extractIdentifiers(prop.value, nodes)
        }
      })
      break

    case 'ArrayPattern':
      param.elements.forEach(element => {
        if (element) extractIdentifiers(element, nodes)
      })
      break

    case 'RestElement':
      extractIdentifiers(param.argument, nodes)
      break

    case 'AssignmentPattern':
      extractIdentifiers(param.left, nodes)
      break
  }

  return nodes
}

function toTextRange(node: Node): TextRange {
  return {
    start: node.start!,
    end: node.end!
  }
}
