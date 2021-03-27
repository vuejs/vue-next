import {
  ref,
  h,
  render,
  nodeOps,
  serializeInner,
  nextTick,
  VNode,
  provide,
  inject,
  Ref,
  watch,
  SetupContext
} from '@vue/runtime-test'

describe('renderer: component', () => {
  test('should update parent(hoc) component host el when child component self update', async () => {
    const value = ref(true)
    let parentVnode: VNode
    let childVnode1: VNode
    let childVnode2: VNode

    const Parent = {
      render: () => {
        // let Parent first rerender
        return (parentVnode = h(Child))
      }
    }

    const Child = {
      render: () => {
        return value.value
          ? (childVnode1 = h('div'))
          : (childVnode2 = h('span'))
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Parent), root)
    expect(serializeInner(root)).toBe(`<div></div>`)
    expect(parentVnode!.el).toBe(childVnode1!.el)

    value.value = false
    await nextTick()
    expect(serializeInner(root)).toBe(`<span></span>`)
    expect(parentVnode!.el).toBe(childVnode2!.el)
  })

  it('should create an Component with props', () => {
    const Comp = {
      render: () => {
        return h('div')
      }
    }
    const root = nodeOps.createElement('div')
    render(h(Comp, { id: 'foo', class: 'bar' }), root)
    expect(serializeInner(root)).toBe(`<div id="foo" class="bar"></div>`)
  })

  it('should create an Component with direct text children', () => {
    const Comp = {
      render: () => {
        return h('div', 'test')
      }
    }
    const root = nodeOps.createElement('div')
    render(h(Comp, { id: 'foo', class: 'bar' }), root)
    expect(serializeInner(root)).toBe(`<div id="foo" class="bar">test</div>`)
  })

  it('should update an Component tag which is already mounted', () => {
    const Comp1 = {
      render: () => {
        return h('div', 'foo')
      }
    }
    const root = nodeOps.createElement('div')
    render(h(Comp1), root)
    expect(serializeInner(root)).toBe('<div>foo</div>')

    const Comp2 = {
      render: () => {
        return h('span', 'foo')
      }
    }
    render(h(Comp2), root)
    expect(serializeInner(root)).toBe('<span>foo</span>')
  })

  // #2072
  it('should not update Component if only changed props are declared emit listeners', () => {
    const Comp1 = {
      emits: ['foo'],
      updated: jest.fn(),
      render: () => null
    }
    const root = nodeOps.createElement('div')
    render(
      h(Comp1, {
        onFoo: () => {}
      }),
      root
    )
    render(
      h(Comp1, {
        onFoo: () => {}
      }),
      root
    )
    expect(Comp1.updated).not.toHaveBeenCalled()
  })

  // #2043
  test('component child synchronously updating parent state should trigger parent re-render', async () => {
    const App = {
      setup() {
        const n = ref(0)
        provide('foo', n)
        return () => {
          return [h('div', n.value), h(Child)]
        }
      }
    }

    const Child = {
      setup() {
        const n = inject<Ref<number>>('foo')!
        n.value++

        return () => {
          return h('div', n.value)
        }
      }
    }

    const root = nodeOps.createElement('div')
    render(h(App), root)
    expect(serializeInner(root)).toBe(`<div>0</div><div>1</div>`)
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>1</div><div>1</div>`)
  })

  // #2170
  test('instance.$el should be exposed to watch options', async () => {
    function returnThis(this: any, _arg: any) {
      return this
    }
    const propWatchSpy = jest.fn(returnThis)
    const dataWatchSpy = jest.fn(returnThis)
    let instance: any
    const Comp = {
      props: {
        testProp: String
      },

      data() {
        return {
          testData: undefined
        }
      },

      watch: {
        testProp() {
          // @ts-ignore
          propWatchSpy(this.$el)
        },
        testData() {
          // @ts-ignore
          dataWatchSpy(this.$el)
        }
      },

      created() {
        instance = this
      },

      render() {
        return h('div')
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    await nextTick()
    expect(propWatchSpy).not.toHaveBeenCalled()
    expect(dataWatchSpy).not.toHaveBeenCalled()

    render(h(Comp, { testProp: 'prop ' }), root)
    await nextTick()
    expect(propWatchSpy).toHaveBeenCalledWith(instance.$el)

    instance.testData = 1
    await nextTick()
    expect(dataWatchSpy).toHaveBeenCalledWith(instance.$el)
  })

  // #2200
  test('component child updating parent state in pre-flush should trigger parent re-render', async () => {
    const outer = ref(0)
    const App = {
      setup() {
        const inner = ref(0)

        return () => {
          return [
            h('div', inner.value),
            h(Child, {
              value: outer.value,
              onUpdate: (val: number) => (inner.value = val)
            })
          ]
        }
      }
    }

    const Child = {
      props: ['value'],
      setup(props: any, { emit }: SetupContext) {
        watch(() => props.value, (val: number) => emit('update', val))

        return () => {
          return h('div', props.value)
        }
      }
    }

    const root = nodeOps.createElement('div')
    render(h(App), root)
    expect(serializeInner(root)).toBe(`<div>0</div><div>0</div>`)

    outer.value++
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>1</div><div>1</div>`)
  })

  // #2521
  test('should pause tracking deps when initializing legacy options', async () => {
    let childInstance = null as any
    const Child = {
      props: ['foo'],
      data() {
        return {
          count: 0
        }
      },
      watch: {
        foo: {
          immediate: true,
          handler() {
            ;(this as any).count
          }
        }
      },
      created() {
        childInstance = this as any
        childInstance.count
      },
      render() {
        return h('h1', (this as any).count)
      }
    }

    const App = {
      setup() {
        return () => h(Child)
      },
      updated: jest.fn()
    }

    const root = nodeOps.createElement('div')
    render(h(App), root)
    expect(App.updated).toHaveBeenCalledTimes(0)

    childInstance.count++
    await nextTick()
    expect(App.updated).toHaveBeenCalledTimes(0)
  })

  describe('render with access caches', () => {
    // #3297
    test('should not set the access cache in the data() function (production mode)', () => {
      const Comp = {
        data() {
          ;(this as any).foo
          return { foo: 1 }
        },
        render() {
          return h('h1', (this as any).foo)
        }
      }
      const root = nodeOps.createElement('div')

      __DEV__ = false
      render(h(Comp), root)
      __DEV__ = true
      expect(serializeInner(root)).toBe(`<h1>1</h1>`)
    })
  })
})
