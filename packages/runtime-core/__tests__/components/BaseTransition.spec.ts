import {
  nodeOps,
  render,
  h,
  BaseTransition,
  BaseTransitionProps,
  ref,
  nextTick,
  serializeInner,
  serialize,
  VNodeProps,
  KeepAlive,
  TestElement
} from '@vue/runtime-test'

function mount(
  props: BaseTransitionProps,
  slot: () => any,
  withKeepAlive = false
) {
  const root = nodeOps.createElement('div')
  render(
    h(BaseTransition, props, () => {
      return withKeepAlive ? h(KeepAlive, null, slot()) : slot()
    }),
    root
  )
  return root
}

function mockProps(extra: BaseTransitionProps = {}, withKeepAlive = false) {
  const cbs: {
    doneEnter: Record<string, () => void>
    doneLeave: Record<string, () => void>
  } = {
    doneEnter: {},
    doneLeave: {}
  }
  const props: BaseTransitionProps = {
    onBeforeEnter: jest.fn(el => {
      if (!extra.persisted && !withKeepAlive) {
        expect(el.parentNode).toBeNull()
      }
    }),
    onEnter: jest.fn((el, done) => {
      cbs.doneEnter[serialize(el as TestElement)] = done
    }),
    onAfterEnter: jest.fn(),
    onEnterCancelled: jest.fn(),
    onBeforeLeave: jest.fn(),
    onLeave: jest.fn((el, done) => {
      cbs.doneLeave[serialize(el as TestElement)] = done
    }),
    onAfterLeave: jest.fn(),
    onLeaveCancelled: jest.fn(),
    onBeforeAppear: jest.fn(),
    onAppear: jest.fn((el, done) => {
      cbs.doneEnter[serialize(el as TestElement)] = done
    }),
    onAfterAppear: jest.fn(),
    onAppearCancelled: jest.fn(),
    ...extra
  }
  return {
    props,
    cbs
  }
}

function assertCalls(
  props: BaseTransitionProps,
  calls: Record<string, number>
) {
  Object.keys(calls).forEach(key => {
    expect(props[key as keyof BaseTransitionProps]).toHaveBeenCalledTimes(
      calls[key]
    )
  })
}

function assertCalledWithEl(fn: any, expected: string, callIndex = 0) {
  expect(serialize((fn as jest.Mock).mock.calls[callIndex][0])).toBe(expected)
}

interface ToggleOptions {
  trueBranch: () => any
  falseBranch: () => any
  trueSerialized: string
  falseSerialized: string
}

type TestFn = (o: ToggleOptions, withKeepAlive?: boolean) => void

function runTestWithElements(tester: TestFn) {
  return tester({
    trueBranch: () => h('div'),
    falseBranch: () => h('span'),
    trueSerialized: `<div></div>`,
    falseSerialized: `<span></span>`
  })
}

function runTestWithComponents(tester: TestFn) {
  const CompA = ({ msg }: { msg: string }) => h('div', msg)
  // test HOC
  const CompB = ({ msg }: { msg: string }) => h(CompC, { msg })
  const CompC = ({ msg }: { msg: string }) => h('span', msg)
  return tester({
    trueBranch: () => h(CompA, { msg: 'foo' }),
    falseBranch: () => h(CompB, { msg: 'bar' }),
    trueSerialized: `<div>foo</div>`,
    falseSerialized: `<span>bar</span>`
  })
}

function runTestWithKeepAlive(tester: TestFn) {
  const trueComp = {
    setup() {
      const count = ref(0)
      return () => h('div', count.value)
    }
  }
  const falseComp = {
    setup() {
      const count = ref(0)
      return () => h('span', count.value)
    }
  }
  return tester(
    {
      trueBranch: () => h(trueComp),
      falseBranch: () => h(falseComp),
      trueSerialized: `<div>0</div>`,
      falseSerialized: `<span>0</span>`
    },
    true /* withKeepAlive: true */
  )
}

