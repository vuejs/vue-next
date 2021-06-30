import {
  ComponentNode,
  findProp,
  NodeTypes,
  createSimpleExpression,
  createFunctionExpression,
  createCallExpression,
  ExpressionNode
} from '@vue/compiler-dom'
import {
  SSRTransformContext,
  processChildrenAsStatement
} from '../ssrCodegenTransform'
import { createSSRCompilerError, SSRErrorCodes } from '../errors'
import { SSR_RENDER_TELEPORT } from '../runtimeHelpers'

// Note: this is a 2nd-pass codegen transform.
export function ssrProcessTeleport(
  node: ComponentNode,
  context: SSRTransformContext
) {
  const targetProp = findProp(node, 'to')
  if (!targetProp) {
    context.onError(
      createSSRCompilerError(SSRErrorCodes.X_SSR_NO_TELEPORT_TARGET, node.loc)
    )
    return
  }

  let target: ExpressionNode | undefined
  if (targetProp.type === NodeTypes.ATTRIBUTE) {
    target =
      targetProp.value && createSimpleExpression(targetProp.value.content, true)
  } else {
    target = targetProp.exp
  }
  if (!target) {
    context.onError(
      createSSRCompilerError(
        SSRErrorCodes.X_SSR_NO_TELEPORT_TARGET,
        targetProp.loc
      )
    )
    return
  }

  const disabledProp = findProp(node, 'disabled', false, true /* allow empty */)
  const disabled = disabledProp
    ? disabledProp.type === NodeTypes.ATTRIBUTE
      ? `true`
      : disabledProp.exp || `false`
    : `false`

  const contentRenderFn = createFunctionExpression(
    [`_push`],
    undefined, // no return
    undefined, // Body is added later
    true, // newline
    false, // isSlot
    node.loc
  )
  contentRenderFn.body = processChildrenAsStatement(node.children, context)
  context.pushStatement(
    createCallExpression(context.helper(SSR_RENDER_TELEPORT), [
      `_push`,
      contentRenderFn,
      target,
      disabled,
      `_parent`
    ])
  )
}
