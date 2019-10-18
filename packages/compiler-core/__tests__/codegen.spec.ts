import {
  locStub,
  generate,
  NodeTypes,
  RootNode,
  createSimpleExpression,
  createObjectExpression,
  createObjectProperty,
  createArrayExpression,
  createCompoundExpression,
  createInterpolation,
  createSequenceExpression,
  createCallExpression,
  createConditionalExpression,
  IfCodegenNode,
  ForCodegenNode
} from '../src'
import {
  CREATE_VNODE,
  COMMENT,
  TO_STRING,
  RESOLVE_DIRECTIVE,
  helperNameMap,
  RESOLVE_COMPONENT
} from '../src/runtimeHelpers'
import { createElementWithCodegen } from './testUtils'
import { PatchFlags } from '@vue/shared'

function createRoot(options: Partial<RootNode> = {}): RootNode {
  return {
    type: NodeTypes.ROOT,
    children: [],
    helpers: [],
    components: [],
    directives: [],
    filters: [],
    hoists: [],
    codegenNode: createSimpleExpression(`null`, false),
    loc: locStub,
    ...options
  }
}

describe('compiler: codegen', () => {
  test('module mode preamble', () => {
    const root = createRoot({
      helpers: [CREATE_VNODE, RESOLVE_DIRECTIVE]
    })
    const { code } = generate(root, { mode: 'module' })
    expect(code).toMatch(
      `import { ${helperNameMap[CREATE_VNODE]}, ${
        helperNameMap[RESOLVE_DIRECTIVE]
      } } from "vue"`
    )
    expect(code).toMatchSnapshot()
  })

  test('function mode preamble', () => {
    const root = createRoot({
      helpers: [CREATE_VNODE, RESOLVE_DIRECTIVE]
    })
    const { code } = generate(root, { mode: 'function' })
    expect(code).toMatch(`const _Vue = Vue`)
    expect(code).toMatch(
      `const { ${helperNameMap[CREATE_VNODE]}: _${
        helperNameMap[CREATE_VNODE]
      }, ${helperNameMap[RESOLVE_DIRECTIVE]}: _${
        helperNameMap[RESOLVE_DIRECTIVE]
      } } = _Vue`
    )
    expect(code).toMatchSnapshot()
  })

  test('function mode preamble w/ prefixIdentifiers: true', () => {
    const root = createRoot({
      helpers: [CREATE_VNODE, RESOLVE_DIRECTIVE]
    })
    const { code } = generate(root, {
      mode: 'function',
      prefixIdentifiers: true
    })
    expect(code).not.toMatch(`const _Vue = Vue`)
    expect(code).toMatch(
      `const { ${helperNameMap[CREATE_VNODE]}, ${
        helperNameMap[RESOLVE_DIRECTIVE]
      } } = Vue`
    )
    expect(code).toMatchSnapshot()
  })

  test('assets', () => {
    const root = createRoot({
      components: [`Foo`, `bar-baz`, `barbaz`],
      directives: [`my_dir`]
    })
    const { code } = generate(root, { mode: 'function' })
    expect(code).toMatch(
      `const _component_Foo = _${helperNameMap[RESOLVE_COMPONENT]}("Foo")\n`
    )
    expect(code).toMatch(
      `const _component_bar_baz = _${
        helperNameMap[RESOLVE_COMPONENT]
      }("bar-baz")\n`
    )
    expect(code).toMatch(
      `const _component_barbaz = _${
        helperNameMap[RESOLVE_COMPONENT]
      }("barbaz")\n`
    )
    expect(code).toMatch(
      `const _directive_my_dir = _${
        helperNameMap[RESOLVE_DIRECTIVE]
      }("my_dir")\n`
    )
    expect(code).toMatchSnapshot()
  })

  test('hoists', () => {
    const root = createRoot({
      hoists: [
        createSimpleExpression(`hello`, false, locStub),
        createObjectExpression(
          [
            createObjectProperty(
              createSimpleExpression(`id`, true, locStub),
              createSimpleExpression(`foo`, true, locStub)
            )
          ],
          locStub
        )
      ]
    })
    const { code } = generate(root)
    expect(code).toMatch(`const _hoisted_1 = hello`)
    expect(code).toMatch(`const _hoisted_2 = { id: "foo" }`)
    expect(code).toMatchSnapshot()
  })

  test('prefixIdentifiers: true should inject _ctx statement', () => {
    const { code } = generate(createRoot(), { prefixIdentifiers: true })
    expect(code).toMatch(`const _ctx = this\n`)
    expect(code).toMatchSnapshot()
  })

  test('static text', () => {
    const { code } = generate(
      createRoot({
        codegenNode: {
          type: NodeTypes.TEXT,
          content: 'hello',
          isEmpty: false,
          loc: locStub
        }
      })
    )
    expect(code).toMatch(`return "hello"`)
    expect(code).toMatchSnapshot()
  })

  test('interpolation', () => {
    const { code } = generate(
      createRoot({
        codegenNode: createInterpolation(`hello`, locStub)
      })
    )
    expect(code).toMatch(`return _${helperNameMap[TO_STRING]}(hello)`)
    expect(code).toMatchSnapshot()
  })

  test('comment', () => {
    const { code } = generate(
      createRoot({
        codegenNode: {
          type: NodeTypes.COMMENT,
          content: 'foo',
          loc: locStub
        }
      })
    )
    expect(code).toMatch(
      `return _${helperNameMap[CREATE_VNODE]}(_${
        helperNameMap[COMMENT]
      }, null, "foo")`
    )
    expect(code).toMatchSnapshot()
  })

  test('compound expression', () => {
    const { code } = generate(
      createRoot({
        codegenNode: createCompoundExpression([
          `_ctx.`,
          createSimpleExpression(`foo`, false, locStub),
          ` + `,
          {
            type: NodeTypes.INTERPOLATION,
            loc: locStub,
            content: createSimpleExpression(`bar`, false, locStub)
          }
        ])
      })
    )
    expect(code).toMatch(`return _ctx.foo + _${helperNameMap[TO_STRING]}(bar)`)
    expect(code).toMatchSnapshot()
  })

  test('ifNode', () => {
    const { code } = generate(
      createRoot({
        codegenNode: {
          type: NodeTypes.IF,
          loc: locStub,
          branches: [],
          codegenNode: createSequenceExpression([
            createSimpleExpression('foo', false),
            createSimpleExpression('bar', false)
          ]) as IfCodegenNode
        }
      })
    )
    expect(code).toMatch(`return (foo, bar)`)
    expect(code).toMatchSnapshot()
  })

  test('forNode', () => {
    const { code } = generate(
      createRoot({
        codegenNode: {
          type: NodeTypes.FOR,
          loc: locStub,
          source: createSimpleExpression('foo', false),
          valueAlias: undefined,
          keyAlias: undefined,
          objectIndexAlias: undefined,
          children: [],
          codegenNode: createSequenceExpression([
            createSimpleExpression('foo', false),
            createSimpleExpression('bar', false)
          ]) as ForCodegenNode
        }
      })
    )
    expect(code).toMatch(`return (foo, bar)`)
    expect(code).toMatchSnapshot()
  })

  test('Element (callExpression + objectExpression + TemplateChildNode[])', () => {
    const { code } = generate(
      createRoot({
        codegenNode: createElementWithCodegen([
          // string
          `"div"`,
          // ObjectExpression
          createObjectExpression(
            [
              createObjectProperty(
                createSimpleExpression(`id`, true, locStub),
                createSimpleExpression(`foo`, true, locStub)
              ),
              createObjectProperty(
                createSimpleExpression(`prop`, false, locStub),
                createSimpleExpression(`bar`, false, locStub)
              ),
              // compound expression as computed key
              createObjectProperty(
                {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  loc: locStub,
                  children: [
                    `foo + `,
                    createSimpleExpression(`bar`, false, locStub)
                  ]
                },
                createSimpleExpression(`bar`, false, locStub)
              )
            ],
            locStub
          ),
          // ChildNode[]
          [
            createElementWithCodegen([
              `"p"`,
              createObjectExpression(
                [
                  createObjectProperty(
                    // should quote the key!
                    createSimpleExpression(`some-key`, true, locStub),
                    createSimpleExpression(`foo`, true, locStub)
                  )
                ],
                locStub
              )
            ])
          ],
          // flag
          PatchFlags.FULL_PROPS + ''
        ])
      })
    )
    expect(code).toMatch(`
    return _${helperNameMap[CREATE_VNODE]}("div", {
      id: "foo",
      [prop]: bar,
      [foo + bar]: bar
    }, [
      _${helperNameMap[CREATE_VNODE]}("p", { "some-key": "foo" })
    ], ${PatchFlags.FULL_PROPS})`)
    expect(code).toMatchSnapshot()
  })

  test('ArrayExpression', () => {
    const { code } = generate(
      createRoot({
        codegenNode: createArrayExpression([
          createSimpleExpression(`foo`, false),
          createCallExpression(`bar`, [`baz`])
        ])
      })
    )
    expect(code).toMatch(`return [
      foo,
      bar(baz)
    ]`)
    expect(code).toMatchSnapshot()
  })

  test('SequenceExpression', () => {
    const { code } = generate(
      createRoot({
        codegenNode: createSequenceExpression([
          createSimpleExpression(`foo`, false),
          createCallExpression(`bar`, [`baz`])
        ])
      })
    )
    expect(code).toMatch(`return (foo, bar(baz))`)
    expect(code).toMatchSnapshot()
  })

  test('ConditionalExpression', () => {
    const { code } = generate(
      createRoot({
        codegenNode: createConditionalExpression(
          createSimpleExpression(`ok`, false),
          createCallExpression(`foo`),
          createConditionalExpression(
            createSimpleExpression(`orNot`, false),
            createCallExpression(`bar`),
            createCallExpression(`baz`)
          )
        )
      })
    )
    expect(code).toMatch(
      `return ok
      ? foo()
      : orNot
        ? bar()
        : baz()`
    )
    expect(code).toMatchSnapshot()
  })
})
