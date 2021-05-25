import {
  h,
  Fragment,
  createVNode,
  openBlock,
  createBlock,
  render,
  nodeOps,
  TestElement,
  serialize,
  serializeInner as inner,
  VNode,
  ref,
  nextTick,
  defineComponent,
  withCtx,
  renderSlot,
  onBeforeUnmount,
  createTextVNode,
  SetupContext,
  createApp,
  resolveDynamicComponent,
  createCommentVNode,
  computed
} from '@vue/runtime-test'
import { PatchFlags, SlotFlags } from '@vue/shared'

describe('renderer: optimized mode', () => {
  let root: TestElement
  let block: VNode | null = null

  beforeEach(() => {
    root = nodeOps.createElement('div')
    block = null
  })

  const renderWithBlock = (renderChildren: () => VNode[]) => {
    render(
      (openBlock(), (block = createBlock('div', null, renderChildren()))),
      root
    )
  }

  test('basic use of block', () => {
    render((openBlock(), (block = createBlock('p', null, 'foo'))), root)

    expect(block.dynamicChildren!.length).toBe(0)
    expect(inner(root)).toBe('<p>foo</p>')
  })

  test('block can appear anywhere in the vdom tree', () => {
    render(
      h('div', (openBlock(), (block = createBlock('p', null, 'foo')))),
      root
    )

    expect(block.dynamicChildren!.length).toBe(0)
    expect(inner(root)).toBe('<div><p>foo</p></div>')
  })

  test('block should collect dynamic vnodes', () => {
    renderWithBlock(() => [
      createVNode('p', null, 'foo', PatchFlags.TEXT),
      createVNode('i')
    ])

    expect(block!.dynamicChildren!.length).toBe(1)
    expect(serialize(block!.dynamicChildren![0].el as TestElement)).toBe(
      '<p>foo</p>'
    )
  })

  test('block can disable tracking', () => {
    render(
      // disable tracking
      (openBlock(true),
      (block = createBlock('div', null, [
        createVNode('p', null, 'foo', PatchFlags.TEXT)
      ]))),
      root
    )

    expect(block.dynamicChildren!.length).toBe(0)
  })

  test('block as dynamic children', () => {
    renderWithBlock(() => [
      (openBlock(), createBlock('div', { key: 0 }, [h('p')]))
    ])

    expect(block!.dynamicChildren!.length).toBe(1)
    expect(block!.dynamicChildren![0].dynamicChildren!.length).toBe(0)
    expect(serialize(block!.dynamicChildren![0].el as TestElement)).toBe(
      '<div><p></p></div>'
    )

    renderWithBlock(() => [
      (openBlock(), createBlock('div', { key: 1 }, [h('i')]))
    ])

    expect(block!.dynamicChildren!.length).toBe(1)
    expect(block!.dynamicChildren![0].dynamicChildren!.length).toBe(0)
    expect(serialize(block!.dynamicChildren![0].el as TestElement)).toBe(
      '<div><i></i></div>'
    )
  })

  test('PatchFlags: PatchFlags.TEXT', async () => {
    renderWithBlock(() => [createVNode('p', null, 'foo', PatchFlags.TEXT)])

    expect(inner(root)).toBe('<div><p>foo</p></div>')
    expect(block!.dynamicChildren!.length).toBe(1)
    expect(serialize(block!.dynamicChildren![0].el as TestElement)).toBe(
      '<p>foo</p>'
    )

    renderWithBlock(() => [createVNode('p', null, 'bar', PatchFlags.TEXT)])

    expect(inner(root)).toBe('<div><p>bar</p></div>')
    expect(block!.dynamicChildren!.length).toBe(1)
    expect(serialize(block!.dynamicChildren![0].el as TestElement)).toBe(
      '<p>bar</p>'
    )
  })

  test('PatchFlags: PatchFlags.CLASS', async () => {
    renderWithBlock(() => [
      createVNode('p', { class: 'foo' }, '', PatchFlags.CLASS)
    ])

    expect(inner(root)).toBe('<div><p class="foo"></p></div>')
    expect(block!.dynamicChildren!.length).toBe(1)
    expect(serialize(block!.dynamicChildren![0].el as TestElement)).toBe(
      '<p class="foo"></p>'
    )

    renderWithBlock(() => [
      createVNode('p', { class: 'bar' }, '', PatchFlags.CLASS)
    ])

    expect(inner(root)).toBe('<div><p class="bar"></p></div>')
    expect(block!.dynamicChildren!.length).toBe(1)
    expect(serialize(block!.dynamicChildren![0].el as TestElement)).toBe(
      '<p class="bar"></p>'
    )
  })

  test('PatchFlags: PatchFlags.STYLE', async () => {
    renderWithBlock(() => [
      createVNode('p', { style: 'color: red' }, '', PatchFlags.STYLE)
    ])

    expect(inner(root)).toBe('<div><p style="color: red"></p></div>')
    expect(block!.dynamicChildren!.length).toBe(1)
    expect(serialize(block!.dynamicChildren![0].el as TestElement)).toBe(
      '<p style="color: red"></p>'
    )

    renderWithBlock(() => [
      createVNode('p', { style: 'color: green' }, '', PatchFlags.STYLE)
    ])

    expect(inner(root)).toBe('<div><p style="color: green"></p></div>')
    expect(block!.dynamicChildren!.length).toBe(1)
    expect(serialize(block!.dynamicChildren![0].el as TestElement)).toBe(
      '<p style="color: green"></p>'
    )
  })

  test('PatchFlags: PatchFlags.PROPS', async () => {
    renderWithBlock(() => [
      createVNode('p', { id: 'foo' }, '', PatchFlags.PROPS, ['id'])
    ])

    expect(inner(root)).toBe('<div><p id="foo"></p></div>')
    expect(block!.dynamicChildren!.length).toBe(1)
    expect(serialize(block!.dynamicChildren![0].el as TestElement)).toBe(
      '<p id="foo"></p>'
    )

    renderWithBlock(() => [
      createVNode('p', { id: 'bar' }, '', PatchFlags.PROPS, ['id'])
    ])

    expect(inner(root)).toBe('<div><p id="bar"></p></div>')
    expect(block!.dynamicChildren!.length).toBe(1)
    expect(serialize(block!.dynamicChildren![0].el as TestElement)).toBe(
      '<p id="bar"></p>'
    )
  })

  test('PatchFlags: PatchFlags.FULL_PROPS', async () => {
    let propName = 'foo'

    renderWithBlock(() => [
      createVNode('p', { [propName]: 'dynamic' }, '', PatchFlags.FULL_PROPS)
    ])

    expect(inner(root)).toBe('<div><p foo="dynamic"></p></div>')
    expect(block!.dynamicChildren!.length).toBe(1)
    expect(serialize(block!.dynamicChildren![0].el as TestElement)).toBe(
      '<p foo="dynamic"></p>'
    )

    propName = 'bar'
    renderWithBlock(() => [
      createVNode('p', { [propName]: 'dynamic' }, '', PatchFlags.FULL_PROPS)
    ])

    expect(inner(root)).toBe('<div><p bar="dynamic"></p></div>')
    expect(block!.dynamicChildren!.length).toBe(1)
    expect(serialize(block!.dynamicChildren![0].el as TestElement)).toBe(
      '<p bar="dynamic"></p>'
    )
  })

  // the order and length of the list will not change
  test('PatchFlags: PatchFlags.STABLE_FRAGMENT', async () => {
    let list = ['foo', 'bar']
    render(
      (openBlock(),
      (block = createBlock(
        Fragment,
        null,
        list.map(item => {
          return createVNode('p', null, item, PatchFlags.TEXT)
        }),
        PatchFlags.STABLE_FRAGMENT
      ))),
      root
    )

    expect(inner(root)).toBe('<p>foo</p><p>bar</p>')
    expect(block.dynamicChildren!.length).toBe(2)
    expect(serialize(block.dynamicChildren![0].el as TestElement)).toBe(
      '<p>foo</p>'
    )
    expect(serialize(block.dynamicChildren![1].el as TestElement)).toBe(
      '<p>bar</p>'
    )

    list = list.map(item => item.repeat(2))
    render(
      (openBlock(),
      createBlock(
        Fragment,
        null,
        list.map(item => {
          return createVNode('p', null, item, PatchFlags.TEXT)
        }),
        PatchFlags.STABLE_FRAGMENT
      )),
      root
    )

    expect(inner(root)).toBe('<p>foofoo</p><p>barbar</p>')
    expect(block.dynamicChildren!.length).toBe(2)
    expect(serialize(block.dynamicChildren![0].el as TestElement)).toBe(
      '<p>foofoo</p>'
    )
    expect(serialize(block.dynamicChildren![1].el as TestElement)).toBe(
      '<p>barbar</p>'
    )
  })

  // A Fragment with `UNKEYED_FRAGMENT` flag will always patch its children,
  // so there's no need for tracking dynamicChildren.
  test('PatchFlags: PatchFlags.UNKEYED_FRAGMENT', async () => {
    const list = [{ tag: 'p', text: 'foo' }]
    render(
      (openBlock(true),
      (block = createBlock(
        Fragment,
        null,
        list.map(item => {
          return createVNode(item.tag, null, item.text)
        }),
        PatchFlags.UNKEYED_FRAGMENT
      ))),
      root
    )

    expect(inner(root)).toBe('<p>foo</p>')
    expect(block.dynamicChildren!.length).toBe(0)

    list.unshift({ tag: 'i', text: 'bar' })
    render(
      (openBlock(true),
      createBlock(
        Fragment,
        null,
        list.map(item => {
          return createVNode(item.tag, null, item.text)
        }),
        PatchFlags.UNKEYED_FRAGMENT
      )),
      root
    )

    expect(inner(root)).toBe('<i>bar</i><p>foo</p>')
    expect(block.dynamicChildren!.length).toBe(0)
  })

  // A Fragment with `KEYED_FRAGMENT` will always patch its children,
  // so there's no need for tracking dynamicChildren.
  test('PatchFlags: PatchFlags.KEYED_FRAGMENT', async () => {
    const list = [{ tag: 'p', text: 'foo' }]
    render(
      (openBlock(true),
      (block = createBlock(
        Fragment,
        null,
        list.map(item => {
          return createVNode(item.tag, { key: item.tag }, item.text)
        }),
        PatchFlags.KEYED_FRAGMENT
      ))),
      root
    )

    expect(inner(root)).toBe('<p>foo</p>')
    expect(block.dynamicChildren!.length).toBe(0)

    list.unshift({ tag: 'i', text: 'bar' })
    render(
      (openBlock(true),
      createBlock(
        Fragment,
        null,
        list.map(item => {
          return createVNode(item.tag, { key: item.tag }, item.text)
        }),
        PatchFlags.KEYED_FRAGMENT
      )),
      root
    )

    expect(inner(root)).toBe('<i>bar</i><p>foo</p>')
    expect(block.dynamicChildren!.length).toBe(0)
  })

  test('PatchFlags: PatchFlags.NEED_PATCH', async () => {
    const spyMounted = jest.fn()
    const spyUpdated = jest.fn()
    const count = ref(0)
    const Comp = {
      setup() {
        return () => {
          count.value
          return (
            openBlock(),
            (block = createBlock('div', null, [
              createVNode(
                'p',
                { onVnodeMounted: spyMounted, onVnodeBeforeUpdate: spyUpdated },
                '',
                PatchFlags.NEED_PATCH
              )
            ]))
          )
        }
      }
    }

    render(h(Comp), root)

    expect(inner(root)).toBe('<div><p></p></div>')
    expect(block!.dynamicChildren!.length).toBe(1)
    expect(serialize(block!.dynamicChildren![0].el as TestElement)).toBe(
      '<p></p>'
    )
    expect(spyMounted).toHaveBeenCalledTimes(1)
    expect(spyUpdated).toHaveBeenCalledTimes(0)

    count.value++
    await nextTick()

    expect(inner(root)).toBe('<div><p></p></div>')
    expect(block!.dynamicChildren!.length).toBe(1)
    expect(serialize(block!.dynamicChildren![0].el as TestElement)).toBe(
      '<p></p>'
    )
    expect(spyMounted).toHaveBeenCalledTimes(1)
    expect(spyUpdated).toHaveBeenCalledTimes(1)
  })

  test('PatchFlags: PatchFlags.BAIL', async () => {
    render(
      (openBlock(),
      (block = createBlock('div', null, [createVNode('p', null, 'foo')]))),
      root
    )

    expect(inner(root)).toBe('<div><p>foo</p></div>')
    expect(block!.dynamicChildren!.length).toBe(0)

    render(
      (openBlock(),
      (block = createBlock(
        'div',
        null,
        [createVNode('i', null, 'bar')],
        PatchFlags.BAIL
      ))),
      root
    )

    expect(inner(root)).toBe('<div><i>bar</i></div>')
    expect(block!.dynamicChildren).toBe(null)
  })

  // #1980
  test('dynamicChildren should be tracked correctly when normalizing slots to plain children', async () => {
    let block: VNode
    const Comp = defineComponent({
      setup(_props, { slots }) {
        return () => {
          const vnode = (openBlock(),
          (block = createBlock('div', null, {
            default: withCtx(() => [renderSlot(slots, 'default')]),
            _: SlotFlags.FORWARDED
          })))

          return vnode
        }
      }
    })

    const foo = ref(0)
    const App = {
      setup() {
        return () => {
          return createVNode(Comp, null, {
            default: withCtx(() => [
              createVNode('p', null, foo.value, PatchFlags.TEXT)
            ]),
            // Indicates that this is a stable slot to avoid bail out
            _: SlotFlags.STABLE
          })
        }
      }
    }

    render(h(App), root)
    expect(inner(root)).toBe('<div><p>0</p></div>')
    expect(block!.dynamicChildren!.length).toBe(1)
    expect(block!.dynamicChildren![0].type).toBe(Fragment)
    expect(block!.dynamicChildren![0].dynamicChildren!.length).toBe(1)
    expect(
      serialize(block!.dynamicChildren![0].dynamicChildren![0]
        .el as TestElement)
    ).toBe('<p>0</p>')

    foo.value++
    await nextTick()

    expect(inner(root)).toBe('<div><p>1</p></div>')
  })

  // #2169
  // block
  // - dynamic child (1)
  //   - component (2)
  // When unmounting (1), we know we are in optimized mode so no need to further
  // traverse unmount its children
  test('should not perform unnecessary unmount traversals', () => {
    const spy = jest.fn()
    const Child = {
      setup() {
        onBeforeUnmount(spy)
        return () => 'child'
      }
    }
    const Parent = () => (
      openBlock(),
      createBlock('div', null, [
        createVNode('div', { style: {} }, [createVNode(Child)], 4 /* STYLE */)
      ])
    )
    render(h(Parent), root)
    render(null, root)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  // #2444
  // `KEYED_FRAGMENT` and `UNKEYED_FRAGMENT` always need to diff its children
  test('non-stable Fragment always need to diff its children', () => {
    const spyA = jest.fn()
    const spyB = jest.fn()
    const ChildA = {
      setup() {
        onBeforeUnmount(spyA)
        return () => 'child'
      }
    }
    const ChildB = {
      setup() {
        onBeforeUnmount(spyB)
        return () => 'child'
      }
    }
    const Parent = () => (
      openBlock(),
      createBlock('div', null, [
        (openBlock(true),
        createBlock(
          Fragment,
          null,
          [createVNode(ChildA, { key: 0 })],
          128 /* KEYED_FRAGMENT */
        )),
        (openBlock(true),
        createBlock(
          Fragment,
          null,
          [createVNode(ChildB)],
          256 /* UNKEYED_FRAGMENT */
        ))
      ])
    )
    render(h(Parent), root)
    render(null, root)
    expect(spyA).toHaveBeenCalledTimes(1)
    expect(spyB).toHaveBeenCalledTimes(1)
  })

  // #2893
  test('manually rendering the optimized slots should allow subsequent updates to exit the optimized mode correctly', async () => {
    const state = ref(0)

    const CompA = {
      setup(props: any, { slots }: SetupContext) {
        return () => {
          return (
            openBlock(),
            createBlock('div', null, [renderSlot(slots, 'default')])
          )
        }
      }
    }

    const Wrapper = {
      setup(props: any, { slots }: SetupContext) {
        // use the manually written render function to rendering the optimized slots,
        // which should make subsequent updates exit the optimized mode correctly
        return () => {
          return slots.default!()[state.value]
        }
      }
    }

    const app = createApp({
      setup() {
        return () => {
          return (
            openBlock(),
            createBlock(Wrapper, null, {
              default: withCtx(() => [
                createVNode(CompA, null, {
                  default: withCtx(() => [createTextVNode('Hello')]),
                  _: 1 /* STABLE */
                }),
                createVNode(CompA, null, {
                  default: withCtx(() => [createTextVNode('World')]),
                  _: 1 /* STABLE */
                })
              ]),
              _: 1 /* STABLE */
            })
          )
        }
      }
    })

    app.mount(root)
    expect(inner(root)).toBe('<div>Hello</div>')

    state.value = 1
    await nextTick()
    expect(inner(root)).toBe('<div>World</div>')
  })

  test('the call of the `h` fucntion should not mess up the tracking of dynamic children', async () => {
    const Comp = {
      render() {
        return h('h1', 'Comp')
      }
    }

    const show = ref(true)
    const app = createApp({
      setup() {
        // when reading the value of computed in the render function,
        // the h function is called indirectly
        const dynamicComp = computed(() => h(Comp))

        return () => {
          return show.value
            ? (openBlock(),
              (block = createBlock('div', { key: 0 }, [
                // calling h for the first time
                dynamicComp.value
                  ? (openBlock(),
                    createBlock(
                      // calling h for the second time
                      resolveDynamicComponent(dynamicComp.value)
                    ))
                  : createCommentVNode('v-if', true)
              ])))
            : createCommentVNode('v-if', true)
        }
      }
    })

    app.mount(root)
    expect(block!.dynamicChildren!.length).toBe(1)
    expect(inner(root)).toBe(`<div><h1>Comp</h1></div>`)

    show.value = false
    await nextTick()
    expect(inner(root)).toBe(`<!--v-if-->`)
  })
})
