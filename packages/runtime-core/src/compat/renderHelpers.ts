import {
  camelize,
  extend,
  hyphenate,
  isString,
  isArray,
  isObject,
  isReservedProp,
  normalizeClass
} from '@vue/shared'
import { ComponentInternalInstance } from '../component'
import { Slot } from '../componentSlots'
import { createSlots } from '../helpers/createSlots'
import { renderSlot } from '../helpers/renderSlot'
import { toHandlers } from '../helpers/toHandlers'
import { mergeProps, VNode } from '../vnode'

function toObject(arr: Array<any>): Object {
  const res = {}
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i])
    }
  }
  return res
}

export function legacyBindObjectProps(
  data: any,
  _tag: string,
  value: any,
  _asProp: boolean,
  isSync?: boolean
) {
  if (value && isObject(value)) {
    if (isArray(value)) {
      value = toObject(value)
    }
    for (const key in value) {
      if (isReservedProp(key)) {
        data[key] = value[key]
      } else if (key === 'class') {
        data.class = normalizeClass([data.class, value.class])
      } else if (key === 'style') {
        data.style = normalizeClass([data.style, value.style])
      } else {
        const attrs = data.attrs || (data.attrs = {})
        const camelizedKey = camelize(key)
        const hyphenatedKey = hyphenate(key)
        if (!(camelizedKey in attrs) && !(hyphenatedKey in attrs)) {
          attrs[key] = value[key]

          if (isSync) {
            const on = data.on || (data.on = {})
            on[`update:${key}`] = function ($event: any) {
              value[key] = $event
            }
          }
        }
      }
    }
  }
  return data
}

export function legacyBindObjectListeners(props: any, listeners: any) {
  return mergeProps(props, toHandlers(listeners))
}

export function legacyRenderSlot(
  instance: ComponentInternalInstance,
  name: string,
  fallback?: VNode[],
  props?: any,
  bindObject?: any
) {
  if (bindObject) {
    props = mergeProps(props, bindObject)
  }
  return renderSlot(instance.slots, name, props, fallback && (() => fallback))
}

type LegacyScopedSlotsData = Array<
  | {
      key: string
      fn: Function
    }
  | LegacyScopedSlotsData
>

export function legacyresolveScopedSlots(
  fns: LegacyScopedSlotsData,
  raw?: Record<string, Slot>,
  // the following are added in 2.6
  hasDynamicKeys?: boolean
) {
  // v2 default slot doesn't have name
  return createSlots(
    raw || ({ $stable: !hasDynamicKeys } as any),
    mapKeyToName(fns)
  )
}

function mapKeyToName(slots: LegacyScopedSlotsData) {
  for (let i = 0; i < slots.length; i++) {
    const fn = slots[i]
    if (fn) {
      if (isArray(fn)) {
        mapKeyToName(fn)
      } else {
        ;(fn as any).name = fn.key || 'default'
      }
    }
  }
  return slots as any
}

const staticCacheMap = /*#__PURE__*/ new WeakMap<
  ComponentInternalInstance,
  any[]
>()

export function legacyRenderStatic(
  instance: ComponentInternalInstance,
  index: number
) {
  let cache = staticCacheMap.get(instance)
  if (!cache) {
    staticCacheMap.set(instance, (cache = []))
  }
  if (cache[index]) {
    return cache[index]
  }
  const fn = (instance.type as any).staticRenderFns[index]
  const ctx = instance.proxy
  return (cache[index] = fn.call(ctx, null, ctx))
}

export function legacyCheckKeyCodes(
  instance: ComponentInternalInstance,
  eventKeyCode: number,
  key: string,
  builtInKeyCode?: number | number[],
  eventKeyName?: string,
  builtInKeyName?: string | string[]
) {
  const config = instance.appContext.config as any
  const configKeyCodes = config.keyCodes || {}
  const mappedKeyCode = configKeyCodes[key] || builtInKeyCode
  if (builtInKeyName && eventKeyName && !configKeyCodes[key]) {
    return isKeyNotMatch(builtInKeyName, eventKeyName)
  } else if (mappedKeyCode) {
    return isKeyNotMatch(mappedKeyCode, eventKeyCode)
  } else if (eventKeyName) {
    return hyphenate(eventKeyName) !== key
  }
}

function isKeyNotMatch<T>(expect: T | T[], actual: T): boolean {
  if (isArray(expect)) {
    return expect.indexOf(actual) === -1
  } else {
    return expect !== actual
  }
}

export function legacyMarkOnce(tree: VNode) {
  return tree
}

export function legacyBindDynamicKeys(props: any, values: any[]) {
  for (let i = 0; i < values.length; i += 2) {
    const key = values[i]
    if (isString(key) && key) {
      props[values[i]] = values[i + 1]
    }
  }
  return props
}

export function legacyPrependModifier(value: any, symbol: string) {
  return isString(value) ? symbol + value : value
}
