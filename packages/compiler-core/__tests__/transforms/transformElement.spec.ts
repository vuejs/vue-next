import {
  CompilerOptions,
  baseParse as parse,
  transform,
  ErrorCodes
} from '../../src'
import {
  RESOLVE_COMPONENT,
  CREATE_VNODE,
  MERGE_PROPS,
  RESOLVE_DIRECTIVE,
  TO_HANDLERS,
  helperNameMap,
  TELEPORT,
  RESOLVE_DYNAMIC_COMPONENT,
  SUSPENSE,
  KEEP_ALIVE,
  BASE_TRANSITION
} from '../../src/runtimeHelpers'
import {
  NodeTypes,
  createObjectProperty,
  DirectiveNode,
  RootNode,
  VNodeCall
} from '../../src/ast'
import { transformElement } from '../../src/transforms/transformElement'
import { transformStyle } from '../../../compiler-dom/src/transforms/transformStyle'
import { transformOn } from '../../src/transforms/vOn'
import { transformBind } from '../../src/transforms/vBind'
import { PatchFlags } from '@vue/shared'
import { createObjectMatcher, genFlagText } from '../testUtils'
import { transformText } from '../../src/transforms/transformText'

function parseWithElementTransform(
  template: string,
  options: CompilerOptions = {}
): {
  root: RootNode
  node: VNodeCall
} {
  // wrap raw template in an extra div so that it doesn't get turned into a
  // block as root node
  const ast = parse(`<div>${template}</div>`, options)
  transform(ast, {
    nodeTransforms: [transformElement, transformText],
    ...options
  })
  const codegenNode = (ast as any).children[0].children[0]
    .codegenNode as VNodeCall
  expect(codegenNode.type).toBe(NodeTypes.VNODE_CALL)
  return {
    root: ast,
    node: codegenNode
  }
}

function parseWithBind(template: string) {
  return parseWithElementTransform(template, {
    directiveTransforms: {
      bind: transformBind
    }
  })
}

