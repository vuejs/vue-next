import {
  describe,
  Component,
  defineComponent,
  PropType,
  ref,
  Ref,
  expectError,
  expectType,
  ShallowUnwrapRef,
  FunctionalComponent,
  ComponentPublicInstance
} from './index'

declare function extractComponentOptions<Props, RawBindings>(
  obj: Component<Props, RawBindings>
): {
  props: Props
  rawBindings: RawBindings
  setup: ShallowUnwrapRef<RawBindings>
}

describe('object props', () => {
  interface ExpectedProps {
    a?: number | undefined
    b: string
    e?: Function
    bb: string
    bbb: string
    cc?: string[] | undefined
    dd: { n: 1 }
    ee?: () => string
    ff?: (a: number, b: string) => { a: boolean }
    ccc?: string[] | undefined
    ddd: string[]
    eee: () => { a: string }
    fff: (a: number, b: string) => { a: boolean }
    hhh: boolean
    ggg: 'foo' | 'bar'
    ffff: (a: number, b: string) => { a: boolean }
    validated?: string
    object?: object
  }

  describe('defineComponent', () => {
    const MyComponent = defineComponent({
      props: {
        a: Number,
        // required should make property non-void
        b: {
          type: String,
          required: true
        },
        e: Function,
        // default value should infer type and make it non-void
        bb: {
          default: 'hello'
        },
        bbb: {
          // Note: default function value requires arrow syntax + explicit
          // annotation
          default: (props: any) => (props.bb as string) || 'foo'
        },
        // explicit type casting
        cc: Array as PropType<string[]>,
        // required + type casting
        dd: {
          type: Object as PropType<{ n: 1 }>,
          required: true
        },
        // return type
        ee: Function as PropType<() => string>,
        // arguments + object return
        ff: Function as PropType<(a: number, b: string) => { a: boolean }>,
        // explicit type casting with constructor
        ccc: Array as () => string[],
        // required + contructor type casting
        ddd: {
          type: Array as () => string[],
          required: true
        },
        // required + object return
        eee: {
          type: Function as PropType<() => { a: string }>,
          required: true
        },
        // required + arguments + object return
        fff: {
          type: Function as PropType<(a: number, b: string) => { a: boolean }>,
          required: true
        },
        hhh: {
          type: Boolean,
          required: true
        },
        // default + type casting
        ggg: {
          type: String as PropType<'foo' | 'bar'>,
          default: 'foo'
        },
        // default + function
        ffff: {
          type: Function as PropType<(a: number, b: string) => { a: boolean }>,
          default: (_a: number, _b: string) => ({ a: true })
        },
        validated: {
          type: String,
          // validator requires explicit annotation
          validator: (val: unknown) => val !== ''
        },
        object: Object as PropType<object>
      },
      setup(props) {
        return {
          setupA: 1,
          setupB: ref(1),
          setupC: {
            a: ref(2)
          },
          setupProps: props
        }
      }
    })

    const { props, rawBindings, setup } = extractComponentOptions(MyComponent)

    // props
    expectType<ExpectedProps['a']>(props.a)
    expectType<ExpectedProps['b']>(props.b)
    expectType<ExpectedProps['e']>(props.e)
    expectType<ExpectedProps['bb']>(props.bb)
    expectType<ExpectedProps['bbb']>(props.bbb)
    expectType<ExpectedProps['cc']>(props.cc)
    expectType<ExpectedProps['dd']>(props.dd)
    expectType<ExpectedProps['ee']>(props.ee)
    expectType<ExpectedProps['ff']>(props.ff)
    expectType<ExpectedProps['ccc']>(props.ccc)
    expectType<ExpectedProps['ddd']>(props.ddd)
    expectType<ExpectedProps['eee']>(props.eee)
    expectType<ExpectedProps['fff']>(props.fff)
    expectType<ExpectedProps['hhh']>(props.hhh)
    expectType<ExpectedProps['ggg']>(props.ggg)
    expectType<ExpectedProps['ffff']>(props.ffff)
    expectType<ExpectedProps['validated']>(props.validated)
    expectType<ExpectedProps['object']>(props.object)

    // raw bindings
    expectType<Number>(rawBindings.setupA)
    expectType<Ref<Number>>(rawBindings.setupB)
    expectType<Ref<Number>>(rawBindings.setupC.a)
    expectType<Number>(rawBindings.setupA)

    // raw bindings props
    expectType<ExpectedProps['a']>(rawBindings.setupProps.a)
    expectType<ExpectedProps['b']>(rawBindings.setupProps.b)
    expectType<ExpectedProps['e']>(rawBindings.setupProps.e)
    expectType<ExpectedProps['bb']>(rawBindings.setupProps.bb)
    expectType<ExpectedProps['bbb']>(rawBindings.setupProps.bbb)
    expectType<ExpectedProps['cc']>(rawBindings.setupProps.cc)
    expectType<ExpectedProps['dd']>(rawBindings.setupProps.dd)
    expectType<ExpectedProps['ee']>(rawBindings.setupProps.ee)
    expectType<ExpectedProps['ff']>(rawBindings.setupProps.ff)
    expectType<ExpectedProps['ccc']>(rawBindings.setupProps.ccc)
    expectType<ExpectedProps['ddd']>(rawBindings.setupProps.ddd)
    expectType<ExpectedProps['eee']>(rawBindings.setupProps.eee)
    expectType<ExpectedProps['fff']>(rawBindings.setupProps.fff)
    expectType<ExpectedProps['hhh']>(rawBindings.setupProps.hhh)
    expectType<ExpectedProps['ggg']>(rawBindings.setupProps.ggg)
    expectType<ExpectedProps['ffff']>(rawBindings.setupProps.ffff)
    expectType<ExpectedProps['validated']>(rawBindings.setupProps.validated)

    // setup
    expectType<Number>(setup.setupA)
    expectType<Number>(setup.setupB)
    expectType<Ref<Number>>(setup.setupC.a)
    expectType<Number>(setup.setupA)

    // raw bindings props
    expectType<ExpectedProps['a']>(setup.setupProps.a)
    expectType<ExpectedProps['b']>(setup.setupProps.b)
    expectType<ExpectedProps['e']>(setup.setupProps.e)
    expectType<ExpectedProps['bb']>(setup.setupProps.bb)
    expectType<ExpectedProps['bbb']>(setup.setupProps.bbb)
    expectType<ExpectedProps['cc']>(setup.setupProps.cc)
    expectType<ExpectedProps['dd']>(setup.setupProps.dd)
    expectType<ExpectedProps['ee']>(setup.setupProps.ee)
    expectType<ExpectedProps['ff']>(setup.setupProps.ff)
    expectType<ExpectedProps['ccc']>(setup.setupProps.ccc)
    expectType<ExpectedProps['ddd']>(setup.setupProps.ddd)
    expectType<ExpectedProps['eee']>(setup.setupProps.eee)
    expectType<ExpectedProps['fff']>(setup.setupProps.fff)
    expectType<ExpectedProps['hhh']>(setup.setupProps.hhh)
    expectType<ExpectedProps['ggg']>(setup.setupProps.ggg)
    expectType<ExpectedProps['ffff']>(setup.setupProps.ffff)
    expectType<ExpectedProps['validated']>(setup.setupProps.validated)

    // instance
    const instance = new MyComponent()
    expectType<number>(instance.setupA)
    // @ts-expect-error
    instance.notExist
  })

  describe('options', () => {
    const MyComponent = {
      props: {
        a: Number,
        // required should make property non-void
        b: {
          type: String,
          required: true
        },
        e: Function,
        // default value should infer type and make it non-void
        bb: {
          default: 'hello'
        },
        bbb: {
          // Note: default function value requires arrow syntax + explicit
          // annotation
          default: (props: any) => (props.bb as string) || 'foo'
        },
        // explicit type casting
        cc: Array as PropType<string[]>,
        // required + type casting
        dd: {
          type: Object as PropType<{ n: 1 }>,
          required: true
        },
        // return type
        ee: Function as PropType<() => string>,
        // arguments + object return
        ff: Function as PropType<(a: number, b: string) => { a: boolean }>,
        // explicit type casting with constructor
        ccc: Array as () => string[],
        // required + contructor type casting
        ddd: {
          type: Array as () => string[],
          required: true
        },
        // required + object return
        eee: {
          type: Function as PropType<() => { a: string }>,
          required: true
        },
        // required + arguments + object return
        fff: {
          type: Function as PropType<(a: number, b: string) => { a: boolean }>,
          required: true
        },
        hhh: {
          type: Boolean,
          required: true
        },
        // default + type casting
        ggg: {
          type: String as PropType<'foo' | 'bar'>,
          default: 'foo'
        },
        // default + function
        ffff: {
          type: Function as PropType<(a: number, b: string) => { a: boolean }>,
          default: (_a: number, _b: string) => ({ a: true })
        },
        validated: {
          type: String,
          // validator requires explicit annotation
          validator: (val: unknown) => val !== ''
        },
        object: Object as PropType<object>
      },

      setup() {
        return {
          setupA: 1
        }
      }
    } as const

    const { props, rawBindings, setup } = extractComponentOptions(MyComponent)

    // props
    expectType<ExpectedProps['a']>(props.a)
    expectType<ExpectedProps['b']>(props.b)
    expectType<ExpectedProps['e']>(props.e)
    expectType<ExpectedProps['bb']>(props.bb)
    expectType<ExpectedProps['bbb']>(props.bbb)
    expectType<ExpectedProps['cc']>(props.cc)
    expectType<ExpectedProps['dd']>(props.dd)
    expectType<ExpectedProps['ee']>(props.ee)
    expectType<ExpectedProps['ff']>(props.ff)
    expectType<ExpectedProps['ccc']>(props.ccc)
    expectType<ExpectedProps['ddd']>(props.ddd)
    expectType<ExpectedProps['eee']>(props.eee)
    expectType<ExpectedProps['fff']>(props.fff)
    expectType<ExpectedProps['hhh']>(props.hhh)
    expectType<ExpectedProps['ggg']>(props.ggg)
    // expectType<ExpectedProps['ffff']>(props.ffff) // todo fix
    expectType<ExpectedProps['validated']>(props.validated)
    expectType<ExpectedProps['object']>(props.object)

    // rawBindings
    expectType<Number>(rawBindings.setupA)

    //setup
    expectType<Number>(setup.setupA)
  })
})

