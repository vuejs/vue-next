// Core API ------------------------------------------------------------------

export const version = __VERSION__
export {
  // core
  reactive,
  ref,
  readonly,
  // utilities
  unref,
  proxyRefs,
  isRef,
  toRef,
  toRefs,
  isProxy,
  isReactive,
  isReadonly,
  // advanced
  customRef,
  triggerRef,
  shallowRef,
  shallowReactive,
  shallowReadonly,
  markRaw,
  toRaw
} from '@vue/reactivity'
export { computed } from './apiComputed'
export { watch, watchEffect } from './apiWatch'
export {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onBeforeActivate,
  onActivated,
  onBeforeDeactivate,
  onDeactivated,
  onRenderTracked,
  onRenderTriggered,
  onErrorCaptured
} from './apiLifecycle'
export { provide, inject } from './apiInject'
export { nextTick } from './scheduler'
export { defineComponent } from './apiDefineComponent'
export { defineAsyncComponent } from './apiAsyncComponent'
export { defineProps, defineEmit, useContext } from './apiSetupHelpers'

// Advanced API ----------------------------------------------------------------

// For getting a hold of the internal instance in setup() - useful for advanced
// plugins
export { getCurrentInstance } from './component'

// For raw render function users
export { h } from './h'
// Advanced render function utilities
export { createVNode, cloneVNode, mergeProps, isVNode } from './vnode'
// VNode types
export { Fragment, Text, Comment, Static } from './vnode'
// Built-in components
export { Teleport, TeleportProps } from './components/Teleport'
export { Suspense, SuspenseProps } from './components/Suspense'
export { KeepAlive, KeepAliveProps } from './components/KeepAlive'
export {
  BaseTransition,
  BaseTransitionProps
} from './components/BaseTransition'
// For using custom directives
export { withDirectives } from './directives'
// SSR context
export { useSSRContext, ssrContextKey } from './helpers/useSsrContext'

// Custom Renderer API ---------------------------------------------------------

export { createRenderer, createHydrationRenderer } from './renderer'
export { queuePostFlushCb } from './scheduler'
export { warn } from './warning'
export {
  handleError,
  callWithErrorHandling,
  callWithAsyncErrorHandling,
  ErrorCodes
} from './errorHandling'
export {
  resolveComponent,
  resolveDirective,
  resolveDynamicComponent
} from './helpers/resolveAssets'
// For integration with runtime compiler
export { registerRuntimeCompiler, isRuntimeOnly } from './component'
export {
  useTransitionState,
  resolveTransitionHooks,
  setTransitionHooks,
  getTransitionRawChildren
} from './components/BaseTransition'
export { initCustomFormatter } from './customFormatter'

// For devtools
export { devtools, setDevtoolsHook } from './devtools'

// Types -------------------------------------------------------------------------

import { VNode } from './vnode'
import { ComponentInternalInstance } from './component'

// Augment Ref unwrap bail types.
// Note: if updating this, also update `types/refBail.d.ts`.
declare module '@vue/reactivity' {
  export interface RefUnwrapBailTypes {
    runtimeCoreBailTypes:
      | VNode
      | {
          // directly bailing on ComponentPublicInstance results in recursion
          // so we use this as a bail hint
          $: ComponentInternalInstance
        }
  }
}

export {
  ReactiveEffect,
  ReactiveEffectOptions,
  DebuggerEvent,
  TrackOpTypes,
  TriggerOpTypes,
  Ref,
  ComputedRef,
  WritableComputedRef,
  UnwrapRef,
  ShallowUnwrapRef,
  WritableComputedOptions,
  ToRefs,
  DeepReadonly
} from '@vue/reactivity'
export {
  // types
  WatchEffect,
  WatchOptions,
  WatchOptionsBase,
  WatchCallback,
  WatchSource,
  WatchStopHandle
} from './apiWatch'
export { InjectionKey } from './apiInject'
export {
  App,
  AppConfig,
  AppContext,
  Plugin,
  CreateAppFunction,
  OptionMergeFunction
} from './apiCreateApp'
export {
  VNode,
  VNodeChild,
  VNodeTypes,
  VNodeProps,
  VNodeArrayChildren,
  VNodeNormalizedChildren
} from './vnode'
export {
  Component,
  ConcreteComponent,
  FunctionalComponent,
  ComponentInternalInstance,
  SetupContext,
  ComponentCustomProps,
  AllowedComponentProps
} from './component'
export { DefineComponent } from './apiDefineComponent'
export {
  ComponentOptions,
  ComponentOptionsMixin,
  ComponentOptionsWithoutProps,
  ComponentOptionsWithObjectProps,
  ComponentOptionsWithArrayProps,
  ComponentCustomOptions,
  ComponentOptionsBase,
  RenderFunction,
  MethodOptions,
  ComputedOptions
} from './componentOptions'
export { EmitsOptions, ObjectEmitsOptions } from './componentEmits'
export {
  ComponentPublicInstance,
  ComponentCustomProperties
} from './componentPublicInstance'
export {
  Renderer,
  RendererNode,
  RendererElement,
  HydrationRenderer,
  RendererOptions,
  RootRenderFunction
} from './renderer'
export { RootHydrateFunction } from './hydration'
export { Slot, Slots } from './componentSlots'
export {
  Prop,
  PropType,
  ComponentPropsOptions,
  ComponentObjectPropsOptions,
  ExtractPropTypes,
  ExtractDefaultPropTypes
} from './componentProps'
export {
  Directive,
  DirectiveBinding,
  DirectiveHook,
  ObjectDirective,
  FunctionDirective,
  DirectiveArguments
} from './directives'
export { SuspenseBoundary } from './components/Suspense'
export { TransitionState, TransitionHooks } from './components/BaseTransition'
export {
  AsyncComponentOptions,
  AsyncComponentLoader
} from './apiAsyncComponent'
export { HMRRuntime } from './hmr'

// Internal API ----------------------------------------------------------------

// **IMPORTANT** Internal APIs may change without notice between versions and
// user code should avoid relying on them.

// For compiler generated code
// should sync with '@vue/compiler-core/src/runtimeHelpers.ts'
export {
  withCtx,
  pushScopeId,
  popScopeId,
  withScopeId
} from './componentRenderContext'
export { renderList } from './helpers/renderList'
export { toHandlers } from './helpers/toHandlers'
export { renderSlot } from './helpers/renderSlot'
export { createSlots } from './helpers/createSlots'
export {
  openBlock,
  createBlock,
  setBlockTracking,
  createTextVNode,
  createCommentVNode,
  createStaticVNode
} from './vnode'
export {
  toDisplayString,
  camelize,
  capitalize,
  toHandlerKey
} from '@vue/shared'

// For test-utils
export { transformVNodeArgs } from './vnode'

// SSR -------------------------------------------------------------------------

// **IMPORTANT** These APIs are exposed solely for @vue/server-renderer and may
// change without notice between versions. User code should never rely on them.

import { createComponentInstance, setupComponent } from './component'
import { renderComponentRoot } from './componentRenderUtils'
import { setCurrentRenderingInstance } from './componentRenderContext'
import { isVNode, normalizeVNode } from './vnode'

const _ssrUtils = {
  createComponentInstance,
  setupComponent,
  renderComponentRoot,
  setCurrentRenderingInstance,
  isVNode,
  normalizeVNode
}

/**
 * SSR utils for \@vue/server-renderer. Only exposed in cjs builds.
 * @internal
 */
export const ssrUtils = (__NODE_JS__ ? _ssrUtils : null) as typeof _ssrUtils
