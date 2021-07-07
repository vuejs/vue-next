import {
  createRenderer,
  h,
  nodeOps,
  render,
  serializeInner as inner,
  TestElement
} from '@vue/runtime-test'
import { extend } from '@vue/shared'

describe('renderer: element', () => {
  let root: TestElement

  beforeEach(() => {
    root = nodeOps.createElement('div')
  })

  it('should create an element', () => {
    render(h('div'), root)
    expect(inner(root)).toBe('<div></div>')
  })

  it('should create an element with props', () => {
    render(h('div', { id: 'foo', class: 'bar' }), root)
    expect(inner(root)).toBe('<div id="foo" class="bar"></div>')
  })

  it('should create an element with direct text children', () => {
    render(h('div', ['foo', ' ', 'bar']), root)
    expect(inner(root)).toBe('<div>foo bar</div>')
  })

  it('should create an element with direct text children and props', () => {
    render(h('div', { id: 'foo' }, ['bar']), root)
    expect(inner(root)).toBe('<div id="foo">bar</div>')
  })

  it('should update an element tag which is already mounted', () => {
    render(h('div', ['foo']), root)
    expect(inner(root)).toBe('<div>foo</div>')

    render(h('span', ['foo']), root)
    expect(inner(root)).toBe('<span>foo</span>')
  })

  it('should update element props which is already mounted', () => {
    render(h('div', { id: 'bar' }, ['foo']), root)
    expect(inner(root)).toBe('<div id="bar">foo</div>')

    render(h('div', { id: 'baz', class: 'bar' }, ['foo']), root)
    expect(inner(root)).toBe('<div id="baz" class="bar">foo</div>')
  })

  it('should delay the initializing of specific props', () => {
    const queue: string[] = []
    const { render } = createRenderer(
      extend(
        {
          patchProp(
            el: TestElement,
            key: string,
            prevValue: any,
            nextValue: any
          ) {
            el.props[key] = nextValue
            queue.push(key)
          },
          delayInitProp(el: Element, key: string) {
            return key.startsWith('delay')
              ? key.startsWith('delay-weak')
                ? -1
                : 1
              : 0
          }
        },
        nodeOps
      )
    )

    render(
      h('div', {
        'delay-a': 'a',
        'delay-b': 'b',
        'delay-weak-a': 'a',
        id: 'baz'
      }),
      root
    )
    expect(queue.length).toBe(4)
    expect(queue[0]).toBe('id')
    expect(queue[1]).toBe('delay-weak-a')
    expect(queue[2]).toBe('delay-a')
    expect(queue[3]).toBe('delay-b')

    expect(inner(root)).toBe(
      '<div id="baz" delay-weak-a="a" delay-a="a" delay-b="b"></div>'
    )
  })
})
