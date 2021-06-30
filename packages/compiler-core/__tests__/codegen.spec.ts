import {
  locStub,
  generate,
  genNode,
  NodeTypes,
  RootNode,
  createSimpleExpression,
  createObjectExpression,
  createObjectProperty,
  createArrayExpression,
  createCompoundExpression,
  createInterpolation,
  createCallExpression,
  createConditionalExpression,
  ForCodegenNode,
  createCacheExpression,
  createTemplateLiteral,
  createBlockStatement,
  createIfStatement,
  createAssignmentExpression,
  IfConditionalExpression,
  createVNodeCall,
  VNodeCall,
  DirectiveArguments,
  ConstantTypes,
  JSChildNode,
  createFunctionExpression,
  SourceLocation
} from '../src'
import {
  CREATE_VNODE,
  TO_DISPLAY_STRING,
  RESOLVE_DIRECTIVE,
  helperNameMap,
  RESOLVE_COMPONENT,
  CREATE_COMMENT,
  FRAGMENT,
  RENDER_LIST
} from '../src/runtimeHelpers'
import { createElementWithCodegen, genFlagText } from './testUtils'
import { PatchFlags } from '@vue/shared'

function createRoot(options: Partial<RootNode> = {}): RootNode {
  return {
    type: NodeTypes.ROOT,
    children: [],
    helpers: [],
    components: [],
    directives: [],
    imports: [],
    hoists: [],
    cached: 0,
    temps: 0,
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
      `import { ${helperNameMap[CREATE_VNODE]} as _${
        helperNameMap[CREATE_VNODE]
      }, ${helperNameMap[RESOLVE_DIRECTIVE]} as _${
        helperNameMap[RESOLVE_DIRECTIVE]
      } } from "vue"`
    )
    expect(code).toMatchSnapshot()
  })

  test('module mode preamble w/ optimizeImports: true', () => {
    const root = createRoot({
      helpers: [CREATE_VNODE, RESOLVE_DIRECTIVE]
    })
    const { code } = generate(root, { mode: 'module', optimizeImports: true })
    expect(code).toMatch(
      `import { ${helperNameMap[CREATE_VNODE]}, ${
        helperNameMap[RESOLVE_DIRECTIVE]
      } } from "vue"`
    )
    expect(code).toMatch(
      `const _${helperNameMap[CREATE_VNODE]} = ${
        helperNameMap[CREATE_VNODE]
      }, _${helperNameMap[RESOLVE_DIRECTIVE]} = ${
        helperNameMap[RESOLVE_DIRECTIVE]
      }`
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
      `const { ${helperNameMap[CREATE_VNODE]}: _${
        helperNameMap[CREATE_VNODE]
      }, ${helperNameMap[RESOLVE_DIRECTIVE]}: _${
        helperNameMap[RESOLVE_DIRECTIVE]
      } } = Vue`
    )
    expect(code).toMatchSnapshot()
  })

  test('assets + temps', () => {
    const root = createRoot({
      components: [`Foo`, `bar-baz`, `barbaz`, `Qux__self`],
      directives: [`my_dir_0`, `my_dir_1`],
      temps: 3
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
    // implicit self reference from SFC filename
    expect(code).toMatch(
      `const _component_Qux = _${
        helperNameMap[RESOLVE_COMPONENT]
      }("Qux", true)\n`
    )
    expect(code).toMatch(
      `const _directive_my_dir_0 = _${
        helperNameMap[RESOLVE_DIRECTIVE]
      }("my_dir_0")\n`
    )
    expect(code).toMatch(
      `const _directive_my_dir_1 = _${
        helperNameMap[RESOLVE_DIRECTIVE]
      }("my_dir_1")\n`
    )
    expect(code).toMatch(`let _temp0, _temp1, _temp2`)
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

  test('temps', () => {
    const root = createRoot({
      temps: 3
    })
    const { code } = generate(root)
    expect(code).toMatch(`let _temp0, _temp1, _temp2`)
    expect(code).toMatchSnapshot()
  })

  test('static text', () => {
    const { code } = generate(
      createRoot({
        codegenNode: {
          type: NodeTypes.TEXT,
          content: 'hello',
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
    expect(code).toMatch(`return _${helperNameMap[TO_DISPLAY_STRING]}(hello)`)
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
    expect(code).toMatch(`return _${helperNameMap[CREATE_COMMENT]}("foo")`)
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
          },
          // nested compound
          createCompoundExpression([` + `, `nested`])
        ])
      })
    )
    expect(code).toMatch(
      `return _ctx.foo + _${helperNameMap[TO_DISPLAY_STRING]}(bar) + nested`
    )
    expect(code).toMatchSnapshot()
  })

  test('ifNode', () => {
    const { code } = generate(
      createRoot({
        codegenNode: {
          type: NodeTypes.IF,
          loc: locStub,
          branches: [],
          codegenNode: createConditionalExpression(
            createSimpleExpression('foo', false),
            createSimpleExpression('bar', false),
            createSimpleExpression('baz', false)
          ) as IfConditionalExpression
        }
      })
    )
    expect(code).toMatch(/return foo\s+\? bar\s+: baz/)
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
          parseResult: {} as any,
          codegenNode: {
            type: NodeTypes.VNODE_CALL,
            tag: FRAGMENT,
            isBlock: true,
            disableTracking: true,
            props: undefined,
            children: createCallExpression(RENDER_LIST),
            patchFlag: '1',
            dynamicProps: undefined,
            directives: undefined,
            loc: locStub
          } as ForCodegenNode
        }
      })
    )
    expect(code).toMatch(`openBlock(true)`)
    expect(code).toMatchSnapshot()
  })

  test('forNode with constant expression', () => {
    const { code } = generate(
      createRoot({
        codegenNode: {
          type: NodeTypes.FOR,
          loc: locStub,
          source: createSimpleExpression(
            '1 + 2',
            false,
            locStub,
            ConstantTypes.CAN_STRINGIFY
          ),
          valueAlias: undefined,
          keyAlias: undefined,
          objectIndexAlias: undefined,
          children: [],
          parseResult: {} as any,
          codegenNode: {
            type: NodeTypes.VNODE_CALL,
            tag: FRAGMENT,
            isBlock: true,
            disableTracking: false,
            props: undefined,
            children: createCallExpression(RENDER_LIST),
            patchFlag: genFlagText(PatchFlags.STABLE_FRAGMENT),
            dynamicProps: undefined,
            directives: undefined,
            loc: locStub
          } as ForCodegenNode
        }
      })
    )
    expect(code).toMatch(`openBlock()`)
    expect(code).toMatchSnapshot()
  })

  test('Element (callExpression + objectExpression + TemplateChildNode[])', () => {
    const { code } = generate(
      createRoot({
        codegenNode: createElementWithCodegen(
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
            createElementWithCodegen(
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
            )
          ],
          // flag
          PatchFlags.FULL_PROPS + ''
        )
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

  test('CacheExpression', () => {
    const { code } = generate(
      createRoot({
        cached: 1,
        codegenNode: createCacheExpression(
          1,
          createSimpleExpression(`foo`, false)
        )
      }),
      {
        mode: 'module',
        prefixIdentifiers: true
      }
    )
    expect(code).toMatch(`_cache[1] || (_cache[1] = foo)`)
    expect(code).toMatchSnapshot()
  })

  test('CacheExpression w/ isVNode: true', () => {
    const { code } = generate(
      createRoot({
        cached: 1,
        codegenNode: createCacheExpression(
          1,
          createSimpleExpression(`foo`, false),
          true
        )
      }),
      {
        mode: 'module',
        prefixIdentifiers: true
      }
    )
    expect(code).toMatch(
      `
  _cache[1] || (
    _setBlockTracking(-1),
    _cache[1] = foo,
    _setBlockTracking(1),
    _cache[1]
  )
    `.trim()
    )
    expect(code).toMatchSnapshot()
  })

  test('TemplateLiteral', () => {
    const { code } = generate(
      createRoot({
        codegenNode: createCallExpression(`_push`, [
          createTemplateLiteral([
            `foo`,
            createCallExpression(`_renderAttr`, ['id', 'foo']),
            `bar`
          ])
        ])
      }),
      { ssr: true, mode: 'module' }
    )
    expect(code).toMatchInlineSnapshot(`
      "
      export function ssrRender(_ctx, _push, _parent, _attrs) {
        _push(\`foo\${_renderAttr(id, foo)}bar\`)
      }"
    `)
  })

  describe('IfStatement', () => {
    test('if', () => {
      const { code } = generate(
        createRoot({
          codegenNode: createBlockStatement([
            createIfStatement(
              createSimpleExpression('foo', false),
              createBlockStatement([createCallExpression(`ok`)])
            )
          ])
        }),
        { ssr: true, mode: 'module' }
      )
      expect(code).toMatchInlineSnapshot(`
        "
        export function ssrRender(_ctx, _push, _parent, _attrs) {
          if (foo) {
            ok()
          }
        }"
      `)
    })

    test('if/else', () => {
      const { code } = generate(
        createRoot({
          codegenNode: createBlockStatement([
            createIfStatement(
              createSimpleExpression('foo', false),
              createBlockStatement([createCallExpression(`foo`)]),
              createBlockStatement([createCallExpression('bar')])
            )
          ])
        }),
        { ssr: true, mode: 'module' }
      )
      expect(code).toMatchInlineSnapshot(`
        "
        export function ssrRender(_ctx, _push, _parent, _attrs) {
          if (foo) {
            foo()
          } else {
            bar()
          }
        }"
      `)
    })

    test('if/else-if', () => {
      const { code } = generate(
        createRoot({
          codegenNode: createBlockStatement([
            createIfStatement(
              createSimpleExpression('foo', false),
              createBlockStatement([createCallExpression(`foo`)]),
              createIfStatement(
                createSimpleExpression('bar', false),
                createBlockStatement([createCallExpression(`bar`)])
              )
            )
          ])
        }),
        { ssr: true, mode: 'module' }
      )
      expect(code).toMatchInlineSnapshot(`
        "
        export function ssrRender(_ctx, _push, _parent, _attrs) {
          if (foo) {
            foo()
          } else if (bar) {
            bar()
          }
        }"
      `)
    })

    test('if/else-if/else', () => {
      const { code } = generate(
        createRoot({
          codegenNode: createBlockStatement([
            createIfStatement(
              createSimpleExpression('foo', false),
              createBlockStatement([createCallExpression(`foo`)]),
              createIfStatement(
                createSimpleExpression('bar', false),
                createBlockStatement([createCallExpression(`bar`)]),
                createBlockStatement([createCallExpression('baz')])
              )
            )
          ])
        }),
        { ssr: true, mode: 'module' }
      )
      expect(code).toMatchInlineSnapshot(`
        "
        export function ssrRender(_ctx, _push, _parent, _attrs) {
          if (foo) {
            foo()
          } else if (bar) {
            bar()
          } else {
            baz()
          }
        }"
      `)
    })
  })

  test('AssignmentExpression', () => {
    const { code } = generate(
      createRoot({
        codegenNode: createAssignmentExpression(
          createSimpleExpression(`foo`, false),
          createSimpleExpression(`bar`, false)
        )
      })
    )
    expect(code).toMatchInlineSnapshot(`
      "
      return function render(_ctx, _cache) {
        with (_ctx) {
          return foo = bar
        }
      }"
    `)
  })

  describe('VNodeCall', () => {
    function genCode(node: VNodeCall) {
      return generate(
        createRoot({
          codegenNode: node
        })
      ).code.match(/with \(_ctx\) \{\s+([^]+)\s+\}\s+\}$/)![1]
    }

    const mockProps = createObjectExpression([
      createObjectProperty(`foo`, createSimpleExpression(`bar`, true))
    ])
    const mockChildren = createCompoundExpression(['children'])
    const mockDirs = createArrayExpression([
      createArrayExpression([`foo`, createSimpleExpression(`bar`, false)])
    ]) as DirectiveArguments

    test('tag only', () => {
      expect(genCode(createVNodeCall(null, `"div"`))).toMatchInlineSnapshot(`
              "return _createVNode(\\"div\\")
               "
          `)
      expect(genCode(createVNodeCall(null, FRAGMENT))).toMatchInlineSnapshot(`
              "return _createVNode(_Fragment)
               "
          `)
    })

    test('with props', () => {
      expect(genCode(createVNodeCall(null, `"div"`, mockProps)))
        .toMatchInlineSnapshot(`
              "return _createVNode(\\"div\\", { foo: \\"bar\\" })
               "
          `)
    })

    test('with children, no props', () => {
      expect(genCode(createVNodeCall(null, `"div"`, undefined, mockChildren)))
        .toMatchInlineSnapshot(`
        "return _createVNode(\\"div\\", null, children)
         "
      `)
    })

    test('with children + props', () => {
      expect(genCode(createVNodeCall(null, `"div"`, mockProps, mockChildren)))
        .toMatchInlineSnapshot(`
        "return _createVNode(\\"div\\", { foo: \\"bar\\" }, children)
         "
      `)
    })

    test('with patchFlag and no children/props', () => {
      expect(genCode(createVNodeCall(null, `"div"`, undefined, undefined, '1')))
        .toMatchInlineSnapshot(`
        "return _createVNode(\\"div\\", null, null, 1)
         "
      `)
    })

    test('as block', () => {
      expect(
        genCode(
          createVNodeCall(
            null,
            `"div"`,
            mockProps,
            mockChildren,
            undefined,
            undefined,
            undefined,
            true
          )
        )
      ).toMatchInlineSnapshot(`
        "return (_openBlock(), _createBlock(\\"div\\", { foo: \\"bar\\" }, children))
         "
      `)
    })

    test('as for block', () => {
      expect(
        genCode(
          createVNodeCall(
            null,
            `"div"`,
            mockProps,
            mockChildren,
            undefined,
            undefined,
            undefined,
            true,
            true
          )
        )
      ).toMatchInlineSnapshot(`
        "return (_openBlock(true), _createBlock(\\"div\\", { foo: \\"bar\\" }, children))
         "
      `)
    })

    test('with directives', () => {
      expect(
        genCode(
          createVNodeCall(
            null,
            `"div"`,
            mockProps,
            mockChildren,
            undefined,
            undefined,
            mockDirs
          )
        )
      ).toMatchInlineSnapshot(`
        "return _withDirectives(_createVNode(\\"div\\", { foo: \\"bar\\" }, children), [
              [foo, bar]
            ])
         "
      `)
    })

    test('block + directives', () => {
      expect(
        genCode(
          createVNodeCall(
            null,
            `"div"`,
            mockProps,
            mockChildren,
            undefined,
            undefined,
            mockDirs,
            true
          )
        )
      ).toMatchInlineSnapshot(`
        "return _withDirectives((_openBlock(), _createBlock(\\"div\\", { foo: \\"bar\\" }, children)), [
              [foo, bar]
            ])
         "
      `)
    })
  })

  test('custom gen', () => {
    interface VariableDecl {
      type: 'VariableDecl'
      id: string
      init: JSChildNode
      kind: 'const' | 'let'
      loc: SourceLocation
    }
    function createVariableDecl(
      id: VariableDecl['id'],
      init: VariableDecl['init'],
      kind: VariableDecl['kind'] = 'const'
    ) {
      return ({
        type: 'VariableDecl',
        id,
        init,
        kind,
        loc: locStub
      } as unknown) as JSChildNode
    }
    const { code } = generate(
      createRoot({
        codegenNode: createFunctionExpression(
          'obj',
          createSimpleExpression('count', false),
          createBlockStatement([
            createVariableDecl(
              'count',
              createSimpleExpression('obj.foo', false)
            )
          ]),
          true /* newline */
        )
      }),
      {
        customGen(node, context) {
          if (node.type === 'VariableDecl') {
            const { push, newline } = context
            const { id, init, kind } = (node as unknown) as VariableDecl
            push(`${kind} ${id} = `)
            genNode(init, context)
            newline()
          }
        }
      }
    )
    expect(code).toMatchSnapshot()
  })
})
