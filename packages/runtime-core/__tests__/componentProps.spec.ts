import {
  ComponentInternalInstance,
  getCurrentInstance,
  render,
  h,
  nodeOps,
  FunctionalComponent,
  defineComponent,
  ref,
  serializeInner,
  createApp,
  provide,
  inject,
  watch,
  toRefs,
  SetupContext
} from '@vue/runtime-test'
import { render as domRender, nextTick } from 'vue'

describe('component props', () => {
  test('stateful', () => {
    let props: any
    let attrs: any
    let proxy: any

    const Comp = defineComponent({
      props: ['fooBar', 'barBaz'],
      render() {
        props = this.$props
        attrs = this.$attrs
        proxy = this
      }
    })

    const root = nodeOps.createElement('div')
    render(h(Comp, { fooBar: 1, bar: 2 }), root)
    expect(proxy.fooBar).toBe(1)
    expect(props).toEqual({ fooBar: 1 })
    expect(attrs).toEqual({ bar: 2 })

    // test passing kebab-case and resolving to camelCase
    render(h(Comp, { 'foo-bar': 2, bar: 3, baz: 4 }), root)
    expect(proxy.fooBar).toBe(2)
    expect(props).toEqual({ fooBar: 2 })
    expect(attrs).toEqual({ bar: 3, baz: 4 })

    // test updating kebab-case should not delete it (#955)
    render(h(Comp, { 'foo-bar': 3, bar: 3, baz: 4, barBaz: 5 }), root)
    expect(proxy.fooBar).toBe(3)
    expect(proxy.barBaz).toBe(5)
    expect(props).toEqual({ fooBar: 3, barBaz: 5 })
    expect(attrs).toEqual({ bar: 3, baz: 4 })

    render(h(Comp, { qux: 5 }), root)
    expect(proxy.fooBar).toBeUndefined()
    // remove the props with camelCase key (#1412)
    expect(proxy.barBaz).toBeUndefined()
    expect(props).toEqual({})
    expect(attrs).toEqual({ qux: 5 })
  })

  test('stateful with setup', () => {
    let props: any
    let attrs: any

    const Comp = defineComponent({
      props: ['foo'],
      setup(_props, { attrs: _attrs }) {
        return () => {
          props = _props
          attrs = _attrs
        }
      }
    })

    const root = nodeOps.createElement('div')
    render(h(Comp, { foo: 1, bar: 2 }), root)
    expect(props).toEqual({ foo: 1 })
    expect(attrs).toEqual({ bar: 2 })

    render(h(Comp, { foo: 2, bar: 3, baz: 4 }), root)
    expect(props).toEqual({ foo: 2 })
    expect(attrs).toEqual({ bar: 3, baz: 4 })

    render(h(Comp, { qux: 5 }), root)
    expect(props).toEqual({})
    expect(attrs).toEqual({ qux: 5 })
  })

  test('functional with declaration', () => {
    let props: any
    let attrs: any

    const Comp: FunctionalComponent = (_props, { attrs: _attrs }) => {
      props = _props
      attrs = _attrs
    }
    Comp.props = ['foo']

    const root = nodeOps.createElement('div')
    render(h(Comp, { foo: 1, bar: 2 }), root)
    expect(props).toEqual({ foo: 1 })
    expect(attrs).toEqual({ bar: 2 })

    render(h(Comp, { foo: 2, bar: 3, baz: 4 }), root)
    expect(props).toEqual({ foo: 2 })
    expect(attrs).toEqual({ bar: 3, baz: 4 })

    render(h(Comp, { qux: 5 }), root)
    expect(props).toEqual({})
    expect(attrs).toEqual({ qux: 5 })
  })

  test('functional without declaration', () => {
    let props: any
    let attrs: any
    const Comp: FunctionalComponent = (_props, { attrs: _attrs }) => {
      props = _props
      attrs = _attrs
    }
    const root = nodeOps.createElement('div')

    render(h(Comp, { foo: 1 }), root)
    expect(props).toEqual({ foo: 1 })
    expect(attrs).toEqual({ foo: 1 })
    expect(props).toBe(attrs)

    render(h(Comp, { bar: 2 }), root)
    expect(props).toEqual({ bar: 2 })
    expect(attrs).toEqual({ bar: 2 })
    expect(props).toBe(attrs)
  })

  test('boolean casting', () => {
    let proxy: any
    const Comp = {
      props: {
        foo: Boolean,
        bar: Boolean,
        baz: Boolean,
        qux: Boolean
      },
      render() {
        proxy = this
      }
    }
    render(
      h(Comp, {
        // absent should cast to false
        bar: '', // empty string should cast to true
        baz: 'baz', // same string should cast to true
        qux: 'ok' // other values should be left in-tact (but raise warning)
      }),
      nodeOps.createElement('div')
    )

    expect(proxy.foo).toBe(false)
    expect(proxy.bar).toBe(true)
    expect(proxy.baz).toBe(true)
    expect(proxy.qux).toBe('ok')
    expect('type check failed for prop "qux"').toHaveBeenWarned()
  })

  test('default value', () => {
    let proxy: any
    const defaultFn = jest.fn(() => ({ a: 1 }))
    const defaultBaz = jest.fn(() => ({ b: 1 }))

    const Comp = {
      props: {
        foo: {
          default: 1
        },
        bar: {
          default: defaultFn
        },
        baz: {
          type: Function,
          default: defaultBaz
        }
      },
      render() {
        proxy = this
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp, { foo: 2 }), root)
    expect(proxy.foo).toBe(2)
    const prevBar = proxy.bar
    expect(proxy.bar).toEqual({ a: 1 })
    expect(proxy.baz).toEqual(defaultBaz)
    expect(defaultFn).toHaveBeenCalledTimes(1)
    expect(defaultBaz).toHaveBeenCalledTimes(0)

    // #999: updates should not cause default factory of unchanged prop to be
    // called again
    render(h(Comp, { foo: 3 }), root)
    expect(proxy.foo).toBe(3)
    expect(proxy.bar).toEqual({ a: 1 })
    expect(proxy.bar).toBe(prevBar)
    expect(defaultFn).toHaveBeenCalledTimes(1)

    render(h(Comp, { bar: { b: 2 } }), root)
    expect(proxy.foo).toBe(1)
    expect(proxy.bar).toEqual({ b: 2 })
    expect(defaultFn).toHaveBeenCalledTimes(1)

    render(h(Comp, { foo: 3, bar: { b: 3 } }), root)
    expect(proxy.foo).toBe(3)
    expect(proxy.bar).toEqual({ b: 3 })
    expect(defaultFn).toHaveBeenCalledTimes(1)

    render(h(Comp, { bar: { b: 4 } }), root)
    expect(proxy.foo).toBe(1)
    expect(proxy.bar).toEqual({ b: 4 })
    expect(defaultFn).toHaveBeenCalledTimes(1)
  })

  test('using inject in default value factory', () => {
    const Child = defineComponent({
      props: {
        test: {
          default: () => inject('test', 'default')
        }
      },
      setup(props) {
        return () => {
          return h('div', props.test)
        }
      }
    })

    const Comp = {
      setup() {
        provide('test', 'injected')
        return () => h(Child)
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>injected</div>`)
  })

  test('optimized props updates', async () => {
    const Child = defineComponent({
      props: ['foo'],
      template: `<div>{{ foo }}</div>`
    })

    const foo = ref(1)
    const id = ref('a')

    const Comp = defineComponent({
      setup() {
        return {
          foo,
          id
        }
      },
      components: { Child },
      template: `<Child :foo="foo" :id="id"/>`
    })

    // Note this one is using the main Vue render so it can compile template
    // on the fly
    const root = document.createElement('div')
    domRender(h(Comp), root)
    expect(root.innerHTML).toBe('<div id="a">1</div>')

    foo.value++
    await nextTick()
    expect(root.innerHTML).toBe('<div id="a">2</div>')

    id.value = 'b'
    await nextTick()
    expect(root.innerHTML).toBe('<div id="b">2</div>')
  })

  describe('validator', () => {
    test('validator should be called with two arguments', async () => {
      const mockFn = jest.fn((...args: any[]) => true)
      const Comp = defineComponent({
        props: {
          foo: {
            type: Number,
            validator: (value, props) => mockFn(value, props)
          },
          bar: {
            type: Number
          }
        },
        template: `<div />`
      })

      // Note this one is using the main Vue render so it can compile template
      // on the fly
      const root = document.createElement('div')
      domRender(h(Comp, { foo: 1, bar: 2 }), root)
      expect(mockFn).toHaveBeenCalledWith(1, { foo: 1, bar: 2 })
    })

    test('validator should not be able to mutate other props', async () => {
      const mockFn = jest.fn((...args: any[]) => true)
      const Comp = defineComponent({
        props: {
          foo: {
            type: Number,
            validator: (value, props) => !!(props.bar = 1)
          },
          bar: {
            type: Number,
            validator: value => mockFn(value)
          }
        },
        template: `<div />`
      })

      // Note this one is using the main Vue render so it can compile template
      // on the fly
      const root = document.createElement('div')
      domRender(h(Comp, { foo: 1, bar: 2 }), root)
      expect(
        `Set operation on key "bar" failed: target is readonly.`
      ).toHaveBeenWarnedLast()
      expect(mockFn).toHaveBeenCalledWith(2)
    })
  })

  test('warn props mutation', () => {
    let instance: ComponentInternalInstance
    let setupProps: any
    const Comp = {
      props: ['foo'],
      setup(props: any) {
        instance = getCurrentInstance()!
        setupProps = props
        return () => null
      }
    }
    render(h(Comp, { foo: 1 }), nodeOps.createElement('div'))
    expect(setupProps.foo).toBe(1)
    expect(instance!.props.foo).toBe(1)
    setupProps.foo = 2
    expect(`Set operation on key "foo" failed`).toHaveBeenWarned()
    expect(() => {
      ;(instance!.proxy as any).foo = 2
    }).toThrow(TypeError)
    expect(`Attempting to mutate prop "foo"`).toHaveBeenWarned()
    // should not throw when overriding properties other than props
    expect(() => {
      ;(instance!.proxy as any).hasOwnProperty = () => {}
    }).not.toThrow(TypeError)
  })

  test('warn absent required props', () => {
    const Comp = {
      props: {
        bool: { type: Boolean, required: true },
        str: { type: String, required: true },
        num: { type: Number, required: true }
      },
      setup() {
        return () => null
      }
    }
    render(h(Comp), nodeOps.createElement('div'))
    expect(`Missing required prop: "bool"`).toHaveBeenWarned()
    expect(`Missing required prop: "str"`).toHaveBeenWarned()
    expect(`Missing required prop: "num"`).toHaveBeenWarned()
  })

  // #3495
  test('should not warn required props using kebab-case', async () => {
    const Comp = {
      props: {
        fooBar: { type: String, required: true }
      },
      setup() {
        return () => null
      }
    }
    render(
      h(Comp, {
        'foo-bar': 'hello'
      }),
      nodeOps.createElement('div')
    )
    expect(`Missing required prop: "fooBar"`).not.toHaveBeenWarned()
  })

  test('merging props from mixins and extends', () => {
    let setupProps: any
    let renderProxy: any

    const E = {
      props: ['base']
    }
    const M1 = {
      props: ['m1']
    }
    const M2 = {
      props: { m2: null }
    }
    const Comp = {
      props: ['self'],
      mixins: [M1, M2],
      extends: E,
      setup(props: any) {
        setupProps = props
      },
      render(this: any) {
        renderProxy = this
        return h('div', [this.self, this.base, this.m1, this.m2])
      }
    }

    const root = nodeOps.createElement('div')
    const props = {
      self: 'from self, ',
      base: 'from base, ',
      m1: 'from mixin 1, ',
      m2: 'from mixin 2'
    }
    render(h(Comp, props), root)

    expect(serializeInner(root)).toMatch(
      `from self, from base, from mixin 1, from mixin 2`
    )
    expect(setupProps).toMatchObject(props)
    expect(renderProxy.$props).toMatchObject(props)
  })

  test('merging props from global mixins', () => {
    let setupProps: any
    let renderProxy: any

    const M1 = {
      props: ['m1']
    }
    const M2 = {
      props: { m2: null }
    }
    const Comp = {
      props: ['self'],
      setup(props: any) {
        setupProps = props
      },
      render(this: any) {
        renderProxy = this
        return h('div', [this.self, this.m1, this.m2])
      }
    }

    const props = {
      self: 'from self, ',
      m1: 'from mixin 1, ',
      m2: 'from mixin 2'
    }
    const app = createApp(Comp, props)
    app.mixin(M1)
    app.mixin(M2)

    const root = nodeOps.createElement('div')
    app.mount(root)

    expect(serializeInner(root)).toMatch(
      `from self, from mixin 1, from mixin 2`
    )
    expect(setupProps).toMatchObject(props)
    expect(renderProxy.$props).toMatchObject(props)
  })

  test('props type support BigInt', () => {
    const Comp = {
      props: {
        foo: BigInt
      },
      render(this: any) {
        return h('div', [this.foo])
      }
    }

    const root = nodeOps.createElement('div')
    render(
      h(Comp, {
        foo: BigInt(BigInt(100000111)) + BigInt(2000000000) * BigInt(30000000)
      }),
      root
    )

    expect(serializeInner(root)).toMatch('<div>60000000100000111</div>')
  })

  // #3474
  test('should cache the value returned from the default factory to avoid unnecessary watcher trigger', async () => {
    let count = 0
    const Comp = {
      props: {
        foo: {
          type: Object,
          default: () => ({ val: 1 })
        },
        bar: Number
      },
      setup(props: any) {
        watch(
          () => props.foo,
          () => {
            count++
          }
        )
        return () => h('h1', [props.foo.val, props.bar])
      }
    }

    const foo = ref()
    const bar = ref(0)
    const app = createApp({
      render: () => h(Comp, { foo: foo.value, bar: bar.value })
    })

    const root = nodeOps.createElement('div')
    app.mount(root)
    expect(serializeInner(root)).toMatch(`<h1>10</h1>`)
    expect(count).toBe(0)

    bar.value++
    await nextTick()
    expect(serializeInner(root)).toMatch(`<h1>11</h1>`)
    expect(count).toBe(0)
  })

  // #3288
  test('declared prop key should be present even if not passed', async () => {
    let initialKeys: string[] = []
    const changeSpy = jest.fn()
    const passFoo = ref(false)

    const Comp = {
      render() {},
      props: {
        foo: String
      },
      setup(props: any) {
        initialKeys = Object.keys(props)
        const { foo } = toRefs(props)
        watch(foo, changeSpy)
      }
    }

    const Parent = () => (passFoo.value ? h(Comp, { foo: 'ok' }) : h(Comp))
    const root = nodeOps.createElement('div')
    createApp(Parent).mount(root)

    expect(initialKeys).toMatchObject(['foo'])
    passFoo.value = true
    await nextTick()
    expect(changeSpy).toHaveBeenCalledTimes(1)
  })

  // #3371
  test(`avoid double-setting props when casting`, async () => {
    const Parent = {
      setup(props: any, { slots }: SetupContext) {
        const childProps = ref()
        const registerChildProps = (props: any) => {
          childProps.value = props
        }
        provide('register', registerChildProps)

        return () => {
          // access the child component's props
          childProps.value && childProps.value.foo
          return slots.default!()
        }
      }
    }

    const Child = {
      props: {
        foo: {
          type: Boolean,
          required: false
        }
      },
      setup(props: { foo: boolean }) {
        const register = inject('register') as any
        // 1. change the reactivity data of the parent component
        // 2. register its own props to the parent component
        register(props)

        return () => 'foo'
      }
    }

    const App = {
      setup() {
        return () => h(Parent, () => h(Child as any, { foo: '' }, () => null))
      }
    }

    const root = nodeOps.createElement('div')
    render(h(App), root)
    await nextTick()
    expect(serializeInner(root)).toBe(`foo`)
  })

  test('support null in required + multiple-type declarations', () => {
    const Comp = {
      props: {
        foo: { type: [Function, null], required: true }
      },
      render() {}
    }
    const root = nodeOps.createElement('div')
    expect(() => {
      render(h(Comp, { foo: () => {} }), root)
    }).not.toThrow()

    expect(() => {
      render(h(Comp, { foo: null }), root)
    }).not.toThrow()
  })
})
