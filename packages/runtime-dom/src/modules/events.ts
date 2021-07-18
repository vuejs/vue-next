import { hyphenate, isArray } from '@vue/shared'
import {
  ComponentInternalInstance,
  callWithAsyncErrorHandling
} from '@vue/runtime-core'
import { ErrorCodes } from 'packages/runtime-core/src/errorHandling'

interface Invoker extends EventListener {
  value: EventValue
  attached: number
}

type EventValue = Function | Function[]

// Async edge case fix requires storing an event listener's attach timestamp.
let _getNow: () => number = Date.now

let skipTimestampCheck = false

if (typeof window !== 'undefined') {
  // Determine what event timestamp the browser is using. Annoyingly, the
  // timestamp can either be hi-res (relative to page load) or low-res
  // (relative to UNIX epoch), so in order to compare time we have to use the
  // same timestamp type when saving the flush timestamp.
  if (_getNow() > document.createEvent('Event').timeStamp) {
    // if the low-res timestamp which is bigger than the event timestamp
    // (which is evaluated AFTER) it means the event is using a hi-res timestamp,
    // and we need to use the hi-res version for event listeners as well.
    _getNow = () => performance.now()
  }
  // #3485: Firefox <= 53 has incorrect Event.timeStamp implementation
  // and does not fire microtasks in between event propagation, so safe to exclude.
  const ffMatch = navigator.userAgent.match(/firefox\/(\d+)/i)
  skipTimestampCheck = !!(ffMatch && Number(ffMatch[1]) <= 53)
}

// To avoid the overhead of repeatedly calling performance.now(), we cache
// and use the same timestamp for all event listeners attached in the same tick.
let cachedNow: number = 0
const p = Promise.resolve()
const reset = () => {
  cachedNow = 0
}
const getNow = () => cachedNow || (p.then(reset), (cachedNow = _getNow()))

export function addEventListener(
  el: Element,
  event: string,
  handler: EventListener,
  options?: EventListenerOptions
) {
  el.addEventListener(event, handler, options)
}

export function removeEventListener(
  el: Element,
  event: string,
  handler: EventListener,
  options?: EventListenerOptions
) {
  el.removeEventListener(event, handler, options)
}

export function patchEvent(
  el: Element & { _vei?: Record<string, Invoker | undefined> },
  rawName: string,
  prevValue: EventValue | null,
  nextValue: EventValue | null,
  instance: ComponentInternalInstance | null = null
) {
  // vei = vue event invokers
  const invokers = el._vei || (el._vei = {})
  const existingInvoker = invokers[rawName]
  if (nextValue && existingInvoker) {
    // patch
    existingInvoker.value = nextValue
  } else {
    const [name, options] = parseName(rawName)
    if (nextValue) {
      // add
      const invoker = (invokers[rawName] = createInvoker(nextValue, instance))
      addEventListener(el, name, invoker, options)
    } else if (existingInvoker) {
      // remove
      removeEventListener(el, name, existingInvoker, options)
      invokers[rawName] = undefined
    }
  }
}

const optionsModifierRE = /(?:Once|Passive|Capture)$/

function parseName(name: string): [string, EventListenerOptions | undefined] {
  let options: EventListenerOptions | undefined
  if (optionsModifierRE.test(name)) {
    options = {}
    let m
    while ((m = name.match(optionsModifierRE))) {
      name = name.slice(0, name.length - m[0].length)
      ;(options as any)[m[0].toLowerCase()] = true
      options
    }
  }
  return [hyphenate(name.slice(2)), options]
}

function createInvoker(
  initialValue: EventValue,
  instance: ComponentInternalInstance | null
) {
  const invoker: Invoker = (e: Event) => {
    // async edge case #6566: inner click event triggers patch, event handler
    // attached to outer element during patch, and triggered again. This
    // happens because browsers fire microtask ticks between event propagation.
    // the solution is simple: we save the timestamp when a handler is attached,
    // and the handler would only fire if the event passed to it was fired
    // AFTER it was attached.
    const timeStamp = e.timeStamp || _getNow()

    if (skipTimestampCheck || timeStamp >= invoker.attached - 1) {
      callWithAsyncErrorHandling(
        patchStopImmediatePropagation(e, invoker.value),
        instance,
        ErrorCodes.NATIVE_EVENT_HANDLER,
        [e]
      )
    }
  }
  invoker.value = initialValue
  invoker.attached = getNow()
  return invoker
}

function patchStopImmediatePropagation(
  e: Event,
  value: EventValue
): EventValue {
  if (isArray(value)) {
    const originalStop = e.stopImmediatePropagation
    e.stopImmediatePropagation = () => {
      originalStop.call(e)
      ;(e as any)._stopped = true
    }
    return value.map(fn => (e: Event) => !(e as any)._stopped && fn(e))
  } else {
    return value
  }
}

