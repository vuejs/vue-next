import { BindingTypes } from '@vue/compiler-core'
import { compileSFCScript as compile, assertCode } from './utils'

describe('SFC compile <script setup>', () => {
  test('should expose top level declarations', () => {
    const { content } = compile(`
      <script setup>
      import { x } from './x'
      let a = 1
      const b = 2
      function c() {}
      class d {}
      </script>
      `)
    assertCode(content)
    expect(content).toMatch('return { a, b, c, d, x }')
  })

  test('defineProps()', () => {
    const { content, bindings } = compile(`
<script setup>
const props = defineProps({
  foo: String
})
const bar = 1
</script>
  `)
    // should generate working code
    assertCode(content)
    // should anayze bindings
    expect(bindings).toStrictEqual({
      foo: BindingTypes.PROPS,
      bar: BindingTypes.SETUP_CONST,
      props: BindingTypes.SETUP_CONST
    })

    // should remove defineOptions import and call
    expect(content).not.toMatch('defineProps')
    // should generate correct setup signature
    expect(content).toMatch(`setup(__props, { expose }) {`)
    // should assign user identifier to it
    expect(content).toMatch(`const props = __props`)
    // should include context options in default export
    expect(content).toMatch(`export default {
  props: {
  foo: String
},`)
  })

  test('defineProps w/ external definition', () => {
    const { content } = compile(`
    <script setup>
    import { propsModel } from './props'
    const props = defineProps(propsModel)
    </script>
      `)
    assertCode(content)
    expect(content).toMatch(`export default {
  props: propsModel,`)
  })

  test('defineEmit() (deprecated)', () => {
    const { content, bindings } = compile(`
<script setup>
const myEmit = defineEmit(['foo', 'bar'])
</script>
  `)
    assertCode(content)
    expect(bindings).toStrictEqual({
      myEmit: BindingTypes.SETUP_CONST
    })
    // should remove defineOptions import and call
    expect(content).not.toMatch(/defineEmits?/)
    // should generate correct setup signature
    expect(content).toMatch(`setup(__props, { expose, emit: myEmit }) {`)
    // should include context options in default export
    expect(content).toMatch(`export default {
  emits: ['foo', 'bar'],`)
  })

  test('defineEmits()', () => {
    const { content, bindings } = compile(`
<script setup>
const myEmit = defineEmits(['foo', 'bar'])
</script>
  `)
    assertCode(content)
    expect(bindings).toStrictEqual({
      myEmit: BindingTypes.SETUP_CONST
    })
    // should remove defineOptions import and call
    expect(content).not.toMatch('defineEmits')
    // should generate correct setup signature
    expect(content).toMatch(`setup(__props, { expose, emit: myEmit }) {`)
    // should include context options in default export
    expect(content).toMatch(`export default {
  emits: ['foo', 'bar'],`)
  })

  test('defineProps/defineEmits in multi-variable decalration', () => {
    const { content } = compile(`
    <script setup>
    const props = defineProps(['item']),
      a = 1,
      emit = defineEmits(['a']);
    </script>
  `)
    assertCode(content)
    expect(content).toMatch(`const a = 1;`) // test correct removal
    expect(content).toMatch(`props: ['item'],`)
    expect(content).toMatch(`emits: ['a'],`)
  })

  test('defineProps/defineEmits in multi-variable decalration (full removal)', () => {
    const { content } = compile(`
    <script setup>
    const props = defineProps(['item']),
          emit = defineEmits(['a']);
    </script>
  `)
    assertCode(content)
    expect(content).toMatch(`props: ['item'],`)
    expect(content).toMatch(`emits: ['a'],`)
  })

  test('defineExpose()', () => {
    const { content } = compile(`
<script setup>
defineExpose({ foo: 123 })
</script>
  `)
    assertCode(content)
    // should remove defineOptions import and call
    expect(content).not.toMatch('defineExpose')
    // should generate correct setup signature
    expect(content).toMatch(`setup(__props, { expose }) {`)
    // should replace callee
    expect(content).toMatch(/\bexpose\(\{ foo: 123 \}\)/)
  })

  describe('<script> and <script setup> co-usage', () => {
    test('script first', () => {
      const { content } = compile(`
      <script>
      export const n = 1
      </script>
      <script setup>
      import { x } from './x'
      x()
      </script>
      `)
      assertCode(content)
    })

    test('script setup first', () => {
      const { content } = compile(`
      <script setup>
      import { x } from './x'
      x()
      </script>
      <script>
      export const n = 1
      </script>
      `)
      assertCode(content)
    })
  })

  describe('imports', () => {
    test('should hoist and expose imports', () => {
      assertCode(
        compile(`<script setup>
          import { ref } from 'vue'
          import 'foo/css'
        </script>`).content
      )
    })

    test('should extract comment for import or type declarations', () => {
      assertCode(
        compile(`
        <script setup>
        import a from 'a' // comment
        import b from 'b'
        </script>
        `).content
      )
    })

    // #2740
    test('should allow defineProps/Emit at the start of imports', () => {
      assertCode(
        compile(`<script setup>
      import { ref } from 'vue'
      defineProps(['foo'])
      defineEmits(['bar'])
      const r = ref(0)
      </script>`).content
      )
    })

    test('dedupe between user & helper', () => {
      const { content } = compile(
        `
      <script setup>
      import { ref } from 'vue'
      ref: foo = 1
      </script>
      `,
        { refSugar: true }
      )
      assertCode(content)
      expect(content).toMatch(`import { ref } from 'vue'`)
    })

    test('import dedupe between <script> and <script setup>', () => {
      const { content } = compile(`
        <script>
        import { x } from './x'
        </script>
        <script setup>
        import { x } from './x'
        x()
        </script>
        `)
      assertCode(content)
      expect(content.indexOf(`import { x }`)).toEqual(
        content.lastIndexOf(`import { x }`)
      )
    })

    test('imports in <script> should not be exposed', () => {
      assertCode(
        compile(`
      <script>
      import { foo } from './foo'
      import { a } from './bar'
      </script>
      <script setup>
      import { b } from './bar'
      </script>
      `).content
      )
    })
  })

  describe('inlineTemplate mode', () => {
    test('should work', () => {
      const { content } = compile(
        `
        <script setup>
        import { ref } from 'vue'
        const count = ref(0)
        </script>
        <template>
          <div>{{ count }}</div>
          <div>static</div>
        </template>
        `,
        { inlineTemplate: true }
      )
      // check snapshot and make sure helper imports and
      // hoists are placed correctly.
      assertCode(content)
      // in inline mode, no need to call expose() since nothing is exposed
      // anyway!
      expect(content).not.toMatch(`expose()`)
    })

    test('with defineExpose()', () => {
      const { content } = compile(
        `
        <script setup>
        const count = ref(0)
        defineExpose({ count })
        </script>
        `,
        { inlineTemplate: true }
      )
      assertCode(content)
      expect(content).toMatch(`setup(__props, { expose })`)
      expect(content).toMatch(`expose({ count })`)
    })

    test('referencing scope components and directives', () => {
      const { content } = compile(
        `
        <script setup>
        import ChildComp from './Child.vue'
        import SomeOtherComp from './Other.vue'
        import vMyDir from './my-dir'
        </script>
        <template>
          <div v-my-dir></div>
          <ChildComp/>
          <some-other-comp/>
        </template>
        `,
        { inlineTemplate: true }
      )
      expect(content).toMatch('[_unref(vMyDir)]')
      expect(content).toMatch('_createVNode(ChildComp)')
      // kebab-case component support
      expect(content).toMatch('_createVNode(SomeOtherComp)')
      assertCode(content)
    })

    test('avoid unref() when necessary', () => {
      // function, const, component import
      const { content } = compile(
        `<script setup>
        import { ref } from 'vue'
        import Foo, { bar } from './Foo.vue'
        import other from './util'
        const count = ref(0)
        const constant = {}
        const maybe = foo()
        let lett = 1
        function fn() {}
        </script>
        <template>
          <Foo>{{ bar }}</Foo>
          <div @click="fn">{{ count }} {{ constant }} {{ maybe }} {{ lett }} {{ other }}</div>
        </template>
        `,
        { inlineTemplate: true }
      )
      // no need to unref vue component import
      expect(content).toMatch(`createVNode(Foo,`)
      // #2699 should unref named imports from .vue
      expect(content).toMatch(`unref(bar)`)
      // should unref other imports
      expect(content).toMatch(`unref(other)`)
      // no need to unref constant literals
      expect(content).not.toMatch(`unref(constant)`)
      // should directly use .value for known refs
      expect(content).toMatch(`count.value`)
      // should unref() on const bindings that may be refs
      expect(content).toMatch(`unref(maybe)`)
      // should unref() on let bindings
      expect(content).toMatch(`unref(lett)`)
      // no need to unref function declarations
      expect(content).toMatch(`{ onClick: fn }`)
      // no need to mark constant fns in patch flag
      expect(content).not.toMatch(`PROPS`)
      assertCode(content)
    })

    test('v-model codegen', () => {
      const { content } = compile(
        `<script setup>
        import { ref } from 'vue'
        const count = ref(0)
        const maybe = foo()
        let lett = 1
        </script>
        <template>
          <input v-model="count">
          <input v-model="maybe">
          <input v-model="lett">
        </template>
        `,
        { inlineTemplate: true }
      )
      // known const ref: set value
      expect(content).toMatch(`count.value = $event`)
      // const but maybe ref: also assign .value directly since non-ref
      // won't work
      expect(content).toMatch(`maybe.value = $event`)
      // let: handle both cases
      expect(content).toMatch(
        `_isRef(lett) ? lett.value = $event : lett = $event`
      )
      assertCode(content)
    })

    test('template assignment expression codegen', () => {
      const { content } = compile(
        `<script setup>
        import { ref } from 'vue'
        const count = ref(0)
        const maybe = foo()
        let lett = 1
        let v = ref(1)
        </script>
        <template>
          <div @click="count = 1"/>
          <div @click="maybe = count"/>
          <div @click="lett = count"/>
          <div @click="v += 1"/>
          <div @click="v -= 1"/>
        </template>
        `,
        { inlineTemplate: true }
      )
      // known const ref: set value
      expect(content).toMatch(`count.value = 1`)
      // const but maybe ref: only assign after check
      expect(content).toMatch(`maybe.value = count.value`)
      // let: handle both cases
      expect(content).toMatch(
        `_isRef(lett) ? lett.value = count.value : lett = count.value`
      )
      expect(content).toMatch(`_isRef(v) ? v.value += 1 : v += 1`)
      expect(content).toMatch(`_isRef(v) ? v.value -= 1 : v -= 1`)
      assertCode(content)
    })

    test('template update expression codegen', () => {
      const { content } = compile(
        `<script setup>
        import { ref } from 'vue'
        const count = ref(0)
        const maybe = foo()
        let lett = 1
        </script>
        <template>
          <div @click="count++"/>
          <div @click="--count"/>
          <div @click="maybe++"/>
          <div @click="--maybe"/>
          <div @click="lett++"/>
          <div @click="--lett"/>
        </template>
        `,
        { inlineTemplate: true }
      )
      // known const ref: set value
      expect(content).toMatch(`count.value++`)
      expect(content).toMatch(`--count.value`)
      // const but maybe ref (non-ref case ignored)
      expect(content).toMatch(`maybe.value++`)
      expect(content).toMatch(`--maybe.value`)
      // let: handle both cases
      expect(content).toMatch(`_isRef(lett) ? lett.value++ : lett++`)
      expect(content).toMatch(`_isRef(lett) ? --lett.value : --lett`)
      assertCode(content)
    })

    test('template destructure assignment codegen', () => {
      const { content } = compile(
        `<script setup>
        import { ref } from 'vue'
        const val = {}
        const count = ref(0)
        const maybe = foo()
        let lett = 1
        </script>
        <template>
          <div @click="({ count } = val)"/>
          <div @click="[maybe] = val"/>
          <div @click="({ lett } = val)"/>
        </template>
        `,
        { inlineTemplate: true }
      )
      // known const ref: set value
      expect(content).toMatch(`({ count: count.value } = val)`)
      // const but maybe ref (non-ref case ignored)
      expect(content).toMatch(`[maybe.value] = val`)
      // let: assumes non-ref
      expect(content).toMatch(`{ lett: lett } = val`)
      assertCode(content)
    })

    test('ssr codegen', () => {
      const { content } = compile(
        `
        <script setup>
        import { ref } from 'vue'
        const count = ref(0)
        </script>
        <template>
          <div>{{ count }}</div>
          <div>static</div>
        </template>
        <style>
        div { color: v-bind(count) }
        </style>
        `,
        {
          inlineTemplate: true,
          templateOptions: {
            ssr: true
          }
        }
      )
      expect(content).toMatch(`\n  __ssrInlineRender: true,\n`)
      expect(content).toMatch(`return (_ctx, _push`)
      expect(content).toMatch(`ssrInterpolate`)
      assertCode(content)
    })

    // _withId is only generated for backwards compat and is a noop when called
    // in module scope.
    // when inside setup(), currentInstance will be non-null and _withId will
    // no longer be noop and cause scopeId errors.
    // TODO: this test should no longer be necessary if we remove _withId
    // codegen in 3.1
    test('should not wrap render fn with withId when having scoped styles', async () => {
      const { content } = compile(
        `
        <script setup>
        const msg = 1
        </script>
        <template><h1>{{ msg }}</h1></template>
        <style scoped>
        h1 { color: red; }
        </style>
        `,
        {
          inlineTemplate: true
        }
      )
      expect(content).toMatch(`return (_ctx, _cache`)
      expect(content).not.toMatch(`_withId(`)
      assertCode(content)
    })
  })

  describe('with TypeScript', () => {
    test('hoist type declarations', () => {
      const { content } = compile(`
      <script setup lang="ts">
        export interface Foo {}
        type Bar = {}
      </script>`)
      assertCode(content)
    })

    test('defineProps/Emit w/ runtime options', () => {
      const { content } = compile(`
<script setup lang="ts">
const props = defineProps({ foo: String })
const emit = defineEmits(['a', 'b'])
</script>
      `)
      assertCode(content)
      expect(content).toMatch(`export default _defineComponent({
  props: { foo: String },
  emits: ['a', 'b'],
  setup(__props, { expose, emit }) {`)
    })

    test('defineProps w/ type', () => {
      const { content, bindings } = compile(`
      <script setup lang="ts">
      interface Test {}

      type Alias = number[]

      defineProps<{
        string: string
        number: number
        boolean: boolean
        object: object
        objectLiteral: { a: number }
        fn: (n: number) => void
        functionRef: Function
        objectRef: Object
        array: string[]
        arrayRef: Array<any>
        tuple: [number, number]
        set: Set<string>
        literal: 'foo'
        optional?: any
        recordRef: Record<string, null>
        interface: Test
        alias: Alias
        method(): void

        union: string | number
        literalUnion: 'foo' | 'bar'
        literalUnionMixed: 'foo' | 1 | boolean
        intersection: Test & {}
      }>()
      </script>`)
      assertCode(content)
      expect(content).toMatch(`string: { type: String, required: true }`)
      expect(content).toMatch(`number: { type: Number, required: true }`)
      expect(content).toMatch(`boolean: { type: Boolean, required: true }`)
      expect(content).toMatch(`object: { type: Object, required: true }`)
      expect(content).toMatch(`objectLiteral: { type: Object, required: true }`)
      expect(content).toMatch(`fn: { type: Function, required: true }`)
      expect(content).toMatch(`functionRef: { type: Function, required: true }`)
      expect(content).toMatch(`objectRef: { type: Object, required: true }`)
      expect(content).toMatch(`array: { type: Array, required: true }`)
      expect(content).toMatch(`arrayRef: { type: Array, required: true }`)
      expect(content).toMatch(`tuple: { type: Array, required: true }`)
      expect(content).toMatch(`set: { type: Set, required: true }`)
      expect(content).toMatch(`literal: { type: String, required: true }`)
      expect(content).toMatch(`optional: { type: null, required: false }`)
      expect(content).toMatch(`recordRef: { type: Object, required: true }`)
      expect(content).toMatch(`interface: { type: Object, required: true }`)
      expect(content).toMatch(`alias: { type: Array, required: true }`)
      expect(content).toMatch(`method: { type: Function, required: true }`)
      expect(content).toMatch(
        `union: { type: [String, Number], required: true }`
      )
      expect(content).toMatch(
        `literalUnion: { type: [String, String], required: true }`
      )
      expect(content).toMatch(
        `literalUnionMixed: { type: [String, Number, Boolean], required: true }`
      )
      expect(content).toMatch(`intersection: { type: Object, required: true }`)
      expect(bindings).toStrictEqual({
        string: BindingTypes.PROPS,
        number: BindingTypes.PROPS,
        boolean: BindingTypes.PROPS,
        object: BindingTypes.PROPS,
        objectLiteral: BindingTypes.PROPS,
        fn: BindingTypes.PROPS,
        functionRef: BindingTypes.PROPS,
        objectRef: BindingTypes.PROPS,
        array: BindingTypes.PROPS,
        arrayRef: BindingTypes.PROPS,
        tuple: BindingTypes.PROPS,
        set: BindingTypes.PROPS,
        literal: BindingTypes.PROPS,
        optional: BindingTypes.PROPS,
        recordRef: BindingTypes.PROPS,
        interface: BindingTypes.PROPS,
        alias: BindingTypes.PROPS,
        method: BindingTypes.PROPS,
        union: BindingTypes.PROPS,
        literalUnion: BindingTypes.PROPS,
        literalUnionMixed: BindingTypes.PROPS,
        intersection: BindingTypes.PROPS
      })
    })

    test('defineProps w/ interface', () => {
      const { content, bindings } = compile(`
      <script setup lang="ts">
      interface Props { x?: number }
      defineProps<Props>()
      </script>
      `)
      assertCode(content)
      expect(content).toMatch(`x: { type: Number, required: false }`)
      expect(bindings).toStrictEqual({
        x: BindingTypes.PROPS
      })
    })

    test('defineProps w/ exported interface', () => {
      const { content, bindings } = compile(`
      <script setup lang="ts">
      export interface Props { x?: number }
      defineProps<Props>()
      </script>
      `)
      assertCode(content)
      expect(content).toMatch(`x: { type: Number, required: false }`)
      expect(bindings).toStrictEqual({
        x: BindingTypes.PROPS
      })
    })

    test('defineProps w/ type alias', () => {
      const { content, bindings } = compile(`
      <script setup lang="ts">
      type Props = { x?: number }
      defineProps<Props>()
      </script>
      `)
      assertCode(content)
      expect(content).toMatch(`x: { type: Number, required: false }`)
      expect(bindings).toStrictEqual({
        x: BindingTypes.PROPS
      })
    })

    test('defineProps w/ exported type alias', () => {
      const { content, bindings } = compile(`
      <script setup lang="ts">
      export type Props = { x?: number }
      defineProps<Props>()
      </script>
      `)
      assertCode(content)
      expect(content).toMatch(`x: { type: Number, required: false }`)
      expect(bindings).toStrictEqual({
        x: BindingTypes.PROPS
      })
    })

    test('withDefaults (static)', () => {
      const { content, bindings } = compile(`
      <script setup lang="ts">
      const props = withDefaults(defineProps<{
        foo?: string
        bar?: number
      }>(), {
        foo: 'hi'
      })
      </script>
      `)
      assertCode(content)
      expect(content).toMatch(
        `foo: { type: String, required: false, default: 'hi' }`
      )
      expect(content).toMatch(`bar: { type: Number, required: false }`)
      expect(content).toMatch(`const props = __props`)
      expect(bindings).toStrictEqual({
        foo: BindingTypes.PROPS,
        bar: BindingTypes.PROPS,
        props: BindingTypes.SETUP_CONST
      })
    })

    test('withDefaults (dynamic)', () => {
      const { content } = compile(`
      <script setup lang="ts">
      import { defaults } from './foo'
      const props = withDefaults(defineProps<{
        foo?: string
        bar?: number
      }>(), { ...defaults })
      </script>
      `)
      assertCode(content)
      expect(content).toMatch(`import { mergeDefaults as _mergeDefaults`)
      expect(content).toMatch(
        `
  _mergeDefaults({
    foo: { type: String, required: false },
    bar: { type: Number, required: false }
  }, { ...defaults })`.trim()
      )
    })

    test('defineEmits w/ type', () => {
      const { content } = compile(`
      <script setup lang="ts">
      const emit = defineEmits<(e: 'foo' | 'bar') => void>()
      </script>
      `)
      assertCode(content)
      expect(content).toMatch(`emit: ((e: 'foo' | 'bar') => void),`)
      expect(content).toMatch(`emits: ["foo", "bar"] as unknown as undefined`)
    })

    test('defineEmits w/ type (union)', () => {
      const type = `((e: 'foo' | 'bar') => void) | ((e: 'baz', id: number) => void)`
      expect(() =>
        compile(`
      <script setup lang="ts">
      const emit = defineEmits<${type}>()
      </script>
      `)
      ).toThrow()
    })

    test('defineEmits w/ type (type literal w/ call signatures)', () => {
      const type = `{(e: 'foo' | 'bar'): void; (e: 'baz', id: number): void;}`
      const { content } = compile(`
      <script setup lang="ts">
      const emit = defineEmits<${type}>()
      </script>
      `)
      assertCode(content)
      expect(content).toMatch(`emit: (${type}),`)
      expect(content).toMatch(
        `emits: ["foo", "bar", "baz"] as unknown as undefined`
      )
    })

    test('defineEmits w/ type (interface)', () => {
      const { content } = compile(`
      <script setup lang="ts">
      interface Emits { (e: 'foo' | 'bar'): void }
      const emit = defineEmits<Emits>()
      </script>
      `)
      assertCode(content)
      expect(content).toMatch(`emit: ({ (e: 'foo' | 'bar'): void }),`)
      expect(content).toMatch(`emits: ["foo", "bar"] as unknown as undefined`)
    })

    test('defineEmits w/ type (exported interface)', () => {
      const { content } = compile(`
      <script setup lang="ts">
      export interface Emits { (e: 'foo' | 'bar'): void }
      const emit = defineEmits<Emits>()
      </script>
      `)
      assertCode(content)
      expect(content).toMatch(`emit: ({ (e: 'foo' | 'bar'): void }),`)
      expect(content).toMatch(`emits: ["foo", "bar"] as unknown as undefined`)
    })

    test('defineEmits w/ type (type alias)', () => {
      const { content } = compile(`
      <script setup lang="ts">
      type Emits = { (e: 'foo' | 'bar'): void }
      const emit = defineEmits<Emits>()
      </script>
      `)
      assertCode(content)
      expect(content).toMatch(`emit: ({ (e: 'foo' | 'bar'): void }),`)
      expect(content).toMatch(`emits: ["foo", "bar"] as unknown as undefined`)
    })

    test('defineEmits w/ type (exported type alias)', () => {
      const { content } = compile(`
      <script setup lang="ts">
      export type Emits = { (e: 'foo' | 'bar'): void }
      const emit = defineEmits<Emits>()
      </script>
      `)
      assertCode(content)
      expect(content).toMatch(`emit: ({ (e: 'foo' | 'bar'): void }),`)
      expect(content).toMatch(`emits: ["foo", "bar"] as unknown as undefined`)
    })

    test('defineEmits w/ type (referenced function type)', () => {
      const { content } = compile(`
      <script setup lang="ts">
      type Emits = (e: 'foo' | 'bar') => void
      const emit = defineEmits<Emits>()
      </script>
      `)
      assertCode(content)
      expect(content).toMatch(`emit: ((e: 'foo' | 'bar') => void),`)
      expect(content).toMatch(`emits: ["foo", "bar"] as unknown as undefined`)
    })

    test('defineEmits w/ type (referenced exported function type)', () => {
      const { content } = compile(`
      <script setup lang="ts">
      export type Emits = (e: 'foo' | 'bar') => void
      const emit = defineEmits<Emits>()
      </script>
      `)
      assertCode(content)
      expect(content).toMatch(`emit: ((e: 'foo' | 'bar') => void),`)
      expect(content).toMatch(`emits: ["foo", "bar"] as unknown as undefined`)
    })
  })

  describe('async/await detection', () => {
    function assertAwaitDetection(
      code: string,
      expected: string | ((content: string) => boolean),
      shouldAsync = true
    ) {
      const { content } = compile(`<script setup>${code}</script>`, {
        refSugar: true
      })
      expect(content).toMatch(`${shouldAsync ? `async ` : ``}setup(`)
      if (typeof expected === 'string') {
        expect(content).toMatch(expected)
      } else {
        expect(expected(content)).toBe(true)
      }
    }

    test('expression statement', () => {
      assertAwaitDetection(`await foo`, `await _withAsyncContext(foo)`)
    })

    test('variable', () => {
      assertAwaitDetection(
        `const a = 1 + (await foo)`,
        `1 + (await _withAsyncContext(foo))`
      )
    })

    test('ref', () => {
      assertAwaitDetection(
        `ref: a = 1 + (await foo)`,
        `1 + (await _withAsyncContext(foo))`
      )
    })

    test('nested statements', () => {
      assertAwaitDetection(`if (ok) { await foo } else { await bar }`, code => {
        return (
          code.includes(`await _withAsyncContext(foo)`) &&
          code.includes(`await _withAsyncContext(bar)`)
        )
      })
    })

    test('should ignore await inside functions', () => {
      // function declaration
      assertAwaitDetection(
        `async function foo() { await bar }`,
        `await bar`,
        false
      )
      // function expression
      assertAwaitDetection(
        `const foo = async () => { await bar }`,
        `await bar`,
        false
      )
      // object method
      assertAwaitDetection(
        `const obj = { async method() { await bar }}`,
        `await bar`,
        false
      )
      // class method
      assertAwaitDetection(
        `const cls = class Foo { async method() { await bar }}`,
        `await bar`,
        false
      )
    })
  })

  describe('errors', () => {
    test('<script> and <script setup> must have same lang', () => {
      expect(() =>
        compile(`<script>foo()</script><script setup lang="ts">bar()</script>`)
      ).toThrow(`<script> and <script setup> must have the same language type`)
    })

    const moduleErrorMsg = `cannot contain ES module exports`

    test('non-type named exports', () => {
      expect(() =>
        compile(`<script setup>
        export const a = 1
        </script>`)
      ).toThrow(moduleErrorMsg)

      expect(() =>
        compile(`<script setup>
        export * from './foo'
        </script>`)
      ).toThrow(moduleErrorMsg)

      expect(() =>
        compile(`<script setup>
          const bar = 1
          export { bar as default }
        </script>`)
      ).toThrow(moduleErrorMsg)
    })

    test('defineProps/Emit() w/ both type and non-type args', () => {
      expect(() => {
        compile(`<script setup lang="ts">
        defineProps<{}>({})
        </script>`)
      }).toThrow(`cannot accept both type and non-type arguments`)

      expect(() => {
        compile(`<script setup lang="ts">
        defineEmits<{}>({})
        </script>`)
      }).toThrow(`cannot accept both type and non-type arguments`)
    })

    test('defineProps/Emit() referencing local var', () => {
      expect(() =>
        compile(`<script setup>
        const bar = 1
        defineProps({
          foo: {
            default: () => bar
          }
        })
        </script>`)
      ).toThrow(`cannot reference locally declared variables`)

      expect(() =>
        compile(`<script setup>
        const bar = 'hello'
        defineEmits([bar])
        </script>`)
      ).toThrow(`cannot reference locally declared variables`)
    })

    test('should allow defineProps/Emit() referencing scope var', () => {
      assertCode(
        compile(`<script setup>
          const bar = 1
          defineProps({
            foo: {
              default: bar => bar + 1
            }
          })
          defineEmits({
            foo: bar => bar > 1
          })
        </script>`).content
      )
    })

    test('should allow defineProps/Emit() referencing imported binding', () => {
      assertCode(
        compile(`<script setup>
        import { bar } from './bar'
        defineProps({
          foo: {
            default: () => bar
          }
        })
        defineEmits({
          foo: () => bar > 1
        })
        </script>`).content
      )
    })
  })
})

