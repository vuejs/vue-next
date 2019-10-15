const systemModifiers = new Set(['ctrl', 'shift', 'alt', 'meta'])

const modifierGuards: Record<
  string,
  (e: Event, modifiers?: string[]) => void | boolean
> = {
  stop: e => e.stopPropagation(),
  prevent: e => e.preventDefault(),
  self: e => e.target !== e.currentTarget,
  ctrl: e => !(e as KeyboardEvent).ctrlKey,
  shift: e => !(e as KeyboardEvent).shiftKey,
  alt: e => !(e as KeyboardEvent).altKey,
  meta: e => !(e as KeyboardEvent).metaKey,
  left: e => 'button' in e && (e as MouseEvent).button !== 0,
  middle: e => 'button' in e && (e as MouseEvent).button !== 1,
  right: e => 'button' in e && (e as MouseEvent).button !== 2,
  exact: (e, modifiers) =>
    modifiers!.some(m => systemModifiers.has(m) && (e as any)[`${m}Key`])
}

export const vOnModifiersGuard = (fn: Function, modifiers: string[]) => {
  return (event: Event) => {
    for (let i = 0; i < modifiers.length; i++) {
      const guard = modifierGuards[modifiers[i]]
      if (guard && guard(event, modifiers)) return
    }
    return fn(event)
  }
}

// Kept for 2.x compat.
// Note: IE11 compat for `spacebar` and `del` is removed for now.
const keyNames: Record<string, string | string[]> = {
  esc: 'escape',
  space: ' ',
  up: 'arrowup',
  left: 'arrowleft',
  right: 'arrowright',
  down: 'arrowdown',
  delete: 'backspace'
}

export const vOnKeysGuard = (fn: Function, modifiers: string[]) => {
  return (event: KeyboardEvent) => {
    if (!('key' in event)) return
    const eventKey = event.key.toLowerCase()
    if (
      // None of the provided key modifiers match the current event key
      !modifiers.some(k => k === eventKey || keyNames[k] === eventKey)
    ) {
      return
    }
    return fn(event)
  }
}
