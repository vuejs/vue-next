import {
  h,
  render,
  nodeOps,
  serializeInner,
  renderSlot,
  withScopeId,
  pushScopeId,
  popScopeId
} from '@vue/runtime-test'
import { withCtx } from '../src/componentRenderContext'

describe('scopeId runtime support', () => {
  test('should attach scopeId', () => {
    const App = {
      __scopeId: 'parent',
      render: () => h('div', [h('div')])
    }
    const root = nodeOps.createElement('div')
    render(h(App), root)
    expect(serializeInner(root)).toBe(`<div parent><div parent></div></div>`)
  })

  test('should attach scopeId to components in parent component', () => {
    const Child = {
      __scopeId: 'child',
      render: () => h('div')
    }
    const App = {
      __scopeId: 'parent',
      render: () => h('div', [h(Child)])
    }

    const root = nodeOps.createElement('div')
    render(h(App), root)
    expect(serializeInner(root)).toBe(
      `<div parent><div child parent></div></div>`
    )
  })

  // :slotted basic
  test('should work on slots', () => {
    const Child = {
      __scopeId: 'child',
      render(this: any) {
        return h('div', renderSlot(this.$slots, 'default'))
      }
    }
    const Child2 = {
      __scopeId: 'child2',
      render: () => h('span')
    }
    const App = {
      __scopeId: 'parent',
      render: () => {
        return h(
          Child,
          withCtx(() => {
            return [h('div'), h(Child2)]
          })
        )
      }
    }
    const root = nodeOps.createElement('div')
    render(h(App), root)
    // slot content should have:
    // - scopeId from parent
    // - slotted scopeId (with `-s` postfix) from child (the tree owner)
    expect(serializeInner(root)).toBe(
      `<div child parent>` +
        `<div parent child-s></div>` +
        // component inside slot should have:
        // - scopeId from template context
        // - slotted scopeId from slot owner
        // - its own scopeId
        `<span child2 parent child-s></span>` +
        `</div>`
    )
  })

  // #2892
  test(':slotted on forwarded slots', async () => {
    const Wrapper = {
      __scopeId: 'wrapper',
      render(this: any) {
        // <div class="wrapper"><slot/></div>
        return h('div', { class: 'wrapper' }, [
          renderSlot(
            this.$slots,
            'default',
            {},
            undefined,
            true /* noSlotted */
          )
        ])
      }
    }

    const Slotted = {
      __scopeId: 'slotted',
      render(this: any) {
        // <Wrapper><slot/></Wrapper>
        return h(Wrapper, null, {
          default: withCtx(() => [renderSlot(this.$slots, 'default')])
        })
      }
    }

    // simulate hoisted node
    pushScopeId('root')
    const hoisted = h('div', 'hoisted')
    popScopeId()

    const Root = {
      __scopeId: 'root',
      render(this: any) {
        // <Slotted><div>hoisted</div><div>{{ dynamic }}</div></Slotted>
        return h(Slotted, null, {
          default: withCtx(() => {
            return [hoisted, h('div', 'dynamic')]
          })
        })
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Root), root)
    expect(serializeInner(root)).toBe(
      `<div class="wrapper" wrapper slotted root>` +
        `<div root slotted-s>hoisted</div>` +
        `<div root slotted-s>dynamic</div>` +
        `</div>`
    )

    const Root2 = {
      __scopeId: 'root',
      render(this: any) {
        // <Slotted>
        //  <Wrapper>
        //    <div>hoisted</div><div>{{ dynamic }}</div>
        //  </Wrapper>
        // </Slotted>
        return h(Slotted, null, {
          default: withCtx(() => [
            h(Wrapper, null, {
              default: withCtx(() => [hoisted, h('div', 'dynamic')])
            })
          ])
        })
      }
    }
    const root2 = nodeOps.createElement('div')
    render(h(Root2), root2)
    expect(serializeInner(root2)).toBe(
      `<div class="wrapper" wrapper slotted root>` +
        `<div class="wrapper" wrapper root slotted-s>` +
        `<div root>hoisted</div>` +
        `<div root>dynamic</div>` +
        `</div>` +
        `</div>`
    )
  })

  // #1988
  test('should inherit scopeId through nested HOCs with inheritAttrs: false', () => {
    const App = {
      __scopeId: 'parent',
      render: () => {
        return h(Child)
      }
    }

    function Child() {
      return h(Child2, { class: 'foo' })
    }

    function Child2() {
      return h('div')
    }
    Child2.inheritAttrs = false

    const root = nodeOps.createElement('div')
    render(h(App), root)

    expect(serializeInner(root)).toBe(`<div parent></div>`)
  })
})

describe('backwards compat with <=3.0.7', () => {
  const withParentId = withScopeId('parent')
  const withChildId = withScopeId('child')

  test('should attach scopeId', () => {
    const App = {
      __scopeId: 'parent',
      render: withParentId(() => {
        return h('div', [h('div')])
      })
    }
    const root = nodeOps.createElement('div')
    render(h(App), root)
    expect(serializeInner(root)).toBe(`<div parent><div parent></div></div>`)
  })

  test('should attach scopeId to components in parent component', () => {
    const Child = {
      __scopeId: 'child',
      render: withChildId(() => {
        return h('div')
      })
    }
    const App = {
      __scopeId: 'parent',
      render: withParentId(() => {
        return h('div', [h(Child)])
      })
    }

    const root = nodeOps.createElement('div')
    render(h(App), root)
    expect(serializeInner(root)).toBe(
      `<div parent><div child parent></div></div>`
    )
  })

  test('should work on slots', () => {
    const Child = {
      __scopeId: 'child',
      render: withChildId(function(this: any) {
        return h('div', renderSlot(this.$slots, 'default'))
      })
    }
    const withChild2Id = withScopeId('child2')
    const Child2 = {
      __scopeId: 'child2',
      render: withChild2Id(() => h('span'))
    }
    const App = {
      __scopeId: 'parent',
      render: withParentId(() => {
        return h(
          Child,
          withParentId(() => {
            return [h('div'), h(Child2)]
          })
        )
      })
    }
    const root = nodeOps.createElement('div')
    render(h(App), root)
    // slot content should have:
    // - scopeId from parent
    // - slotted scopeId (with `-s` postfix) from child (the tree owner)
    expect(serializeInner(root)).toBe(
      `<div child parent>` +
        `<div parent child-s></div>` +
        // component inside slot should have:
        // - scopeId from template context
        // - slotted scopeId from slot owner
        // - its own scopeId
        `<span child2 parent child-s></span>` +
        `</div>`
    )
  })

  // #1988
  test('should inherit scopeId through nested HOCs with inheritAttrs: false', () => {
    const withParentId = withScopeId('parent')
    const App = {
      __scopeId: 'parent',
      render: withParentId(() => {
        return h(Child)
      })
    }

    function Child() {
      return h(Child2, { class: 'foo' })
    }

    function Child2() {
      return h('div')
    }
    Child2.inheritAttrs = false

    const root = nodeOps.createElement('div')
    render(h(App), root)

    expect(serializeInner(root)).toBe(`<div parent></div>`)
  })

  test('hoisted nodes', async () => {
    pushScopeId('foobar')
    const hoisted = h('div', 'hello')
    popScopeId()

    const App = {
      __scopeId: 'foobar',
      render: () => h('div', [hoisted])
    }

    const root = nodeOps.createElement('div')
    render(h(App), root)

    expect(serializeInner(root)).toBe(
      `<div foobar><div foobar>hello</div></div>`
    )
  })
})
