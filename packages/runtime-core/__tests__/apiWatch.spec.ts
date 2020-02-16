import { watch, reactive, computed, nextTick, ref, h } from '../src/index'
import { render, nodeOps, serializeInner } from '@vue/runtime-test'
import {
  ITERATE_KEY,
  DebuggerEvent,
  TrackOpTypes,
  TriggerOpTypes
} from '@vue/reactivity'
import { mockWarn } from '@vue/shared'

// reference: https://vue-composition-api-rfc.netlify.com/api.html#watch

describe('api: watch', () => {
  mockWarn()

  it('basic usage', async () => {
    const state = reactive({ count: 0 })
    let dummy
    watch(() => {
      dummy = state.count
    })
    await nextTick()
    expect(dummy).toBe(0)

    state.count++
    await nextTick()
    expect(dummy).toBe(1)
  })

  it('triggers when initial value is null', async () => {
    const state = ref(null)
    const spy = jest.fn()
    watch(() => state.value, spy)
    await nextTick()
    expect(spy).toHaveBeenCalled()
  })

  it('triggers when initial value is undefined', async () => {
    const state = ref()
    const spy = jest.fn()
    watch(() => state.value, spy)
    await nextTick()
    expect(spy).toHaveBeenCalled()
    state.value = 3
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(2)
    // testing if undefined can trigger the watcher
    state.value = undefined
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(3)
    // it shouldn't trigger if the same value is set
    state.value = undefined
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('watching single source: getter', async () => {
    const state = reactive({ count: 0 })
    let dummy
    watch(
      () => state.count,
      (count, prevCount) => {
        dummy = [count, prevCount]
        // assert types
        count + 1
        if (prevCount) {
          prevCount + 1
        }
      }
    )
    await nextTick()
    expect(dummy).toMatchObject([0, undefined])

    state.count++
    await nextTick()
    expect(dummy).toMatchObject([1, 0])
  })

  it('watching single source: ref', async () => {
    const count = ref(0)
    let dummy
    watch(count, (count, prevCount) => {
      dummy = [count, prevCount]
      // assert types
      count + 1
      if (prevCount) {
        prevCount + 1
      }
    })
    await nextTick()
    expect(dummy).toMatchObject([0, undefined])

    count.value++
    await nextTick()
    expect(dummy).toMatchObject([1, 0])
  })

  it('watching single source: computed ref', async () => {
    const count = ref(0)
    const plus = computed(() => count.value + 1)
    let dummy
    watch(plus, (count, prevCount) => {
      dummy = [count, prevCount]
      // assert types
      count + 1
      if (prevCount) {
        prevCount + 1
      }
    })
    await nextTick()
    expect(dummy).toMatchObject([1, undefined])

    count.value++
    await nextTick()
    expect(dummy).toMatchObject([2, 1])
  })

  it('watching multiple sources', async () => {
    const state = reactive({ count: 1 })
    const count = ref(1)
    const plus = computed(() => count.value + 1)

    let dummy
    watch([() => state.count, count, plus], (vals, oldVals) => {
      dummy = [vals, oldVals]
      // assert types
      vals.concat(1)
      oldVals.concat(1)
    })
    await nextTick()
    expect(dummy).toMatchObject([[1, 1, 2], []])

    state.count++
    count.value++
    await nextTick()
    expect(dummy).toMatchObject([[2, 2, 3], [1, 1, 2]])
  })

  it('watching multiple sources: readonly array', async () => {
    const state = reactive({ count: 1 })
    const status = ref(false)

    let dummy
    watch([() => state.count, status] as const, (vals, oldVals) => {
      dummy = [vals, oldVals]
      let [count] = vals
      let [, oldStatus] = oldVals
      // assert types
      count + 1
      oldStatus === true
    })
    await nextTick()
    expect(dummy).toMatchObject([[1, false], []])

    state.count++
    status.value = true
    await nextTick()
    expect(dummy).toMatchObject([[2, true], [1, false]])
  })

  it('stopping the watcher', async () => {
    const state = reactive({ count: 0 })
    let dummy
    const stop = watch(() => {
      dummy = state.count
    })
    await nextTick()
    expect(dummy).toBe(0)

    stop()
    state.count++
    await nextTick()
    // should not update
    expect(dummy).toBe(0)
  })

  it('cleanup registration (basic)', async () => {
    const state = reactive({ count: 0 })
    const cleanup = jest.fn()
    let dummy
    const stop = watch(onCleanup => {
      onCleanup(cleanup)
      dummy = state.count
    })
    await nextTick()
    expect(dummy).toBe(0)

    state.count++
    await nextTick()
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(1)

    stop()
    expect(cleanup).toHaveBeenCalledTimes(2)
  })

  it('cleanup registration (with source)', async () => {
    const count = ref(0)
    const cleanup = jest.fn()
    let dummy
    const stop = watch(count, (count, prevCount, onCleanup) => {
      onCleanup(cleanup)
      dummy = count
    })
    await nextTick()
    expect(dummy).toBe(0)

    count.value++
    await nextTick()
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(1)

    stop()
    expect(cleanup).toHaveBeenCalledTimes(2)
  })

  it('flush timing: post', async () => {
    const count = ref(0)
    const assertion = jest.fn(count => {
      expect(serializeInner(root)).toBe(`${count}`)
    })

    const Comp = {
      setup() {
        watch(() => {
          assertion(count.value)
        })
        return () => count.value
      }
    }
    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    await nextTick()
    expect(assertion).toHaveBeenCalledTimes(1)

    count.value++
    await nextTick()
    expect(assertion).toHaveBeenCalledTimes(2)
  })

  it('flush timing: pre', async () => {
    const count = ref(0)
    const count2 = ref(0)

    let callCount = 0
    const assertion = jest.fn((count, count2Value) => {
      callCount++
      // on mount, the watcher callback should be called before DOM render
      // on update, should be called before the count is updated
      const expectedDOM = callCount === 1 ? `` : `${count - 1}`
      expect(serializeInner(root)).toBe(expectedDOM)

      // in a pre-flush callback, all state should have been updated
      const expectedState = callCount === 1 ? 0 : 1
      expect(count2Value).toBe(expectedState)
    })

    const Comp = {
      setup() {
        watch(
          () => {
            assertion(count.value, count2.value)
          },
          {
            flush: 'pre'
          }
        )
        return () => count.value
      }
    }
    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    await nextTick()
    expect(assertion).toHaveBeenCalledTimes(1)

    count.value++
    count2.value++
    await nextTick()
    // two mutations should result in 1 callback execution
    expect(assertion).toHaveBeenCalledTimes(2)
  })

  it('flush timing: sync', async () => {
    const count = ref(0)
    const count2 = ref(0)

    let callCount = 0
    const assertion = jest.fn(count => {
      callCount++
      // on mount, the watcher callback should be called before DOM render
      // on update, should be called before the count is updated
      const expectedDOM = callCount === 1 ? `` : `${count - 1}`
      expect(serializeInner(root)).toBe(expectedDOM)

      // in a sync callback, state mutation on the next line should not have
      // executed yet on the 2nd call, but will be on the 3rd call.
      const expectedState = callCount < 3 ? 0 : 1
      expect(count2.value).toBe(expectedState)
    })

    const Comp = {
      setup() {
        watch(
          () => {
            assertion(count.value)
          },
          {
            flush: 'sync'
          }
        )
        return () => count.value
      }
    }
    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    await nextTick()
    expect(assertion).toHaveBeenCalledTimes(1)

    count.value++
    count2.value++
    await nextTick()
    expect(assertion).toHaveBeenCalledTimes(3)
  })

  it('deep', async () => {
    const countSymbol = Symbol('countSymbol')

    const state = reactive({
      nested: {
        count: ref(0),
        [countSymbol]: ref(0)
      },
      array: [1, 2, 3],
      map: new Map([['a', 1], ['b', 2]]),
      set: new Set([1, 2, 3])
    })

    let dummy
    watch(
      () => state,
      state => {
        dummy = [
          state.nested.count,
          state.nested[countSymbol],
          state.array[0],
          state.map.get('a'),
          state.set.has(1)
        ]
      },
      { deep: true }
    )

    await nextTick()
    expect(dummy).toEqual([0, 0, 1, 1, true])

    state.nested.count++
    await nextTick()
    expect(dummy).toEqual([1, 0, 1, 1, true])

    state.nested[countSymbol]++
    await nextTick()
    expect(dummy).toEqual([1, 1, 1, 1, true])

    // nested array mutation
    state.array[0] = 2
    await nextTick()
    expect(dummy).toEqual([1, 1, 2, 1, true])

    // nested map mutation
    state.map.set('a', 2)
    await nextTick()
    expect(dummy).toEqual([1, 1, 2, 2, true])

    // nested set mutation
    state.set.delete(1)
    await nextTick()
    expect(dummy).toEqual([1, 1, 2, 2, false])
  })

  it('lazy', async () => {
    const count = ref(0)
    const cb = jest.fn()
    watch(count, cb, { lazy: true })
    await nextTick()
    expect(cb).not.toHaveBeenCalled()
    count.value++
    await nextTick()
    expect(cb).toHaveBeenCalled()
  })

  it('ignore lazy option when using simple callback', async () => {
    const count = ref(0)
    let dummy
    // @ts-ignore
    watch(
      () => {
        dummy = count.value
      },
      { lazy: true }
    )
    expect(dummy).toBeUndefined()
    expect(`lazy option is only respected`).toHaveBeenWarned()

    await nextTick()
    expect(dummy).toBe(0)

    count.value++
    await nextTick()
    expect(dummy).toBe(1)
  })

  it('onTrack', async () => {
    const events: DebuggerEvent[] = []
    let dummy
    const onTrack = jest.fn((e: DebuggerEvent) => {
      events.push(e)
    })
    const obj = reactive({ foo: 1, bar: 2 })
    watch(
      () => {
        dummy = [obj.foo, 'bar' in obj, Object.keys(obj)]
      },
      { onTrack }
    )
    await nextTick()
    expect(dummy).toEqual([1, true, ['foo', 'bar']])
    expect(onTrack).toHaveBeenCalledTimes(3)
    expect(events).toMatchObject([
      {
        target: obj,
        type: TrackOpTypes.GET,
        key: 'foo'
      },
      {
        target: obj,
        type: TrackOpTypes.HAS,
        key: 'bar'
      },
      {
        target: obj,
        type: TrackOpTypes.ITERATE,
        key: ITERATE_KEY
      }
    ])
  })

  it('onTrigger', async () => {
    const events: DebuggerEvent[] = []
    let dummy
    const onTrigger = jest.fn((e: DebuggerEvent) => {
      events.push(e)
    })
    const obj = reactive({ foo: 1 })
    watch(
      () => {
        dummy = obj.foo
      },
      { onTrigger }
    )
    await nextTick()
    expect(dummy).toBe(1)

    obj.foo++
    await nextTick()
    expect(dummy).toBe(2)
    expect(onTrigger).toHaveBeenCalledTimes(1)
    expect(events[0]).toMatchObject({
      type: TriggerOpTypes.SET,
      key: 'foo',
      oldValue: 1,
      newValue: 2
    })

    delete obj.foo
    await nextTick()
    expect(dummy).toBeUndefined()
    expect(onTrigger).toHaveBeenCalledTimes(2)
    expect(events[1]).toMatchObject({
      type: TriggerOpTypes.DELETE,
      key: 'foo',
      oldValue: 2
    })
  })
})
