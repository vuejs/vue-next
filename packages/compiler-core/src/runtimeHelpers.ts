export const FRAGMENT = Symbol(__DEV__ ? `Fragment` : ``)
export const TELEPORT = Symbol(__DEV__ ? `Teleport` : ``)
export const SUSPENSE = Symbol(__DEV__ ? `Suspense` : ``)
export const KEEP_ALIVE = Symbol(__DEV__ ? `KeepAlive` : ``)
export const BASE_TRANSITION = Symbol(__DEV__ ? `BaseTransition` : ``)
export const OPEN_BLOCK = Symbol(__DEV__ ? `openBlock` : ``)
export const CREATE_BLOCK = Symbol(__DEV__ ? `createBlock` : ``)
export const CREATE_VNODE = Symbol(__DEV__ ? `createVNode` : ``)
export const CREATE_COMMENT = Symbol(__DEV__ ? `createCommentVNode` : ``)
export const CREATE_TEXT = Symbol(__DEV__ ? `createTextVNode` : ``)
export const CREATE_STATIC = Symbol(__DEV__ ? `createStaticVNode` : ``)
export const RESOLVE_COMPONENT = Symbol(__DEV__ ? `resolveComponent` : ``)
export const RESOLVE_DYNAMIC_COMPONENT = Symbol(
  __DEV__ ? `resolveDynamicComponent` : ``
)
export const RESOLVE_DIRECTIVE = Symbol(__DEV__ ? `resolveDirective` : ``)
export const WITH_DIRECTIVES = Symbol(__DEV__ ? `withDirectives` : ``)
export const RENDER_LIST = Symbol(__DEV__ ? `renderList` : ``)
export const RENDER_SLOT = Symbol(__DEV__ ? `renderSlot` : ``)
export const CREATE_SLOTS = Symbol(__DEV__ ? `createSlots` : ``)
export const TO_DISPLAY_STRING = Symbol(__DEV__ ? `toDisplayString` : ``)
export const MERGE_PROPS = Symbol(__DEV__ ? `mergeProps` : ``)
export const TO_HANDLERS = Symbol(__DEV__ ? `toHandlers` : ``)
export const CAMELIZE = Symbol(__DEV__ ? `camelize` : ``)
export const CAPITALIZE = Symbol(__DEV__ ? `capitalize` : ``)
export const TO_HANDLER_KEY = Symbol(__DEV__ ? `toHandlerKey` : ``)
export const SET_BLOCK_TRACKING = Symbol(__DEV__ ? `setBlockTracking` : ``)
export const SET_SCOPE_ID = Symbol(__DEV__ ? `setScopeId` : ``)
export const WITH_CTX = Symbol(__DEV__ ? `withCtx` : ``)
export const UNREF = Symbol(__DEV__ ? `unref` : ``)
export const IS_REF = Symbol(__DEV__ ? `isRef` : ``)

// Name mapping for runtime helpers that need to be imported from 'vue' in
// generated code. Make sure these are correctly exported in the runtime!
// Using `any` here because TS doesn't allow symbols as index type.
export const helperNameMap: any = {
  [FRAGMENT]: `Fragment`,
  [TELEPORT]: `Teleport`,
  [SUSPENSE]: `Suspense`,
  [KEEP_ALIVE]: `KeepAlive`,
  [BASE_TRANSITION]: `BaseTransition`,
  [OPEN_BLOCK]: `openBlock`,
  [CREATE_BLOCK]: `createBlock`,
  [CREATE_VNODE]: `createVNode`,
  [CREATE_COMMENT]: `createCommentVNode`,
  [CREATE_TEXT]: `createTextVNode`,
  [CREATE_STATIC]: `createStaticVNode`,
  [RESOLVE_COMPONENT]: `resolveComponent`,
  [RESOLVE_DYNAMIC_COMPONENT]: `resolveDynamicComponent`,
  [RESOLVE_DIRECTIVE]: `resolveDirective`,
  [WITH_DIRECTIVES]: `withDirectives`,
  [RENDER_LIST]: `renderList`,
  [RENDER_SLOT]: `renderSlot`,
  [CREATE_SLOTS]: `createSlots`,
  [TO_DISPLAY_STRING]: `toDisplayString`,
  [MERGE_PROPS]: `mergeProps`,
  [TO_HANDLERS]: `toHandlers`,
  [CAMELIZE]: `camelize`,
  [CAPITALIZE]: `capitalize`,
  [TO_HANDLER_KEY]: `toHandlerKey`,
  [SET_BLOCK_TRACKING]: `setBlockTracking`,
  [SET_SCOPE_ID]: `setScopeId`,
  [WITH_CTX]: `withCtx`,
  [UNREF]: `unref`,
  [IS_REF]: `isRef`
}

export function registerRuntimeHelpers(helpers: any) {
  Object.getOwnPropertySymbols(helpers).forEach(s => {
    helperNameMap[s] = helpers[s]
  })
}
