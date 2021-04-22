import {
  h,
  TestElement,
  nodeOps,
  render,
  ref,
  KeepAlive,
  serializeInner,
  nextTick,
  ComponentOptions,
  markRaw,
  inject,
  defineComponent,
  ComponentPublicInstance,
  Ref,
  cloneVNode,
  provide,
  onUnmounted,
  onMounted,
  createApp,
  reactive,
  shallowRef,
  onActivated,
  onDeactivated
} from '@vue/runtime-test'
import { KeepAliveProps } from '../../src/components/KeepAlive'

describe('KeepAlive', () => {
  let one: ComponentOptions
  let two: ComponentOptions
  let views: Record<string, ComponentOptions>
  let root: TestElement

  beforeEach(() => {
    root = nodeOps.createElement('div')
    one = {
      name: 'one',
      data: () => ({ msg: 'one' }),
      render(this: any) {
        return h('div', this.msg)
      },
      created: jest.fn(),
      mounted: jest.fn(),
      activated: jest.fn(),
      deactivated: jest.fn(),
      unmounted: jest.fn()
    }
    two = {
      name: 'two',
      data: () => ({ msg: 'two' }),
      render(this: any) {
        return h('div', this.msg)
      },
      created: jest.fn(),
      mounted: jest.fn(),
      activated: jest.fn(),
      deactivated: jest.fn(),
      unmounted: jest.fn()
    }
    views = {
      one,
      two
    }
  })

  function assertHookCalls(component: any, callCounts: number[]) {
    expect([
      component.created.mock.calls.length,
      component.mounted.mock.calls.length,
      component.activated.mock.calls.length,
      component.deactivated.mock.calls.length,
      component.unmounted.mock.calls.length
    ]).toEqual(callCounts)
  }

  test('should preserve state', async () => {
    const viewRef = ref('one')
    const instanceRef = ref<any>(null)
    const App = {
      render() {
        return h(KeepAlive, null, {
          default: () => h(views[viewRef.value], { ref: instanceRef })
        })
      }
    }
    render(h(App), root)
    expect(serializeInner(root)).toBe(`<div>one</div>`)
    instanceRef.value.msg = 'changed'
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>changed</div>`)
    viewRef.value = 'two'
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>two</div>`)
    viewRef.value = 'one'
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>changed</div>`)
  })

  test('should call correct lifecycle hooks', async () => {
    const toggle = ref(true)
    const viewRef = ref('one')
    const App = {
      render() {
        return toggle.value ? h(KeepAlive, () => h(views[viewRef.value])) : null
      }
    }
    render(h(App), root)

    expect(serializeInner(root)).toBe(`<div>one</div>`)
    assertHookCalls(one, [1, 1, 1, 0, 0])
    assertHookCalls(two, [0, 0, 0, 0, 0])

    // toggle kept-alive component
    viewRef.value = 'two'
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>two</div>`)
    assertHookCalls(one, [1, 1, 1, 1, 0])
    assertHookCalls(two, [1, 1, 1, 0, 0])

    viewRef.value = 'one'
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>one</div>`)
    assertHookCalls(one, [1, 1, 2, 1, 0])
    assertHookCalls(two, [1, 1, 1, 1, 0])

    viewRef.value = 'two'
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>two</div>`)
    assertHookCalls(one, [1, 1, 2, 2, 0])
    assertHookCalls(two, [1, 1, 2, 1, 0])

    // teardown keep-alive, should unmount all components including cached
    toggle.value = false
    await nextTick()
    expect(serializeInner(root)).toBe(`<!---->`)
    assertHookCalls(one, [1, 1, 2, 2, 1])
    assertHookCalls(two, [1, 1, 2, 2, 1])
  })

  test('should call correct lifecycle hooks when toggle the KeepAlive first', async () => {
    const toggle = ref(true)
    const viewRef = ref('one')
    const App = {
      render() {
        return toggle.value ? h(KeepAlive, () => h(views[viewRef.value])) : null
      }
    }
    render(h(App), root)

    expect(serializeInner(root)).toBe(`<div>one</div>`)
    assertHookCalls(one, [1, 1, 1, 0, 0])
    assertHookCalls(two, [0, 0, 0, 0, 0])

    // should unmount 'one' component when toggle the KeepAlive first
    toggle.value = false
    await nextTick()
    expect(serializeInner(root)).toBe(`<!---->`)
    assertHookCalls(one, [1, 1, 1, 1, 1])
    assertHookCalls(two, [0, 0, 0, 0, 0])

    toggle.value = true
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>one</div>`)
    assertHookCalls(one, [2, 2, 2, 1, 1])
    assertHookCalls(two, [0, 0, 0, 0, 0])

    // 1. the first time toggle kept-alive component
    viewRef.value = 'two'
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>two</div>`)
    assertHookCalls(one, [2, 2, 2, 2, 1])
    assertHookCalls(two, [1, 1, 1, 0, 0])

    // 2. should unmount all components including cached
    toggle.value = false
    await nextTick()
    expect(serializeInner(root)).toBe(`<!---->`)
    assertHookCalls(one, [2, 2, 2, 2, 2])
    assertHookCalls(two, [1, 1, 1, 1, 1])
  })

  test('should call lifecycle hooks on nested components', async () => {
    one.render = () => h(two)

    const toggle = ref(true)
    const App = {
      render() {
        return h(KeepAlive, () => (toggle.value ? h(one) : null))
      }
    }
    render(h(App), root)

    expect(serializeInner(root)).toBe(`<div>two</div>`)
    assertHookCalls(one, [1, 1, 1, 0, 0])
    assertHookCalls(two, [1, 1, 1, 0, 0])

    toggle.value = false
    await nextTick()
    expect(serializeInner(root)).toBe(`<!---->`)
    assertHookCalls(one, [1, 1, 1, 1, 0])
    assertHookCalls(two, [1, 1, 1, 1, 0])

    toggle.value = true
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>two</div>`)
    assertHookCalls(one, [1, 1, 2, 1, 0])
    assertHookCalls(two, [1, 1, 2, 1, 0])

    toggle.value = false
    await nextTick()
    expect(serializeInner(root)).toBe(`<!---->`)
    assertHookCalls(one, [1, 1, 2, 2, 0])
    assertHookCalls(two, [1, 1, 2, 2, 0])
  })

  // #1742
  test('should call lifecycle hooks on nested components when root component no hooks', async () => {
    const two = {
      name: 'two',
      data: () => ({ msg: 'two' }),
      render(this: any) {
        return h('div', this.msg)
      },
      activated: jest.fn()
    }
    const one = {
      name: 'one',
      data: () => ({ msg: 'one' }),
      render(this: any) {
        return h(two)
      }
    }

    const toggle = ref(true)
    const App = {
      render() {
        return h(KeepAlive, () => (toggle.value ? h(one) : null))
      }
    }
    render(h(App), root)

    expect(serializeInner(root)).toBe(`<div>two</div>`)
    expect(two.activated).toHaveBeenCalledTimes(1)
  })

  test('should call correct hooks for nested keep-alive', async () => {
    const toggle2 = ref(true)
    one.render = () => h(KeepAlive, () => (toggle2.value ? h(two) : null))

    const toggle1 = ref(true)
    const App = {
      render() {
        return h(KeepAlive, () => (toggle1.value ? h(one) : null))
      }
    }
    render(h(App), root)

    expect(serializeInner(root)).toBe(`<div>two</div>`)
    assertHookCalls(one, [1, 1, 1, 0, 0])
    assertHookCalls(two, [1, 1, 1, 0, 0])

    toggle1.value = false
    await nextTick()
    expect(serializeInner(root)).toBe(`<!---->`)
    assertHookCalls(one, [1, 1, 1, 1, 0])
    assertHookCalls(two, [1, 1, 1, 1, 0])

    toggle1.value = true
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>two</div>`)
    assertHookCalls(one, [1, 1, 2, 1, 0])
    assertHookCalls(two, [1, 1, 2, 1, 0])

    // toggle nested instance
    toggle2.value = false
    await nextTick()
    expect(serializeInner(root)).toBe(`<!---->`)
    assertHookCalls(one, [1, 1, 2, 1, 0])
    assertHookCalls(two, [1, 1, 2, 2, 0])

    toggle2.value = true
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>two</div>`)
    assertHookCalls(one, [1, 1, 2, 1, 0])
    assertHookCalls(two, [1, 1, 3, 2, 0])

    toggle1.value = false
    await nextTick()
    expect(serializeInner(root)).toBe(`<!---->`)
    assertHookCalls(one, [1, 1, 2, 2, 0])
    assertHookCalls(two, [1, 1, 3, 3, 0])

    // toggle nested instance when parent is deactivated
    toggle2.value = false
    await nextTick()
    expect(serializeInner(root)).toBe(`<!---->`)
    assertHookCalls(one, [1, 1, 2, 2, 0])
    assertHookCalls(two, [1, 1, 3, 3, 0]) // should not be affected

    toggle2.value = true
    await nextTick()
    expect(serializeInner(root)).toBe(`<!---->`)
    assertHookCalls(one, [1, 1, 2, 2, 0])
    assertHookCalls(two, [1, 1, 3, 3, 0]) // should not be affected

    toggle1.value = true
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>two</div>`)
    assertHookCalls(one, [1, 1, 3, 2, 0])
    assertHookCalls(two, [1, 1, 4, 3, 0])

    toggle1.value = false
    toggle2.value = false
    await nextTick()
    expect(serializeInner(root)).toBe(`<!---->`)
    assertHookCalls(one, [1, 1, 3, 3, 0])
    assertHookCalls(two, [1, 1, 4, 4, 0])

    toggle1.value = true
    await nextTick()
    expect(serializeInner(root)).toBe(`<!---->`)
    assertHookCalls(one, [1, 1, 4, 3, 0])
    assertHookCalls(two, [1, 1, 4, 4, 0]) // should remain inactive
  })

  async function assertNameMatch(props: KeepAliveProps) {
    const outerRef = ref(true)
    const viewRef = ref('one')
    const App = {
      render() {
        return outerRef.value
          ? h(KeepAlive, props, () => h(views[viewRef.value]))
          : null
      }
    }
    render(h(App), root)

    expect(serializeInner(root)).toBe(`<div>one</div>`)
    assertHookCalls(one, [1, 1, 1, 0, 0])
    assertHookCalls(two, [0, 0, 0, 0, 0])

    viewRef.value = 'two'
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>two</div>`)
    assertHookCalls(one, [1, 1, 1, 1, 0])
    assertHookCalls(two, [1, 1, 0, 0, 0])

    viewRef.value = 'one'
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>one</div>`)
    assertHookCalls(one, [1, 1, 2, 1, 0])
    assertHookCalls(two, [1, 1, 0, 0, 1])

    viewRef.value = 'two'
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>two</div>`)
    assertHookCalls(one, [1, 1, 2, 2, 0])
    assertHookCalls(two, [2, 2, 0, 0, 1])

    // teardown
    outerRef.value = false
    await nextTick()
    expect(serializeInner(root)).toBe(`<!---->`)
    assertHookCalls(one, [1, 1, 2, 2, 1])
    assertHookCalls(two, [2, 2, 0, 0, 2])
  }

  describe('props', () => {
    test('include (string)', async () => {
      await assertNameMatch({ include: 'one' })
    })

    test('include (regex)', async () => {
      await assertNameMatch({ include: /^one$/ })
    })

    test('include (array)', async () => {
      await assertNameMatch({ include: ['one'] })
    })

    test('exclude (string)', async () => {
      await assertNameMatch({ exclude: 'two' })
    })

    test('exclude (regex)', async () => {
      await assertNameMatch({ exclude: /^two$/ })
    })

    test('exclude (array)', async () => {
      await assertNameMatch({ exclude: ['two'] })
    })

    test('include + exclude', async () => {
      await assertNameMatch({ include: 'one,two', exclude: 'two' })
    })

    test('max', async () => {
      const spyAC = jest.fn()
      const spyBC = jest.fn()
      const spyCC = jest.fn()
      const spyAA = jest.fn()
      const spyBA = jest.fn()
      const spyCA = jest.fn()
      const spyADA = jest.fn()
      const spyBDA = jest.fn()
      const spyCDA = jest.fn()
      const spyAUM = jest.fn()
      const spyBUM = jest.fn()
      const spyCUM = jest.fn()

      function assertCount(calls: number[]) {
        expect([
          spyAC.mock.calls.length,
          spyAA.mock.calls.length,
          spyADA.mock.calls.length,
          spyAUM.mock.calls.length,
          spyBC.mock.calls.length,
          spyBA.mock.calls.length,
          spyBDA.mock.calls.length,
          spyBUM.mock.calls.length,
          spyCC.mock.calls.length,
          spyCA.mock.calls.length,
          spyCDA.mock.calls.length,
          spyCUM.mock.calls.length
        ]).toEqual(calls)
      }

      const viewRef = ref('a')
      const views: Record<string, ComponentOptions> = {
        a: {
          render: () => `one`,
          created: spyAC,
          activated: spyAA,
          deactivated: spyADA,
          unmounted: spyAUM
        },
        b: {
          render: () => `two`,
          created: spyBC,
          activated: spyBA,
          deactivated: spyBDA,
          unmounted: spyBUM
        },
        c: {
          render: () => `three`,
          created: spyCC,
          activated: spyCA,
          deactivated: spyCDA,
          unmounted: spyCUM
        }
      }

      const App = {
        render() {
          return h(KeepAlive, { max: 2 }, () => {
            return h(views[viewRef.value])
          })
        }
      }
      render(h(App), root)
      assertCount([1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

      viewRef.value = 'b'
      await nextTick()
      assertCount([1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0])

      viewRef.value = 'c'
      await nextTick()
      // should prune A because max cache reached
      assertCount([1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0])

      viewRef.value = 'b'
      await nextTick()
      // B should be reused, and made latest
      assertCount([1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 0])

      viewRef.value = 'a'
      await nextTick()
      // C should be pruned because B was used last so C is the oldest cached
      assertCount([2, 2, 1, 1, 1, 2, 2, 0, 1, 1, 1, 1])
    })
  })

  describe('cache invalidation', () => {
    function setup() {
      const viewRef = ref('one')
      const includeRef = ref('one,two')
      const App = {
        render() {
          return h(
            KeepAlive,
            {
              include: includeRef.value
            },
            () => h(views[viewRef.value])
          )
        }
      }
      render(h(App), root)
      return { viewRef, includeRef }
    }

    function setupExclude() {
      const viewRef = ref('one')
      const excludeRef = ref('')
      const App = {
        render() {
          return h(
            KeepAlive,
            {
              exclude: excludeRef.value
            },
            () => h(views[viewRef.value])
          )
        }
      }
      render(h(App), root)
      return { viewRef, excludeRef }
    }

    test('on include change', async () => {
      const { viewRef, includeRef } = setup()

      viewRef.value = 'two'
      await nextTick()
      assertHookCalls(one, [1, 1, 1, 1, 0])
      assertHookCalls(two, [1, 1, 1, 0, 0])

      includeRef.value = 'two'
      await nextTick()
      assertHookCalls(one, [1, 1, 1, 1, 1])
      assertHookCalls(two, [1, 1, 1, 0, 0])

      viewRef.value = 'one'
      await nextTick()
      assertHookCalls(one, [2, 2, 1, 1, 1])
      assertHookCalls(two, [1, 1, 1, 1, 0])
    })

    test('on exclude change', async () => {
      const { viewRef, excludeRef } = setupExclude()

      viewRef.value = 'two'
      await nextTick()
      assertHookCalls(one, [1, 1, 1, 1, 0])
      assertHookCalls(two, [1, 1, 1, 0, 0])

      excludeRef.value = 'one'
      await nextTick()
      assertHookCalls(one, [1, 1, 1, 1, 1])
      assertHookCalls(two, [1, 1, 1, 0, 0])

      viewRef.value = 'one'
      await nextTick()
      assertHookCalls(one, [2, 2, 1, 1, 1])
      assertHookCalls(two, [1, 1, 1, 1, 0])
    })

    test('on include change + view switch', async () => {
      const { viewRef, includeRef } = setup()

      viewRef.value = 'two'
      await nextTick()
      assertHookCalls(one, [1, 1, 1, 1, 0])
      assertHookCalls(two, [1, 1, 1, 0, 0])

      includeRef.value = 'one'
      viewRef.value = 'one'
      await nextTick()
      assertHookCalls(one, [1, 1, 2, 1, 0])
      // two should be pruned
      assertHookCalls(two, [1, 1, 1, 1, 1])
    })

    test('on exclude change + view switch', async () => {
      const { viewRef, excludeRef } = setupExclude()

      viewRef.value = 'two'
      await nextTick()
      assertHookCalls(one, [1, 1, 1, 1, 0])
      assertHookCalls(two, [1, 1, 1, 0, 0])

      excludeRef.value = 'two'
      viewRef.value = 'one'
      await nextTick()
      assertHookCalls(one, [1, 1, 2, 1, 0])
      // two should be pruned
      assertHookCalls(two, [1, 1, 1, 1, 1])
    })

    test('should not prune current active instance', async () => {
      const { viewRef, includeRef } = setup()

      includeRef.value = 'two'
      await nextTick()
      assertHookCalls(one, [1, 1, 1, 0, 0])
      assertHookCalls(two, [0, 0, 0, 0, 0])

      viewRef.value = 'two'
      await nextTick()
      assertHookCalls(one, [1, 1, 1, 0, 1])
      assertHookCalls(two, [1, 1, 1, 0, 0])
    })

    async function assertAnonymous(include: boolean) {
      const one = {
        name: 'one',
        created: jest.fn(),
        render: () => 'one'
      }

      const two = {
        // anonymous
        created: jest.fn(),
        render: () => 'two'
      }

      const views: any = { one, two }
      const viewRef = ref('one')

      const App = {
        render() {
          return h(
            KeepAlive,
            {
              include: include ? 'one' : undefined
            },
            () => h(views[viewRef.value])
          )
        }
      }
      render(h(App), root)

      function assert(oneCreateCount: number, twoCreateCount: number) {
        expect(one.created.mock.calls.length).toBe(oneCreateCount)
        expect(two.created.mock.calls.length).toBe(twoCreateCount)
      }

      assert(1, 0)

      viewRef.value = 'two'
      await nextTick()
      assert(1, 1)

      viewRef.value = 'one'
      await nextTick()
      assert(1, 1)

      viewRef.value = 'two'
      await nextTick()
      // two should be re-created if include is specified, since it's not matched
      // otherwise it should be cached.
      assert(1, include ? 2 : 1)
    }

    // 2.x #6938
    test('should not cache anonymous component when include is specified', async () => {
      await assertAnonymous(true)
    })

    test('should cache anonymous components if include is not specified', async () => {
      await assertAnonymous(false)
    })

    // 2.x #7105
    test('should not destroy active instance when pruning cache', async () => {
      const Foo = {
        render: () => 'foo',
        unmounted: jest.fn()
      }
      const includeRef = ref(['foo'])
      const App = {
        render() {
          return h(
            KeepAlive,
            {
              include: includeRef.value
            },
            () => h(Foo)
          )
        }
      }
      render(h(App), root)
      // condition: a render where a previous component is reused
      includeRef.value = ['foo', 'bar']
      await nextTick()
      includeRef.value = []
      await nextTick()
      expect(Foo.unmounted).not.toHaveBeenCalled()
    })

    test('should update re-activated component if props have changed', async () => {
      const Foo = (props: { n: number }) => props.n

      const toggle = ref(true)
      const n = ref(0)

      const App = {
        setup() {
          return () =>
            h(KeepAlive, () => (toggle.value ? h(Foo, { n: n.value }) : null))
        }
      }

      render(h(App), root)
      expect(serializeInner(root)).toBe(`0`)

      toggle.value = false
      await nextTick()
      expect(serializeInner(root)).toBe(`<!---->`)

      n.value++
      await nextTick()
      toggle.value = true
      await nextTick()
      expect(serializeInner(root)).toBe(`1`)
    })
  })

  it('should call correct vnode hooks', async () => {
    const Foo = markRaw({
      name: 'Foo',
      render() {
        return h('Foo')
      }
    })
    const Bar = markRaw({
      name: 'Bar',
      render() {
        return h('Bar')
      }
    })

    const spyMounted = jest.fn()
    const spyUnmounted = jest.fn()

    const RouterView = defineComponent({
      setup(_, { slots }) {
        const Component = inject<Ref<ComponentPublicInstance>>('component')
        const refView = ref()

        let componentProps = {
          ref: refView,
          onVnodeMounted() {
            spyMounted()
          },
          onVnodeUnmounted() {
            spyUnmounted()
          }
        }

        return () => {
          const child: any = slots.default!({
            Component: Component!.value
          })[0]

          const innerChild = child.children[0]
          child.children[0] = cloneVNode(innerChild, componentProps)
          return child
        }
      }
    })

    let toggle: () => void = () => {}

    const App = defineComponent({
      setup() {
        const component = ref(Foo)

        provide('component', component)

        toggle = () => {
          component.value = component.value === Foo ? Bar : Foo
        }
        return {
          component,
          toggle
        }
      },
      render() {
        return h(RouterView, null, {
          default: ({ Component }: any) => h(KeepAlive, null, [h(Component)])
        })
      }
    })

    render(h(App), root)
    await nextTick()
    expect(spyMounted).toHaveBeenCalledTimes(1)
    expect(spyUnmounted).toHaveBeenCalledTimes(0)

    toggle()
    await nextTick()

    expect(spyMounted).toHaveBeenCalledTimes(2)
    expect(spyUnmounted).toHaveBeenCalledTimes(1)

    toggle()
    await nextTick()
    expect(spyMounted).toHaveBeenCalledTimes(3)
    expect(spyUnmounted).toHaveBeenCalledTimes(2)

    render(null, root)
    await nextTick()
    expect(spyMounted).toHaveBeenCalledTimes(3)
    expect(spyUnmounted).toHaveBeenCalledTimes(4)
  })

  // #1513
  test('should work with cloned root due to scopeId / fallthrough attrs', async () => {
    const viewRef = ref('one')
    const instanceRef = ref<any>(null)
    const App = {
      __scopeId: 'foo',
      render: () => {
        return h(KeepAlive, null, {
          default: () => h(views[viewRef.value], { ref: instanceRef })
        })
      }
    }
    render(h(App), root)
    expect(serializeInner(root)).toBe(`<div foo>one</div>`)
    instanceRef.value.msg = 'changed'
    await nextTick()
    expect(serializeInner(root)).toBe(`<div foo>changed</div>`)
    viewRef.value = 'two'
    await nextTick()
    expect(serializeInner(root)).toBe(`<div foo>two</div>`)
    viewRef.value = 'one'
    await nextTick()
    expect(serializeInner(root)).toBe(`<div foo>changed</div>`)
  })

  // #3648
  test('should avoid unmount later included components', async () => {
    const unmountedA = jest.fn()
    const mountedA = jest.fn()
    const activatedA = jest.fn()
    const deactivatedA = jest.fn()
    const unmountedB = jest.fn()
    const mountedB = jest.fn()

    const A = {
      name: 'A',
      setup() {
        onMounted(mountedA)
        onUnmounted(unmountedA)
        onActivated(activatedA)
        onDeactivated(deactivatedA)
        return () => 'A'
      }
    }
    const B = {
      name: 'B',
      setup() {
        onMounted(mountedB)
        onUnmounted(unmountedB)
        return () => 'B'
      }
    }

    const include = reactive<string[]>([])
    const current = shallowRef(A)
    const app = createApp({
      setup() {
        return () => {
          return [
            h(
              KeepAlive,
              {
                include
              },
              h(current.value)
            )
          ]
        }
      }
    })

    app.mount(root)

    expect(serializeInner(root)).toBe(`A`)
    expect(mountedA).toHaveBeenCalledTimes(1)
    expect(unmountedA).toHaveBeenCalledTimes(0)
    expect(activatedA).toHaveBeenCalledTimes(0)
    expect(deactivatedA).toHaveBeenCalledTimes(0)
    expect(mountedB).toHaveBeenCalledTimes(0)
    expect(unmountedB).toHaveBeenCalledTimes(0)

    include.push('A') // cache A
    await nextTick()
    current.value = B // toggle to B
    await nextTick()
    expect(serializeInner(root)).toBe(`B`)
    expect(mountedA).toHaveBeenCalledTimes(1)
    expect(unmountedA).toHaveBeenCalledTimes(0)
    expect(activatedA).toHaveBeenCalledTimes(0)
    expect(deactivatedA).toHaveBeenCalledTimes(1)
    expect(mountedB).toHaveBeenCalledTimes(1)
    expect(unmountedB).toHaveBeenCalledTimes(0)
  })
})
