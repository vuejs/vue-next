import {
  RootNode,
  BlockStatement,
  TemplateLiteral,
  createCallExpression,
  createTemplateLiteral,
  NodeTypes,
  TemplateChildNode,
  ElementTypes,
  createBlockStatement,
  CompilerOptions,
  IfStatement,
  CallExpression,
  isText,
  processExpression,
  createSimpleExpression,
  createCompoundExpression,
  createTransformContext,
  createRoot
} from '@vue/compiler-dom'
import { isString, escapeHtml } from '@vue/shared'
import { SSR_INTERPOLATE, ssrHelpers } from './runtimeHelpers'
import { ssrProcessIf } from './transforms/ssrVIf'
import { ssrProcessFor } from './transforms/ssrVFor'
import { ssrProcessSlotOutlet } from './transforms/ssrTransformSlotOutlet'
import { ssrProcessComponent } from './transforms/ssrTransformComponent'
import { ssrProcessElement } from './transforms/ssrTransformElement'
import { createSSRCompilerError, SSRErrorCodes } from './errors'

// Because SSR codegen output is completely different from client-side output
// (e.g. multiple elements can be concatenated into a single template literal
// instead of each getting a corresponding call), we need to apply an extra
// transform pass to convert the template AST into a fresh JS AST before
// passing it to codegen.

export function ssrCodegenTransform(ast: RootNode, options: CompilerOptions) {
  const context = createSSRTransformContext(ast, options)

  // inject SFC <style> CSS variables
  // we do this instead of inlining the expression to ensure the vars are
  // only resolved once per render
  if (options.ssrCssVars) {
    const varsExp = processExpression(
      createSimpleExpression(options.ssrCssVars, false),
      createTransformContext(createRoot([]), options)
    )
    context.body.push(
      createCompoundExpression([`const _cssVars = { style: `, varsExp, `}`])
    )
  }

  const isFragment =
    ast.children.length > 1 && ast.children.some(c => !isText(c))
  processChildren(ast.children, context, isFragment)
  ast.codegenNode = createBlockStatement(context.body)

  // Finalize helpers.
  // We need to separate helpers imported from 'vue' vs. '@vue/server-renderer'
  ast.ssrHelpers = Array.from(
    new Set([...ast.helpers.filter(h => h in ssrHelpers), ...context.helpers])
  )

  ast.helpers = ast.helpers.filter(h => !(h in ssrHelpers))
}

export type SSRTransformContext = ReturnType<typeof createSSRTransformContext>

function createSSRTransformContext(
  root: RootNode,
  options: CompilerOptions,
  helpers: Set<symbol> = new Set(),
  withSlotScopeId = false
) {
  const body: BlockStatement['body'] = []
  let currentString: TemplateLiteral | null = null

  return {
    root,
    options,
    body,
    helpers,
    withSlotScopeId,
    onError:
      options.onError ||
      (e => {
        throw e
      }),
    helper<T extends symbol>(name: T): T {
      helpers.add(name)
      return name
    },
    pushStringPart(part: TemplateLiteral['elements'][0]) {
      if (!currentString) {
        const currentCall = createCallExpression(`_push`)
        body.push(currentCall)
        currentString = createTemplateLiteral([])
        currentCall.arguments.push(currentString)
      }
      const bufferedElements = currentString.elements
      const lastItem = bufferedElements[bufferedElements.length - 1]
      if (isString(part) && isString(lastItem)) {
        bufferedElements[bufferedElements.length - 1] += part
      } else {
        bufferedElements.push(part)
      }
    },
    pushStatement(statement: IfStatement | CallExpression) {
      // close current string
      currentString = null
      body.push(statement)
    }
  }
}

function createChildContext(
  parent: SSRTransformContext,
  withSlotScopeId = parent.withSlotScopeId
): SSRTransformContext {
  // ensure child inherits parent helpers
  return createSSRTransformContext(
    parent.root,
    parent.options,
    parent.helpers,
    withSlotScopeId
  )
}

export function processChildren(
  children: TemplateChildNode[],
  context: SSRTransformContext,
  asFragment = false,
  disableNestedFragments = false
) {
  if (asFragment) {
    context.pushStringPart(`<!--[-->`)
  }
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    switch (child.type) {
      case NodeTypes.ELEMENT:
        switch (child.tagType) {
          case ElementTypes.ELEMENT:
            ssrProcessElement(child, context)
            break
          case ElementTypes.COMPONENT:
            ssrProcessComponent(child, context)
            break
          case ElementTypes.SLOT:
            ssrProcessSlotOutlet(child, context)
            break
          case ElementTypes.TEMPLATE:
            // TODO
            break
          default:
            context.onError(
              createSSRCompilerError(
                SSRErrorCodes.X_SSR_INVALID_AST_NODE,
                (child as any).loc
              )
            )
            // make sure we exhaust all possible types
            const exhaustiveCheck: never = child
            return exhaustiveCheck
        }
        break
      case NodeTypes.TEXT:
        context.pushStringPart(escapeHtml(child.content))
        break
      case NodeTypes.COMMENT:
        // no need to escape comment here because the AST can only
        // contain valid comments.
        context.pushStringPart(`<!--${child.content}-->`)
        break
      case NodeTypes.INTERPOLATION:
        context.pushStringPart(
          createCallExpression(context.helper(SSR_INTERPOLATE), [child.content])
        )
        break
      case NodeTypes.IF:
        ssrProcessIf(child, context, disableNestedFragments)
        break
      case NodeTypes.FOR:
        ssrProcessFor(child, context, disableNestedFragments)
        break
      case NodeTypes.IF_BRANCH:
        // no-op - handled by ssrProcessIf
        break
      case NodeTypes.TEXT_CALL:
      case NodeTypes.COMPOUND_EXPRESSION:
        // no-op - these two types can never appear as template child node since
        // `transformText` is not used during SSR compile.
        break
      default:
        context.onError(
          createSSRCompilerError(
            SSRErrorCodes.X_SSR_INVALID_AST_NODE,
            (child as any).loc
          )
        )
        // make sure we exhaust all possible types
        const exhaustiveCheck: never = child
        return exhaustiveCheck
    }
  }
  if (asFragment) {
    context.pushStringPart(`<!--]-->`)
  }
}

export function processChildrenAsStatement(
  children: TemplateChildNode[],
  parentContext: SSRTransformContext,
  asFragment = false,
  withSlotScopeId = parentContext.withSlotScopeId
): BlockStatement {
  const childContext = createChildContext(parentContext, withSlotScopeId)
  processChildren(children, childContext, asFragment)
  return createBlockStatement(childContext.body)
}
