import { baseCompile } from '../src/compile'
import { PUSH_SCOPE_ID, POP_SCOPE_ID } from '../src/runtimeHelpers'
import { PatchFlags } from '@vue/shared'
import { genFlagText } from './testUtils'

/**
 * Ensure all slot functions are wrapped with _withCtx
 * which sets the currentRenderingInstance and currentScopeId when rendering
 * the slot.
 */
describe('scopeId compiler support', () => {
  test('should only work in module mode', () => {
    expect(() => {
      baseCompile(``, { scopeId: 'test' })
    }).toThrow(`"scopeId" option is only supported in module mode`)
  })

  test('should wrap default slot', () => {
    const { code } = baseCompile(`<Child><div/></Child>`, {
      mode: 'module',
      scopeId: 'test'
    })
    expect(code).toMatch(`default: _withId(() => [`)
    expect(code).toMatchSnapshot()
  })

  test('should wrap named slots', () => {
    const { code } = baseCompile(
      `<Child>
        <template #foo="{ msg }">{{ msg }}</template>
        <template #bar><div/></template>
      </Child>
      `,
      {
        mode: 'module',
        scopeId: 'test'
      }
    )
    expect(code).toMatch(`foo: _withId(({ msg }) => [`)
    expect(code).toMatch(`bar: _withId(() => [`)
    expect(code).toMatchSnapshot()
  })

  test('should wrap dynamic slots', () => {
    const { code } = baseCompile(
      `<Child>
        <template #foo v-if="ok"><div/></template>
        <template v-for="i in list" #[i]><div/></template>
      </Child>
      `,
      {
        mode: 'module',
        scopeId: 'test'
      }
    )
    expect(code).toMatch(/name: "foo",\s+fn: _withId\(/)
    expect(code).toMatch(/name: i,\s+fn: _withId\(/)
    expect(code).toMatchSnapshot()
  })

  test('should push scopeId for hoisted nodes', () => {
    const { ast, code } = baseCompile(
      `<div><div>hello</div>{{ foo }}<div>world</div></div>`,
      {
        mode: 'module',
        scopeId: 'test',
        hoistStatic: true
      }
    )
    expect(ast.helpers).toContain(PUSH_SCOPE_ID)
    expect(ast.helpers).toContain(POP_SCOPE_ID)
    expect(ast.hoists.length).toBe(2)
    expect(code).toMatch(
      [
        `_pushScopeId("test")`,
        `const _hoisted_1 = /*#__PURE__*/_createVNode("div", null, "hello", ${genFlagText(
          PatchFlags.HOISTED
        )})`,
        `const _hoisted_2 = /*#__PURE__*/_createVNode("div", null, "world", ${genFlagText(
          PatchFlags.HOISTED
        )})`,
        `_popScopeId()`
      ].join('\n')
    )
    expect(code).toMatchSnapshot()
  })
})
