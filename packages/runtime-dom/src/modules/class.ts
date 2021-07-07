import { ElementWithTransition } from '../components/Transition'

// compiler should normalize class + :class bindings on the same element
// into a single binding ['staticClass', dynamic]
export function patchClass(el: Element, value: string | null, isSVG: boolean) {
  if (value == null) {
    value = ''
  }
  if (isSVG) {
    value ? el.setAttribute('class', value) : el.removeAttribute('class')
  } else {
    if (!el.className && !value) return
    // directly setting className should be faster than setAttribute in theory
    // if this is an element during a transition, take the temporary transition
    // classes into account.
    const transitionClasses = (el as ElementWithTransition)._vtc
    if (transitionClasses) {
      value = (value
        ? [value, ...transitionClasses]
        : [...transitionClasses]
      ).join(' ')
    }
    if (!value) {
      el.removeAttribute('class')
      return
    }
    el.className = value
  }
}
