import {
  computed,
  deferredComputed,
  effect,
  isComputed,
  reactive,
  ref,
  toRaw
} from '../src'

describe('deferred computed', () => {
  const tick = Promise.resolve()

  test('should only trigger once on multiple mutations', async () => {
    const src = ref(0)
    const c = deferredComputed(() => src.value)
    const spy = jest.fn()
    effect(() => {
      spy(c.value)
    })
    expect(spy).toHaveBeenCalledTimes(1)
    src.value = 1
    src.value = 2
    src.value = 3
    // not called yet
    expect(spy).toHaveBeenCalledTimes(1)
    await tick
    // should only trigger once
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenCalledWith(c.value)
  })

  test('should not trigger if value did not change', async () => {
    const src = ref(0)
    const c = deferredComputed(() => src.value % 2)
    const spy = jest.fn()
    effect(() => {
      spy(c.value)
    })
    expect(spy).toHaveBeenCalledTimes(1)
    src.value = 1
    src.value = 2

    await tick
    // should not trigger
    expect(spy).toHaveBeenCalledTimes(1)

    src.value = 3
    src.value = 4
    src.value = 5
    await tick
    // should trigger because latest value changes
    expect(spy).toHaveBeenCalledTimes(2)
  })

  test('chained computed trigger', async () => {
    const effectSpy = jest.fn()
    const c1Spy = jest.fn()
    const c2Spy = jest.fn()

    const src = ref(0)
    const c1 = deferredComputed(() => {
      c1Spy()
      return src.value % 2
    })
    const c2 = computed(() => {
      c2Spy()
      return c1.value + 1
    })

    effect(() => {
      effectSpy(c2.value)
    })

    expect(c1Spy).toHaveBeenCalledTimes(1)
    expect(c2Spy).toHaveBeenCalledTimes(1)
    expect(effectSpy).toHaveBeenCalledTimes(1)

    src.value = 1
    await tick
    expect(c1Spy).toHaveBeenCalledTimes(2)
    expect(c2Spy).toHaveBeenCalledTimes(2)
    expect(effectSpy).toHaveBeenCalledTimes(2)
  })

  test('chained computed avoid re-compute', async () => {
    const effectSpy = jest.fn()
    const c1Spy = jest.fn()
    const c2Spy = jest.fn()

    const src = ref(0)
    const c1 = deferredComputed(() => {
      c1Spy()
      return src.value % 2
    })
    const c2 = computed(() => {
      c2Spy()
      return c1.value + 1
    })

    effect(() => {
      effectSpy(c2.value)
    })

    expect(effectSpy).toHaveBeenCalledTimes(1)
    src.value = 2
    src.value = 4
    src.value = 6
    await tick
    // c1 should re-compute once.
    expect(c1Spy).toHaveBeenCalledTimes(2)
    // c2 should not have to re-compute because c1 did not change.
    expect(c2Spy).toHaveBeenCalledTimes(1)
    // effect should not trigger because c2 did not change.
    expect(effectSpy).toHaveBeenCalledTimes(1)
  })

  test('chained computed value invalidation', async () => {
    const effectSpy = jest.fn()
    const c1Spy = jest.fn()
    const c2Spy = jest.fn()

    const src = ref(0)
    const c1 = deferredComputed(() => {
      c1Spy()
      return src.value % 2
    })
    const c2 = deferredComputed(() => {
      c2Spy()
      return c1.value + 1
    })

    effect(() => {
      effectSpy(c2.value)
    })

    expect(effectSpy).toHaveBeenCalledTimes(1)
    expect(effectSpy).toHaveBeenCalledWith(1)
    expect(c2.value).toBe(1)

    expect(c1Spy).toHaveBeenCalledTimes(1)
    expect(c2Spy).toHaveBeenCalledTimes(1)

    src.value = 1
    // value should be available sync
    expect(c2.value).toBe(2)
    expect(c2Spy).toHaveBeenCalledTimes(2)
  })

  test('sync access of invalidated chained computed should not prevent final effect from running', async () => {
    const effectSpy = jest.fn()
    const c1Spy = jest.fn()
    const c2Spy = jest.fn()

    const src = ref(0)
    const c1 = deferredComputed(() => {
      c1Spy()
      return src.value % 2
    })
    const c2 = deferredComputed(() => {
      c2Spy()
      return c1.value + 1
    })

    effect(() => {
      effectSpy(c2.value)
    })
    expect(effectSpy).toHaveBeenCalledTimes(1)

    src.value = 1
    // sync access c2
    c2.value
    await tick
    expect(effectSpy).toHaveBeenCalledTimes(2)
  })

  test('should not compute if deactivated before scheduler is called', async () => {
    const c1Spy = jest.fn()
    const src = ref(0)
    const c1 = deferredComputed(() => {
      c1Spy()
      return src.value % 2
    })
    effect(() => c1.value)
    expect(c1Spy).toHaveBeenCalledTimes(1)

    c1.effect.stop()
    // trigger
    src.value++
    await tick
    expect(c1Spy).toHaveBeenCalledTimes(1)
  })

  it('isComputed', () => {
    expect(isComputed(computed(() => 1))).toBe(true)
    expect(isComputed(deferredComputed(() => 1))).toBe(true)
    expect(isComputed(ref(1))).toBe(false)
    expect(isComputed(reactive({}))).toBe(false)
    expect(isComputed(reactive({ c: computed(() => 1) }).c)).toBe(false)
    expect(isComputed(toRaw(reactive({ c: computed(() => 1) })).c)).toBe(true)
  })
})
