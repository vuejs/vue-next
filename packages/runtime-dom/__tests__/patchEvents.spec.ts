import { patchProp } from '../src/propOps'

const timeout = () => new Promise(r => setTimeout(r))

describe(`runtime-dom: events patching`, () => {
  it('should assign event handler', async () => {
    const el = document.createElement('div')
    const event = new Event('click')
    const fn = jest.fn()
    patchProp(el, 'onClick', null, fn)
    el.dispatchEvent(event)
    await timeout()
    el.dispatchEvent(event)
    await timeout()
    el.dispatchEvent(event)
    await timeout()
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('should update event handler', async () => {
    const el = document.createElement('div')
    const event = new Event('click')
    const prevFn = jest.fn()
    const nextFn = jest.fn()
    patchProp(el, 'onClick', null, prevFn)
    el.dispatchEvent(event)
    patchProp(el, 'onClick', prevFn, nextFn)
    await timeout()
    el.dispatchEvent(event)
    await timeout()
    el.dispatchEvent(event)
    await timeout()
    expect(prevFn).toHaveBeenCalledTimes(1)
    expect(nextFn).toHaveBeenCalledTimes(2)
  })

  it('should support multiple event handlers', async () => {
    const el = document.createElement('div')
    const event = new Event('click')
    const fn1 = jest.fn()
    const fn2 = jest.fn()
    patchProp(el, 'onClick', null, [fn1, fn2])
    el.dispatchEvent(event)
    await timeout()
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
  })

  it('should unassign event handler', async () => {
    const el = document.createElement('div')
    const event = new Event('click')
    const fn = jest.fn()
    patchProp(el, 'onClick', null, fn)
    patchProp(el, 'onClick', fn, null)
    el.dispatchEvent(event)
    await timeout()
    expect(fn).not.toHaveBeenCalled()
  })

  it('should support event option modifiers', async () => {
    const el = document.createElement('div')
    const event = new Event('click')
    const fn = jest.fn()
    patchProp(el, 'onClickOnceCapture', null, fn)
    el.dispatchEvent(event)
    await timeout()
    el.dispatchEvent(event)
    await timeout()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should unassign event handler with options', async () => {
    const el = document.createElement('div')
    const event = new Event('click')
    const fn = jest.fn()
    patchProp(el, 'onClickCapture', null, fn)
    el.dispatchEvent(event)
    await timeout()
    expect(fn).toHaveBeenCalledTimes(1)

    patchProp(el, 'onClickCapture', fn, null)
    el.dispatchEvent(event)
    await timeout()
    el.dispatchEvent(event)
    await timeout()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should support native onclick', async () => {
    const el = document.createElement('div')
    const event = new Event('click')

    // string should be set as attribute
    const fn = ((window as any).__globalSpy = jest.fn())
    patchProp(el, 'onclick', null, '__globalSpy(1)')
    el.dispatchEvent(event)
    await timeout()
    delete (window as any).__globalSpy
    expect(fn).toHaveBeenCalledWith(1)

    const fn2 = jest.fn()
    patchProp(el, 'onclick', '__globalSpy(1)', fn2)
    el.dispatchEvent(event)
    await timeout()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledWith(event)
  })

  it('should support stopImmediatePropagation on multiple listeners', async () => {
    const el = document.createElement('div')
    const event = new Event('click')
    const fn1 = jest.fn((e: Event) => {
      e.stopImmediatePropagation()
    })
    const fn2 = jest.fn()
    patchProp(el, 'onClick', null, [fn1, fn2])
    el.dispatchEvent(event)
    await timeout()
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(0)
  })

  // #1747
  it('should handle same computed handler function being bound on multiple targets', async () => {
    const el1 = document.createElement('div')
    const el2 = document.createElement('div')

    const event = new Event('click')
    const prevFn = jest.fn()
    const nextFn = jest.fn()

    patchProp(el1, 'onClick', null, prevFn)
    patchProp(el2, 'onClick', null, prevFn)

    el1.dispatchEvent(event)
    el2.dispatchEvent(event)
    await timeout()
    expect(prevFn).toHaveBeenCalledTimes(2)
    expect(nextFn).toHaveBeenCalledTimes(0)

    patchProp(el1, 'onClick', prevFn, nextFn)
    patchProp(el2, 'onClick', prevFn, nextFn)

    el1.dispatchEvent(event)
    el2.dispatchEvent(event)
    await timeout()
    expect(prevFn).toHaveBeenCalledTimes(2)
    expect(nextFn).toHaveBeenCalledTimes(2)

    el1.dispatchEvent(event)
    el2.dispatchEvent(event)
    await timeout()
    expect(prevFn).toHaveBeenCalledTimes(2)
    expect(nextFn).toHaveBeenCalledTimes(4)
  })

  // #2841
  test('should patch event correctly in web-components', async () => {
    class TestElement extends HTMLElement {
      constructor() {
        super()
      }
    }
    window.customElements.define('test-element', TestElement)
    const testElement = document.createElement('test-element', {
      is: 'test-element'
    })
    const fn1 = jest.fn()
    const fn2 = jest.fn()

    // in webComponents, @foo-bar will patch prop 'onFooBar'
    // and @foobar will patch prop 'onFoobar'

    patchProp(testElement, 'onFooBar', null, fn1)
    testElement.dispatchEvent(new CustomEvent('foo-bar'))
    expect(fn1).toHaveBeenCalledTimes(1)

    patchProp(testElement, 'onFoobar', null, fn2)
    testElement.dispatchEvent(new CustomEvent('foobar'))
    expect(fn2).toHaveBeenCalledTimes(1)
  })
})
