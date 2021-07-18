import { reactive, isReactive, toRaw } from '../src/reactive'
import { ref, isRef } from '../src/ref'
import { effect } from '../src/effect'

describe('reactivity/reactive/Array', () => {
  test('should make Array reactive', () => {
    const original = [{ foo: 1 }]
    const observed = reactive(original)
    expect(observed).not.toBe(original)
    expect(isReactive(observed)).toBe(true)
    expect(isReactive(original)).toBe(false)
    expect(isReactive(observed[0])).toBe(true)
    // get
    expect(observed[0].foo).toBe(1)
    // has
    expect(0 in observed).toBe(true)
    // ownKeys
    expect(Object.keys(observed)).toEqual(['0'])
  })

  test('cloned reactive Array should point to observed values', () => {
    const original = [{ foo: 1 }]
    const observed = reactive(original)
    const clone = observed.slice()
    expect(isReactive(clone[0])).toBe(true)
    expect(clone[0]).not.toBe(original[0])
    expect(clone[0]).toBe(observed[0])
  })

  test('observed value should proxy mutations to original (Array)', () => {
    const original: any[] = [{ foo: 1 }, { bar: 2 }]
    const observed = reactive(original)
    // set
    const value = { baz: 3 }
    const reactiveValue = reactive(value)
    observed[0] = value
    expect(observed[0]).toBe(reactiveValue)
    expect(original[0]).toBe(value)
    // delete
    delete observed[0]
    expect(observed[0]).toBeUndefined()
    expect(original[0]).toBeUndefined()
    // mutating methods
    observed.push(value)
    expect(observed[2]).toBe(reactiveValue)
    expect(original[2]).toBe(value)
  })

  test('Array identity methods should work with raw values', () => {
    const raw = {}
    const arr = reactive([{}, {}])
    arr.push(raw)
    expect(arr.indexOf(raw)).toBe(2)
    expect(arr.indexOf(raw, 3)).toBe(-1)
    expect(arr.includes(raw)).toBe(true)
    expect(arr.includes(raw, 3)).toBe(false)
    expect(arr.lastIndexOf(raw)).toBe(2)
    expect(arr.lastIndexOf(raw, 1)).toBe(-1)

    // should work also for the observed version
    const observed = arr[2]
    expect(arr.indexOf(observed)).toBe(2)
    expect(arr.indexOf(observed, 3)).toBe(-1)
    expect(arr.includes(observed)).toBe(true)
    expect(arr.includes(observed, 3)).toBe(false)
    expect(arr.lastIndexOf(observed)).toBe(2)
    expect(arr.lastIndexOf(observed, 1)).toBe(-1)
  })

  test('Array identity methods should work if raw value contains reactive objects', () => {
    const raw = []
    const obj = reactive({})
    raw.push(obj)
    const arr = reactive(raw)
    expect(arr.includes(obj)).toBe(true)
  })

  test('Array identity methods should be reactive', () => {
    const obj = {}
    const arr = reactive([obj, {}])

    let index: number = -1
    effect(() => {
      index = arr.indexOf(obj)
    })
    expect(index).toBe(0)
    arr.reverse()
    expect(index).toBe(1)
  })

  test('delete on Array should not trigger length dependency', () => {
    const arr = reactive([1, 2, 3])
    const fn = jest.fn()
    effect(() => {
      fn(arr.length)
    })
    expect(fn).toHaveBeenCalledTimes(1)
    delete arr[1]
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('add existing index on Array should not trigger length dependency', () => {
    const array = new Array(3)
    const observed = reactive(array)
    const fn = jest.fn()
    effect(() => {
      fn(observed.length)
    })
    expect(fn).toHaveBeenCalledTimes(1)
    observed[1] = 1
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('add non-integer prop on Array should not trigger length dependency', () => {
    const array: any[] & { x?: string } = new Array(3)
    const observed = reactive(array)
    const fn = jest.fn()
    effect(() => {
      fn(observed.length)
    })
    expect(fn).toHaveBeenCalledTimes(1)
    observed.x = 'x'
    expect(fn).toHaveBeenCalledTimes(1)
    observed[-1] = 'x'
    expect(fn).toHaveBeenCalledTimes(1)
    observed[NaN] = 'x'
    expect(fn).toHaveBeenCalledTimes(1)
  })

  // #2427
  test('track length on for ... in iteration', () => {
    const array = reactive([1])
    let length = ''
    effect(() => {
      length = ''
      for (const key in array) {
        length += key
      }
    })
    expect(length).toBe('0')
    array.push(1)
    expect(length).toBe('01')
  })

  describe('Array methods w/ refs', () => {
    let original: any[]
    beforeEach(() => {
      original = reactive([1, ref(2)])
    })

    // read + copy
    test('read only copy methods', () => {
      const res = original.concat([3, ref(4)])
      const raw = toRaw(res)
      expect(isRef(raw[1])).toBe(true)
      expect(isRef(raw[3])).toBe(true)
    })

    // read + write
    test('read + write mutating methods', () => {
      const res = original.copyWithin(0, 1, 2)
      const raw = toRaw(res)
      expect(isRef(raw[0])).toBe(true)
      expect(isRef(raw[1])).toBe(true)
    })

    test('read + identity', () => {
      const ref = original[1]
      expect(ref).toBe(toRaw(original)[1])
      expect(original.indexOf(ref)).toBe(1)
    })
  })

  describe('Array subclasses', () => {
    class SubArray<T> extends Array<T> {
      lastPushed: undefined | T
      lastSearched: undefined | T

      push(item: T) {
        this.lastPushed = item
        return super.push(item)
      }

      indexOf(searchElement: T, fromIndex?: number | undefined): number {
        this.lastSearched = searchElement
        return super.indexOf(searchElement, fromIndex)
      }
    }

    test('calls correct mutation method on Array subclass', () => {
      const subArray = new SubArray(4, 5, 6)
      const observed = reactive(subArray)

      subArray.push(7)
      expect(subArray.lastPushed).toBe(7)
      observed.push(9)
      expect(observed.lastPushed).toBe(9)
    })

    test('calls correct identity-sensitive method on Array subclass', () => {
      const subArray = new SubArray(4, 5, 6)
      const observed = reactive(subArray)
      let index

      index = subArray.indexOf(4)
      expect(index).toBe(0)
      expect(subArray.lastSearched).toBe(4)

      index = observed.indexOf(6)
      expect(index).toBe(2)
      expect(observed.lastSearched).toBe(6)
    })
  })
})