describe('BaseTransition', () => {
  test('appear: true w/ appear hooks', () => {
    const { props, cbs } = mockProps({
      appear: true
    })
    mount(props, () => h('div'))
    expect(props.onBeforeAppear).toHaveBeenCalledTimes(1)
    expect(props.onAppear).toHaveBeenCalledTimes(1)
    expect(props.onAfterAppear).not.toHaveBeenCalled()

    // enter should not be called
    expect(props.onBeforeEnter).not.toHaveBeenCalled()
    expect(props.onEnter).not.toHaveBeenCalled()
    expect(props.onAfterEnter).not.toHaveBeenCalled()

    cbs.doneEnter[`<div></div>`]()
    expect(props.onAfterAppear).toHaveBeenCalledTimes(1)
    expect(props.onAfterEnter).not.toHaveBeenCalled()
  })

  test('appear: true w/ fallback to enter hooks', () => {
    const { props, cbs } = mockProps({
      appear: true,
      onBeforeAppear: undefined,
      onAppear: undefined,
      onAfterAppear: undefined,
      onAppearCancelled: undefined
    })
    mount(props, () => h('div'))
    expect(props.onBeforeEnter).toHaveBeenCalledTimes(1)
    expect(props.onEnter).toHaveBeenCalledTimes(1)
    expect(props.onAfterEnter).not.toHaveBeenCalled()
    cbs.doneEnter[`<div></div>`]()
    expect(props.onAfterEnter).toHaveBeenCalledTimes(1)
  })

  describe('persisted: true', () => {
    // this is pretty much how v-show is implemented
    // (but using the directive API instead)
    function mockPersistedHooks() {
      const state = { show: true }
      const toggle = ref(true)
      const hooks: VNodeProps = {
        onVnodeBeforeMount(vnode) {
          vnode.transition!.beforeEnter(vnode.el!)
        },
        onVnodeMounted(vnode) {
          vnode.transition!.enter(vnode.el!)
        },
        onVnodeUpdated(vnode, oldVnode) {
          if (oldVnode.props!.id !== vnode.props!.id) {
            if (vnode.props!.id) {
              vnode.transition!.beforeEnter(vnode.el!)
              state.show = true
              vnode.transition!.enter(vnode.el!)
            } else {
              vnode.transition!.leave(vnode.el!, () => {
                state.show = false
              })
            }
          }
        }
      }
      return { state, toggle, hooks }
    }

    test('w/ appear: false', async () => {
      const { props, cbs } = mockProps({ persisted: true })
      const { toggle, state, hooks } = mockPersistedHooks()

      mount(props, () => h('div', { id: toggle.value, ...hooks }))
      // without appear: true, enter hooks should not be called on mount
      expect(props.onBeforeEnter).not.toHaveBeenCalled()
      expect(props.onEnter).not.toHaveBeenCalled()
      expect(props.onAfterEnter).not.toHaveBeenCalled()

      toggle.value = false
      await nextTick()
      expect(props.onBeforeLeave).toHaveBeenCalledTimes(1)
      expect(props.onLeave).toHaveBeenCalledTimes(1)
      expect(props.onAfterLeave).not.toHaveBeenCalled()
      expect(state.show).toBe(true) // should still be shown
      cbs.doneLeave[`<div id=false></div>`]()
      expect(state.show).toBe(false) // should be hidden now
      expect(props.onAfterLeave).toHaveBeenCalledTimes(1)

      toggle.value = true
      await nextTick()
      expect(props.onBeforeEnter).toHaveBeenCalledTimes(1)
      expect(props.onEnter).toHaveBeenCalledTimes(1)
      expect(props.onAfterEnter).not.toHaveBeenCalled()
      expect(state.show).toBe(true) // should be shown now
      cbs.doneEnter[`<div id=true></div>`]()
      expect(props.onAfterEnter).toHaveBeenCalledTimes(1)
    })

    test('w/ appear: true', () => {
      const { props, cbs } = mockProps({ persisted: true, appear: true })
      const { hooks } = mockPersistedHooks()
      mount(props, () => h('div', hooks))

      expect(props.onBeforeAppear).toHaveBeenCalledTimes(1)
      expect(props.onAppear).toHaveBeenCalledTimes(1)
      expect(props.onAfterAppear).not.toHaveBeenCalled()
      cbs.doneEnter[`<div></div>`]()
      expect(props.onAfterAppear).toHaveBeenCalledTimes(1)
    })
  })

  describe('toggle on-off', () => {
    async function testToggleOnOff(
      {
        trueBranch,
        trueSerialized,
        falseBranch,
        falseSerialized
      }: ToggleOptions,
      mode?: BaseTransitionProps['mode']
    ) {
      const toggle = ref(true)
      const { props, cbs } = mockProps({ mode })
      const root = mount(
        props,
        () => (toggle.value ? trueBranch() : falseBranch())
      )

      // without appear: true, enter hooks should not be called on mount
      expect(props.onBeforeEnter).not.toHaveBeenCalled()
      expect(props.onEnter).not.toHaveBeenCalled()
      expect(props.onAfterEnter).not.toHaveBeenCalled()

      toggle.value = false
      await nextTick()
      // comment placeholder enters immediately
      expect(serializeInner(root)).toBe(`${trueSerialized}${falseSerialized}`)
      expect(props.onBeforeLeave).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onBeforeLeave, trueSerialized)
      expect(props.onLeave).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onLeave, trueSerialized)
      expect(props.onAfterLeave).not.toHaveBeenCalled()
      cbs.doneLeave[trueSerialized]()
      expect(serializeInner(root)).toBe(falseSerialized)
      expect(props.onAfterLeave).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onAfterLeave, trueSerialized)

      toggle.value = true
      await nextTick()
      expect(serializeInner(root)).toBe(trueSerialized)
      // before enter spy asserts node has no parent when it's called
      expect(props.onBeforeEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onBeforeEnter, trueSerialized)
      expect(props.onEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onEnter, trueSerialized)
      expect(props.onAfterEnter).not.toHaveBeenCalled()
      cbs.doneEnter[trueSerialized]()
      expect(props.onAfterEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onAfterEnter, trueSerialized)

      assertCalls(props, {
        onBeforeEnter: 1,
        onEnter: 1,
        onAfterEnter: 1,
        onEnterCancelled: 0,
        onBeforeLeave: 1,
        onLeave: 1,
        onAfterLeave: 1,
        onLeaveCancelled: 0
      })
    }

    test('w/ element', async () => {
      await testToggleOnOff({
        trueBranch: () => h('div'),
        trueSerialized: `<div></div>`,
        falseBranch: () => null,
        falseSerialized: `<!---->`
      })
    })

    test('w/ component', async () => {
      const Comp = ({ msg }: { msg: string }) => h('div', msg)
      await testToggleOnOff({
        trueBranch: () => h(Comp, { msg: 'hello' }),
        trueSerialized: `<div>hello</div>`,
        falseBranch: () => null,
        falseSerialized: `<!---->`
      })
    })

    test('w/ mode: "in-out', async () => {
      await testToggleOnOff(
        {
          trueBranch: () => h('div'),
          trueSerialized: `<div></div>`,
          falseBranch: () => null,
          falseSerialized: `<!---->`
        },
        'in-out'
      )
    })
  })

  describe('toggle on-off before finish', () => {
    async function testToggleOnOffBeforeFinish({
      trueBranch,
      trueSerialized,
      falseBranch = () => null,
      falseSerialized = `<!---->`
    }: ToggleOptions) {
      const toggle = ref(false)
      const { props, cbs } = mockProps()
      const root = mount(
        props,
        () => (toggle.value ? trueBranch() : falseBranch())
      )

      // start enter
      toggle.value = true
      await nextTick()
      expect(serializeInner(root)).toBe(trueSerialized)
      expect(props.onBeforeEnter).toHaveBeenCalledTimes(1)
      expect(props.onEnter).toHaveBeenCalledTimes(1)

      // leave before enter finishes
      toggle.value = false
      await nextTick()
      expect(serializeInner(root)).toBe(`${trueSerialized}${falseSerialized}`)
      expect(props.onEnterCancelled).toHaveBeenCalled()
      expect(props.onBeforeLeave).toHaveBeenCalledTimes(1)
      expect(props.onLeave).toHaveBeenCalledTimes(1)
      expect(props.onAfterLeave).not.toHaveBeenCalled()
      // calling doneEnter now should have no effect
      cbs.doneEnter[trueSerialized]()
      expect(props.onAfterEnter).not.toHaveBeenCalled()

      // enter again before leave finishes
      toggle.value = true
      await nextTick()
      expect(props.onBeforeEnter).toHaveBeenCalledTimes(2)
      expect(props.onEnter).toHaveBeenCalledTimes(2)
      // 1. should remove the previous leaving <div> so there is only one <div>
      // 2. should remove the comment placeholder for the off branch
      expect(serializeInner(root)).toBe(trueSerialized)
      // note onLeaveCancelled is NOT called because it was a forced early
      // removal instead of a cancel. Instead, onAfterLeave should be called.
      expect(props.onAfterLeave).toHaveBeenCalledTimes(1)
      // calling doneLeave again should have no effect now
      cbs.doneLeave[trueSerialized]()
      expect(props.onAfterLeave).toHaveBeenCalledTimes(1)
      cbs.doneEnter[trueSerialized]()
      expect(props.onAfterEnter).toHaveBeenCalledTimes(1)

      assertCalls(props, {
        onBeforeEnter: 2,
        onEnter: 2,
        onAfterEnter: 1,
        onEnterCancelled: 1,
        onBeforeLeave: 1,
        onLeave: 1,
        onAfterLeave: 1,
        onLeaveCancelled: 0
      })
    }

    test('w/ element', async () => {
      await testToggleOnOffBeforeFinish({
        trueBranch: () => h('div'),
        trueSerialized: `<div></div>`,
        falseBranch: () => null,
        falseSerialized: `<!---->`
      })
    })

    test('w/ component', async () => {
      const Comp = ({ msg }: { msg: string }) => h('div', msg)
      await testToggleOnOffBeforeFinish({
        trueBranch: () => h(Comp, { msg: 'hello' }),
        trueSerialized: `<div>hello</div>`,
        falseBranch: () => null,
        falseSerialized: `<!---->`
      })
    })
  })

  describe('toggle between branches', () => {
    async function testToggleBranches(
      {
        trueBranch,
        falseBranch,
        trueSerialized,
        falseSerialized
      }: ToggleOptions,
      withKeepAlive = false
    ) {
      const toggle = ref(true)
      const { props, cbs } = mockProps({}, withKeepAlive)
      const root = mount(
        props,
        () => (toggle.value ? trueBranch() : falseBranch()),
        withKeepAlive
      )

      // without appear: true, enter hooks should not be called on mount
      expect(props.onBeforeEnter).not.toHaveBeenCalled()
      expect(props.onEnter).not.toHaveBeenCalled()
      expect(props.onAfterEnter).not.toHaveBeenCalled()

      // start toggle
      toggle.value = false
      await nextTick()
      expect(serializeInner(root)).toBe(`${trueSerialized}${falseSerialized}`)
      // leave should be triggered
      expect(props.onBeforeLeave).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onBeforeLeave, trueSerialized)
      expect(props.onLeave).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onLeave, trueSerialized)
      expect(props.onAfterLeave).not.toHaveBeenCalled()
      // enter should also be triggered
      expect(props.onBeforeEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onBeforeEnter, falseSerialized)
      expect(props.onEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onEnter, falseSerialized)
      expect(props.onAfterEnter).not.toHaveBeenCalled()

      // finish enter
      cbs.doneEnter[falseSerialized]()
      expect(serializeInner(root)).toBe(`${trueSerialized}${falseSerialized}`)
      expect(props.onAfterEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onAfterEnter, falseSerialized)
      expect(props.onAfterLeave).not.toHaveBeenCalled()
      // finish leave
      cbs.doneLeave[trueSerialized]()
      expect(serializeInner(root)).toBe(`${falseSerialized}`)
      expect(props.onAfterLeave).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onAfterLeave, trueSerialized)

      // toggle again
      toggle.value = true
      await nextTick()
      expect(serializeInner(root)).toBe(`${falseSerialized}${trueSerialized}`)
      // leave should be triggered
      expect(props.onBeforeLeave).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onBeforeLeave, falseSerialized, 1)
      expect(props.onLeave).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onLeave, falseSerialized, 1)
      expect(props.onAfterLeave).toHaveBeenCalledTimes(1)
      // enter should also be triggered
      expect(props.onBeforeEnter).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onBeforeEnter, trueSerialized, 1)
      expect(props.onEnter).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onEnter, trueSerialized, 1)
      expect(props.onAfterEnter).toHaveBeenCalledTimes(1)

      // finish leave first
      cbs.doneLeave[falseSerialized]()
      expect(serializeInner(root)).toBe(`${trueSerialized}`)
      expect(props.onAfterLeave).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onAfterLeave, falseSerialized, 1)
      expect(props.onAfterEnter).toHaveBeenCalledTimes(1)
      // finish enter
      cbs.doneEnter[trueSerialized]()
      expect(serializeInner(root)).toBe(`${trueSerialized}`)
      expect(props.onAfterEnter).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onAfterEnter, trueSerialized, 1)

      assertCalls(props, {
        onBeforeEnter: 2,
        onEnter: 2,
        onAfterEnter: 2,
        onBeforeLeave: 2,
        onLeave: 2,
        onAfterLeave: 2,
        onEnterCancelled: 0,
        onLeaveCancelled: 0
      })
    }

    test('w/ elements', async () => {
      await runTestWithElements(testToggleBranches)
    })

    test('w/ components', async () => {
      await runTestWithComponents(testToggleBranches)
    })

    test('w/ KeepAlive', async () => {
      await runTestWithKeepAlive(testToggleBranches)
    })
  })

  describe('toggle between branches before finish', () => {
    async function testToggleBranchesBeforeFinish(
      {
        trueBranch,
        falseBranch,
        trueSerialized,
        falseSerialized
      }: ToggleOptions,
      withKeepAlive = false
    ) {
      const toggle = ref(true)
      const { props, cbs } = mockProps({}, withKeepAlive)
      const root = mount(
        props,
        () => (toggle.value ? trueBranch() : falseBranch()),
        withKeepAlive
      )

      // start toggle
      toggle.value = false
      await nextTick()
      expect(serializeInner(root)).toBe(`${trueSerialized}${falseSerialized}`)
      // leave should be triggered
      expect(props.onBeforeLeave).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onBeforeLeave, trueSerialized)
      expect(props.onLeave).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onLeave, trueSerialized)
      expect(props.onAfterLeave).not.toHaveBeenCalled()
      // enter should also be triggered
      expect(props.onBeforeEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onBeforeEnter, falseSerialized)
      expect(props.onEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onEnter, falseSerialized)
      expect(props.onAfterEnter).not.toHaveBeenCalled()

      // toggle again before transition finishes
      toggle.value = true
      await nextTick()
      // the previous leaving true branch should have been force-removed
      expect(serializeInner(root)).toBe(`${falseSerialized}${trueSerialized}`)
      if (!withKeepAlive) {
        expect(props.onAfterLeave).toHaveBeenCalledTimes(1)
        assertCalledWithEl(props.onAfterLeave, trueSerialized)
      } else {
        expect(props.onLeaveCancelled).toHaveBeenCalledTimes(1)
        assertCalledWithEl(props.onLeaveCancelled, trueSerialized)
      }
      // false branch enter is cancelled
      expect(props.onEnterCancelled).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onEnterCancelled, falseSerialized)
      // calling false branch done should have no effect now
      cbs.doneEnter[falseSerialized]()
      expect(props.onAfterEnter).not.toHaveBeenCalled()
      // false branch leave triggered
      expect(props.onBeforeLeave).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onBeforeLeave, falseSerialized, 1)
      expect(props.onLeave).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onLeave, falseSerialized, 1)
      // true branch enter triggered
      expect(props.onBeforeEnter).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onBeforeEnter, trueSerialized, 1)
      expect(props.onEnter).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onEnter, trueSerialized, 1)
      expect(props.onAfterEnter).not.toHaveBeenCalled()

      // toggle again
      toggle.value = false
      await nextTick()
      // the previous leaving false branch should have been force-removed
      expect(serializeInner(root)).toBe(`${trueSerialized}${falseSerialized}`)
      if (!withKeepAlive) {
        expect(props.onAfterLeave).toHaveBeenCalledTimes(2)
        assertCalledWithEl(props.onAfterLeave, falseSerialized, 1)
      } else {
        expect(props.onLeaveCancelled).toHaveBeenCalledTimes(2)
        assertCalledWithEl(props.onLeaveCancelled, falseSerialized, 1)
      }
      // true branch enter is cancelled
      expect(props.onEnterCancelled).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onEnterCancelled, trueSerialized, 1)
      // calling true branch enter done should have no effect
      cbs.doneEnter[trueSerialized]()
      expect(props.onAfterEnter).not.toHaveBeenCalled()
      // true branch leave triggered (again)
      expect(props.onBeforeLeave).toHaveBeenCalledTimes(3)
      assertCalledWithEl(props.onBeforeLeave, trueSerialized, 2)
      expect(props.onLeave).toHaveBeenCalledTimes(3)
      assertCalledWithEl(props.onLeave, trueSerialized, 2)
      // false branch enter triggered (again)
      expect(props.onBeforeEnter).toHaveBeenCalledTimes(3)
      assertCalledWithEl(props.onBeforeEnter, falseSerialized, 2)
      expect(props.onEnter).toHaveBeenCalledTimes(3)
      assertCalledWithEl(props.onEnter, falseSerialized, 2)
      expect(props.onAfterEnter).not.toHaveBeenCalled()

      cbs.doneEnter[falseSerialized]()
      expect(props.onAfterEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onAfterEnter, falseSerialized)

      cbs.doneLeave[trueSerialized]()
      if (!withKeepAlive) {
        expect(props.onAfterLeave).toHaveBeenCalledTimes(3)
        assertCalledWithEl(props.onAfterLeave, trueSerialized, 2)
      } else {
        expect(props.onAfterLeave).toHaveBeenCalledTimes(1)
        assertCalledWithEl(props.onAfterLeave, trueSerialized)
      }

      assertCalls(props, {
        onBeforeEnter: 3,
        onEnter: 3,
        onAfterEnter: 1,
        onEnterCancelled: 2,
        onBeforeLeave: 3,
        onLeave: 3,
        onAfterLeave: withKeepAlive ? 1 : 3,
        onLeaveCancelled: withKeepAlive ? 2 : 0
      })
    }

    test('w/ elements', async () => {
      await runTestWithElements(testToggleBranchesBeforeFinish)
    })

    test('w/ components', async () => {
      await runTestWithComponents(testToggleBranchesBeforeFinish)
    })

    test('w/ KeepAlive', async () => {
      await runTestWithKeepAlive(testToggleBranchesBeforeFinish)
    })
  })

  describe('mode: "out-in"', () => {
    async function testOutIn(
      {
        trueBranch,
        falseBranch,
        trueSerialized,
        falseSerialized
      }: ToggleOptions,
      withKeepAlive = false
    ) {
      const toggle = ref(true)
      const { props, cbs } = mockProps({ mode: 'out-in' }, withKeepAlive)
      const root = mount(
        props,
        () => (toggle.value ? trueBranch() : falseBranch()),
        withKeepAlive
      )

      // trigger toggle
      toggle.value = false
      await nextTick()
      // a placeholder is injected until the leave finishes
      expect(serializeInner(root)).toBe(`${trueSerialized}<!---->`)
      expect(props.onBeforeLeave).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onBeforeLeave, trueSerialized)
      expect(props.onLeave).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onLeave, trueSerialized)
      expect(props.onAfterLeave).not.toHaveBeenCalled()
      // enter should not have started
      expect(props.onBeforeEnter).not.toHaveBeenCalled()
      expect(props.onEnter).not.toHaveBeenCalled()
      expect(props.onAfterEnter).not.toHaveBeenCalled()

      cbs.doneLeave[trueSerialized]()
      expect(props.onAfterLeave).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onAfterLeave, trueSerialized)
      // have to wait for a tick because this triggers an update
      await nextTick()
      expect(serializeInner(root)).toBe(falseSerialized)
      // enter should start
      expect(props.onBeforeEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onBeforeEnter, falseSerialized)
      expect(props.onEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onEnter, falseSerialized)
      expect(props.onAfterEnter).not.toHaveBeenCalled()
      // finish enter
      cbs.doneEnter[falseSerialized]()
      expect(props.onAfterEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onAfterEnter, falseSerialized)

      // toggle again
      toggle.value = true
      await nextTick()
      expect(serializeInner(root)).toBe(`${falseSerialized}<!---->`)
      expect(props.onBeforeLeave).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onBeforeLeave, falseSerialized, 1)
      expect(props.onLeave).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onLeave, falseSerialized, 1)
      expect(props.onAfterLeave).toHaveBeenCalledTimes(1)
      // enter should not have started
      expect(props.onBeforeEnter).toHaveBeenCalledTimes(1)
      expect(props.onEnter).toHaveBeenCalledTimes(1)
      expect(props.onAfterEnter).toHaveBeenCalledTimes(1)

      cbs.doneLeave[falseSerialized]()
      expect(props.onAfterLeave).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onAfterLeave, falseSerialized, 1)
      await nextTick()
      expect(serializeInner(root)).toBe(trueSerialized)
      // enter should start
      expect(props.onBeforeEnter).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onBeforeEnter, trueSerialized, 1)
      expect(props.onEnter).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onEnter, trueSerialized, 1)
      expect(props.onAfterEnter).toHaveBeenCalledTimes(1)
      // finish enter
      cbs.doneEnter[trueSerialized]()
      expect(props.onAfterEnter).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onAfterEnter, trueSerialized, 1)

      assertCalls(props, {
        onBeforeEnter: 2,
        onEnter: 2,
        onAfterEnter: 2,
        onEnterCancelled: 0,
        onBeforeLeave: 2,
        onLeave: 2,
        onAfterLeave: 2,
        onLeaveCancelled: 0
      })
    }

    test('w/ elements', async () => {
      await runTestWithElements(testOutIn)
    })

    test('w/ components', async () => {
      await runTestWithComponents(testOutIn)
    })

    test('w/ KeepAlive', async () => {
      await runTestWithKeepAlive(testOutIn)
    })
  })

  describe('mode: "out-in" toggle before finish', () => {
    async function testOutInBeforeFinish(
      { trueBranch, falseBranch, trueSerialized }: ToggleOptions,
      withKeepAlive = false
    ) {
      const toggle = ref(true)
      const { props, cbs } = mockProps({ mode: 'out-in' }, withKeepAlive)
      const root = mount(
        props,
        () => (toggle.value ? trueBranch() : falseBranch()),
        withKeepAlive
      )

      // trigger toggle
      toggle.value = false
      await nextTick()
      // toggle again before finish
      toggle.value = true
      await nextTick()
      // expected behavior: the previous true branch is preserved,
      // and a placeholder is injected for the replacement.
      // the leaving node is replaced with the replace node (of the same branch)
      // when it finishes leaving
      expect(serializeInner(root)).toBe(`${trueSerialized}<!---->`)
      // enter hooks should never be called (for neither branch)
      expect(props.onBeforeEnter).not.toHaveBeenCalled()
      expect(props.onEnter).not.toHaveBeenCalled()
      expect(props.onAfterEnter).not.toHaveBeenCalled()

      // finish leave
      cbs.doneLeave[trueSerialized]()
      expect(props.onAfterLeave).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onAfterLeave, trueSerialized)
      await nextTick()
      // leaving node and placeholder removed, enter node injected
      expect(serializeInner(root)).toBe(trueSerialized)
      // enter should start
      expect(props.onBeforeEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onBeforeEnter, trueSerialized)
      expect(props.onEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onEnter, trueSerialized)
      expect(props.onAfterEnter).not.toHaveBeenCalled()
      // finish enter
      cbs.doneEnter[trueSerialized]()
      expect(props.onAfterEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onAfterEnter, trueSerialized)

      assertCalls(props, {
        onBeforeEnter: 1,
        onEnter: 1,
        onAfterEnter: 1,
        onEnterCancelled: 0,
        onBeforeLeave: 1,
        onLeave: 1,
        onAfterLeave: 1,
        onLeaveCancelled: 0
      })
    }

    test('w/ elements', async () => {
      await runTestWithElements(testOutInBeforeFinish)
    })

    test('w/ components', async () => {
      await runTestWithComponents(testOutInBeforeFinish)
    })

    test('w/ KeepAlive', async () => {
      await runTestWithKeepAlive(testOutInBeforeFinish)
    })
  })

  describe('mode: "out-in" double quick toggle', () => {
    async function testOutInDoubleToggle(
      {
        trueBranch,
        falseBranch,
        trueSerialized,
        falseSerialized
      }: ToggleOptions,
      withKeepAlive = false
    ) {
      const toggle = ref(true)
      const { props, cbs } = mockProps({ mode: 'out-in' }, withKeepAlive)
      const root = mount(
        props,
        () => (toggle.value ? trueBranch() : falseBranch()),
        withKeepAlive
      )

      // double quick toggle
      toggle.value = false
      await nextTick()
      toggle.value = true
      await nextTick()
      toggle.value = false
      await nextTick()

      // expected behavior: the leaving true branch is preserved no matter
      // how many times the state is toggled as long as the leave isn't finished
      // yet. A placeholder is injected for the replacement.
      expect(serializeInner(root)).toBe(`${trueSerialized}<!---->`)
      // enter hooks should never be called (for neither branch)
      expect(props.onBeforeEnter).not.toHaveBeenCalled()
      expect(props.onEnter).not.toHaveBeenCalled()
      expect(props.onAfterEnter).not.toHaveBeenCalled()

      // finish leave
      cbs.doneLeave[trueSerialized]()
      expect(props.onAfterLeave).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onAfterLeave, trueSerialized)
      await nextTick()
      // leaving node and placeholder removed, enter node injected
      expect(serializeInner(root)).toBe(falseSerialized)
      // enter should start
      expect(props.onBeforeEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onBeforeEnter, falseSerialized)
      expect(props.onEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onEnter, falseSerialized)
      expect(props.onAfterEnter).not.toHaveBeenCalled()
      // finish enter
      cbs.doneEnter[falseSerialized]()
      expect(props.onAfterEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onAfterEnter, falseSerialized)

      assertCalls(props, {
        onBeforeEnter: 1,
        onEnter: 1,
        onAfterEnter: 1,
        onEnterCancelled: 0,
        onBeforeLeave: 1,
        onLeave: 1,
        onAfterLeave: 1,
        onLeaveCancelled: 0
      })
    }

    test('w/ elements', async () => {
      await runTestWithElements(testOutInDoubleToggle)
    })

    test('w/ components', async () => {
      await runTestWithComponents(testOutInDoubleToggle)
    })

    test('w/ KeepAlive', async () => {
      await runTestWithKeepAlive(testOutInDoubleToggle)
    })
  })

  describe('mode: "in-out"', () => {
    async function testInOut(
      {
        trueBranch,
        falseBranch,
        trueSerialized,
        falseSerialized
      }: ToggleOptions,
      withKeepAlive = false
    ) {
      const toggle = ref(true)
      const { props, cbs } = mockProps({ mode: 'in-out' }, withKeepAlive)
      const root = mount(
        props,
        () => (toggle.value ? trueBranch() : falseBranch()),
        withKeepAlive
      )

      toggle.value = false
      await nextTick()
      expect(serializeInner(root)).toBe(`${trueSerialized}${falseSerialized}`)
      // enter should start
      expect(props.onBeforeEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onBeforeEnter, falseSerialized)
      expect(props.onEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onEnter, falseSerialized)
      expect(props.onAfterEnter).not.toHaveBeenCalled()
      // leave should not start
      expect(props.onBeforeLeave).not.toHaveBeenCalled()
      expect(props.onLeave).not.toHaveBeenCalled()
      expect(props.onAfterLeave).not.toHaveBeenCalled()

      // finish enter
      cbs.doneEnter[falseSerialized]()
      expect(props.onAfterEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onAfterEnter, falseSerialized)

      // leave should start now
      expect(props.onBeforeLeave).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onBeforeLeave, trueSerialized)
      expect(props.onLeave).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onLeave, trueSerialized)
      expect(props.onAfterLeave).not.toHaveBeenCalled()
      // finish leave
      cbs.doneLeave[trueSerialized]()
      expect(props.onAfterLeave).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onAfterLeave, trueSerialized)

      // toggle again
      toggle.value = true
      await nextTick()
      expect(serializeInner(root)).toBe(`${falseSerialized}${trueSerialized}`)
      // enter should start
      expect(props.onBeforeEnter).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onBeforeEnter, trueSerialized, 1)
      expect(props.onEnter).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onEnter, trueSerialized, 1)
      expect(props.onAfterEnter).toHaveBeenCalledTimes(1)
      // leave should not start
      expect(props.onBeforeLeave).toHaveBeenCalledTimes(1)
      expect(props.onLeave).toHaveBeenCalledTimes(1)
      expect(props.onAfterLeave).toHaveBeenCalledTimes(1)

      // finish enter
      cbs.doneEnter[trueSerialized]()
      expect(props.onAfterEnter).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onAfterEnter, trueSerialized, 1)

      // leave should start now
      expect(props.onBeforeLeave).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onBeforeLeave, falseSerialized, 1)
      expect(props.onLeave).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onLeave, falseSerialized, 1)
      expect(props.onAfterLeave).toHaveBeenCalledTimes(1)
      // finish leave
      cbs.doneLeave[falseSerialized]()
      expect(props.onAfterLeave).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onAfterLeave, falseSerialized, 1)

      assertCalls(props, {
        onBeforeEnter: 2,
        onEnter: 2,
        onAfterEnter: 2,
        onEnterCancelled: 0,
        onBeforeLeave: 2,
        onLeave: 2,
        onAfterLeave: 2,
        onLeaveCancelled: 0
      })
    }

    test('w/ elements', async () => {
      await runTestWithElements(testInOut)
    })

    test('w/ components', async () => {
      await runTestWithComponents(testInOut)
    })

    test('w/ KeepAlive', async () => {
      await runTestWithKeepAlive(testInOut)
    })
  })

  describe('mode: "in-out" toggle before finish', () => {
    async function testInOutBeforeFinish(
      {
        trueBranch,
        falseBranch,
        trueSerialized,
        falseSerialized
      }: ToggleOptions,
      withKeepAlive = false
    ) {
      const toggle = ref(true)
      const { props, cbs } = mockProps({ mode: 'in-out' }, withKeepAlive)
      const root = mount(
        props,
        () => (toggle.value ? trueBranch() : falseBranch()),
        withKeepAlive
      )

      toggle.value = false
      await nextTick()
      expect(serializeInner(root)).toBe(`${trueSerialized}${falseSerialized}`)

      // toggle back before enter finishes
      toggle.value = true
      await nextTick()
      // should force remove stale true branch
      expect(serializeInner(root)).toBe(`${falseSerialized}${trueSerialized}`)
      expect(props.onBeforeEnter).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onBeforeEnter, falseSerialized)
      assertCalledWithEl(props.onBeforeEnter, trueSerialized, 1)
      expect(props.onEnter).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onEnter, falseSerialized)
      assertCalledWithEl(props.onEnter, trueSerialized, 1)
      expect(props.onAfterEnter).not.toHaveBeenCalled()
      expect(props.onEnterCancelled).not.toHaveBeenCalled()

      // calling the enter done for false branch does fire the afterEnter
      // hook, but should have no other effects since stale branch has already
      // left
      cbs.doneEnter[falseSerialized]()
      expect(props.onAfterEnter).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onAfterEnter, falseSerialized)

      // leave should not start for either branch
      expect(props.onBeforeLeave).not.toHaveBeenCalled()
      expect(props.onLeave).not.toHaveBeenCalled()
      expect(props.onAfterLeave).not.toHaveBeenCalled()

      cbs.doneEnter[trueSerialized]()
      expect(props.onAfterEnter).toHaveBeenCalledTimes(2)
      assertCalledWithEl(props.onAfterEnter, trueSerialized, 1)
      // should start leave for false branch
      expect(props.onBeforeLeave).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onBeforeLeave, falseSerialized)
      expect(props.onLeave).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onLeave, falseSerialized)
      expect(props.onAfterLeave).not.toHaveBeenCalled()
      // finish leave
      cbs.doneLeave[falseSerialized]()
      expect(serializeInner(root)).toBe(trueSerialized)
      expect(props.onAfterLeave).toHaveBeenCalledTimes(1)
      assertCalledWithEl(props.onAfterLeave, falseSerialized)

      assertCalls(props, {
        onBeforeEnter: 2,
        onEnter: 2,
        onAfterEnter: 2,
        onEnterCancelled: 0,
        onBeforeLeave: 1,
        onLeave: 1,
        onAfterLeave: 1,
        onLeaveCancelled: 0
      })
    }

    test('w/ elements', async () => {
      await runTestWithElements(testInOutBeforeFinish)
    })

    test('w/ components', async () => {
      await runTestWithComponents(testInOutBeforeFinish)
    })

    test('w/ KeepAlive', async () => {
      await runTestWithKeepAlive(testInOutBeforeFinish)
    })
  })
})
