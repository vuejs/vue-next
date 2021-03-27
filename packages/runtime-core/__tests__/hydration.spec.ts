import {
  createSSRApp,
  h,
  ref,
  nextTick,
  VNode,
  Teleport,
  createStaticVNode,
  Suspense,
  onMounted,
  defineAsyncComponent,
  defineComponent,
  createTextVNode
} from '@vue/runtime-dom'
import { renderToString, SSRContext } from '@vue/server-renderer'

function mountWithHydration(html: string, render: () => any) {
  const container = document.createElement('div')
  container.innerHTML = html
  const app = createSSRApp({
    render
  })
  return {
    vnode: app.mount(container).$.subTree as VNode<Node, Element> & {
      el: Element
    },
    container
  }
}

const triggerEvent = (type: string, el: Element) => {
  const event = new Event(type)
  el.dispatchEvent(event)
}

describe('SSR hydration', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  test('text', async () => {
    const msg = ref('foo')
    const { vnode, container } = mountWithHydration('foo', () => msg.value)
    expect(vnode.el).toBe(container.firstChild)
    expect(container.textContent).toBe('foo')
    msg.value = 'bar'
    await nextTick()
    expect(container.textContent).toBe('bar')
  })

  test('empty text', async () => {
    const { container } = mountWithHydration('<div></div>', () =>
      h('div', createTextVNode(''))
    )
    expect(container.textContent).toBe('')
    expect(`Hydration children mismatch in <div>`).not.toHaveBeenWarned()
  })

  test('comment', () => {
    const { vnode, container } = mountWithHydration('<!---->', () => null)
    expect(vnode.el).toBe(container.firstChild)
    expect(vnode.el.nodeType).toBe(8) // comment
  })

  test('static', () => {
    const html = '<div><span>hello</span></div>'
    const { vnode, container } = mountWithHydration(html, () =>
      createStaticVNode('', 1)
    )
    expect(vnode.el).toBe(container.firstChild)
    expect(vnode.el.outerHTML).toBe(html)
    expect(vnode.anchor).toBe(container.firstChild)
    expect(vnode.children).toBe(html)
  })

  test('static (multiple elements)', () => {
    const staticContent = '<div></div><span>hello</span>'
    const html = `<div><div>hi</div>` + staticContent + `<div>ho</div></div>`

    const n1 = h('div', 'hi')
    const s = createStaticVNode('', 2)
    const n2 = h('div', 'ho')

    const { container } = mountWithHydration(html, () => h('div', [n1, s, n2]))

    const div = container.firstChild!

    expect(n1.el).toBe(div.firstChild)
    expect(n2.el).toBe(div.lastChild)
    expect(s.el).toBe(div.childNodes[1])
    expect(s.anchor).toBe(div.childNodes[2])
    expect(s.children).toBe(staticContent)
  })

  test('element with text children', async () => {
    const msg = ref('foo')
    const { vnode, container } = mountWithHydration(
      '<div class="foo">foo</div>',
      () => h('div', { class: msg.value }, msg.value)
    )
    expect(vnode.el).toBe(container.firstChild)
    expect(container.firstChild!.textContent).toBe('foo')
    msg.value = 'bar'
    await nextTick()
    expect(container.innerHTML).toBe(`<div class="bar">bar</div>`)
  })

  test('element with elements children', async () => {
    const msg = ref('foo')
    const fn = jest.fn()
    const { vnode, container } = mountWithHydration(
      '<div><span>foo</span><span class="foo"></span></div>',
      () =>
        h('div', [
          h('span', msg.value),
          h('span', { class: msg.value, onClick: fn })
        ])
    )
    expect(vnode.el).toBe(container.firstChild)
    expect((vnode.children as VNode[])[0].el).toBe(
      container.firstChild!.childNodes[0]
    )
    expect((vnode.children as VNode[])[1].el).toBe(
      container.firstChild!.childNodes[1]
    )

    // event handler
    triggerEvent('click', vnode.el.querySelector('.foo')!)
    expect(fn).toHaveBeenCalled()

    msg.value = 'bar'
    await nextTick()
    expect(vnode.el.innerHTML).toBe(`<span>bar</span><span class="bar"></span>`)
  })

  test('element with ref', () => {
    const el = ref()
    const { vnode, container } = mountWithHydration('<div></div>', () =>
      h('div', { ref: el })
    )
    expect(vnode.el).toBe(container.firstChild)
    expect(el.value).toBe(vnode.el)
  })

  test('Fragment', async () => {
    const msg = ref('foo')
    const fn = jest.fn()
    const { vnode, container } = mountWithHydration(
      '<div><!--[--><span>foo</span><!--[--><span class="foo"></span><!--]--><!--]--></div>',
      () =>
        h('div', [
          [h('span', msg.value), [h('span', { class: msg.value, onClick: fn })]]
        ])
    )
    expect(vnode.el).toBe(container.firstChild)

    expect(vnode.el.innerHTML).toBe(
      `<!--[--><span>foo</span><!--[--><span class="foo"></span><!--]--><!--]-->`
    )

    // start fragment 1
    const fragment1 = (vnode.children as VNode[])[0]
    expect(fragment1.el).toBe(vnode.el.childNodes[0])
    const fragment1Children = fragment1.children as VNode[]

    // first <span>
    expect(fragment1Children[0].el!.tagName).toBe('SPAN')
    expect(fragment1Children[0].el).toBe(vnode.el.childNodes[1])

    // start fragment 2
    const fragment2 = fragment1Children[1]
    expect(fragment2.el).toBe(vnode.el.childNodes[2])
    const fragment2Children = fragment2.children as VNode[]

    // second <span>
    expect(fragment2Children[0].el!.tagName).toBe('SPAN')
    expect(fragment2Children[0].el).toBe(vnode.el.childNodes[3])

    // end fragment 2
    expect(fragment2.anchor).toBe(vnode.el.childNodes[4])

    // end fragment 1
    expect(fragment1.anchor).toBe(vnode.el.childNodes[5])

    // event handler
    triggerEvent('click', vnode.el.querySelector('.foo')!)
    expect(fn).toHaveBeenCalled()

    msg.value = 'bar'
    await nextTick()
    expect(vnode.el.innerHTML).toBe(
      `<!--[--><span>bar</span><!--[--><span class="bar"></span><!--]--><!--]-->`
    )
  })

  test('Teleport', async () => {
    const msg = ref('foo')
    const fn = jest.fn()
    const teleportContainer = document.createElement('div')
    teleportContainer.id = 'teleport'
    teleportContainer.innerHTML = `<span>foo</span><span class="foo"></span><!---->`
    document.body.appendChild(teleportContainer)

    const { vnode, container } = mountWithHydration(
      '<!--teleport start--><!--teleport end-->',
      () =>
        h(Teleport, { to: '#teleport' }, [
          h('span', msg.value),
          h('span', { class: msg.value, onClick: fn })
        ])
    )

    expect(vnode.el).toBe(container.firstChild)
    expect(vnode.anchor).toBe(container.lastChild)

    expect(vnode.target).toBe(teleportContainer)
    expect((vnode.children as VNode[])[0].el).toBe(
      teleportContainer.childNodes[0]
    )
    expect((vnode.children as VNode[])[1].el).toBe(
      teleportContainer.childNodes[1]
    )
    expect(vnode.targetAnchor).toBe(teleportContainer.childNodes[2])

    // event handler
    triggerEvent('click', teleportContainer.querySelector('.foo')!)
    expect(fn).toHaveBeenCalled()

    msg.value = 'bar'
    await nextTick()
    expect(teleportContainer.innerHTML).toBe(
      `<span>bar</span><span class="bar"></span><!---->`
    )
  })

  test('Teleport (multiple + integration)', async () => {
    const msg = ref('foo')
    const fn1 = jest.fn()
    const fn2 = jest.fn()

    const Comp = () => [
      h(Teleport, { to: '#teleport2' }, [
        h('span', msg.value),
        h('span', { class: msg.value, onClick: fn1 })
      ]),
      h(Teleport, { to: '#teleport2' }, [
        h('span', msg.value + '2'),
        h('span', { class: msg.value + '2', onClick: fn2 })
      ])
    ]

    const teleportContainer = document.createElement('div')
    teleportContainer.id = 'teleport2'
    const ctx: SSRContext = {}
    const mainHtml = await renderToString(h(Comp), ctx)
    expect(mainHtml).toMatchInlineSnapshot(
      `"<!--[--><!--teleport start--><!--teleport end--><!--teleport start--><!--teleport end--><!--]-->"`
    )

    const teleportHtml = ctx.teleports!['#teleport2']
    expect(teleportHtml).toMatchInlineSnapshot(
      `"<span>foo</span><span class=\\"foo\\"></span><!----><span>foo2</span><span class=\\"foo2\\"></span><!---->"`
    )

    teleportContainer.innerHTML = teleportHtml
    document.body.appendChild(teleportContainer)

    const { vnode, container } = mountWithHydration(mainHtml, Comp)
    expect(vnode.el).toBe(container.firstChild)
    const teleportVnode1 = (vnode.children as VNode[])[0]
    const teleportVnode2 = (vnode.children as VNode[])[1]
    expect(teleportVnode1.el).toBe(container.childNodes[1])
    expect(teleportVnode1.anchor).toBe(container.childNodes[2])
    expect(teleportVnode2.el).toBe(container.childNodes[3])
    expect(teleportVnode2.anchor).toBe(container.childNodes[4])

    expect(teleportVnode1.target).toBe(teleportContainer)
    expect((teleportVnode1 as any).children[0].el).toBe(
      teleportContainer.childNodes[0]
    )
    expect(teleportVnode1.targetAnchor).toBe(teleportContainer.childNodes[2])

    expect(teleportVnode2.target).toBe(teleportContainer)
    expect((teleportVnode2 as any).children[0].el).toBe(
      teleportContainer.childNodes[3]
    )
    expect(teleportVnode2.targetAnchor).toBe(teleportContainer.childNodes[5])

    // // event handler
    triggerEvent('click', teleportContainer.querySelector('.foo')!)
    expect(fn1).toHaveBeenCalled()

    triggerEvent('click', teleportContainer.querySelector('.foo2')!)
    expect(fn2).toHaveBeenCalled()

    msg.value = 'bar'
    await nextTick()
    expect(teleportContainer.innerHTML).toMatchInlineSnapshot(
      `"<span>bar</span><span class=\\"bar\\"></span><!----><span>bar2</span><span class=\\"bar2\\"></span><!---->"`
    )
  })

  test('Teleport (disabled)', async () => {
    const msg = ref('foo')
    const fn1 = jest.fn()
    const fn2 = jest.fn()

    const Comp = () => [
      h('div', 'foo'),
      h(Teleport, { to: '#teleport3', disabled: true }, [
        h('span', msg.value),
        h('span', { class: msg.value, onClick: fn1 })
      ]),
      h('div', { class: msg.value + '2', onClick: fn2 }, 'bar')
    ]

    const teleportContainer = document.createElement('div')
    teleportContainer.id = 'teleport3'
    const ctx: SSRContext = {}
    const mainHtml = await renderToString(h(Comp), ctx)
    expect(mainHtml).toMatchInlineSnapshot(
      `"<!--[--><div>foo</div><!--teleport start--><span>foo</span><span class=\\"foo\\"></span><!--teleport end--><div class=\\"foo2\\">bar</div><!--]-->"`
    )

    const teleportHtml = ctx.teleports!['#teleport3']
    expect(teleportHtml).toMatchInlineSnapshot(`"<!---->"`)

    teleportContainer.innerHTML = teleportHtml
    document.body.appendChild(teleportContainer)

    const { vnode, container } = mountWithHydration(mainHtml, Comp)
    expect(vnode.el).toBe(container.firstChild)
    const children = vnode.children as VNode[]

    expect(children[0].el).toBe(container.childNodes[1])

    const teleportVnode = children[1]
    expect(teleportVnode.el).toBe(container.childNodes[2])
    expect((teleportVnode.children as VNode[])[0].el).toBe(
      container.childNodes[3]
    )
    expect((teleportVnode.children as VNode[])[1].el).toBe(
      container.childNodes[4]
    )
    expect(teleportVnode.anchor).toBe(container.childNodes[5])
    expect(children[2].el).toBe(container.childNodes[6])

    expect(teleportVnode.target).toBe(teleportContainer)
    expect(teleportVnode.targetAnchor).toBe(teleportContainer.childNodes[0])

    // // event handler
    triggerEvent('click', container.querySelector('.foo')!)
    expect(fn1).toHaveBeenCalled()

    triggerEvent('click', container.querySelector('.foo2')!)
    expect(fn2).toHaveBeenCalled()

    msg.value = 'bar'
    await nextTick()
    expect(container.innerHTML).toMatchInlineSnapshot(
      `"<!--[--><div>foo</div><!--teleport start--><span>bar</span><span class=\\"bar\\"></span><!--teleport end--><div class=\\"bar2\\">bar</div><!--]-->"`
    )
  })

  // compile SSR + client render fn from the same template & hydrate
  test('full compiler integration', async () => {
    const mounted: string[] = []
    const log = jest.fn()
    const toggle = ref(true)

    const Child = {
      data() {
        return {
          count: 0,
          text: 'hello',
          style: {
            color: 'red'
          }
        }
      },
      mounted() {
        mounted.push('child')
      },
      template: `
      <div>
        <span class="count" :style="style">{{ count }}</span>
        <button class="inc" @click="count++">inc</button>
        <button class="change" @click="style.color = 'green'" >change color</button>
        <button class="emit" @click="$emit('foo')">emit</button>
        <span class="text">{{ text }}</span>
        <input v-model="text">
      </div>
      `
    }

    const App = {
      setup() {
        return { toggle }
      },
      mounted() {
        mounted.push('parent')
      },
      template: `
        <div>
          <span>hello</span>
          <template v-if="toggle">
            <Child @foo="log('child')"/>
            <template v-if="true">
              <button class="parent-click" @click="log('click')">click me</button>
            </template>
          </template>
          <span>hello</span>
        </div>`,
      components: {
        Child
      },
      methods: {
        log
      }
    }

    const container = document.createElement('div')
    // server render
    container.innerHTML = await renderToString(h(App))
    // hydrate
    createSSRApp(App).mount(container)

    // assert interactions
    // 1. parent button click
    triggerEvent('click', container.querySelector('.parent-click')!)
    expect(log).toHaveBeenCalledWith('click')

    // 2. child inc click + text interpolation
    const count = container.querySelector('.count') as HTMLElement
    expect(count.textContent).toBe(`0`)
    triggerEvent('click', container.querySelector('.inc')!)
    await nextTick()
    expect(count.textContent).toBe(`1`)

    // 3. child color click + style binding
    expect(count.style.color).toBe('red')
    triggerEvent('click', container.querySelector('.change')!)
    await nextTick()
    expect(count.style.color).toBe('green')

    // 4. child event emit
    triggerEvent('click', container.querySelector('.emit')!)
    expect(log).toHaveBeenCalledWith('child')

    // 5. child v-model
    const text = container.querySelector('.text')!
    const input = container.querySelector('input')!
    expect(text.textContent).toBe('hello')
    input.value = 'bye'
    triggerEvent('input', input)
    await nextTick()
    expect(text.textContent).toBe('bye')
  })

  test('Suspense', async () => {
    const AsyncChild = {
      async setup() {
        const count = ref(0)
        return () =>
          h(
            'span',
            {
              onClick: () => {
                count.value++
              }
            },
            count.value
          )
      }
    }
    const { vnode, container } = mountWithHydration('<span>0</span>', () =>
      h(Suspense, () => h(AsyncChild))
    )
    expect(vnode.el).toBe(container.firstChild)
    // wait for hydration to finish
    await new Promise(r => setTimeout(r))
    triggerEvent('click', container.querySelector('span')!)
    await nextTick()
    expect(container.innerHTML).toBe(`<span>1</span>`)
  })

  test('Suspense (full integration)', async () => {
    const mountedCalls: number[] = []
    const asyncDeps: Promise<any>[] = []

    const AsyncChild = defineComponent({
      props: ['n'],
      async setup(props) {
        const count = ref(props.n)
        onMounted(() => {
          mountedCalls.push(props.n)
        })
        const p = new Promise(r => setTimeout(r, props.n * 10))
        asyncDeps.push(p)
        await p
        return () =>
          h(
            'span',
            {
              onClick: () => {
                count.value++
              }
            },
            count.value
          )
      }
    })

    const done = jest.fn()
    const App = {
      template: `
      <Suspense @resolve="done">
        <div>
          <AsyncChild :n="1" />
          <AsyncChild :n="2" />
        </div>
      </Suspense>`,
      components: {
        AsyncChild
      },
      methods: {
        done
      }
    }

    const container = document.createElement('div')
    // server render
    container.innerHTML = await renderToString(h(App))
    expect(container.innerHTML).toMatchInlineSnapshot(
      `"<div><span>1</span><span>2</span></div>"`
    )
    // reset asyncDeps from ssr
    asyncDeps.length = 0
    // hydrate
    createSSRApp(App).mount(container)

    expect(mountedCalls.length).toBe(0)
    expect(asyncDeps.length).toBe(2)

    // wait for hydration to complete
    await Promise.all(asyncDeps)
    await new Promise(r => setTimeout(r))

    // should flush buffered effects
    expect(mountedCalls).toMatchObject([1, 2])
    expect(container.innerHTML).toMatch(
      `<div><span>1</span><span>2</span></div>`
    )

    const span1 = container.querySelector('span')!
    triggerEvent('click', span1)
    await nextTick()
    expect(container.innerHTML).toMatch(
      `<div><span>2</span><span>2</span></div>`
    )

    const span2 = span1.nextSibling as Element
    triggerEvent('click', span2)
    await nextTick()
    expect(container.innerHTML).toMatch(
      `<div><span>2</span><span>3</span></div>`
    )
  })

  test('async component', async () => {
    const spy = jest.fn()
    const Comp = () =>
      h(
        'button',
        {
          onClick: spy
        },
        'hello!'
      )

    let serverResolve: any
    let AsyncComp = defineAsyncComponent(
      () =>
        new Promise(r => {
          serverResolve = r
        })
    )

    const App = {
      render() {
        return ['hello', h(AsyncComp), 'world']
      }
    }

    // server render
    const htmlPromise = renderToString(h(App))
    serverResolve(Comp)
    const html = await htmlPromise
    expect(html).toMatchInlineSnapshot(
      `"<!--[-->hello<button>hello!</button>world<!--]-->"`
    )

    // hydration
    let clientResolve: any
    AsyncComp = defineAsyncComponent(
      () =>
        new Promise(r => {
          clientResolve = r
        })
    )

    const container = document.createElement('div')
    container.innerHTML = html
    createSSRApp(App).mount(container)

    // hydration not complete yet
    triggerEvent('click', container.querySelector('button')!)
    expect(spy).not.toHaveBeenCalled()

    // resolve
    clientResolve(Comp)
    await new Promise(r => setTimeout(r))

    // should be hydrated now
    triggerEvent('click', container.querySelector('button')!)
    expect(spy).toHaveBeenCalled()
  })

  test('elements with camel-case in svg ', () => {
    const { vnode, container } = mountWithHydration(
      '<animateTransform></animateTransform>',
      () => h('animateTransform')
    )
    expect(vnode.el).toBe(container.firstChild)
    expect(`Hydration node mismatch`).not.toHaveBeenWarned()
  })

  test('SVG as a mount container', () => {
    const svgContainer = document.createElement('svg')
    svgContainer.innerHTML = '<g></g>'
    const app = createSSRApp({
      render: () => h('g')
    })

    expect(
      (app.mount(svgContainer).$.subTree as VNode<Node, Element> & {
        el: Element
      }).el instanceof SVGElement
    )
  })

  describe('mismatch handling', () => {
    test('text node', () => {
      const { container } = mountWithHydration(`foo`, () => 'bar')
      expect(container.textContent).toBe('bar')
      expect(`Hydration text mismatch`).toHaveBeenWarned()
    })

    test('element text content', () => {
      const { container } = mountWithHydration(`<div>foo</div>`, () =>
        h('div', 'bar')
      )
      expect(container.innerHTML).toBe('<div>bar</div>')
      expect(`Hydration text content mismatch in <div>`).toHaveBeenWarned()
    })

    test('not enough children', () => {
      const { container } = mountWithHydration(`<div></div>`, () =>
        h('div', [h('span', 'foo'), h('span', 'bar')])
      )
      expect(container.innerHTML).toBe(
        '<div><span>foo</span><span>bar</span></div>'
      )
      expect(`Hydration children mismatch in <div>`).toHaveBeenWarned()
    })

    test('too many children', () => {
      const { container } = mountWithHydration(
        `<div><span>foo</span><span>bar</span></div>`,
        () => h('div', [h('span', 'foo')])
      )
      expect(container.innerHTML).toBe('<div><span>foo</span></div>')
      expect(`Hydration children mismatch in <div>`).toHaveBeenWarned()
    })

    test('complete mismatch', () => {
      const { container } = mountWithHydration(
        `<div><span>foo</span><span>bar</span></div>`,
        () => h('div', [h('div', 'foo'), h('p', 'bar')])
      )
      expect(container.innerHTML).toBe('<div><div>foo</div><p>bar</p></div>')
      expect(`Hydration node mismatch`).toHaveBeenWarnedTimes(2)
    })

    test('fragment mismatch removal', () => {
      const { container } = mountWithHydration(
        `<div><!--[--><div>foo</div><div>bar</div><!--]--></div>`,
        () => h('div', [h('span', 'replaced')])
      )
      expect(container.innerHTML).toBe('<div><span>replaced</span></div>')
      expect(`Hydration node mismatch`).toHaveBeenWarned()
    })

    test('fragment not enough children', () => {
      const { container } = mountWithHydration(
        `<div><!--[--><div>foo</div><!--]--><div>baz</div></div>`,
        () => h('div', [[h('div', 'foo'), h('div', 'bar')], h('div', 'baz')])
      )
      expect(container.innerHTML).toBe(
        '<div><!--[--><div>foo</div><div>bar</div><!--]--><div>baz</div></div>'
      )
      expect(`Hydration node mismatch`).toHaveBeenWarned()
    })

    test('fragment too many children', () => {
      const { container } = mountWithHydration(
        `<div><!--[--><div>foo</div><div>bar</div><!--]--><div>baz</div></div>`,
        () => h('div', [[h('div', 'foo')], h('div', 'baz')])
      )
      expect(container.innerHTML).toBe(
        '<div><!--[--><div>foo</div><!--]--><div>baz</div></div>'
      )
      // fragment ends early and attempts to hydrate the extra <div>bar</div>
      // as 2nd fragment child.
      expect(`Hydration text content mismatch`).toHaveBeenWarned()
      // excessive children removal
      expect(`Hydration children mismatch`).toHaveBeenWarned()
    })

    test('Teleport target has empty children', () => {
      const teleportContainer = document.createElement('div')
      teleportContainer.id = 'teleport'
      document.body.appendChild(teleportContainer)

      mountWithHydration('<!--teleport start--><!--teleport end-->', () =>
        h(Teleport, { to: '#teleport' }, [h('span', 'value')])
      )
      expect(teleportContainer.innerHTML).toBe(`<span>value</span>`)
      expect(`Hydration children mismatch`).toHaveBeenWarned()
    })
  })
})
