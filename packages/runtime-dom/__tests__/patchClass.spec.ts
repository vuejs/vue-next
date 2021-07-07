import { patchProp } from '../src/patchProp'
import { ElementWithTransition } from '../src/components/Transition'
import { svgNS } from '../src/nodeOps'

describe('runtime-dom: class patching', () => {
  test('basics', () => {
    const el = document.createElement('div')
    patchProp(el, 'class', null, 'foo')
    expect(el.className).toBe('foo')
    expect(el.outerHTML).toBe('<div class="foo"></div>')
    patchProp(el, 'class', 'foo', null)
    expect(el.className).toBe('')
    expect(el.outerHTML).toBe('<div></div>')
  })

  test('transition class', () => {
    const el = document.createElement('div') as ElementWithTransition
    el._vtc = new Set(['bar', 'baz'])
    patchProp(el, 'class', null, 'foo')
    expect(el.className).toBe('foo bar baz')
    patchProp(el, 'class', 'foo bar baz', null)
    expect(el.className).toBe('bar baz')
    delete el._vtc
    patchProp(el, 'class', 'bar baz', 'foo')
    expect(el.className).toBe('foo')
  })

  test('svg', () => {
    const el = document.createElementNS(svgNS, 'svg')
    patchProp(el, 'class', null, 'foo', true)
    expect(el.getAttribute('class')).toBe('foo')
    expect(el.outerHTML).toBe('<svg class="foo"></svg>')
    patchProp(el, 'class', 'foo', null, true)
    expect(el.getAttribute('class')).toBe(null)
    expect(el.outerHTML).toBe('<svg></svg>')
  })
})
