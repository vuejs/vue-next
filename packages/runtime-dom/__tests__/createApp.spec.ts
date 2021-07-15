import { createApp, h } from '../src'

describe('createApp for dom', () => {
  // #2926
  test('mount to SVG container', () => {
    const root = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    createApp({
      render() {
        return h('g')
      }
    }).mount(root)
    expect(root.children.length).toBe(1)
    expect(root.children[0] instanceof SVGElement).toBe(true)
  })

  test('mount to shadow DOM container', () => {
    const shadowHost = document.createElement('div')
    const shadowRoot = shadowHost.attachShadow({ mode: 'open' })
    createApp({
      render() {
        return h('p', 'shadow DOM')
      }
    }).mount(shadowRoot)
    expect(shadowRoot.children.length).toBe(1)
    expect(shadowRoot.children[0].textContent).toBe('shadow DOM')
  })
})
