import {
  CompilerOptions,
  baseParse as parse,
  transform,
  ElementNode,
  NodeTypes,
  ErrorCodes
} from '../../src'
import { transformElement } from '../../src/transforms/transformElement'
import { transformOn } from '../../src/transforms/vOn'
import { transformBind } from '../../src/transforms/vBind'
import { transformExpression } from '../../src/transforms/transformExpression'
import { RENDER_SLOT } from '../../src/runtimeHelpers'
import { transformSlotOutlet } from '../../src/transforms/transformSlotOutlet'

function parseWithSlots(template: string, options: CompilerOptions = {}) {
  const ast = parse(template)
  transform(ast, {
    nodeTransforms: [
      ...(options.prefixIdentifiers ? [transformExpression] : []),
      transformSlotOutlet,
      transformElement
    ],
    directiveTransforms: {
      on: transformOn,
      bind: transformBind
    },
    ...options
  })
  return ast
}

describe('compiler: transform <slot> outlets', () => {
  test('default slot outlet', () => {
    const ast = parseWithSlots(`<slot/>`)
    expect((ast.children[0] as ElementNode).codegenNode).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: RENDER_SLOT,
      arguments: [`$slots`, `"default"`]
    })
  })

  test('statically named slot outlet', () => {
    const ast = parseWithSlots(`<slot name="foo" />`)
    expect((ast.children[0] as ElementNode).codegenNode).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: RENDER_SLOT,
      arguments: [`$slots`, `"foo"`]
    })
  })

  test('dynamically named slot outlet', () => {
    const ast = parseWithSlots(`<slot :name="foo" />`)
    expect((ast.children[0] as ElementNode).codegenNode).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: RENDER_SLOT,
      arguments: [
        `$slots`,
        {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: `foo`,
          isStatic: false
        }
      ]
    })
  })

  test('dynamically named slot outlet w/ prefixIdentifiers: true', () => {
    const ast = parseWithSlots(`<slot :name="foo + bar" />`, {
      prefixIdentifiers: true
    })
    expect((ast.children[0] as ElementNode).codegenNode).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: RENDER_SLOT,
      arguments: [
        `_ctx.$slots`,
        {
          type: NodeTypes.COMPOUND_EXPRESSION,
          children: [
            {
              type: NodeTypes.SIMPLE_EXPRESSION,
              content: `_ctx.foo`,
              isStatic: false
            },
            ` + `,
            {
              type: NodeTypes.SIMPLE_EXPRESSION,
              content: `_ctx.bar`,
              isStatic: false
            }
          ]
        }
      ]
    })
  })

  test('default slot outlet with props', () => {
    const ast = parseWithSlots(
      `<slot foo="bar" :baz="qux" :foo-bar="foo-bar" />`
    )
    expect((ast.children[0] as ElementNode).codegenNode).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: RENDER_SLOT,
      arguments: [
        `$slots`,
        `"default"`,
        {
          type: NodeTypes.JS_OBJECT_EXPRESSION,
          properties: [
            {
              key: {
                content: `foo`,
                isStatic: true
              },
              value: {
                content: `bar`,
                isStatic: true
              }
            },
            {
              key: {
                content: `baz`,
                isStatic: true
              },
              value: {
                content: `qux`,
                isStatic: false
              }
            },
            {
              key: {
                content: `fooBar`,
                isStatic: true
              },
              value: {
                content: `foo-bar`,
                isStatic: false
              }
            }
          ]
        }
      ]
    })
  })

  test('statically named slot outlet with props', () => {
    const ast = parseWithSlots(`<slot name="foo" foo="bar" :baz="qux" />`)
    expect((ast.children[0] as ElementNode).codegenNode).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: RENDER_SLOT,
      arguments: [
        `$slots`,
        `"foo"`,
        {
          type: NodeTypes.JS_OBJECT_EXPRESSION,
          // props should not include name
          properties: [
            {
              key: {
                content: `foo`,
                isStatic: true
              },
              value: {
                content: `bar`,
                isStatic: true
              }
            },
            {
              key: {
                content: `baz`,
                isStatic: true
              },
              value: {
                content: `qux`,
                isStatic: false
              }
            }
          ]
        }
      ]
    })
  })

  test('dynamically named slot outlet with props', () => {
    const ast = parseWithSlots(`<slot :name="foo" foo="bar" :baz="qux" />`)
    expect((ast.children[0] as ElementNode).codegenNode).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: RENDER_SLOT,
      arguments: [
        `$slots`,
        { content: `foo`, isStatic: false },
        {
          type: NodeTypes.JS_OBJECT_EXPRESSION,
          // props should not include name
          properties: [
            {
              key: {
                content: `foo`,
                isStatic: true
              },
              value: {
                content: `bar`,
                isStatic: true
              }
            },
            {
              key: {
                content: `baz`,
                isStatic: true
              },
              value: {
                content: `qux`,
                isStatic: false
              }
            }
          ]
        }
      ]
    })
  })

  test('default slot outlet with fallback', () => {
    const ast = parseWithSlots(`<slot><div/></slot>`)
    expect((ast.children[0] as ElementNode).codegenNode).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: RENDER_SLOT,
      arguments: [
        `$slots`,
        `"default"`,
        `{}`,
        {
          type: NodeTypes.JS_FUNCTION_EXPRESSION,
          params: [],
          returns: [
            {
              type: NodeTypes.ELEMENT,
              tag: `div`
            }
          ]
        }
      ]
    })
  })

  test('named slot outlet with fallback', () => {
    const ast = parseWithSlots(`<slot name="foo"><div/></slot>`)
    expect((ast.children[0] as ElementNode).codegenNode).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: RENDER_SLOT,
      arguments: [
        `$slots`,
        `"foo"`,
        `{}`,
        {
          type: NodeTypes.JS_FUNCTION_EXPRESSION,
          params: [],
          returns: [
            {
              type: NodeTypes.ELEMENT,
              tag: `div`
            }
          ]
        }
      ]
    })
  })

  test('default slot outlet with props & fallback', () => {
    const ast = parseWithSlots(`<slot :foo="bar"><div/></slot>`)
    expect((ast.children[0] as ElementNode).codegenNode).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: RENDER_SLOT,
      arguments: [
        `$slots`,
        `"default"`,
        {
          type: NodeTypes.JS_OBJECT_EXPRESSION,
          properties: [
            {
              key: {
                content: `foo`,
                isStatic: true
              },
              value: {
                content: `bar`,
                isStatic: false
              }
            }
          ]
        },
        {
          type: NodeTypes.JS_FUNCTION_EXPRESSION,
          params: [],
          returns: [
            {
              type: NodeTypes.ELEMENT,
              tag: `div`
            }
          ]
        }
      ]
    })
  })

  test('named slot outlet with props & fallback', () => {
    const ast = parseWithSlots(`<slot name="foo" :foo="bar"><div/></slot>`)
    expect((ast.children[0] as ElementNode).codegenNode).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: RENDER_SLOT,
      arguments: [
        `$slots`,
        `"foo"`,
        {
          type: NodeTypes.JS_OBJECT_EXPRESSION,
          properties: [
            {
              key: {
                content: `foo`,
                isStatic: true
              },
              value: {
                content: `bar`,
                isStatic: false
              }
            }
          ]
        },
        {
          type: NodeTypes.JS_FUNCTION_EXPRESSION,
          params: [],
          returns: [
            {
              type: NodeTypes.ELEMENT,
              tag: `div`
            }
          ]
        }
      ]
    })
  })

  test('slot with slotted: false', async () => {
    const ast = parseWithSlots(`<slot/>`, { slotted: false, scopeId: 'foo' })
    expect((ast.children[0] as ElementNode).codegenNode).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: RENDER_SLOT,
      arguments: [`$slots`, `"default"`, `{}`, `undefined`, `true`]
    })
  })

  test(`error on unexpected custom directive on <slot>`, () => {
    const onError = jest.fn()
    const source = `<slot v-foo />`
    parseWithSlots(source, { onError })
    const index = source.indexOf('v-foo')
    expect(onError.mock.calls[0][0]).toMatchObject({
      code: ErrorCodes.X_V_SLOT_UNEXPECTED_DIRECTIVE_ON_SLOT_OUTLET,
      loc: {
        source: `v-foo`,
        start: {
          offset: index,
          line: 1,
          column: index + 1
        },
        end: {
          offset: index + 5,
          line: 1,
          column: index + 6
        }
      }
    })
  })
})