describe('array props', () => {
  describe('defineComponent', () => {
    const MyComponent = defineComponent({
      props: ['a', 'b'],
      setup() {
        return {
          c: 1
        }
      }
    })

    const { props, rawBindings, setup } = extractComponentOptions(MyComponent)

    // @ts-expect-error props should be readonly
    expectError((props.a = 1))
    expectType<any>(props.a)
    expectType<any>(props.b)

    expectType<number>(rawBindings.c)
    expectType<number>(setup.c)
  })

  describe('options', () => {
    const MyComponent = {
      props: ['a', 'b'] as const,
      setup() {
        return {
          c: 1
        }
      }
    }

    const { props, rawBindings, setup } = extractComponentOptions(MyComponent)

    // @ts-expect-error props should be readonly
    expectError((props.a = 1))

    // TODO infer the correct keys
    // expectType<any>(props.a)
    // expectType<any>(props.b)

    expectType<number>(rawBindings.c)
    expectType<number>(setup.c)
  })
})

describe('no props', () => {
  describe('defineComponent', () => {
    const MyComponent = defineComponent({
      setup() {
        return {
          setupA: 1
        }
      }
    })

    const { rawBindings, setup } = extractComponentOptions(MyComponent)

    expectType<number>(rawBindings.setupA)
    expectType<number>(setup.setupA)

    // instance
    const instance = new MyComponent()
    expectType<number>(instance.setupA)
    // @ts-expect-error
    instance.notExist
  })

  describe('options', () => {
    const MyComponent = {
      setup() {
        return {
          setupA: 1
        }
      }
    }

    const { rawBindings, setup } = extractComponentOptions(MyComponent)

    expectType<number>(rawBindings.setupA)
    expectType<number>(setup.setupA)
  })
})

describe('functional', () => {
  // TODO `props.foo` is `number|undefined`
  //   describe('defineComponent', () => {
  //     const MyComponent = defineComponent((props: { foo: number }) => {})

  //     const { props } = extractComponentOptions(MyComponent)

  //     expectType<number>(props.foo)
  //   })

  describe('function', () => {
    const MyComponent = (props: { foo: number }) => props.foo
    const { props } = extractComponentOptions(MyComponent)

    expectType<number>(props.foo)
  })

  describe('typed', () => {
    const MyComponent: FunctionalComponent<{ foo: number }> = (_, _2) => {}

    const { props } = extractComponentOptions(MyComponent)

    expectType<number>(props.foo)
  })
})

declare type VueClass<Props = {}> = {
  new (): ComponentPublicInstance<Props>
}

describe('class', () => {
  const MyComponent: VueClass<{ foo: number }> = {} as any

  const { props } = extractComponentOptions(MyComponent)

  expectType<number>(props.foo)
})
