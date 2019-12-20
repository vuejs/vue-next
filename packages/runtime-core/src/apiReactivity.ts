export {
  ref,
  isRef,
  toRefs,
  reactive,
  isReactive,
  readonly,
  isReadonly,
  toRaw,
  markReadonly,
  markNonReactive,
  effect,
  // types
  ReactiveEffect,
  ReactiveEffectOptions,
  DebuggerEvent,
  TrackOpTypes,
  TriggerOpTypes,
  Ref,
  ComputedRef,
  UnwrapRef,
  WritableComputedOptions
} from '@vue/reactivity'

import {
  computed as _computed,
  ComputedRef,
  WritableComputedOptions,
  ReactiveEffect,
  WritableComputedRef,
  ComputedGetter
} from '@vue/reactivity'

import { currentInstance } from './component'

import { isFunction } from '@vue/shared'

import { callWithErrorHandling, ErrorCodes } from './errorHandling'

// record effects created during a component's setup() so that they can be
// stopped when the component unmounts
export function recordEffect(effect: ReactiveEffect) {
  if (currentInstance) {
    ;(currentInstance.effects || (currentInstance.effects = [])).push(effect)
  }
}

function handleObject<T>(
  options: WritableComputedOptions<T>
): WritableComputedOptions<T> {
  return {
    get: handleFn(options.get),
    set: (v: T) =>
      callWithErrorHandling(
        options.set,
        currentInstance,
        ErrorCodes.COMPUTED_SETTER,
        [v]
      )
  }
}

function handleFn<T>(get: ComputedGetter<T>): ComputedGetter<T> {
  return () =>
    callWithErrorHandling(get, currentInstance, ErrorCodes.COMPUTED_GETTER)
}

export function computed<T>(getter: ComputedGetter<T>): ComputedRef<T>
export function computed<T>(
  options: WritableComputedOptions<T>
): WritableComputedRef<T>
export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>
) {
  if (isFunction(getterOrOptions)) {
    getterOrOptions = handleFn(getterOrOptions)
  } else {
    getterOrOptions = handleObject(getterOrOptions)
  }

  const c = _computed(getterOrOptions as any)
  recordEffect(c.effect)
  return c
}
