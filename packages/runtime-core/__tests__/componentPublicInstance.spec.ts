import {
  h,
  render,
  getCurrentInstance,
  nodeOps,
  createApp,
  shallowReadonly
} from '@vue/runtime-test'
import { ComponentInternalInstance } from '../src/component'

describe('component: proxy', () => {
  test('data', () => {
    let instance: ComponentInternalInstance
    let instanceProxy: any
    const Comp = {
      data() {
        return {
          foo: 1
        }
      },
      mounted() {
        instance = getCurrentInstance()!
        instanceProxy = this
      },
      render() {
        return null
      }
    }
    render(h(Comp), nodeOps.createElement('div'))
    expect(instanceProxy.foo).toBe(1)
    instanceProxy.foo = 2
    expect(instance!.data.foo).toBe(2)
  })

  test('setupState', () => {
    let instance: ComponentInternalInstance
    let instanceProxy: any
    const Comp = {
      setup() {
        return {
          foo: 1
        }
      },
      mounted() {
        instance = getCurrentInstance()!
        instanceProxy = this
      },
      render() {
        return null
      }
    }
    render(h(Comp), nodeOps.createElement('div'))
    expect(instanceProxy.foo).toBe(1)
    instanceProxy.foo = 2
    expect(instance!.setupState.foo).toBe(2)
  })

  test('should not expose non-declared props', () => {
    let instanceProxy: any
    const Comp = {
      setup() {
        return () => null
      },
      mounted() {
        instanceProxy = this
      }
    }
    render(h(Comp, { count: 1 }), nodeOps.createElement('div'))
    expect('count' in instanceProxy).toBe(false)
  })

  test('public properties', async () => {
    let instance: ComponentInternalInstance
    let instanceProxy: any
    const Comp = {
      setup() {
        return () => null
      },
      mounted() {
        instance = getCurrentInstance()!
        instanceProxy = this
      }
    }
    render(h(Comp), nodeOps.createElement('div'))
    expect(instanceProxy.$data).toBe(instance!.data)
    expect(instanceProxy.$props).toBe(shallowReadonly(instance!.props))
    expect(instanceProxy.$attrs).toBe(shallowReadonly(instance!.attrs))
    expect(instanceProxy.$slots).toBe(shallowReadonly(instance!.slots))
    expect(instanceProxy.$refs).toBe(shallowReadonly(instance!.refs))
    expect(instanceProxy.$parent).toBe(
      instance!.parent && instance!.parent.proxy
    )
    expect(instanceProxy.$root).toBe(instance!.root.proxy)
    expect(instanceProxy.$emit).toBe(instance!.emit)
    expect(instanceProxy.$el).toBe(instance!.vnode.el)
    expect(instanceProxy.$options).toBe(instance!.type)
    expect(() => (instanceProxy.$data = {})).toThrow(TypeError)
    expect(`Attempting to mutate public property "$data"`).toHaveBeenWarned()

    const nextTickThis = await instanceProxy.$nextTick(function(this: any) {
      return this
    })
    expect(nextTickThis).toBe(instanceProxy)
  })

  test('user attached properties', async () => {
    let instance: ComponentInternalInstance
    let instanceProxy: any
    const Comp = {
      setup() {
        return () => null
      },
      mounted() {
        instance = getCurrentInstance()!
        instanceProxy = this
      }
    }
    render(h(Comp), nodeOps.createElement('div'))
    instanceProxy.foo = 1
    expect(instanceProxy.foo).toBe(1)
    expect(instance!.ctx.foo).toBe(1)

    // should also allow properties that start with $
    const obj = (instanceProxy.$store = {})
    expect(instanceProxy.$store).toBe(obj)
    expect(instance!.ctx.$store).toBe(obj)
  })

  test('globalProperties', () => {
    let instance: ComponentInternalInstance
    let instanceProxy: any
    const Comp = {
      setup() {
        return () => null
      },
      mounted() {
        instance = getCurrentInstance()!
        instanceProxy = this
      }
    }

    const app = createApp(Comp)
    app.config.globalProperties.foo = 1
    app.mount(nodeOps.createElement('div'))

    expect(instanceProxy.foo).toBe(1)

    // set should overwrite globalProperties with local
    instanceProxy.foo = 2
    // expect(instanceProxy.foo).toBe(2)
    expect(instance!.ctx.foo).toBe(2)
    // should not affect global
    expect(app.config.globalProperties.foo).toBe(1)
  })

  test('has check', () => {
    let instanceProxy: any
    const Comp = {
      render() {},
      props: {
        msg: String
      },
      data() {
        return {
          foo: 0
        }
      },
      setup() {
        return {
          bar: 1
        }
      },
      mounted() {
        instanceProxy = this
      }
    }

    const app = createApp(Comp, { msg: 'hello' })
    app.config.globalProperties.global = 1

    app.mount(nodeOps.createElement('div'))

    // props
    expect('msg' in instanceProxy).toBe(true)
    // data
    expect('foo' in instanceProxy).toBe(true)
    // ctx
    expect('bar' in instanceProxy).toBe(true)
    // public properties
    expect('$el' in instanceProxy).toBe(true)
    // global properties
    expect('global' in instanceProxy).toBe(true)

    // non-existent
    expect('$foobar' in instanceProxy).toBe(false)
    expect('baz' in instanceProxy).toBe(false)

    // set non-existent (goes into proxyTarget sink)
    instanceProxy.baz = 1
    expect('baz' in instanceProxy).toBe(true)

    // dev mode ownKeys check for console inspection
    // should only expose own keys
    expect(Object.keys(instanceProxy)).toMatchObject([
      'msg',
      'bar',
      'foo',
      'baz'
    ])
  })

  // #864
  test('should not warn declared but absent props', () => {
    const Comp = {
      props: ['test'],
      render(this: any) {
        return this.test
      }
    }
    render(h(Comp), nodeOps.createElement('div'))
    expect(
      `was accessed during render but is not defined`
    ).not.toHaveBeenWarned()
  })

  test('should allow symbol to access on render', () => {
    const Comp = {
      render() {
        if ((this as any)[Symbol.unscopables]) {
          return '1'
        }
        return '2'
      }
    }

    const app = createApp(Comp)
    app.mount(nodeOps.createElement('div'))

    expect(
      `Property ${JSON.stringify(
        Symbol.unscopables
      )} was accessed during render ` + `but is not defined on instance.`
    ).toHaveBeenWarned()
  })
})