export interface SyntheticEvent<T = Element, E = Event> extends Event {
  target: EventTarget
  nativeEvent: E
  currentTarget: T & EventTarget
}

export interface InputEvent<T = Element> extends SyntheticEvent<T> {
  target: EventTarget & T
}

// Event type helpers
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts

type NativeAnimationEvent = AnimationEvent
type NativeClipboardEvent = ClipboardEvent
type NativeCompositionEvent = CompositionEvent
type NativeDragEvent = DragEvent
type NativeFocusEvent = FocusEvent
type NativeKeyboardEvent = KeyboardEvent
type NativeMouseEvent = MouseEvent
type NativeTouchEvent = TouchEvent
type NativePointerEvent = PointerEvent
type NativeTransitionEvent = TransitionEvent
type NativeUIEvent = UIEvent
type NativeWheelEvent = WheelEvent

export interface ClipboardEvent<T = Element>
  extends SyntheticEvent<T, NativeClipboardEvent> {
  clipboardData: DataTransfer
}

export interface CompositionEvent<T = Element>
  extends SyntheticEvent<T, NativeCompositionEvent> {
  data: string
}

export interface DragEvent<T = Element> extends MouseEvent<T, NativeDragEvent> {
  dataTransfer: DataTransfer
}

export interface PointerEvent<T = Element>
  extends MouseEvent<T, NativePointerEvent> {
  pointerId: number
  pressure: number
  tangentialPressure: number
  tiltX: number
  tiltY: number
  twist: number
  width: number
  height: number
  pointerType: 'mouse' | 'pen' | 'touch'
  isPrimary: boolean
}

export interface FocusEvent<T = Element>
  extends SyntheticEvent<T, NativeFocusEvent> {
  relatedTarget: EventTarget | null
  target: EventTarget & T
}

export interface FormEvent<T = Element> extends SyntheticEvent<T> {}

export interface InvalidEvent<T = Element> extends SyntheticEvent<T> {
  target: EventTarget & T
}

export interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
  target: EventTarget & T
}

export interface KeyboardEvent<T = Element>
  extends SyntheticEvent<T, NativeKeyboardEvent> {
  altKey: boolean
  /** @deprecated */
  charCode: number
  ctrlKey: boolean
  code: string
  /**
   * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
   */
  getModifierState(key: string): boolean
  /**
   * See the [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#named-key-attribute-values). for possible values
   */
  key: string
  /** @deprecated */
  keyCode: number
  locale: string
  location: number
  metaKey: boolean
  repeat: boolean
  shiftKey: boolean
  /** @deprecated */
  which: number
}

export interface MouseEvent<T = Element, E = NativeMouseEvent>
  extends UIEvent<T, E> {
  altKey: boolean
  button: number
  buttons: number
  clientX: number
  clientY: number
  ctrlKey: boolean
  /**
   * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
   */
  getModifierState(key: string): boolean
  metaKey: boolean
  movementX: number
  movementY: number
  pageX: number
  pageY: number
  relatedTarget: EventTarget | null
  screenX: number
  screenY: number
  shiftKey: boolean
}

export interface TouchEvent<T = Element> extends UIEvent<T, NativeTouchEvent> {
  altKey: boolean
  changedTouches: TouchList
  ctrlKey: boolean
  /**
   * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
   */
  getModifierState(key: string): boolean
  metaKey: boolean
  shiftKey: boolean
  targetTouches: TouchList
  touches: TouchList
}

export interface UIEvent<T = Element, E = NativeUIEvent>
  extends SyntheticEvent<T, E> {
  detail: number
  view: AbstractView
}

export interface WheelEvent<T = Element>
  extends MouseEvent<T, NativeWheelEvent> {
  deltaMode: number
  deltaX: number
  deltaY: number
  deltaZ: number
}

export interface AnimationEvent<T = Element>
  extends SyntheticEvent<T, NativeAnimationEvent> {
  animationName: string
  elapsedTime: number
  pseudoElement: string
}

export interface TransitionEvent<T = Element>
  extends SyntheticEvent<T, NativeTransitionEvent> {
  elapsedTime: number
  propertyName: string
  pseudoElement: string
}

//
// Browser Interfaces
// https://github.com/nikeee/2048-typescript/blob/master/2048/js/touch.d.ts
// ----------------------------------------------------------------------

interface AbstractView {
  styleMedia: StyleMedia
  document: Document
}

interface Touch {
  identifier: number
  target: EventTarget
  screenX: number
  screenY: number
  clientX: number
  clientY: number
  pageX: number
  pageY: number
}

interface TouchList {
  [index: number]: Touch
  length: number
  item(index: number): Touch
  identifiedTouch(identifier: number): Touch
}
