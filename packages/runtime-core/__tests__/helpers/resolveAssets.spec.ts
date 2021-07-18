import {
  createApp,
  nodeOps,
  resolveComponent,
  resolveDirective,
  Component,
  Directive,
  resolveDynamicComponent,
  h,
  serializeInner,
  createVNode,
  Comment,
  VNode
} from '@vue/runtime-test'

describe('resolveAssets', () => {
  test('should work', () => {
    const FooBar = () => null
    const BarBaz = { mounted: () => null }

    let component1: Component | string
    let component2: Component | string
    let component3: Component | string
    let component4: Component | string
    let directive1: Directive
    let directive2: Directive
    let directive3: Directive
    let directive4: Directive

    const Root = {
      components: {
        FooBar: FooBar
      },
      directives: {
        BarBaz: BarBaz
      },
      setup() {
        return () => {
          component1 = resolveComponent('FooBar')!
          directive1 = resolveDirective('BarBaz')!
          // camelize
          component2 = resolveComponent('Foo-bar')!
          directive2 = resolveDirective('Bar-baz')!
          // capitalize
          component3 = resolveComponent('fooBar')!
          directive3 = resolveDirective('barBaz')!
          // camelize and capitalize
          component4 = resolveComponent('foo-bar')!
          directive4 = resolveDirective('bar-baz')!
        }
      }
    }

    const app = createApp(Root)
    const root = nodeOps.createElement('div')
    app.mount(root)
    expect(component1!).toBe(FooBar)
    expect(component2!).toBe(FooBar)
    expect(component3!).toBe(FooBar)
    expect(component4!).toBe(FooBar)

    expect(directive1!).toBe(BarBaz)
    expect(directive2!).toBe(BarBaz)
    expect(directive3!).toBe(BarBaz)
    expect(directive4!).toBe(BarBaz)
  })

  test('maybeSelfReference', async () => {
    let component1: Component | string
    let component2: Component | string
    let component3: Component | string

    const Foo = () => null

    const Root = {
      name: 'Root',
      components: {
        Foo,
        Root: Foo
      },
      setup() {
        return () => {
          component1 = resolveComponent('Root', true)
          component2 = resolveComponent('Foo', true)
          component3 = resolveComponent('Bar', true)
        }
      }
    }

    const app = createApp(Root)
    const root = nodeOps.createElement('div')
    app.mount(root)

    expect(component1!).toBe(Root) // explicit self name reference
    expect(component2!).toBe(Foo) // successful resolve take higher priority
    expect(component3!).toBe(Root) // fallback when resolve fails
  })

  describe('warning', () => {
    test('used outside render() or setup()', () => {
      resolveComponent('foo')
      expect(
        'resolveComponent can only be used in render() or setup().'
      ).toHaveBeenWarned()

      resolveDirective('foo')
      expect(
        'resolveDirective can only be used in render() or setup().'
      ).toHaveBeenWarned()
    })

    test('not exist', () => {
      const Root = {
        setup() {
          resolveComponent('foo')
          resolveDirective('bar')
          return () => null
        }
      }

      const app = createApp(Root)
      const root = nodeOps.createElement('div')
      app.mount(root)
      expect('Failed to resolve component: foo').toHaveBeenWarned()
      expect('Failed to resolve directive: bar').toHaveBeenWarned()
    })

    test('resolve dynamic component', () => {
      const dynamicComponents = {
        foo: () => 'foo',
        bar: () => 'bar',
        baz: { render: () => 'baz' }
      }
      let foo, bar, baz // dynamic components
      let dynamicVNode: VNode
      let dynamicVNode2: VNode

      const Child = {
        render(this: any) {
          return this.$slots.default()
        }
      }

      const Root = {
        components: { foo: dynamicComponents.foo },
        setup() {
          return () => {
            foo = resolveDynamicComponent('foo') // <component is="foo"/>
            bar = resolveDynamicComponent(dynamicComponents.bar) // <component :is="bar"/>, function
            dynamicVNode = createVNode(resolveDynamicComponent(null)) // <component :is="null"/>
            dynamicVNode2 = createVNode(resolveDynamicComponent('')) // <component :is="''"/>
            return h(Child, () => {
              // check inside child slots
              baz = resolveDynamicComponent(dynamicComponents.baz) // <component :is="baz"/>, object
            })
          }
        }
      }

      const app = createApp(Root)
      const root = nodeOps.createElement('div')
      app.mount(root)
      expect(foo).toBe(dynamicComponents.foo)
      expect(bar).toBe(dynamicComponents.bar)
      expect(baz).toBe(dynamicComponents.baz)
      // should allow explicit falsy type to remove the component
      expect(dynamicVNode!.type).toBe(Comment)
      expect(dynamicVNode2!.type).toBe(Comment)
    })

    test('resolve dynamic component should fallback to plain element without warning', () => {
      const Root = {
        setup() {
          return () => {
            return createVNode(resolveDynamicComponent('div') as string, null, {
              default: () => 'hello'
            })
          }
        }
      }

      const app = createApp(Root)
      const root = nodeOps.createElement('div')
      app.mount(root)
      expect(serializeInner(root)).toBe('<div>hello</div>')
    })
  })

  test('resolving from mixins & extends', () => {
    const FooBar = () => null
    const BarBaz = { mounted: () => null }

    let component1: Component | string
    let component2: Component | string
    let component3: Component | string
    let component4: Component | string
    let directive1: Directive
    let directive2: Directive
    let directive3: Directive
    let directive4: Directive

    const Base = {
      components: {
        FooBar: FooBar
      }
    }
    const Mixin = {
      directives: {
        BarBaz: BarBaz
      }
    }

    const Root = {
      extends: Base,
      mixins: [Mixin],
      setup() {
        return () => {
          component1 = resolveComponent('FooBar')!
          directive1 = resolveDirective('BarBaz')!
          // camelize
          component2 = resolveComponent('Foo-bar')!
          directive2 = resolveDirective('Bar-baz')!
          // capitalize
          component3 = resolveComponent('fooBar')!
          directive3 = resolveDirective('barBaz')!
          // camelize and capitalize
          component4 = resolveComponent('foo-bar')!
          directive4 = resolveDirective('bar-baz')!
        }
      }
    }

    const app = createApp(Root)
    const root = nodeOps.createElement('div')
    app.mount(root)
    expect(component1!).toBe(FooBar)
    expect(component2!).toBe(FooBar)
    expect(component3!).toBe(FooBar)
    expect(component4!).toBe(FooBar)

    expect(directive1!).toBe(BarBaz)
    expect(directive2!).toBe(BarBaz)
    expect(directive3!).toBe(BarBaz)
    expect(directive4!).toBe(BarBaz)
  })
})
