// Note: emits and listener fallthrough is tested in
// ./rendererAttrsFallthrough.spec.ts.

import { render, defineComponent, h, nodeOps } from '@vue/runtime-test'
import { isEmitListener } from '../src/componentEmits'

describe('component: emit', () => {
  test('trigger handlers', () => {
    const Foo = defineComponent({
      render() {},
      created() {
        // the `emit` function is bound on component instances
        this.$emit('foo')
        this.$emit('bar')
        this.$emit('!baz')
      }
    })

    const onfoo = jest.fn()
    const onBar = jest.fn()
    const onBaz = jest.fn()
    const Comp = () => h(Foo, { onfoo, onBar, ['on!baz']: onBaz })
    render(h(Comp), nodeOps.createElement('div'))

    expect(onfoo).not.toHaveBeenCalled()
    // only capitalized or special chars are considered event listeners
    expect(onBar).toHaveBeenCalled()
    expect(onBaz).toHaveBeenCalled()
  })

  test('trigger camelize event', () => {
    const Foo = defineComponent({
      render() {},
      created() {
        this.$emit('test-event')
      }
    })

    const fooSpy = jest.fn()
    const Comp = () =>
      h(Foo, {
        onTestEvent: fooSpy
      })
    render(h(Comp), nodeOps.createElement('div'))

    expect(fooSpy).toHaveBeenCalled()
  })

  // for v-model:foo-bar usage in DOM templates
  test('trigger hyphenated events for update:xxx events', () => {
    const Foo = defineComponent({
      render() {},
      created() {
        this.$emit('update:fooProp')
        this.$emit('update:barProp')
      }
    })

    const fooSpy = jest.fn()
    const barSpy = jest.fn()
    const Comp = () =>
      h(Foo, {
        'onUpdate:fooProp': fooSpy,
        'onUpdate:bar-prop': barSpy
      })
    render(h(Comp), nodeOps.createElement('div'))

    expect(fooSpy).toHaveBeenCalled()
    expect(barSpy).toHaveBeenCalled()
  })

  test('should trigger array of listeners', async () => {
    const Child = defineComponent({
      setup(_, { emit }) {
        emit('foo', 1)
        return () => h('div')
      }
    })

    const fn1 = jest.fn()
    const fn2 = jest.fn()

    const App = {
      setup() {
        return () =>
          h(Child, {
            onFoo: [fn1, fn2]
          })
      }
    }

    render(h(App), nodeOps.createElement('div'))
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn1).toHaveBeenCalledWith(1)
    expect(fn2).toHaveBeenCalledTimes(1)
    expect(fn1).toHaveBeenCalledWith(1)
  })

  test('warning for undeclared event (array)', () => {
    const Foo = defineComponent({
      emits: ['foo'],
      render() {},
      created() {
        // @ts-ignore
        this.$emit('bar')
      }
    })
    render(h(Foo), nodeOps.createElement('div'))
    expect(
      `Component emitted event "bar" but it is neither declared`
    ).toHaveBeenWarned()
  })

  test('warning for undeclared event (object)', () => {
    const Foo = defineComponent({
      emits: {
        foo: null
      },
      render() {},
      created() {
        // @ts-ignore
        this.$emit('bar')
      }
    })
    render(h(Foo), nodeOps.createElement('div'))
    expect(
      `Component emitted event "bar" but it is neither declared`
    ).toHaveBeenWarned()
  })

  test('should not warn if has equivalent onXXX prop', () => {
    const Foo = defineComponent({
      props: ['onFoo'],
      emits: [],
      render() {},
      created() {
        // @ts-ignore
        this.$emit('foo')
      }
    })
    render(h(Foo), nodeOps.createElement('div'))
    expect(
      `Component emitted event "foo" but it is neither declared`
    ).not.toHaveBeenWarned()
  })

  test('validator warning', () => {
    const Foo = defineComponent({
      emits: {
        foo: (arg: number) => arg > 0
      },
      render() {},
      created() {
        this.$emit('foo', -1)
      }
    })
    render(h(Foo), nodeOps.createElement('div'))
    expect(`event validation failed for event "foo"`).toHaveBeenWarned()
  })

  test('merging from mixins', () => {
    const mixin = {
      emits: {
        foo: (arg: number) => arg > 0
      }
    }
    const Foo = defineComponent({
      mixins: [mixin],
      render() {},
      created() {
        this.$emit('foo', -1)
      }
    })
    render(h(Foo), nodeOps.createElement('div'))
    expect(`event validation failed for event "foo"`).toHaveBeenWarned()
  })

  // #2651
  test('should not attach normalized object when mixins do not contain emits', () => {
    const Foo = defineComponent({
      mixins: [{}],
      render() {},
      created() {
        this.$emit('foo')
      }
    })
    render(h(Foo), nodeOps.createElement('div'))
    expect(
      `Component emitted event "foo" but it is neither declared`
    ).not.toHaveBeenWarned()
  })

  test('.once', () => {
    const Foo = defineComponent({
      render() {},
      emits: {
        foo: null
      },
      created() {
        this.$emit('foo')
        this.$emit('foo')
      }
    })
    const fn = jest.fn()
    render(
      h(Foo, {
        onFooOnce: fn
      }),
      nodeOps.createElement('div')
    )
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('.once with normal listener of the same name', () => {
    const Foo = defineComponent({
      render() {},
      emits: {
        foo: null
      },
      created() {
        this.$emit('foo')
        this.$emit('foo')
      }
    })
    const onFoo = jest.fn()
    const onFooOnce = jest.fn()
    render(
      h(Foo, {
        onFoo,
        onFooOnce
      }),
      nodeOps.createElement('div')
    )
    expect(onFoo).toHaveBeenCalledTimes(2)
    expect(onFooOnce).toHaveBeenCalledTimes(1)
  })

  test('.number modifier should work with v-model on component', () => {
    const Foo = defineComponent({
      render() {},
      created() {
        this.$emit('update:modelValue', '1')
        this.$emit('update:foo', '2')
      }
    })

    const fn1 = jest.fn()
    const fn2 = jest.fn()

    const Comp = () =>
      h(Foo, {
        modelValue: null,
        modelModifiers: { number: true },
        'onUpdate:modelValue': fn1,

        foo: null,
        fooModifiers: { number: true },
        'onUpdate:foo': fn2
      })

    render(h(Comp), nodeOps.createElement('div'))

    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn1).toHaveBeenCalledWith(1)
    expect(fn2).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledWith(2)
  })

  test('.trim modifier should work with v-model on component', () => {
    const Foo = defineComponent({
      render() {},
      created() {
        this.$emit('update:modelValue', ' one ')
        this.$emit('update:foo', '  two  ')
      }
    })

    const fn1 = jest.fn()
    const fn2 = jest.fn()

    const Comp = () =>
      h(Foo, {
        modelValue: null,
        modelModifiers: { trim: true },
        'onUpdate:modelValue': fn1,

        foo: null,
        fooModifiers: { trim: true },
        'onUpdate:foo': fn2
      })

    render(h(Comp), nodeOps.createElement('div'))

    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn1).toHaveBeenCalledWith('one')
    expect(fn2).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledWith('two')
  })

  test('isEmitListener', () => {
    const options = {
      click: null,
      'test-event': null,
      fooBar: null,
      FooBaz: null
    }
    expect(isEmitListener(options, 'onClick')).toBe(true)
    expect(isEmitListener(options, 'onclick')).toBe(false)
    expect(isEmitListener(options, 'onBlick')).toBe(false)
    // .once listeners
    expect(isEmitListener(options, 'onClickOnce')).toBe(true)
    expect(isEmitListener(options, 'onclickOnce')).toBe(false)
    // kebab-case option
    expect(isEmitListener(options, 'onTestEvent')).toBe(true)
    // camelCase option
    expect(isEmitListener(options, 'onFooBar')).toBe(true)
    // PascalCase option
    expect(isEmitListener(options, 'onFooBaz')).toBe(true)
  })
})
