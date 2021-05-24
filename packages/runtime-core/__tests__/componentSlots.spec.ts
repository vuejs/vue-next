import {
  ref,
  render,
  h,
  nodeOps,
  nextTick,
  getCurrentInstance,
  SetupContext,
  withCtx
} from '@vue/runtime-test'
import { normalizeVNode } from '../src/vnode'
import { createSlots } from '../src/helpers/createSlots'

describe('component: slots', () => {
  function renderWithSlots(slots: any): any {
    let instance: any
    const Comp = {
      render() {
        instance = getCurrentInstance()
        return h('div')
      }
    }

    render(h(Comp, null, slots), nodeOps.createElement('div'))
    return instance
  }

  test('initSlots: instance.slots should be set correctly', () => {
    const { slots } = renderWithSlots({ _: 1 })
    expect(slots).toMatchObject({ _: 1 })
  })

  test('initSlots: should normalize object slots (when value is null, string, array)', () => {
    const { slots } = renderWithSlots({
      _inner: '_inner',
      foo: null,
      header: 'header',
      footer: ['f1', 'f2']
    })

    expect(
      '[Vue warn]: Non-function value encountered for slot "header". Prefer function slots for better performance.'
    ).toHaveBeenWarned()

    expect(
      '[Vue warn]: Non-function value encountered for slot "footer". Prefer function slots for better performance.'
    ).toHaveBeenWarned()

    expect(slots).not.toHaveProperty('_inner')
    expect(slots).not.toHaveProperty('foo')
    expect(slots.header()).toMatchObject([normalizeVNode('header')])
    expect(slots.footer()).toMatchObject([
      normalizeVNode('f1'),
      normalizeVNode('f2')
    ])
  })

  test('initSlots: should normalize object slots (when value is function)', () => {
    let proxy: any
    const Comp = {
      render() {
        proxy = getCurrentInstance()
        return h('div')
      }
    }

    render(
      h(Comp, null, {
        header: () => 'header'
      }),
      nodeOps.createElement('div')
    )

    expect(proxy.slots.header()).toMatchObject([normalizeVNode('header')])
  })

  test('initSlots: instance.slots should be set correctly (when vnode.shapeFlag is not SLOTS_CHILDREN)', () => {
    const { slots } = renderWithSlots([h('span')])

    expect(
      '[Vue warn]: Non-function value encountered for default slot. Prefer function slots for better performance.'
    ).toHaveBeenWarned()

    expect(slots.default()).toMatchObject([normalizeVNode(h('span'))])
  })

  test('updateSlots: instance.slots should be updated correctly (when slotType is number)', async () => {
    const flag1 = ref(true)

    let instance: any
    const Child = () => {
      instance = getCurrentInstance()
      return 'child'
    }

    const Comp = {
      setup() {
        return () => [
          h(
            Child,
            null,
            createSlots({ _: 2 as any }, [
              flag1.value
                ? {
                    name: 'one',
                    fn: () => [h('span')]
                  }
                : {
                    name: 'two',
                    fn: () => [h('div')]
                  }
            ])
          )
        ]
      }
    }
    render(h(Comp), nodeOps.createElement('div'))

    expect(instance.slots).toHaveProperty('one')
    expect(instance.slots).not.toHaveProperty('two')

    flag1.value = false
    await nextTick()

    expect(instance.slots).not.toHaveProperty('one')
    expect(instance.slots).toHaveProperty('two')
  })

  test('updateSlots: instance.slots should be updated correctly (when slotType is null)', async () => {
    const flag1 = ref(true)

    let instance: any
    const Child = () => {
      instance = getCurrentInstance()
      return 'child'
    }

    const oldSlots = {
      header: 'header'
    }
    const newSlots = {
      footer: 'footer'
    }

    const Comp = {
      setup() {
        return () => [
          h(Child, { n: flag1.value }, flag1.value ? oldSlots : newSlots)
        ]
      }
    }
    render(h(Comp), nodeOps.createElement('div'))

    expect(instance.slots).toHaveProperty('header')
    expect(instance.slots).not.toHaveProperty('footer')

    flag1.value = false
    await nextTick()

    expect(
      '[Vue warn]: Non-function value encountered for slot "header". Prefer function slots for better performance.'
    ).toHaveBeenWarned()

    expect(
      '[Vue warn]: Non-function value encountered for slot "footer". Prefer function slots for better performance.'
    ).toHaveBeenWarned()

    expect(instance.slots).not.toHaveProperty('header')
    expect(instance.slots.footer()).toMatchObject([normalizeVNode('footer')])
  })

  test('updateSlots: instance.slots should be update correctly (when vnode.shapeFlag is not SLOTS_CHILDREN)', async () => {
    const flag1 = ref(true)

    let instance: any
    const Child = () => {
      instance = getCurrentInstance()
      return 'child'
    }

    const Comp = {
      setup() {
        return () => [
          h(Child, { n: flag1.value }, flag1.value ? ['header'] : ['footer'])
        ]
      }
    }
    render(h(Comp), nodeOps.createElement('div'))

    expect(instance.slots.default()).toMatchObject([normalizeVNode('header')])

    flag1.value = false
    await nextTick()

    expect(
      '[Vue warn]: Non-function value encountered for default slot. Prefer function slots for better performance.'
    ).toHaveBeenWarned()

    expect(instance.slots.default()).toMatchObject([normalizeVNode('footer')])
  })

  test('should respect $stable flag', async () => {
    const flag1 = ref(1)
    const flag2 = ref(2)
    const spy = jest.fn()

    const Child = () => {
      spy()
      return 'child'
    }

    const App = {
      setup() {
        return () => [
          flag1.value,
          h(
            Child,
            { n: flag2.value },
            {
              foo: () => 'foo',
              $stable: true
            }
          )
        ]
      }
    }

    render(h(App), nodeOps.createElement('div'))
    expect(spy).toHaveBeenCalledTimes(1)

    // parent re-render, props didn't change, slots are stable
    // -> child should not update
    flag1.value++
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)

    // parent re-render, props changed
    // -> child should update
    flag2.value++
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(2)
  })

  test('warning for calling the slot function outside of render function', () => {
    const Comp = {
      setup(props: any, { slots }: SetupContext) {
        slots.default!()

        return () => null
      }
    }

    render(h(Comp, () => h('div')), nodeOps.createElement('div'))

    expect(
      '[Vue warn]: Slot "default" invoked outside of the render function'
    ).toHaveBeenWarned()
  })

  test('warning for calling the compiled slot function outside of render function', () => {
    const Comp = {
      setup(props: any, { slots }: SetupContext) {
        slots.default!()

        return () => null
      }
    }

    render(
      h(Comp, null, {
        default: withCtx(() => [h('div')]),
        _: 1
      }),
      nodeOps.createElement('div')
    )

    expect(
      '[Vue warn]: Slot "default" invoked outside of the render function'
    ).toHaveBeenWarned()
  })
})
