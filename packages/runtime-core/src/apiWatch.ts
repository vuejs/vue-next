import {
  effect,
  stop,
  isRef,
  Ref,
  ComputedRef,
  ReactiveEffectOptions
} from '@vue/reactivity'
import { queueJob } from './scheduler'
import {
  EMPTY_OBJ,
  isObject,
  isArray,
  isFunction,
  isString,
  hasChanged,
  NOOP
} from '@vue/shared'
import {
  currentInstance,
  ComponentInternalInstance,
  currentSuspense,
  Data,
  isInSSRComponentSetup,
  recordInstanceBoundEffect
} from './component'
import {
  ErrorCodes,
  callWithErrorHandling,
  callWithAsyncErrorHandling
} from './errorHandling'
import { onBeforeUnmount } from './apiLifecycle'
import { queuePostRenderEffect } from './renderer'
import { warn } from './warning'

export type WatchEffect = (onCleanup: CleanupRegistrator) => void

export type WatchSource<T = any> = Ref<T> | ComputedRef<T> | (() => T)

export type WatchCallback<V = any, OV = any> = (
  value: V,
  oldValue: OV,
  onCleanup: CleanupRegistrator
) => any

type MapSources<T> = {
  [K in keyof T]: T[K] extends WatchSource<infer V> ? V : never
}

type MapOldSources<T, Lazy> = {
  [K in keyof T]: T[K] extends WatchSource<infer V>
    ? Lazy extends true ? V : (V | undefined)
    : never
}

export type CleanupRegistrator = (invalidate: () => void) => void

export interface WatchOptions<Lazy = boolean> {
  lazy?: Lazy
  flush?: 'pre' | 'post' | 'sync'
  deep?: boolean
  onTrack?: ReactiveEffectOptions['onTrack']
  onTrigger?: ReactiveEffectOptions['onTrigger']
}

export type StopHandle = () => void

const invoke = (fn: Function) => fn()

// initial value for watchers to trigger on undefined initial values
const INITIAL_WATCHER_VALUE = {}

// overload #1: simple effect
export function watch(
  effect: WatchEffect,
  options?: WatchOptions<false>
): StopHandle

// overload #2: single source + cb
export function watch<T, Lazy extends Readonly<boolean> = false>(
  source: WatchSource<T>,
  cb: WatchCallback<T, Lazy extends true ? T : (T | undefined)>,
  options?: WatchOptions<Lazy>
): StopHandle

// overload #3: array of multiple sources + cb
// Readonly constraint helps the callback to correctly infer value types based
// on position in the source array. Otherwise the values will get a union type
// of all possible value types.
export function watch<
  T extends Readonly<WatchSource<unknown>[]>,
  Lazy extends Readonly<boolean> = false
>(
  sources: T,
  cb: WatchCallback<MapSources<T>, MapOldSources<T, Lazy>>,
  options?: WatchOptions<Lazy>
): StopHandle

// implementation
export function watch<T = any>(
  effectOrSource: WatchSource<T> | WatchSource<T>[] | WatchEffect,
  cbOrOptions?: WatchCallback<T> | WatchOptions,
  options?: WatchOptions
): StopHandle {
  if (isInSSRComponentSetup && !(options && options.flush === 'sync')) {
    // component watchers during SSR are no-op
    return NOOP
  } else if (isFunction(cbOrOptions)) {
    // effect callback as 2nd argument - this is a source watcher
    return doWatch(effectOrSource, cbOrOptions, options)
  } else {
    // 2nd argument is either missing or an options object
    // - this is a simple effect watcher
    return doWatch(effectOrSource, null, cbOrOptions)
  }
}

