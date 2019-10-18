// Public API ------------------------------------------------------------------

export { createComponent } from './apiCreateComponent'
export { nextTick } from './scheduler'
export * from './apiReactivity'
export * from './apiWatch'
export * from './apiLifecycle'
export * from './apiInject'

// Advanced API ----------------------------------------------------------------

// For raw render function users
export { h } from './h'
export {
  createVNode,
  cloneVNode,
  mergeProps,
  openBlock,
  createBlock
} from './vnode'
// VNode type symbols
export { Text, Comment, Fragment, Portal, Suspense } from './vnode'
// VNode flags
export { PublicShapeFlags as ShapeFlags } from './shapeFlags'
export { PublicPatchFlags as PatchFlags } from '@vue/shared'

// For advanced plugins
export { getCurrentInstance } from './component'

// For custom renderers
export { createRenderer } from './createRenderer'
export { warn } from './warning'
export {
  handleError,
  callWithErrorHandling,
  callWithAsyncErrorHandling
} from './errorHandling'

// Internal, for compiler generated code
// should sync with '@vue/compiler-core/src/runtimeConstants.ts'
export { applyDirectives } from './directives'
export {
  resolveComponent,
  resolveDirective,
  resolveFilter
} from './helpers/resolveAssets'
export { renderList } from './helpers/renderList'
export { toString } from './helpers/toString'
export { toHandlers } from './helpers/toHandlers'
export { renderSlot } from './helpers/renderSlot'
export { createSlots } from './helpers/createSlots'
export { capitalize, camelize } from '@vue/shared'

// Internal, for integration with runtime compiler
export { registerRuntimeCompiler } from './component'

// Types -----------------------------------------------------------------------

export { App, AppConfig, AppContext, Plugin } from './apiApp'
export { RawProps, RawChildren, RawSlots } from './h'
export { VNode, VNodeTypes } from './vnode'
export {
  Component,
  FunctionalComponent,
  ComponentInternalInstance,
  RenderFunction
} from './component'
export {
  ComponentOptions,
  ComponentOptionsWithoutProps,
  ComponentOptionsWithObjectProps as ComponentOptionsWithProps,
  ComponentOptionsWithArrayProps
} from './apiOptions'

export { ComponentPublicInstance } from './componentProxy'
export { RendererOptions } from './createRenderer'
export { Slot, Slots } from './componentSlots'
export {
  Prop,
  PropType,
  ComponentPropsOptions,
  ComponentObjectPropsOptions
} from './componentProps'
export {
  Directive,
  DirectiveBinding,
  DirectiveHook,
  ObjectDirective,
  FunctionDirective,
  DirectiveArguments
} from './directives'
export { SuspenseBoundary } from './suspense'

export const version = __VERSION__
