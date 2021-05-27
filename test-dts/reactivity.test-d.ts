import {
  readonly,
  describe,
  expectError,
  ref,
  Ref,
  reactive,
  expectType
} from './index'

describe('should support DeepReadonly', () => {
  const r = readonly({ obj: { k: 'v' } })
  // @ts-expect-error
  expectError((r.obj = {}))
  // @ts-expect-error
  expectError((r.obj.k = 'x'))
})

describe('should unwrap tuple correctly', () => {
  const readonlyTuple = [ref(0)] as const
  const reactiveReadonlyTuple = reactive(readonlyTuple)
  expectType<Ref<number>>(reactiveReadonlyTuple[0])

  const tuple: [Ref<number>] = [ref(0)]
  const reactiveTuple = reactive(tuple)
  expectType<Ref<number>>(reactiveTuple[0])
})
