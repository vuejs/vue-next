import { BindingTypes } from '@vue/compiler-dom'
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
import { defineProps } from 'vue'
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
    expect(content).toMatch(`setup(__props) {`)
    // should assign user identifier to it
    expect(content).toMatch(`const props = __props`)
    // should include context options in default export
    expect(content).toMatch(`export default {
  expose: [],
  props: {
  foo: String
},`)
  })

  test('defineEmit()', () => {
    const { content, bindings } = compile(`
<script setup>
import { defineEmit } from 'vue'
const myEmit = defineEmit(['foo', 'bar'])
</script>
  `)
    assertCode(content)
    expect(bindings).toStrictEqual({
      myEmit: BindingTypes.SETUP_CONST
    })
    // should remove defineOptions import and call
    expect(content).not.toMatch('defineEmit')
    // should generate correct setup signature
    expect(content).toMatch(`setup(__props, { emit: myEmit }) {`)
    // should include context options in default export
    expect(content).toMatch(`export default {
  expose: [],
  emits: ['foo', 'bar'],`)
  })

  test('<template inherit-attrs="false">', () => {
    const { content } = compile(`
      <script>
      export default {}
      </script>
      <template inherit-attrs="false">
      {{ a }}
      </template>
      `)
    assertCode(content)

    const { content: content2 } = compile(`
      <script setup>
      const a = 1
      </script>
      <template inherit-attrs="false">
      {{ a }}
      </template>
      `)
    assertCode(content2)
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
      import { defineProps, defineEmit, ref } from 'vue'
      defineProps(['foo'])
      defineEmit(['bar'])
      const r = ref(0)
      </script>`).content
      )
    })

    test('dedupe between user & helper', () => {
      const { content } = compile(`
      <script setup>
      import { ref } from 'vue'
      ref: foo = 1
      </script>
      `)
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
    })

    test('referencing scope components and directives', () => {
      const { content } = compile(
        `
        <script setup>
        import ChildComp from './Child.vue'
        import SomeOtherComp from './Other.vue'
        import myDir from './my-dir'
        </script>
        <template>
          <div v-my-dir></div>
          <ChildComp/>
          <some-other-comp/>
        </template>
        `,
        { inlineTemplate: true }
      )
      expect(content).toMatch('[_unref(myDir)]')
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
        </script>
        <template>
          <div @click="count = 1"/>
          <div @click="maybe = count"/>
          <div @click="lett = count"/>
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
import { defineProps, defineEmit } from 'vue'
const props = defineProps({ foo: String })
const emit = defineEmit(['a', 'b'])
</script>
      `)
      assertCode(content)
      expect(content).toMatch(`export default _defineComponent({
  expose: [],
  props: { foo: String },
  emits: ['a', 'b'],
  setup(__props, { emit }) {`)
    })

    test('defineProps w/ type', () => {
      const { content, bindings } = compile(`
      <script setup lang="ts">
      import { defineProps } from 'vue'
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
        union: BindingTypes.PROPS,
        literalUnion: BindingTypes.PROPS,
        literalUnionMixed: BindingTypes.PROPS,
        intersection: BindingTypes.PROPS
      })
    })

    test('defineEmit w/ type', () => {
      const { content } = compile(`
      <script setup lang="ts">
      import { defineEmit } from 'vue'
      const emit = defineEmit<(e: 'foo' | 'bar') => void>()
      </script>
      `)
      assertCode(content)
      expect(content).toMatch(`emit: ((e: 'foo' | 'bar') => void),`)
      expect(content).toMatch(`emits: ["foo", "bar"] as unknown as undefined`)
    })

    test('defineEmit w/ type (union)', () => {
      const type = `((e: 'foo' | 'bar') => void) | ((e: 'baz', id: number) => void)`
      const { content } = compile(`
      <script setup lang="ts">
      import { defineEmit } from 'vue'
      const emit = defineEmit<${type}>()
      </script>
      `)
      assertCode(content)
      expect(content).toMatch(`emit: (${type}),`)
      expect(content).toMatch(
        `emits: ["foo", "bar", "baz"] as unknown as undefined`
      )
    })
  })

  describe('async/await detection', () => {
    function assertAwaitDetection(code: string, shouldAsync = true) {
      const { content } = compile(`<script setup>${code}</script>`)
      expect(content).toMatch(`${shouldAsync ? `async ` : ``}setup(`)
    }

    test('expression statement', () => {
      assertAwaitDetection(`await foo`)
    })

    test('variable', () => {
      assertAwaitDetection(`const a = 1 + (await foo)`)
    })

    test('ref', () => {
      assertAwaitDetection(`ref: a = 1 + (await foo)`)
    })

    test('nested statements', () => {
      assertAwaitDetection(`if (ok) { await foo } else { await bar }`)
    })

    test('should ignore await inside functions', () => {
      // function declaration
      assertAwaitDetection(`async function foo() { await bar }`, false)
      // function expression
      assertAwaitDetection(`const foo = async () => { await bar }`, false)
      // object method
      assertAwaitDetection(`const obj = { async method() { await bar }}`, false)
      // class method
      assertAwaitDetection(
        `const cls = class Foo { async method() { await bar }}`,
        false
      )
    })
  })

  describe('ref: syntax sugar', () => {
    test('convert ref declarations', () => {
      const { content, bindings } = compile(`<script setup>
      ref: foo
      ref: a = 1
      ref: b = {
        count: 0
      }
      let c = () => {}
      let d
      </script>`)
      expect(content).toMatch(`import { ref as _ref } from 'vue'`)
      expect(content).not.toMatch(`ref: foo`)
      expect(content).not.toMatch(`ref: a`)
      expect(content).not.toMatch(`ref: b`)
      expect(content).toMatch(`const foo = _ref()`)
      expect(content).toMatch(`const a = _ref(1)`)
      expect(content).toMatch(`
      const b = _ref({
        count: 0
      })
      `)
      // normal declarations left untouched
      expect(content).toMatch(`let c = () => {}`)
      expect(content).toMatch(`let d`)
      assertCode(content)
      expect(bindings).toStrictEqual({
        foo: BindingTypes.SETUP_REF,
        a: BindingTypes.SETUP_REF,
        b: BindingTypes.SETUP_REF,
        c: BindingTypes.SETUP_LET,
        d: BindingTypes.SETUP_LET
      })
    })

    test('multi ref declarations', () => {
      const { content, bindings } = compile(`<script setup>
      ref: a = 1, b = 2, c = {
        count: 0
      }
      </script>`)
      expect(content).toMatch(`
      const a = _ref(1), b = _ref(2), c = _ref({
        count: 0
      })
      `)
      expect(content).toMatch(`return { a, b, c }`)
      assertCode(content)
      expect(bindings).toStrictEqual({
        a: BindingTypes.SETUP_REF,
        b: BindingTypes.SETUP_REF,
        c: BindingTypes.SETUP_REF
      })
    })

    test('should not convert non ref labels', () => {
      const { content } = compile(`<script setup>
      foo: a = 1, b = 2, c = {
        count: 0
      }
      </script>`)
      expect(content).toMatch(`foo: a = 1, b = 2`)
      assertCode(content)
    })

    test('accessing ref binding', () => {
      const { content } = compile(`<script setup>
      ref: a = 1
      console.log(a)
      function get() {
        return a + 1
      }
      </script>`)
      expect(content).toMatch(`console.log(a.value)`)
      expect(content).toMatch(`return a.value + 1`)
      assertCode(content)
    })

    test('cases that should not append .value', () => {
      const { content } = compile(`<script setup>
      ref: a = 1
      console.log(b.a)
      function get(a) {
        return a + 1
      }
      </script>`)
      expect(content).not.toMatch(`a.value`)
    })

    test('mutating ref binding', () => {
      const { content } = compile(`<script setup>
      ref: a = 1
      ref: b = { count: 0 }
      function inc() {
        a++
        a = a + 1
        b.count++
        b.count = b.count + 1
        ;({ a } = { a: 2 })
        ;[a] = [1]
      }
      </script>`)
      expect(content).toMatch(`a.value++`)
      expect(content).toMatch(`a.value = a.value + 1`)
      expect(content).toMatch(`b.value.count++`)
      expect(content).toMatch(`b.value.count = b.value.count + 1`)
      expect(content).toMatch(`;({ a: a.value } = { a: 2 })`)
      expect(content).toMatch(`;[a.value] = [1]`)
      assertCode(content)
    })

    test('using ref binding in property shorthand', () => {
      const { content } = compile(`<script setup>
      ref: a = 1
      const b = { a }
      function test() {
        const { a } = b
      }
      </script>`)
      expect(content).toMatch(`const b = { a: a.value }`)
      // should not convert destructure
      expect(content).toMatch(`const { a } = b`)
      assertCode(content)
    })

    test('should not rewrite scope variable', () => {
      const { content } = compile(`
      <script setup>
        ref: a = 1
        ref: b = 1
        ref: d = 1
        const e = 1
        function test() {
          const a = 2
          console.log(a)
          console.log(b)
          let c = { c: 3 }
          console.log(c)
          let $d
          console.log($d)
          console.log(d)
          console.log(e)
        }
      </script>`)
      expect(content).toMatch('console.log(a)')
      expect(content).toMatch('console.log(b.value)')
      expect(content).toMatch('console.log(c)')
      expect(content).toMatch('console.log($d)')
      expect(content).toMatch('console.log(d.value)')
      expect(content).toMatch('console.log(e)')
      assertCode(content)
    })

    test('object destructure', () => {
      const { content, bindings } = compile(`<script setup>
      ref: n = 1, ({ a, b: c, d = 1, e: f = 2, ...g } = useFoo())
      console.log(n, a, c, d, f, g)
      </script>`)
      expect(content).toMatch(
        `const n = _ref(1), { a: __a, b: __c, d: __d = 1, e: __f = 2, ...__g } = useFoo()`
      )
      expect(content).toMatch(`\nconst a = _ref(__a);`)
      expect(content).not.toMatch(`\nconst b = _ref(__b);`)
      expect(content).toMatch(`\nconst c = _ref(__c);`)
      expect(content).toMatch(`\nconst d = _ref(__d);`)
      expect(content).not.toMatch(`\nconst e = _ref(__e);`)
      expect(content).toMatch(`\nconst f = _ref(__f);`)
      expect(content).toMatch(`\nconst g = _ref(__g);`)
      expect(content).toMatch(
        `console.log(n.value, a.value, c.value, d.value, f.value, g.value)`
      )
      expect(content).toMatch(`return { n, a, c, d, f, g }`)
      expect(bindings).toStrictEqual({
        n: BindingTypes.SETUP_REF,
        a: BindingTypes.SETUP_REF,
        c: BindingTypes.SETUP_REF,
        d: BindingTypes.SETUP_REF,
        f: BindingTypes.SETUP_REF,
        g: BindingTypes.SETUP_REF
      })
      assertCode(content)
    })

    test('array destructure', () => {
      const { content, bindings } = compile(`<script setup>
      ref: n = 1, [a, b = 1, ...c] = useFoo()
      console.log(n, a, b, c)
      </script>`)
      expect(content).toMatch(
        `const n = _ref(1), [__a, __b = 1, ...__c] = useFoo()`
      )
      expect(content).toMatch(`\nconst a = _ref(__a);`)
      expect(content).toMatch(`\nconst b = _ref(__b);`)
      expect(content).toMatch(`\nconst c = _ref(__c);`)
      expect(content).toMatch(`console.log(n.value, a.value, b.value, c.value)`)
      expect(content).toMatch(`return { n, a, b, c }`)
      expect(bindings).toStrictEqual({
        n: BindingTypes.SETUP_REF,
        a: BindingTypes.SETUP_REF,
        b: BindingTypes.SETUP_REF,
        c: BindingTypes.SETUP_REF
      })
      assertCode(content)
    })

    test('nested destructure', () => {
      const { content, bindings } = compile(`<script setup>
      ref: [{ a: { b }}] = useFoo()
      ref: ({ c: [d, e] } = useBar())
      console.log(b, d, e)
      </script>`)
      expect(content).toMatch(`const [{ a: { b: __b }}] = useFoo()`)
      expect(content).toMatch(`const { c: [__d, __e] } = useBar()`)
      expect(content).not.toMatch(`\nconst a = _ref(__a);`)
      expect(content).not.toMatch(`\nconst c = _ref(__c);`)
      expect(content).toMatch(`\nconst b = _ref(__b);`)
      expect(content).toMatch(`\nconst d = _ref(__d);`)
      expect(content).toMatch(`\nconst e = _ref(__e);`)
      expect(content).toMatch(`return { b, d, e }`)
      expect(bindings).toStrictEqual({
        b: BindingTypes.SETUP_REF,
        d: BindingTypes.SETUP_REF,
        e: BindingTypes.SETUP_REF
      })
      assertCode(content)
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

    test('ref: non-assignment expressions', () => {
      expect(() =>
        compile(`<script setup>
        ref: a = 1, foo()
        </script>`)
      ).toThrow(`ref: statements can only contain assignment expressions`)
    })

    test('defineProps/Emit() w/ both type and non-type args', () => {
      expect(() => {
        compile(`<script setup lang="ts">
        import { defineProps } from 'vue'
        defineProps<{}>({})
        </script>`)
      }).toThrow(`cannot accept both type and non-type arguments`)

      expect(() => {
        compile(`<script setup lang="ts">
        import { defineEmit } from 'vue'
        defineEmit<{}>({})
        </script>`)
      }).toThrow(`cannot accept both type and non-type arguments`)
    })

    test('defineProps/Emit() referencing local var', () => {
      expect(() =>
        compile(`<script setup>
        import { defineProps } from 'vue'
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
        import { defineEmit } from 'vue'
        const bar = 'hello'
        defineEmit([bar])
        </script>`)
      ).toThrow(`cannot reference locally declared variables`)
    })

    test('defineProps/Emit() referencing ref declarations', () => {
      expect(() =>
        compile(`<script setup>
        import { defineProps } from 'vue'
        ref: bar = 1
        defineProps({
          bar
        })
      </script>`)
      ).toThrow(`cannot reference locally declared variables`)

      expect(() =>
        compile(`<script setup>
        import { defineEmit } from 'vue'
        ref: bar = 1
        defineEmit({
          bar
        })
      </script>`)
      ).toThrow(`cannot reference locally declared variables`)
    })

    test('should allow defineProps/Emit() referencing scope var', () => {
      assertCode(
        compile(`<script setup>
          import { defineProps, defineEmit } from 'vue'
          const bar = 1
          defineProps({
            foo: {
              default: bar => bar + 1
            }
          })
          defineEmit({
            foo: bar => bar > 1
          })
        </script>`).content
      )
    })

    test('should allow defineProps/Emit() referencing imported binding', () => {
      assertCode(
        compile(`<script setup>
        import { defineProps, defineEmit } from 'vue'
        import { bar } from './bar'
        defineProps({
          foo: {
            default: () => bar
          }
        })
        defineEmit({
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
      import { defineProps, ref as r } from 'vue'
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