function doWatch(
  source: WatchSource | WatchSource[] | WatchEffect,
  cb: WatchCallback | null,
  { lazy, deep, flush, onTrack, onTrigger }: WatchOptions = EMPTY_OBJ
): StopHandle {
  const instance = currentInstance
  const suspense = currentSuspense

  let getter: () => any
  if (isArray(source)) {
    getter = () =>
      source.map(
        s =>
          isRef(s)
            ? s.value
            : callWithErrorHandling(s, instance, ErrorCodes.WATCH_GETTER)
      )
  } else if (isRef(source)) {
    getter = () => source.value
  } else if (cb) {
    // getter with cb
    getter = () =>
      callWithErrorHandling(source, instance, ErrorCodes.WATCH_GETTER)
  } else {
    // no cb -> simple effect
    getter = () => {
      if (instance && instance.isUnmounted) {
        return
      }
      if (cleanup) {
        cleanup()
      }
      return callWithErrorHandling(
        source,
        instance,
        ErrorCodes.WATCH_CALLBACK,
        [registerCleanup]
      )
    }
  }

  if (deep) {
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }

  let cleanup: Function
  const registerCleanup: CleanupRegistrator = (fn: () => void) => {
    cleanup = runner.options.onStop = () => {
      callWithErrorHandling(fn, instance, ErrorCodes.WATCH_CLEANUP)
    }
  }

  let oldValue = isArray(source) ? [] : INITIAL_WATCHER_VALUE
  const applyCb = cb
    ? () => {
        if (instance && instance.isUnmounted) {
          return
        }
        const newValue = runner()
        if (deep || hasChanged(newValue, oldValue)) {
          // cleanup before running cb again
          if (cleanup) {
            cleanup()
          }
          callWithAsyncErrorHandling(cb, instance, ErrorCodes.WATCH_CALLBACK, [
            newValue,
            // pass undefined as the old value when it's changed for the first time
            oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue,
            registerCleanup
          ])
          oldValue = newValue
        }
      }
    : void 0

  let scheduler: (job: () => any) => void
  if (flush === 'sync') {
    scheduler = invoke
  } else if (flush === 'pre') {
    scheduler = job => {
      if (!instance || instance.vnode.el != null) {
        queueJob(job)
      } else {
        // with 'pre' option, the first call must happen before
        // the component is mounted so it is called synchronously.
        job()
      }
    }
  } else {
    scheduler = job => {
      queuePostRenderEffect(job, suspense)
    }
  }

  const runner = effect(getter, {
    lazy: true,
    // so it runs before component update effects in pre flush mode
    computed: true,
    onTrack,
    onTrigger,
    scheduler: applyCb ? () => scheduler(applyCb) : scheduler
  })

  if (lazy && cb) {
    oldValue = runner()
  } else {
    if (__DEV__ && lazy && !cb) {
      warn(
        `watch() lazy option is only respected when using the ` +
          `watch(getter, callback) signature.`
      )
    }
    if (applyCb) {
      scheduler(applyCb)
    } else {
      scheduler(runner)
    }
  }

  recordInstanceBoundEffect(runner)
  return () => {
    stop(runner)
    if (instance) {
      const effects = instance.effects!
      const index = effects.indexOf(runner)
      if (index > -1) {
        effects.splice(index, 1)
      }
    }
  }
}

// this.$watch
export function instanceWatch(
  this: ComponentInternalInstance,
  source: string | Function,
  cb: Function,
  options?: WatchOptions
): StopHandle {
  const ctx = this.proxy as Data
  const getter = isString(source) ? () => ctx[source] : source.bind(ctx)
  const stop = watch(getter, cb.bind(ctx), options)
  onBeforeUnmount(stop, this)
  return stop
}

function traverse(value: unknown, seen: Set<unknown> = new Set()) {
  if (!isObject(value) || seen.has(value)) {
    return
  }
  seen.add(value)
  if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen)
    }
  } else if (value instanceof Map) {
    const keys = [...value.keys()]

    for (let i = 0; i < keys.length; i++) {
      traverse(value.get(keys[i]), seen)
    }
  } else if (value instanceof Set) {
    const values = [...value.values()]

    for (let i = 0; i < values.length; i++) {
      traverse(values[i], seen)
    }
  } else {
    const keys = [
      ...Object.getOwnPropertyNames(value),
      ...Object.getOwnPropertySymbols(value)
    ]

    for (let i = 0; i < keys.length; i++) {
      // TS doesn't allow symbol as index type
      traverse(value[keys[i] as string], seen)
    }
  }
  return value
}