describe('SFC analyze <script> bindings', () => {
  it('can parse decorators syntax in typescript block', () => {
    const { scriptAst } = compile(`
      <script lang="ts">
        import { Options, Vue } from 'vue-class-component';
        @Options({
          components: {
            HelloWorld,
          },
          props: ['foo', 'bar']
        })
        export default class Home extends Vue {}
      </script>
    `)

    expect(scriptAst).toBeDefined()
  })

  it('recognizes props array declaration', () => {
    const { bindings } = compile(`
      <script>
        export default {
          props: ['foo', 'bar']
        }
      </script>
    `)
    expect(bindings).toStrictEqual({
      foo: BindingTypes.PROPS,
      bar: BindingTypes.PROPS
    })
    expect(bindings!.__isScriptSetup).toBe(false)
  })

  it('recognizes props object declaration', () => {
    const { bindings } = compile(`
      <script>
        export default {
          props: {
            foo: String,
            bar: {
              type: String,
            },
            baz: null,
            qux: [String, Number]
          }
        }
      </script>
    `)
    expect(bindings).toStrictEqual({
      foo: BindingTypes.PROPS,
      bar: BindingTypes.PROPS,
      baz: BindingTypes.PROPS,
      qux: BindingTypes.PROPS
    })
    expect(bindings!.__isScriptSetup).toBe(false)
  })

  it('recognizes setup return', () => {
    const { bindings } = compile(`
      <script>
        const bar = 2
        export default {
          setup() {
            return {
              foo: 1,
              bar
            }
          }
        }
      </script>
    `)
    expect(bindings).toStrictEqual({
      foo: BindingTypes.SETUP_MAYBE_REF,
      bar: BindingTypes.SETUP_MAYBE_REF
    })
    expect(bindings!.__isScriptSetup).toBe(false)
  })

  it('recognizes async setup return', () => {
    const { bindings } = compile(`
      <script>
        const bar = 2
        export default {
          async setup() {
            return {
              foo: 1,
              bar
            }
          }
        }
      </script>
    `)
    expect(bindings).toStrictEqual({
      foo: BindingTypes.SETUP_MAYBE_REF,
      bar: BindingTypes.SETUP_MAYBE_REF
    })
    expect(bindings!.__isScriptSetup).toBe(false)
  })

  it('recognizes data return', () => {
    const { bindings } = compile(`
      <script>
        const bar = 2
        export default {
          data() {
            return {
              foo: null,
              bar
            }
          }
        }
      </script>
    `)
    expect(bindings).toStrictEqual({
      foo: BindingTypes.DATA,
      bar: BindingTypes.DATA
    })
  })

  it('recognizes methods', () => {
    const { bindings } = compile(`
      <script>
        export default {
          methods: {
            foo() {}
          }
        }
      </script>
    `)
    expect(bindings).toStrictEqual({ foo: BindingTypes.OPTIONS })
  })

  it('recognizes computeds', () => {
    const { bindings } = compile(`
      <script>
        export default {
          computed: {
            foo() {},
            bar: {
              get() {},
              set() {},
            }
          }
        }
      </script>
    `)
    expect(bindings).toStrictEqual({
      foo: BindingTypes.OPTIONS,
      bar: BindingTypes.OPTIONS
    })
  })

  it('recognizes injections array declaration', () => {
    const { bindings } = compile(`
      <script>
        export default {
          inject: ['foo', 'bar']
        }
      </script>
    `)
    expect(bindings).toStrictEqual({
      foo: BindingTypes.OPTIONS,
      bar: BindingTypes.OPTIONS
    })
  })

  it('recognizes injections object declaration', () => {
    const { bindings } = compile(`
      <script>
        export default {
          inject: {
            foo: {},
            bar: {},
          }
        }
      </script>
    `)
    expect(bindings).toStrictEqual({
      foo: BindingTypes.OPTIONS,
      bar: BindingTypes.OPTIONS
    })
  })

  it('works for mixed bindings', () => {
    const { bindings } = compile(`
      <script>
        export default {
          inject: ['foo'],
          props: {
            bar: String,
          },
          setup() {
            return {
              baz: null,
            }
          },
          data() {
            return {
              qux: null
            }
          },
          methods: {
            quux() {}
          },
          computed: {
            quuz() {}
          }
        }
      </script>
    `)
    expect(bindings).toStrictEqual({
      foo: BindingTypes.OPTIONS,
      bar: BindingTypes.PROPS,
      baz: BindingTypes.SETUP_MAYBE_REF,
      qux: BindingTypes.DATA,
      quux: BindingTypes.OPTIONS,
      quuz: BindingTypes.OPTIONS
    })
  })

  it('works for script setup', () => {
    const { bindings } = compile(`
      <script setup>
      import { ref as r } from 'vue'
      defineProps({
        foo: String
      })

      const a = r(1)
      let b = 2
      const c = 3
      const { d } = someFoo()
      let { e } = someBar()
      </script>
    `)

    expect(bindings).toStrictEqual({
      r: BindingTypes.SETUP_CONST,
      a: BindingTypes.SETUP_REF,
      b: BindingTypes.SETUP_LET,
      c: BindingTypes.SETUP_CONST,
      d: BindingTypes.SETUP_MAYBE_REF,
      e: BindingTypes.SETUP_LET,
      foo: BindingTypes.PROPS
    })
  })
})
