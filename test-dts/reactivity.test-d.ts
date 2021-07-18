import {
  readonly,
  describe,
  expectError,
  markRaw,
  expectType,
  reactive,
  Ref,
  ref
} from './index'

describe('should support DeepReadonly', () => {
  const r = readonly({ obj: { k: 'v' } })
  // @ts-expect-error
  expectError((r.obj = {}))
  // @ts-expect-error
  expectError((r.obj.k = 'x'))
})

describe('should support markRaw', () => {
  class Test<T> {
    item = {} as Ref<T>
  }
  const test = new Test<number>()
  const plain = {
    ref: ref(1)
  }

  const r = reactive({
    class: {
      raw: markRaw(test),
      reactive: test
    },
    plain: {
      raw: markRaw(plain),
      reactive: plain
    }
  })

  expectType<Test<number>>(r.class.raw)
  // @ts-expect-error it should unwrap
  expectType<Test<number>>(r.class.reactive)

  expectType<Ref<number>>(r.plain.raw.ref)
  // @ts-expect-error it should unwrap
  expectType<Ref<number>>(r.plain.reactive.ref)
})
