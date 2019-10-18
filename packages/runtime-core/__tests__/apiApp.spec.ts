import {
  createApp,
  h,
  nodeOps,
  serializeInner,
  mockWarn,
  provide,
  inject,
  resolveComponent,
  resolveDirective,
  applyDirectives,
  Plugin,
  ref,
  getCurrentInstance,
  resolveFilter
} from '@vue/runtime-test'

describe('api: createApp', () => {
  mockWarn()

  test('mount', () => {
    const Comp = {
      props: {
        count: {
          default: 0
        }
      },
      setup(props: { count: number }) {
        return () => props.count
      }
    }

    const root1 = nodeOps.createElement('div')
    createApp().mount(Comp, root1)
    expect(serializeInner(root1)).toBe(`0`)

    // mount with props
    const root2 = nodeOps.createElement('div')
    const app2 = createApp()
    app2.mount(Comp, root2, { count: 1 })
    expect(serializeInner(root2)).toBe(`1`)

    // remount warning
    const root3 = nodeOps.createElement('div')
    app2.mount(Comp, root3)
    expect(serializeInner(root3)).toBe(``)
    expect(`already been mounted`).toHaveBeenWarned()
  })

  test('provide', () => {
    const app = createApp()
    app.provide('foo', 1)
    app.provide('bar', 2)

    const Root = {
      setup() {
        // test override
        provide('foo', 3)
        return () => h(Child)
      }
    }

    const Child = {
      setup() {
        const foo = inject('foo')
        const bar = inject('bar')
        return () => `${foo},${bar}`
      }
    }

    const root = nodeOps.createElement('div')
    app.mount(Root, root)
    expect(serializeInner(root)).toBe(`3,2`)
  })

  test('component', () => {
    const app = createApp()

    const FooBar = () => 'foobar!'
    app.component('FooBar', FooBar)
    expect(app.component('FooBar')).toBe(FooBar)

    app.component('BarBaz', () => 'barbaz!')

    const Root = {
      // local override
      components: {
        BarBaz: () => 'barbaz-local!'
      },
      setup() {
        // resolve in setup
        const FooBar = resolveComponent('foo-bar') as any
        return () => {
          // resolve in render
          const BarBaz = resolveComponent('bar-baz') as any
          return h('div', [h(FooBar), h(BarBaz)])
        }
      }
    }

    const root = nodeOps.createElement('div')
    app.mount(Root, root)
    expect(serializeInner(root)).toBe(`<div>foobar!barbaz-local!</div>`)
  })

  test('directive', () => {
    const app = createApp()

    const spy1 = jest.fn()
    const spy2 = jest.fn()
    const spy3 = jest.fn()

    const FooBar = { mounted: spy1 }
    app.directive('FooBar', FooBar)
    expect(app.directive('FooBar')).toBe(FooBar)

    app.directive('BarBaz', {
      mounted: spy2
    })

    const Root = {
      // local override
      directives: {
        BarBaz: { mounted: spy3 }
      },
      setup() {
        // resolve in setup
        const FooBar = resolveDirective('foo-bar')!
        return () => {
          // resolve in render
          const BarBaz = resolveDirective('bar-baz')!
          return applyDirectives(h('div'), [[FooBar], [BarBaz]])
        }
      }
    }

    const root = nodeOps.createElement('div')
    app.mount(Root, root)
    expect(spy1).toHaveBeenCalled()
    expect(spy2).not.toHaveBeenCalled()
    expect(spy3).toHaveBeenCalled()
  })

  test('filter', () => {
    const app = createApp()

    const toUpperCase = (s: string) => s.toUpperCase()
    app.filter('toUpperCase', toUpperCase)
    expect(app.filter('toUpperCase')).toBe(toUpperCase)

    const Root = {
      // local override
      filters: {
        toLowerCase: (s: string) => s.toLowerCase()
      },
      setup() {
        // resolve in setup
        const toUpperCase = resolveFilter('toUpperCase')!
        return () => {
          // resolve in render
          const toLowerCase = resolveFilter('toLowerCase')!
          return h('div', `${toUpperCase('a')}${toLowerCase('B')}`)
        }
      }
    }

    const root = nodeOps.createElement('div')
    app.mount(Root, root)
    expect(serializeInner(root)).toBe(`<div>Ab</div>`)
  })

  test('mixin', () => {
    const calls: string[] = []
    const mixinA = {
      data() {
        return {
          a: 1
        }
      },
      created(this: any) {
        calls.push('mixinA created')
        expect(this.a).toBe(1)
        expect(this.b).toBe(2)
        expect(this.c).toBe(3)
      },
      mounted() {
        calls.push('mixinA mounted')
      }
    }
    const mixinB = {
      data() {
        return {
          b: 2
        }
      },
      created(this: any) {
        calls.push('mixinB created')
        expect(this.a).toBe(1)
        expect(this.b).toBe(2)
        expect(this.c).toBe(3)
      },
      mounted() {
        calls.push('mixinB mounted')
      }
    }
    const Comp = {
      data() {
        return {
          c: 3
        }
      },
      created(this: any) {
        calls.push('comp created')
        expect(this.a).toBe(1)
        expect(this.b).toBe(2)
        expect(this.c).toBe(3)
      },
      mounted() {
        calls.push('comp mounted')
      },
      render(this: any) {
        return `${this.a}${this.b}${this.c}`
      }
    }

    const app = createApp()
    app.mixin(mixinA)
    app.mixin(mixinB)

    const root = nodeOps.createElement('div')
    app.mount(Comp, root)

    expect(serializeInner(root)).toBe(`123`)
    expect(calls).toEqual([
      'mixinA created',
      'mixinB created',
      'comp created',
      'mixinA mounted',
      'mixinB mounted',
      'comp mounted'
    ])
  })

  test('use', () => {
    const PluginA: Plugin = app => app.provide('foo', 1)
    const PluginB: Plugin = {
      install: app => app.provide('bar', 2)
    }

    const app = createApp()
    app.use(PluginA)
    app.use(PluginB)

    const Root = {
      setup() {
        const foo = inject('foo')
        const bar = inject('bar')
        return () => `${foo},${bar}`
      }
    }
    const root = nodeOps.createElement('div')
    app.mount(Root, root)
    expect(serializeInner(root)).toBe(`1,2`)
  })

  test('config.errorHandler', () => {
    const app = createApp()

    const error = new Error()
    const count = ref(0)

    const handler = (app.config.errorHandler = jest.fn(
      (err, instance, info) => {
        expect(err).toBe(error)
        expect((instance as any).count).toBe(count.value)
        expect(info).toBe(`render function`)
      }
    ))

    const Root = {
      setup() {
        const count = ref(0)
        return {
          count
        }
      },
      render() {
        throw error
      }
    }

    app.mount(Root, nodeOps.createElement('div'))
    expect(handler).toHaveBeenCalled()
  })

  test('config.warnHandler', () => {
    const app = createApp()
    let ctx: any

    const handler = (app.config.warnHandler = jest.fn(
      (msg, instance, trace) => {
        expect(msg).toMatch(`Component is missing template or render function`)
        expect(instance).toBe(ctx.renderProxy)
        expect(trace).toMatch(`Hello`)
      }
    ))

    const Root = {
      name: 'Hello',
      setup() {
        ctx = getCurrentInstance()
      }
    }

    app.mount(Root, nodeOps.createElement('div'))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  describe('config.isNativeTag', () => {
    const isNativeTag = jest.fn(tag => tag === 'div')

    test('Component.name', () => {
      const app = createApp()
      Object.defineProperty(app.config, 'isNativeTag', {
        value: isNativeTag,
        writable: false
      })

      const Root = {
        name: 'div',
        setup() {
          return {
            count: ref(0)
          }
        },
        render() {
          return null
        }
      }

      app.mount(Root, nodeOps.createElement('div'))
      expect(
        `Do not use built-in or reserved HTML elements as component id: div`
      ).toHaveBeenWarned()
    })

    test('Component.components', () => {
      const app = createApp()
      Object.defineProperty(app.config, 'isNativeTag', {
        value: isNativeTag,
        writable: false
      })

      const Root = {
        components: {
          div: () => 'div'
        },
        setup() {
          return {
            count: ref(0)
          }
        },
        render() {
          return null
        }
      }

      app.mount(Root, nodeOps.createElement('div'))
      expect(
        `Do not use built-in or reserved HTML elements as component id: div`
      ).toHaveBeenWarned()
    })

    test('register using app.component', () => {
      const app = createApp()
      Object.defineProperty(app.config, 'isNativeTag', {
        value: isNativeTag,
        writable: false
      })

      const Root = {
        setup() {
          return {
            count: ref(0)
          }
        },
        render() {
          return null
        }
      }

      app.component('div', () => 'div')
      app.mount(Root, nodeOps.createElement('div'))
      expect(
        `Do not use built-in or reserved HTML elements as component id: div`
      ).toHaveBeenWarned()
    })
  })
})