describe('compiler: element transform', () => {
  test('import + resolve component', () => {
    const { root } = parseWithElementTransform(`<Foo/>`)
    expect(root.helpers).toContain(RESOLVE_COMPONENT)
    expect(root.components).toContain(`Foo`)
  })

  test('resolve implcitly self-referencing component', () => {
    const { root } = parseWithElementTransform(`<Example/>`, {
      filename: `/foo/bar/Example.vue?vue&type=template`
    })
    expect(root.helpers).toContain(RESOLVE_COMPONENT)
    expect(root.components).toContain(`Example__self`)
  })

  test('static props', () => {
    const { node } = parseWithElementTransform(`<div id="foo" class="bar" />`)
    expect(node).toMatchObject({
      tag: `"div"`,
      props: createObjectMatcher({
        id: 'foo',
        class: 'bar'
      }),
      children: undefined
    })
  })

  test('props + children', () => {
    const { node } = parseWithElementTransform(`<div id="foo"><span/></div>`)

    expect(node).toMatchObject({
      tag: `"div"`,
      props: createObjectMatcher({
        id: 'foo'
      }),
      children: [
        {
          type: NodeTypes.ELEMENT,
          tag: 'span',
          codegenNode: {
            type: NodeTypes.VNODE_CALL,
            tag: `"span"`
          }
        }
      ]
    })
  })

  test('0 placeholder for children with no props', () => {
    const { node } = parseWithElementTransform(`<div><span/></div>`)

    expect(node).toMatchObject({
      tag: `"div"`,
      props: undefined,
      children: [
        {
          type: NodeTypes.ELEMENT,
          tag: 'span',
          codegenNode: {
            type: NodeTypes.VNODE_CALL,
            tag: `"span"`
          }
        }
      ]
    })
  })

  test('v-bind="obj"', () => {
    const { root, node } = parseWithElementTransform(`<div v-bind="obj" />`)
    // single v-bind doesn't need mergeProps
    expect(root.helpers).not.toContain(MERGE_PROPS)

    // should directly use `obj` in props position
    expect(node.props).toMatchObject({
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: `obj`
    })
  })

  test('v-bind="obj" after static prop', () => {
    const { root, node } = parseWithElementTransform(
      `<div id="foo" v-bind="obj" />`
    )
    expect(root.helpers).toContain(MERGE_PROPS)

    expect(node.props).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: MERGE_PROPS,
      arguments: [
        createObjectMatcher({
          id: 'foo'
        }),
        {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: `obj`
        }
      ]
    })
  })

  test('v-bind="obj" before static prop', () => {
    const { root, node } = parseWithElementTransform(
      `<div v-bind="obj" id="foo" />`
    )
    expect(root.helpers).toContain(MERGE_PROPS)

    expect(node.props).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: MERGE_PROPS,
      arguments: [
        {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: `obj`
        },
        createObjectMatcher({
          id: 'foo'
        })
      ]
    })
  })

  test('v-bind="obj" between static props', () => {
    const { root, node } = parseWithElementTransform(
      `<div id="foo" v-bind="obj" class="bar" />`
    )
    expect(root.helpers).toContain(MERGE_PROPS)

    expect(node.props).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: MERGE_PROPS,
      arguments: [
        createObjectMatcher({
          id: 'foo'
        }),
        {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: `obj`
        },
        createObjectMatcher({
          class: 'bar'
        })
      ]
    })
  })

  test('v-on="obj"', () => {
    const { root, node } = parseWithElementTransform(
      `<div id="foo" v-on="obj" class="bar" />`
    )
    expect(root.helpers).toContain(MERGE_PROPS)

    expect(node.props).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: MERGE_PROPS,
      arguments: [
        createObjectMatcher({
          id: 'foo'
        }),
        {
          type: NodeTypes.JS_CALL_EXPRESSION,
          callee: TO_HANDLERS,
          arguments: [
            {
              type: NodeTypes.SIMPLE_EXPRESSION,
              content: `obj`
            }
          ]
        },
        createObjectMatcher({
          class: 'bar'
        })
      ]
    })
  })

  test('v-on="obj" + v-bind="obj"', () => {
    const { root, node } = parseWithElementTransform(
      `<div id="foo" v-on="handlers" v-bind="obj" />`
    )
    expect(root.helpers).toContain(MERGE_PROPS)

    expect(node.props).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: MERGE_PROPS,
      arguments: [
        createObjectMatcher({
          id: 'foo'
        }),
        {
          type: NodeTypes.JS_CALL_EXPRESSION,
          callee: TO_HANDLERS,
          arguments: [
            {
              type: NodeTypes.SIMPLE_EXPRESSION,
              content: `handlers`
            }
          ]
        },
        {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: `obj`
        }
      ]
    })
  })

  test('should handle plain <template> as normal element', () => {
    const { node } = parseWithElementTransform(`<template id="foo" />`)

    expect(node).toMatchObject({
      tag: `"template"`,
      props: createObjectMatcher({
        id: 'foo'
      })
    })
  })

  test('should handle <Teleport> with normal children', () => {
    function assert(tag: string) {
      const { root, node } = parseWithElementTransform(
        `<${tag} target="#foo"><span /></${tag}>`
      )
      expect(root.components.length).toBe(0)
      expect(root.helpers).toContain(TELEPORT)

      expect(node).toMatchObject({
        tag: TELEPORT,
        props: createObjectMatcher({
          target: '#foo'
        }),
        children: [
          {
            type: NodeTypes.ELEMENT,
            tag: 'span',
            codegenNode: {
              type: NodeTypes.VNODE_CALL,
              tag: `"span"`
            }
          }
        ]
      })
    }

    assert(`teleport`)
    assert(`Teleport`)
  })

  test('should handle <Suspense>', () => {
    function assert(tag: string, content: string, hasFallback?: boolean) {
      const { root, node } = parseWithElementTransform(
        `<${tag}>${content}</${tag}>`
      )
      expect(root.components.length).toBe(0)
      expect(root.helpers).toContain(SUSPENSE)

      expect(node).toMatchObject({
        tag: SUSPENSE,
        props: undefined,
        children: hasFallback
          ? createObjectMatcher({
              default: {
                type: NodeTypes.JS_FUNCTION_EXPRESSION
              },
              fallback: {
                type: NodeTypes.JS_FUNCTION_EXPRESSION
              },
              _: `[1 /* STABLE */]`
            })
          : createObjectMatcher({
              default: {
                type: NodeTypes.JS_FUNCTION_EXPRESSION
              },
              _: `[1 /* STABLE */]`
            })
      })
    }

    assert(`suspense`, `foo`)
    assert(`suspense`, `<template #default>foo</template>`)
    assert(
      `suspense`,
      `<template #default>foo</template><template #fallback>fallback</template>`,
      true
    )
  })

  test('should handle <KeepAlive>', () => {
    function assert(tag: string) {
      const root = parse(`<div><${tag}><span /></${tag}></div>`)
      transform(root, {
        nodeTransforms: [transformElement, transformText]
      })
      expect(root.components.length).toBe(0)
      expect(root.helpers).toContain(KEEP_ALIVE)
      const node = (root.children[0] as any).children[0].codegenNode
      expect(node).toMatchObject({
        type: NodeTypes.VNODE_CALL,
        tag: KEEP_ALIVE,
        isBlock: true, // should be forced into a block
        props: undefined,
        // keep-alive should not compile content to slots
        children: [{ type: NodeTypes.ELEMENT, tag: 'span' }],
        // should get a dynamic slots flag to force updates
        patchFlag: genFlagText(PatchFlags.DYNAMIC_SLOTS)
      })
    }

    assert(`keep-alive`)
    assert(`KeepAlive`)
  })

  test('should handle <BaseTransition>', () => {
    function assert(tag: string) {
      const { root, node } = parseWithElementTransform(
        `<${tag}><span /></${tag}>`
      )
      expect(root.components.length).toBe(0)
      expect(root.helpers).toContain(BASE_TRANSITION)

      expect(node).toMatchObject({
        tag: BASE_TRANSITION,
        props: undefined,
        children: createObjectMatcher({
          default: {
            type: NodeTypes.JS_FUNCTION_EXPRESSION
          },
          _: `[1 /* STABLE */]`
        })
      })
    }

    assert(`base-transition`)
    assert(`BaseTransition`)
  })

  test('error on v-bind with no argument', () => {
    const onError = jest.fn()
    parseWithElementTransform(`<div v-bind/>`, { onError })
    expect(onError.mock.calls[0]).toMatchObject([
      {
        code: ErrorCodes.X_V_BIND_NO_EXPRESSION
      }
    ])
  })

  test('directiveTransforms', () => {
    let _dir: DirectiveNode
    const { node } = parseWithElementTransform(`<div v-foo:bar="hello" />`, {
      directiveTransforms: {
        foo(dir) {
          _dir = dir
          return {
            props: [createObjectProperty(dir.arg!, dir.exp!)]
          }
        }
      }
    })

    expect(node.props).toMatchObject({
      type: NodeTypes.JS_OBJECT_EXPRESSION,
      properties: [
        {
          type: NodeTypes.JS_PROPERTY,
          key: _dir!.arg,
          value: _dir!.exp
        }
      ]
    })
    // should factor in props returned by custom directive transforms
    // in patchFlag analysis
    expect(node.patchFlag).toMatch(PatchFlags.PROPS + '')
    expect(node.dynamicProps).toMatch(`"bar"`)
  })

  test('directiveTransform with needRuntime: true', () => {
    const { root, node } = parseWithElementTransform(
      `<div v-foo:bar="hello" />`,
      {
        directiveTransforms: {
          foo() {
            return {
              props: [],
              needRuntime: true
            }
          }
        }
      }
    )
    expect(root.helpers).toContain(RESOLVE_DIRECTIVE)
    expect(root.directives).toContain(`foo`)
    expect(node).toMatchObject({
      tag: `"div"`,
      props: undefined,
      children: undefined,
      patchFlag: genFlagText(PatchFlags.NEED_PATCH), // should generate appropriate flag
      directives: {
        type: NodeTypes.JS_ARRAY_EXPRESSION,
        elements: [
          {
            type: NodeTypes.JS_ARRAY_EXPRESSION,
            elements: [
              `_directive_foo`,
              // exp
              {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: `hello`,
                isStatic: false
              },
              // arg
              {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: `bar`,
                isStatic: true
              }
            ]
          }
        ]
      }
    })
  })

  test('directiveTransform with needRuntime: Symbol', () => {
    const { root, node } = parseWithElementTransform(
      `<div v-foo:bar="hello" />`,
      {
        directiveTransforms: {
          foo() {
            return {
              props: [],
              needRuntime: CREATE_VNODE
            }
          }
        }
      }
    )

    expect(root.helpers).toContain(CREATE_VNODE)
    expect(root.helpers).not.toContain(RESOLVE_DIRECTIVE)
    expect(root.directives.length).toBe(0)
    expect(node.directives!.elements[0].elements[0]).toBe(
      `_${helperNameMap[CREATE_VNODE]}`
    )
  })

  test('runtime directives', () => {
    const { root, node } = parseWithElementTransform(
      `<div v-foo v-bar="x" v-baz:[arg].mod.mad="y" />`
    )
    expect(root.helpers).toContain(RESOLVE_DIRECTIVE)
    expect(root.directives).toContain(`foo`)
    expect(root.directives).toContain(`bar`)
    expect(root.directives).toContain(`baz`)

    expect(node).toMatchObject({
      directives: {
        type: NodeTypes.JS_ARRAY_EXPRESSION,
        elements: [
          {
            type: NodeTypes.JS_ARRAY_EXPRESSION,
            elements: [`_directive_foo`]
          },
          {
            type: NodeTypes.JS_ARRAY_EXPRESSION,
            elements: [
              `_directive_bar`,
              // exp
              {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: `x`
              }
            ]
          },
          {
            type: NodeTypes.JS_ARRAY_EXPRESSION,
            elements: [
              `_directive_baz`,
              // exp
              {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: `y`,
                isStatic: false
              },
              // arg
              {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: `arg`,
                isStatic: false
              },
              // modifiers
              {
                type: NodeTypes.JS_OBJECT_EXPRESSION,
                properties: [
                  {
                    type: NodeTypes.JS_PROPERTY,
                    key: {
                      type: NodeTypes.SIMPLE_EXPRESSION,
                      content: `mod`,
                      isStatic: true
                    },
                    value: {
                      type: NodeTypes.SIMPLE_EXPRESSION,
                      content: `true`,
                      isStatic: false
                    }
                  },
                  {
                    type: NodeTypes.JS_PROPERTY,
                    key: {
                      type: NodeTypes.SIMPLE_EXPRESSION,
                      content: `mad`,
                      isStatic: true
                    },
                    value: {
                      type: NodeTypes.SIMPLE_EXPRESSION,
                      content: `true`,
                      isStatic: false
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    })
  })

  test(`props merging: event handlers`, () => {
    const { node } = parseWithElementTransform(
      `<div @click.foo="a" @click.bar="b" />`,
      {
        directiveTransforms: {
          on: transformOn
        }
      }
    )
    expect(node.props).toMatchObject({
      type: NodeTypes.JS_OBJECT_EXPRESSION,
      properties: [
        {
          type: NodeTypes.JS_PROPERTY,
          key: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: `onClick`,
            isStatic: true
          },
          value: {
            type: NodeTypes.JS_ARRAY_EXPRESSION,
            elements: [
              {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: `a`,
                isStatic: false
              },
              {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: `b`,
                isStatic: false
              }
            ]
          }
        }
      ]
    })
  })

  test(`props merging: style`, () => {
    const { node } = parseWithElementTransform(
      `<div style="color: green" :style="{ color: 'red' }" />`,
      {
        nodeTransforms: [transformStyle, transformElement],
        directiveTransforms: {
          bind: transformBind
        }
      }
    )
    expect(node.props).toMatchObject({
      type: NodeTypes.JS_OBJECT_EXPRESSION,
      properties: [
        {
          type: NodeTypes.JS_PROPERTY,
          key: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: `style`,
            isStatic: true
          },
          value: {
            type: NodeTypes.JS_ARRAY_EXPRESSION,
            elements: [
              {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: `{"color":"green"}`,
                isStatic: false
              },
              {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: `{ color: 'red' }`,
                isStatic: false
              }
            ]
          }
        }
      ]
    })
  })

  test(`props merging: class`, () => {
    const { node } = parseWithElementTransform(
      `<div class="foo" :class="{ bar: isBar }" />`,
      {
        directiveTransforms: {
          bind: transformBind
        }
      }
    )
    expect(node.props).toMatchObject({
      type: NodeTypes.JS_OBJECT_EXPRESSION,
      properties: [
        {
          type: NodeTypes.JS_PROPERTY,
          key: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: `class`,
            isStatic: true
          },
          value: {
            type: NodeTypes.JS_ARRAY_EXPRESSION,
            elements: [
              {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: `foo`,
                isStatic: true
              },
              {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: `{ bar: isBar }`,
                isStatic: false
              }
            ]
          }
        }
      ]
    })
  })

  describe('patchFlag analysis', () => {
    test('TEXT', () => {
      const { node } = parseWithBind(`<div>foo</div>`)
      expect(node.patchFlag).toBeUndefined()

      const { node: node2 } = parseWithBind(`<div>{{ foo }}</div>`)
      expect(node2.patchFlag).toBe(genFlagText(PatchFlags.TEXT))

      // multiple nodes, merged with optimize text
      const { node: node3 } = parseWithBind(`<div>foo {{ bar }} baz</div>`)
      expect(node3.patchFlag).toBe(genFlagText(PatchFlags.TEXT))
    })

    test('CLASS', () => {
      const { node } = parseWithBind(`<div :class="foo" />`)
      expect(node.patchFlag).toBe(genFlagText(PatchFlags.CLASS))
    })

    test('STYLE', () => {
      const { node } = parseWithBind(`<div :style="foo" />`)
      expect(node.patchFlag).toBe(genFlagText(PatchFlags.STYLE))
    })

    test('PROPS', () => {
      const { node } = parseWithBind(`<div id="foo" :foo="bar" :baz="qux" />`)
      expect(node.patchFlag).toBe(genFlagText(PatchFlags.PROPS))
      expect(node.dynamicProps).toBe(`["foo", "baz"]`)
    })

    test('CLASS + STYLE + PROPS', () => {
      const { node } = parseWithBind(
        `<div id="foo" :class="cls" :style="styl" :foo="bar" :baz="qux"/>`
      )
      expect(node.patchFlag).toBe(
        genFlagText([PatchFlags.CLASS, PatchFlags.STYLE, PatchFlags.PROPS])
      )
      expect(node.dynamicProps).toBe(`["foo", "baz"]`)
    })

    // should treat `class` and `style` as PROPS
    test('PROPS on component', () => {
      const { node } = parseWithBind(
        `<Foo :id="foo" :class="cls" :style="styl" />`
      )
      expect(node.patchFlag).toBe(genFlagText(PatchFlags.PROPS))
      expect(node.dynamicProps).toBe(`["id", "class", "style"]`)
    })

    test('FULL_PROPS (v-bind)', () => {
      const { node } = parseWithBind(`<div v-bind="foo" />`)
      expect(node.patchFlag).toBe(genFlagText(PatchFlags.FULL_PROPS))
    })

    test('FULL_PROPS (dynamic key)', () => {
      const { node } = parseWithBind(`<div :[foo]="bar" />`)
      expect(node.patchFlag).toBe(genFlagText(PatchFlags.FULL_PROPS))
    })

    test('FULL_PROPS (w/ others)', () => {
      const { node } = parseWithBind(
        `<div id="foo" v-bind="bar" :class="cls" />`
      )
      expect(node.patchFlag).toBe(genFlagText(PatchFlags.FULL_PROPS))
    })

    test('NEED_PATCH (static ref)', () => {
      const { node } = parseWithBind(`<div ref="foo" />`)
      expect(node.patchFlag).toBe(genFlagText(PatchFlags.NEED_PATCH))
    })

    test('NEED_PATCH (dynamic ref)', () => {
      const { node } = parseWithBind(`<div :ref="foo" />`)
      expect(node.patchFlag).toBe(genFlagText(PatchFlags.NEED_PATCH))
    })

    test('NEED_PATCH (custom directives)', () => {
      const { node } = parseWithBind(`<div v-foo />`)
      expect(node.patchFlag).toBe(genFlagText(PatchFlags.NEED_PATCH))
    })

    test('NEED_PATCH (vnode hooks)', () => {
      const { node } = parseWithBind(`<div @vnodeUpdated="foo" />`)
      expect(node.patchFlag).toBe(genFlagText(PatchFlags.NEED_PATCH))
    })

    test('HYDRATE_EVENTS', () => {
      // ignore click events (has dedicated fast path)
      const { node } = parseWithElementTransform(`<div @click="foo" />`, {
        directiveTransforms: {
          on: transformOn
        }
      })
      // should only have props flag
      expect(node.patchFlag).toBe(genFlagText(PatchFlags.PROPS))

      const { node: node2 } = parseWithElementTransform(
        `<div @keyup="foo" />`,
        {
          directiveTransforms: {
            on: transformOn
          }
        }
      )
      expect(node2.patchFlag).toBe(
        genFlagText([PatchFlags.PROPS, PatchFlags.HYDRATE_EVENTS])
      )
    })
  })

  describe('dynamic component', () => {
    test('static binding', () => {
      const { node, root } = parseWithBind(`<component is="foo" />`)
      expect(root.helpers).toContain(RESOLVE_DYNAMIC_COMPONENT)
      expect(node).toMatchObject({
        isBlock: true,
        tag: {
          callee: RESOLVE_DYNAMIC_COMPONENT,
          arguments: [
            {
              type: NodeTypes.SIMPLE_EXPRESSION,
              content: 'foo',
              isStatic: true
            }
          ]
        }
      })
    })

    test('dynamic binding', () => {
      const { node, root } = parseWithBind(`<component :is="foo" />`)
      expect(root.helpers).toContain(RESOLVE_DYNAMIC_COMPONENT)
      expect(node).toMatchObject({
        isBlock: true,
        tag: {
          callee: RESOLVE_DYNAMIC_COMPONENT,
          arguments: [
            {
              type: NodeTypes.SIMPLE_EXPRESSION,
              content: 'foo',
              isStatic: false
            }
          ]
        }
      })
    })

    test('v-is', () => {
      const { node, root } = parseWithBind(`<div v-is="'foo'" />`)
      expect(root.helpers).toContain(RESOLVE_DYNAMIC_COMPONENT)
      expect(node).toMatchObject({
        tag: {
          callee: RESOLVE_DYNAMIC_COMPONENT,
          arguments: [
            {
              type: NodeTypes.SIMPLE_EXPRESSION,
              content: `'foo'`,
              isStatic: false
            }
          ]
        },
        // should skip v-is runtime check
        directives: undefined
      })
    })
  })

  test('<svg> should be forced into blocks', () => {
    const ast = parse(`<div><svg/></div>`)
    transform(ast, {
      nodeTransforms: [transformElement]
    })
    expect((ast as any).children[0].children[0].codegenNode).toMatchObject({
      type: NodeTypes.VNODE_CALL,
      tag: `"svg"`,
      isBlock: true
    })
  })

  // #938
  test('element with dynamic keys should be forced into blocks', () => {
    const ast = parse(`<div><div :key="foo" /></div>`)
    transform(ast, {
      nodeTransforms: [transformElement]
    })
    expect((ast as any).children[0].children[0].codegenNode).toMatchObject({
      type: NodeTypes.VNODE_CALL,
      tag: `"div"`,
      isBlock: true
    })
  })
})
