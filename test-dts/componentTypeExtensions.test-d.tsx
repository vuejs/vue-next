import {
  defineComponent,
  DefineComponent,
  Directive,
  expectError,
  expectType
} from './index'

declare module '@vue/runtime-core' {
  interface ComponentCustomOptions {
    test?(n: number): void
  }

  interface GlobalDirectives {
    test: Directive
  }

  interface GlobalComponents {
    RouterView: DefineComponent<{}>
  }

  interface ComponentCustomProperties {
    state: 'stopped' | 'running'
  }

  interface ComponentCustomProps {
    custom?: number
  }
}

export const Custom = defineComponent({
  props: {
    bar: String,
    baz: {
      type: Number,
      required: true
    }
  },

  data: () => ({ counter: 0 }),

  test(n) {
    expectType<number>(n)
  },

  methods: {
    aMethod() {
      // @ts-expect-error
      expectError(this.notExisting)
      this.counter++
      this.state = 'running'
      // @ts-expect-error
      expectError((this.state = 'not valid'))
    }
  }
})

expectType<Directive>(Custom.directives!.test)
expectType<DefineComponent<{}>>(Custom.components!.RouterView)
expectType<JSX.Element>(<Custom baz={1} />)
expectType<JSX.Element>(<Custom custom={1} baz={1} />)
expectType<JSX.Element>(<Custom bar="bar" baz={1} />)

// @ts-expect-error
expectType<JSX.Element>(<Custom />)
// @ts-expect-error
expectError(<Custom bar="bar" />)
// @ts-expect-error
expectError(<Custom baz="baz" />)
// @ts-expect-error
expectError(<Custom baz={1} notExist={1} />)
// @ts-expect-error
expectError(<Custom baz={1} custom="custom" />)
