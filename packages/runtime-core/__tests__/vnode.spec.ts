import {
  createBlock,
  createVNode,
  openBlock,
  Comment,
  Fragment,
  Text,
  cloneVNode,
  mergeProps,
  normalizeVNode,
  transformVNodeArgs
} from '../src/vnode'
import { Data } from '../src/component'
import { ShapeFlags, PatchFlags } from '@vue/shared'
import { h, reactive, isReactive, setBlockTracking } from '../src'
import { createApp, nodeOps, serializeInner } from '@vue/runtime-test'
import { setCurrentRenderingInstance } from '../src/componentRenderContext'

describe('vnode', () => {
  test('create with just tag', () => {
    const vnode = createVNode('p')
    expect(vnode.type).toBe('p')
    expect(vnode.props).toBe(null)
  })

  test('create with tag and props', () => {
    const vnode = createVNode('p', {})
    expect(vnode.type).toBe('p')
    expect(vnode.props).toMatchObject({})
  })

  test('create with tag, props and children', () => {
    const vnode = createVNode('p', {}, ['foo'])
    expect(vnode.type).toBe('p')
    expect(vnode.props).toMatchObject({})
    expect(vnode.children).toMatchObject(['foo'])
  })

  test('create with 0 as props', () => {
    const vnode = createVNode('p', null)
    expect(vnode.type).toBe('p')
    expect(vnode.props).toBe(null)
  })

  test('show warn when create with invalid type', () => {
    const vnode = createVNode('')
    expect('Invalid vnode type when creating vnode').toHaveBeenWarned()
    expect(vnode.type).toBe(Comment)
  })

  test('create from an existing vnode', () => {
    const vnode1 = createVNode('p', { id: 'foo' })
    const vnode2 = createVNode(vnode1, { class: 'bar' }, 'baz')
    expect(vnode2).toMatchObject({
      type: 'p',
      props: {
        id: 'foo',
        class: 'bar'
      },
      children: 'baz',
      shapeFlag: ShapeFlags.ELEMENT | ShapeFlags.TEXT_CHILDREN
    })
  })

  test('vnode keys', () => {
    for (const key of ['', 'a', 0, 1, NaN]) {
      expect(createVNode('div', { key }).key).toBe(key)
    }
    expect(createVNode('div').key).toBe(null)
    expect(createVNode('div', { key: undefined }).key).toBe(null)
    expect(`VNode created with invalid key (NaN)`).toHaveBeenWarned()
  })

  test('create with class component', () => {
    class Component {
      $props: any
      static __vccOpts = { template: '<div />' }
    }
    const vnode = createVNode(Component)
    expect(vnode.type).toEqual(Component.__vccOpts)
  })

  describe('class normalization', () => {
    test('string', () => {
      const vnode = createVNode('p', { class: 'foo baz' })
      expect(vnode.props).toMatchObject({ class: 'foo baz' })
    })

    test('array<string>', () => {
      const vnode = createVNode('p', { class: ['foo', 'baz'] })
      expect(vnode.props).toMatchObject({ class: 'foo baz' })
    })

    test('array<object>', () => {
      const vnode = createVNode('p', {
        class: [{ foo: 'foo' }, { baz: 'baz' }]
      })
      expect(vnode.props).toMatchObject({ class: 'foo baz' })
    })

    test('object', () => {
      const vnode = createVNode('p', { class: { foo: 'foo', baz: 'baz' } })
      expect(vnode.props).toMatchObject({ class: 'foo baz' })
    })
  })

  describe('style normalization', () => {
    test('array', () => {
      const vnode = createVNode('p', {
        style: [{ foo: 'foo' }, { baz: 'baz' }]
      })
      expect(vnode.props).toMatchObject({ style: { foo: 'foo', baz: 'baz' } })
    })

    test('object', () => {
      const vnode = createVNode('p', { style: { foo: 'foo', baz: 'baz' } })
      expect(vnode.props).toMatchObject({ style: { foo: 'foo', baz: 'baz' } })
    })
  })

  describe('children normalization', () => {
    const nop = jest.fn

    test('null', () => {
      const vnode = createVNode('p', null, null)
      expect(vnode.children).toBe(null)
      expect(vnode.shapeFlag).toBe(ShapeFlags.ELEMENT)
    })

    test('array', () => {
      const vnode = createVNode('p', null, ['foo'])
      expect(vnode.children).toMatchObject(['foo'])
      expect(vnode.shapeFlag).toBe(
        ShapeFlags.ELEMENT | ShapeFlags.ARRAY_CHILDREN
      )
    })

    test('object', () => {
      const vnode = createVNode({}, null, { foo: 'foo' })
      expect(vnode.children).toMatchObject({ foo: 'foo' })
      expect(vnode.shapeFlag).toBe(
        ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.SLOTS_CHILDREN
      )
    })

    test('function', () => {
      const vnode = createVNode('p', null, nop)
      expect(vnode.children).toMatchObject({ default: nop })
      expect(vnode.shapeFlag).toBe(
        ShapeFlags.ELEMENT | ShapeFlags.SLOTS_CHILDREN
      )
    })

    test('string', () => {
      const vnode = createVNode('p', null, 'foo')
      expect(vnode.children).toBe('foo')
      expect(vnode.shapeFlag).toBe(
        ShapeFlags.ELEMENT | ShapeFlags.TEXT_CHILDREN
      )
    })

    test('element with slots', () => {
      const children = [createVNode('span', null, 'hello')]
      const vnode = createVNode('div', null, {
        default: () => children
      })

      expect(vnode.children).toBe(children)
      expect(vnode.shapeFlag).toBe(
        ShapeFlags.ELEMENT | ShapeFlags.ARRAY_CHILDREN
      )
    })
  })

  test('normalizeVNode', () => {
    // null / undefined -> Comment
    expect(normalizeVNode(null)).toMatchObject({ type: Comment })
    expect(normalizeVNode(undefined)).toMatchObject({ type: Comment })

    // boolean -> Comment
    // this is for usage like `someBoolean && h('div')` and behavior consistency
    // with 2.x (#574)
    expect(normalizeVNode(true)).toMatchObject({ type: Comment })
    expect(normalizeVNode(false)).toMatchObject({ type: Comment })

    // array -> Fragment
    expect(normalizeVNode(['foo'])).toMatchObject({ type: Fragment })

    // VNode -> VNode
    const vnode = createVNode('div')
    expect(normalizeVNode(vnode)).toBe(vnode)

    // mounted VNode -> cloned VNode
    const mounted = createVNode('div')
    mounted.el = {}
    const normalized = normalizeVNode(mounted)
    expect(normalized).not.toBe(mounted)
    expect(normalized).toEqual(mounted)

    // primitive types
    expect(normalizeVNode('foo')).toMatchObject({ type: Text, children: `foo` })
    expect(normalizeVNode(1)).toMatchObject({ type: Text, children: `1` })
  })

  test('type shapeFlag inference', () => {
    expect(createVNode('div').shapeFlag).toBe(ShapeFlags.ELEMENT)
    expect(createVNode({}).shapeFlag).toBe(ShapeFlags.STATEFUL_COMPONENT)
    expect(createVNode(() => {}).shapeFlag).toBe(
      ShapeFlags.FUNCTIONAL_COMPONENT
    )
    expect(createVNode(Text).shapeFlag).toBe(0)
  })

  test('cloneVNode', () => {
    const node1 = createVNode('div', { foo: 1 }, null)
    expect(cloneVNode(node1)).toEqual(node1)

    const node2 = createVNode({}, null, [node1])
    const cloned2 = cloneVNode(node2)
    expect(cloned2).toEqual(node2)
    expect(cloneVNode(node2)).toEqual(node2)
    expect(cloneVNode(node2)).toEqual(cloned2)
  })

  test('cloneVNode key normalization', () => {
    // #1041 should use resolved key/ref
    expect(cloneVNode(createVNode('div', { key: 1 })).key).toBe(1)
    expect(cloneVNode(createVNode('div', { key: 1 }), { key: 2 }).key).toBe(2)
    expect(cloneVNode(createVNode('div'), { key: 2 }).key).toBe(2)
  })

  // ref normalizes to [currentRenderingInstance, ref]
  test('cloneVNode ref normalization', () => {
    const mockInstance1 = { type: {} } as any
    const mockInstance2 = { type: {} } as any

    setCurrentRenderingInstance(mockInstance1)
    const original = createVNode('div', { ref: 'foo' })
    expect(original.ref).toStrictEqual({ i: mockInstance1, r: 'foo' })

    // clone and preserve original ref
    const cloned1 = cloneVNode(original)
    expect(cloned1.ref).toStrictEqual({ i: mockInstance1, r: 'foo' })

    // cloning with new ref, but with same context instance
    const cloned2 = cloneVNode(original, { ref: 'bar' })
    expect(cloned2.ref).toStrictEqual({ i: mockInstance1, r: 'bar' })

    // cloning and adding ref to original that has no ref
    const original2 = createVNode('div')
    const cloned3 = cloneVNode(original2, { ref: 'bar' })
    expect(cloned3.ref).toStrictEqual({ i: mockInstance1, r: 'bar' })

    // cloning with different context instance
    setCurrentRenderingInstance(mockInstance2)

    // clone and preserve original ref
    const cloned4 = cloneVNode(original)
    // #1311 should preserve original context instance!
    expect(cloned4.ref).toStrictEqual({ i: mockInstance1, r: 'foo' })

    // cloning with new ref, but with same context instance
    const cloned5 = cloneVNode(original, { ref: 'bar' })
    // new ref should use current context instance and overwrite original
    expect(cloned5.ref).toStrictEqual({ i: mockInstance2, r: 'bar' })

    // cloning and adding ref to original that has no ref
    const cloned6 = cloneVNode(original2, { ref: 'bar' })
    expect(cloned6.ref).toStrictEqual({ i: mockInstance2, r: 'bar' })

    setCurrentRenderingInstance(null)
  })

  test('cloneVNode ref merging', () => {
    const mockInstance1 = { type: {} } as any
    const mockInstance2 = { type: {} } as any

    setCurrentRenderingInstance(mockInstance1)
    const original = createVNode('div', { ref: 'foo' })
    expect(original.ref).toStrictEqual({ i: mockInstance1, r: 'foo' })

    // clone and preserve original ref
    setCurrentRenderingInstance(mockInstance2)
    const cloned1 = cloneVNode(original, { ref: 'bar' }, true)
    expect(cloned1.ref).toStrictEqual([
      { i: mockInstance1, r: 'foo' },
      { i: mockInstance2, r: 'bar' }
    ])

    setCurrentRenderingInstance(null)
  })

  test('cloneVNode class normalization', () => {
    const vnode = createVNode('div')
    const expectedProps = {
      class: 'a b'
    }
    expect(cloneVNode(vnode, { class: 'a b' }).props).toMatchObject(
      expectedProps
    )
    expect(cloneVNode(vnode, { class: ['a', 'b'] }).props).toMatchObject(
      expectedProps
    )
    expect(
      cloneVNode(vnode, { class: { a: true, b: true } }).props
    ).toMatchObject(expectedProps)
    expect(
      cloneVNode(vnode, { class: [{ a: true, b: true }] }).props
    ).toMatchObject(expectedProps)
  })

  test('cloneVNode style normalization', () => {
    const vnode = createVNode('div')
    const expectedProps = {
      style: {
        color: 'blue',
        width: '300px'
      }
    }
    expect(
      cloneVNode(vnode, { style: 'color: blue; width: 300px;' }).props
    ).toMatchObject(expectedProps)
    expect(
      cloneVNode(vnode, {
        style: {
          color: 'blue',
          width: '300px'
        }
      }).props
    ).toMatchObject(expectedProps)
    expect(
      cloneVNode(vnode, {
        style: [
          {
            color: 'blue',
            width: '300px'
          }
        ]
      }).props
    ).toMatchObject(expectedProps)
  })

  describe('mergeProps', () => {
    test('class', () => {
      let props1: Data = { class: 'c' }
      let props2: Data = { class: ['cc'] }
      let props3: Data = { class: [{ ccc: true }] }
      let props4: Data = { class: { cccc: true } }
      expect(mergeProps(props1, props2, props3, props4)).toMatchObject({
        class: 'c cc ccc cccc'
      })
    })

    test('style', () => {
      let props1: Data = {
        style: {
          color: 'red',
          fontSize: 10
        }
      }
      let props2: Data = {
        style: [
          {
            color: 'blue',
            width: '200px'
          },
          {
            width: '300px',
            height: '300px',
            fontSize: 30
          }
        ]
      }
      expect(mergeProps(props1, props2)).toMatchObject({
        style: {
          color: 'blue',
          width: '300px',
          height: '300px',
          fontSize: 30
        }
      })
    })

    test('style w/ strings', () => {
      let props1: Data = {
        style: 'width:100px;right:10;top:10'
      }
      let props2: Data = {
        style: [
          {
            color: 'blue',
            width: '200px'
          },
          {
            width: '300px',
            height: '300px',
            fontSize: 30
          }
        ]
      }
      expect(mergeProps(props1, props2)).toMatchObject({
        style: {
          color: 'blue',
          width: '300px',
          height: '300px',
          fontSize: 30,
          right: '10',
          top: '10'
        }
      })
    })

    test('handlers', () => {
      let clickHandler1 = function() {}
      let clickHandler2 = function() {}
      let focusHandler2 = function() {}

      let props1: Data = { onClick: clickHandler1 }
      let props2: Data = { onClick: clickHandler2, onFocus: focusHandler2 }
      expect(mergeProps(props1, props2)).toMatchObject({
        onClick: [clickHandler1, clickHandler2],
        onFocus: focusHandler2
      })
    })

    test('default', () => {
      let props1: Data = { foo: 'c' }
      let props2: Data = { foo: {}, bar: ['cc'] }
      let props3: Data = { baz: { ccc: true } }
      expect(mergeProps(props1, props2, props3)).toMatchObject({
        foo: {},
        bar: ['cc'],
        baz: { ccc: true }
      })
    })
  })

  describe('dynamic children', () => {
    test('with patchFlags', () => {
      const hoist = createVNode('div')
      let vnode1
      const vnode = (openBlock(),
      createBlock('div', null, [
        hoist,
        (vnode1 = createVNode('div', null, 'text', PatchFlags.TEXT))
      ]))
      expect(vnode.dynamicChildren).toStrictEqual([vnode1])
    })

    test('should not track vnodes with only HYDRATE_EVENTS flag', () => {
      const hoist = createVNode('div')
      const vnode = (openBlock(),
      createBlock('div', null, [
        hoist,
        createVNode('div', null, 'text', PatchFlags.HYDRATE_EVENTS)
      ]))
      expect(vnode.dynamicChildren).toStrictEqual([])
    })

    test('many times call openBlock', () => {
      const hoist = createVNode('div')
      let vnode1, vnode2, vnode3
      const vnode = (openBlock(),
      createBlock('div', null, [
        hoist,
        (vnode1 = createVNode('div', null, 'text', PatchFlags.TEXT)),
        (vnode2 = (openBlock(),
        createBlock('div', null, [
          hoist,
          (vnode3 = createVNode('div', null, 'text', PatchFlags.TEXT))
        ])))
      ]))
      expect(vnode.dynamicChildren).toStrictEqual([vnode1, vnode2])
      expect(vnode2.dynamicChildren).toStrictEqual([vnode3])
    })

    test('with stateful component', () => {
      const hoist = createVNode('div')
      let vnode1
      const vnode = (openBlock(),
      createBlock('div', null, [
        hoist,
        (vnode1 = createVNode({}, null, 'text'))
      ]))
      expect(vnode.dynamicChildren).toStrictEqual([vnode1])
    })

    test('with functional component', () => {
      const hoist = createVNode('div')
      let vnode1
      const vnode = (openBlock(),
      createBlock('div', null, [
        hoist,
        (vnode1 = createVNode(() => {}, null, 'text'))
      ]))
      expect(vnode.dynamicChildren).toStrictEqual([vnode1])
    })

    test('with suspense', () => {
      const hoist = createVNode('div')
      let vnode1
      const vnode = (openBlock(),
      createBlock('div', null, [
        hoist,
        (vnode1 = createVNode(() => {}, null, 'text'))
      ]))
      expect(vnode.dynamicChildren).toStrictEqual([vnode1])
    })

    // #1039
    // <component :is="foo">{{ bar }}</component>
    // - content is compiled as slot
    // - dynamic component resolves to plain element, but as a block
    // - block creation disables its own tracking, accidentally causing the
    //   slot content (called during the block node creation) to be missed
    test('element block should track normalized slot children', () => {
      const hoist = createVNode('div')
      let vnode1: any
      const vnode = (openBlock(),
      createBlock('div', null, {
        default: () => {
          return [
            hoist,
            (vnode1 = createVNode('div', null, 'text', PatchFlags.TEXT))
          ]
        }
      }))
      expect(vnode.dynamicChildren).toStrictEqual([vnode1])
    })

    test('openBlock w/ disableTracking: true', () => {
      const hoist = createVNode('div')
      let vnode1
      const vnode = (openBlock(),
      createBlock('div', null, [
        // a v-for fragment block generated by the compiler
        // disables tracking because it always diffs its
        // children.
        (vnode1 = (openBlock(true),
        createBlock(Fragment, null, [
          hoist,
          /*vnode2*/ createVNode(() => {}, null, 'text')
        ])))
      ]))
      expect(vnode.dynamicChildren).toStrictEqual([vnode1])
      expect(vnode1.dynamicChildren).toStrictEqual([])
    })

    test('openBlock without disableTracking: true', () => {
      const hoist = createVNode('div')
      let vnode1, vnode2
      const vnode = (openBlock(),
      createBlock('div', null, [
        (vnode1 = (openBlock(),
        createBlock(Fragment, null, [
          hoist,
          (vnode2 = createVNode(() => {}, null, 'text'))
        ])))
      ]))
      expect(vnode.dynamicChildren).toStrictEqual([vnode1])
      expect(vnode1.dynamicChildren).toStrictEqual([vnode2])
    })

    test('should not track openBlock() when tracking is disabled', () => {
      let vnode1
      const vnode = (openBlock(),
      createBlock('div', null, [
        setBlockTracking(-1),
        (vnode1 = (openBlock(), createBlock('div'))),
        setBlockTracking(1),
        vnode1
      ]))
      expect(vnode.dynamicChildren).toStrictEqual([])
    })
  })

  describe('transformVNodeArgs', () => {
    afterEach(() => {
      // reset
      transformVNodeArgs()
    })

    test('no-op pass through', () => {
      transformVNodeArgs(args => args)
      const vnode = createVNode('div', { id: 'foo' }, 'hello')
      expect(vnode).toMatchObject({
        type: 'div',
        props: { id: 'foo' },
        children: 'hello',
        shapeFlag: ShapeFlags.ELEMENT | ShapeFlags.TEXT_CHILDREN
      })
    })

    test('direct override', () => {
      transformVNodeArgs(() => ['div', { id: 'foo' }, 'hello'])
      const vnode = createVNode('p')
      expect(vnode).toMatchObject({
        type: 'div',
        props: { id: 'foo' },
        children: 'hello',
        shapeFlag: ShapeFlags.ELEMENT | ShapeFlags.TEXT_CHILDREN
      })
    })

    test('receive component instance as 2nd arg', () => {
      transformVNodeArgs((args, instance) => {
        if (instance) {
          return ['h1', null, instance.type.name]
        } else {
          return args
        }
      })
      const App = {
        // this will be the name of the component in the h1
        name: 'Root Component',
        render() {
          return h('p') // this will be overwritten by the transform
        }
      }
      const root = nodeOps.createElement('div')
      createApp(App).mount(root)
      expect(serializeInner(root)).toBe('<h1>Root Component</h1>')
    })

    test('should not be observable', () => {
      const a = createVNode('div')
      const b = reactive(a)
      expect(b).toBe(a)
      expect(isReactive(b)).toBe(false)
    })
  })
})
