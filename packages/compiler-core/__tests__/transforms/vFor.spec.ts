import { baseParse as parse } from '../../src/parse'
import { transform } from '../../src/transform'
import { transformIf } from '../../src/transforms/vIf'
import { transformFor } from '../../src/transforms/vFor'
import { transformBind } from '../../src/transforms/vBind'
import { transformElement } from '../../src/transforms/transformElement'
import { transformSlotOutlet } from '../../src/transforms/transformSlotOutlet'
import { transformExpression } from '../../src/transforms/transformExpression'
import {
  ForNode,
  NodeTypes,
  SimpleExpressionNode,
  ElementNode,
  InterpolationNode,
  ForCodegenNode,
  ConstantTypes
} from '../../src/ast'
import { ErrorCodes } from '../../src/errors'
import { CompilerOptions, generate } from '../../src'
import {
  CREATE_VNODE,
  FRAGMENT,
  RENDER_LIST,
  RENDER_SLOT
} from '../../src/runtimeHelpers'
import { PatchFlags } from '@vue/shared'
import { createObjectMatcher, genFlagText } from '../testUtils'

function parseWithForTransform(
  template: string,
  options: CompilerOptions = {}
) {
  const ast = parse(template, options)
  transform(ast, {
    nodeTransforms: [
      transformIf,
      transformFor,
      ...(options.prefixIdentifiers ? [transformExpression] : []),
      transformSlotOutlet,
      transformElement
    ],
    directiveTransforms: {
      bind: transformBind
    },
    ...options
  })
  return {
    root: ast,
    node: ast.children[0] as ForNode & { codegenNode: ForCodegenNode }
  }
}

describe('compiler: v-for', () => {
  describe('transform', () => {
    test('number expression', () => {
      const { node: forNode } = parseWithForTransform(
        '<span v-for="index in 5" />'
      )
      expect(forNode.keyAlias).toBeUndefined()
      expect(forNode.objectIndexAlias).toBeUndefined()
      expect((forNode.valueAlias as SimpleExpressionNode).content).toBe('index')
      expect((forNode.source as SimpleExpressionNode).content).toBe('5')
    })

    test('value', () => {
      const { node: forNode } = parseWithForTransform(
        '<span v-for="(item) in items" />'
      )
      expect(forNode.keyAlias).toBeUndefined()
      expect(forNode.objectIndexAlias).toBeUndefined()
      expect((forNode.valueAlias as SimpleExpressionNode).content).toBe('item')
      expect((forNode.source as SimpleExpressionNode).content).toBe('items')
    })

    test('object de-structured value', () => {
      const { node: forNode } = parseWithForTransform(
        '<span v-for="({ id, value }) in items" />'
      )
      expect(forNode.keyAlias).toBeUndefined()
      expect(forNode.objectIndexAlias).toBeUndefined()
      expect((forNode.valueAlias as SimpleExpressionNode).content).toBe(
        '{ id, value }'
      )
      expect((forNode.source as SimpleExpressionNode).content).toBe('items')
    })

    test('array de-structured value', () => {
      const { node: forNode } = parseWithForTransform(
        '<span v-for="([ id, value ]) in items" />'
      )
      expect(forNode.keyAlias).toBeUndefined()
      expect(forNode.objectIndexAlias).toBeUndefined()
      expect((forNode.valueAlias as SimpleExpressionNode).content).toBe(
        '[ id, value ]'
      )
      expect((forNode.source as SimpleExpressionNode).content).toBe('items')
    })

    test('value and key', () => {
      const { node: forNode } = parseWithForTransform(
        '<span v-for="(item, key) in items" />'
      )
      expect(forNode.keyAlias).not.toBeUndefined()
      expect((forNode.keyAlias as SimpleExpressionNode).content).toBe('key')
      expect(forNode.objectIndexAlias).toBeUndefined()
      expect((forNode.valueAlias as SimpleExpressionNode).content).toBe('item')
      expect((forNode.source as SimpleExpressionNode).content).toBe('items')
    })

    test('value, key and index', () => {
      const { node: forNode } = parseWithForTransform(
        '<span v-for="(value, key, index) in items" />'
      )
      expect(forNode.keyAlias).not.toBeUndefined()
      expect((forNode.keyAlias as SimpleExpressionNode).content).toBe('key')
      expect(forNode.objectIndexAlias).not.toBeUndefined()
      expect((forNode.objectIndexAlias as SimpleExpressionNode).content).toBe(
        'index'
      )
      expect((forNode.valueAlias as SimpleExpressionNode).content).toBe('value')
      expect((forNode.source as SimpleExpressionNode).content).toBe('items')
    })

    test('skipped key', () => {
      const { node: forNode } = parseWithForTransform(
        '<span v-for="(value,,index) in items" />'
      )
      expect(forNode.keyAlias).toBeUndefined()
      expect(forNode.objectIndexAlias).not.toBeUndefined()
      expect((forNode.objectIndexAlias as SimpleExpressionNode).content).toBe(
        'index'
      )
      expect((forNode.valueAlias as SimpleExpressionNode).content).toBe('value')
      expect((forNode.source as SimpleExpressionNode).content).toBe('items')
    })

    test('skipped value and key', () => {
      const { node: forNode } = parseWithForTransform(
        '<span v-for="(,,index) in items" />'
      )
      expect(forNode.keyAlias).toBeUndefined()
      expect(forNode.objectIndexAlias).not.toBeUndefined()
      expect((forNode.objectIndexAlias as SimpleExpressionNode).content).toBe(
        'index'
      )
      expect(forNode.valueAlias).toBeUndefined()
      expect((forNode.source as SimpleExpressionNode).content).toBe('items')
    })

    test('unbracketed value', () => {
      const { node: forNode } = parseWithForTransform(
        '<span v-for="item in items" />'
      )
      expect(forNode.keyAlias).toBeUndefined()
      expect(forNode.objectIndexAlias).toBeUndefined()
      expect((forNode.valueAlias as SimpleExpressionNode).content).toBe('item')
      expect((forNode.source as SimpleExpressionNode).content).toBe('items')
    })

    test('unbracketed value and key', () => {
      const { node: forNode } = parseWithForTransform(
        '<span v-for="item, key in items" />'
      )
      expect(forNode.keyAlias).not.toBeUndefined()
      expect((forNode.keyAlias as SimpleExpressionNode).content).toBe('key')
      expect(forNode.objectIndexAlias).toBeUndefined()
      expect((forNode.valueAlias as SimpleExpressionNode).content).toBe('item')
      expect((forNode.source as SimpleExpressionNode).content).toBe('items')
    })

    test('unbracketed value, key and index', () => {
      const { node: forNode } = parseWithForTransform(
        '<span v-for="value, key, index in items" />'
      )
      expect(forNode.keyAlias).not.toBeUndefined()
      expect((forNode.keyAlias as SimpleExpressionNode).content).toBe('key')
      expect(forNode.objectIndexAlias).not.toBeUndefined()
      expect((forNode.objectIndexAlias as SimpleExpressionNode).content).toBe(
        'index'
      )
      expect((forNode.valueAlias as SimpleExpressionNode).content).toBe('value')
      expect((forNode.source as SimpleExpressionNode).content).toBe('items')
    })

    test('unbracketed skipped key', () => {
      const { node: forNode } = parseWithForTransform(
        '<span v-for="value, , index in items" />'
      )
      expect(forNode.keyAlias).toBeUndefined()
      expect(forNode.objectIndexAlias).not.toBeUndefined()
      expect((forNode.objectIndexAlias as SimpleExpressionNode).content).toBe(
        'index'
      )
      expect((forNode.valueAlias as SimpleExpressionNode).content).toBe('value')
      expect((forNode.source as SimpleExpressionNode).content).toBe('items')
    })

    test('unbracketed skipped value and key', () => {
      const { node: forNode } = parseWithForTransform(
        '<span v-for=", , index in items" />'
      )
      expect(forNode.keyAlias).toBeUndefined()
      expect(forNode.objectIndexAlias).not.toBeUndefined()
      expect((forNode.objectIndexAlias as SimpleExpressionNode).content).toBe(
        'index'
      )
      expect(forNode.valueAlias).toBeUndefined()
      expect((forNode.source as SimpleExpressionNode).content).toBe('items')
    })
  })

  describe('errors', () => {
    test('missing expression', () => {
      const onError = jest.fn()
      parseWithForTransform('<span v-for />', { onError })

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ErrorCodes.X_V_FOR_NO_EXPRESSION
        })
      )
    })

    test('empty expression', () => {
      const onError = jest.fn()
      parseWithForTransform('<span v-for="" />', { onError })

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ErrorCodes.X_V_FOR_MALFORMED_EXPRESSION
        })
      )
    })

    test('invalid expression', () => {
      const onError = jest.fn()
      parseWithForTransform('<span v-for="items" />', { onError })

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ErrorCodes.X_V_FOR_MALFORMED_EXPRESSION
        })
      )
    })

    test('missing source', () => {
      const onError = jest.fn()
      parseWithForTransform('<span v-for="item in" />', { onError })

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ErrorCodes.X_V_FOR_MALFORMED_EXPRESSION
        })
      )
    })

    test('missing value', () => {
      const onError = jest.fn()
      parseWithForTransform('<span v-for="in items" />', { onError })

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ErrorCodes.X_V_FOR_MALFORMED_EXPRESSION
        })
      )
    })

    test('<template v-for> key placement', () => {
      const onError = jest.fn()
      parseWithForTransform(
        `
      <template v-for="item in items">
        <div :key="item.id"/>
      </template>`,
        { onError }
      )

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ErrorCodes.X_V_FOR_TEMPLATE_KEY_PLACEMENT
        })
      )

      // should not warn on nested v-for keys
      parseWithForTransform(
        `
      <template v-for="item in items">
        <div v-for="c in item.children" :key="c.id"/>
      </template>`,
        { onError }
      )
      expect(onError).toHaveBeenCalledTimes(1)
    })
  })

  describe('source location', () => {
    test('value & source', () => {
      const source = '<span v-for="item in items" />'
      const { node: forNode } = parseWithForTransform(source)

      const itemOffset = source.indexOf('item')
      const value = forNode.valueAlias as SimpleExpressionNode
      expect((forNode.valueAlias as SimpleExpressionNode).content).toBe('item')
      expect(value.loc.start.offset).toBe(itemOffset)
      expect(value.loc.start.line).toBe(1)
      expect(value.loc.start.column).toBe(itemOffset + 1)
      expect(value.loc.end.line).toBe(1)
      expect(value.loc.end.column).toBe(itemOffset + 1 + `item`.length)

      const itemsOffset = source.indexOf('items')
      expect((forNode.source as SimpleExpressionNode).content).toBe('items')
      expect(forNode.source.loc.start.offset).toBe(itemsOffset)
      expect(forNode.source.loc.start.line).toBe(1)
      expect(forNode.source.loc.start.column).toBe(itemsOffset + 1)
      expect(forNode.source.loc.end.line).toBe(1)
      expect(forNode.source.loc.end.column).toBe(
        itemsOffset + 1 + `items`.length
      )
    })

    test('bracketed value', () => {
      const source = '<span v-for="( item ) in items" />'
      const { node: forNode } = parseWithForTransform(source)

      const itemOffset = source.indexOf('item')
      const value = forNode.valueAlias as SimpleExpressionNode
      expect(value.content).toBe('item')
      expect(value.loc.start.offset).toBe(itemOffset)
      expect(value.loc.start.line).toBe(1)
      expect(value.loc.start.column).toBe(itemOffset + 1)
      expect(value.loc.end.line).toBe(1)
      expect(value.loc.end.column).toBe(itemOffset + 1 + `item`.length)

      const itemsOffset = source.indexOf('items')
      expect((forNode.source as SimpleExpressionNode).content).toBe('items')
      expect(forNode.source.loc.start.offset).toBe(itemsOffset)
      expect(forNode.source.loc.start.line).toBe(1)
      expect(forNode.source.loc.start.column).toBe(itemsOffset + 1)
      expect(forNode.source.loc.end.line).toBe(1)
      expect(forNode.source.loc.end.column).toBe(
        itemsOffset + 1 + `items`.length
      )
    })

    test('de-structured value', () => {
      const source = '<span v-for="(  { id, key }) in items" />'
      const { node: forNode } = parseWithForTransform(source)

      const value = forNode.valueAlias as SimpleExpressionNode
      const valueIndex = source.indexOf('{ id, key }')
      expect(value.content).toBe('{ id, key }')
      expect(value.loc.start.offset).toBe(valueIndex)
      expect(value.loc.start.line).toBe(1)
      expect(value.loc.start.column).toBe(valueIndex + 1)
      expect(value.loc.end.line).toBe(1)
      expect(value.loc.end.column).toBe(valueIndex + 1 + '{ id, key }'.length)

      const itemsOffset = source.indexOf('items')
      expect((forNode.source as SimpleExpressionNode).content).toBe('items')
      expect(forNode.source.loc.start.offset).toBe(itemsOffset)
      expect(forNode.source.loc.start.line).toBe(1)
      expect(forNode.source.loc.start.column).toBe(itemsOffset + 1)
      expect(forNode.source.loc.end.line).toBe(1)
      expect(forNode.source.loc.end.column).toBe(
        itemsOffset + 1 + `items`.length
      )
    })

    test('bracketed value, key, index', () => {
      const source = '<span v-for="( item, key, index ) in items" />'
      const { node: forNode } = parseWithForTransform(source)

      const itemOffset = source.indexOf('item')
      const value = forNode.valueAlias as SimpleExpressionNode
      expect(value.content).toBe('item')
      expect(value.loc.start.offset).toBe(itemOffset)
      expect(value.loc.start.line).toBe(1)
      expect(value.loc.start.column).toBe(itemOffset + 1)
      expect(value.loc.end.line).toBe(1)
      expect(value.loc.end.column).toBe(itemOffset + 1 + `item`.length)

      const keyOffset = source.indexOf('key')
      const key = forNode.keyAlias as SimpleExpressionNode
      expect(key.content).toBe('key')
      expect(key.loc.start.offset).toBe(keyOffset)
      expect(key.loc.start.line).toBe(1)
      expect(key.loc.start.column).toBe(keyOffset + 1)
      expect(key.loc.end.line).toBe(1)
      expect(key.loc.end.column).toBe(keyOffset + 1 + `key`.length)

      const indexOffset = source.indexOf('index')
      const index = forNode.objectIndexAlias as SimpleExpressionNode
      expect(index.content).toBe('index')
      expect(index.loc.start.offset).toBe(indexOffset)
      expect(index.loc.start.line).toBe(1)
      expect(index.loc.start.column).toBe(indexOffset + 1)
      expect(index.loc.end.line).toBe(1)
      expect(index.loc.end.column).toBe(indexOffset + 1 + `index`.length)

      const itemsOffset = source.indexOf('items')
      expect((forNode.source as SimpleExpressionNode).content).toBe('items')
      expect(forNode.source.loc.start.offset).toBe(itemsOffset)
      expect(forNode.source.loc.start.line).toBe(1)
      expect(forNode.source.loc.start.column).toBe(itemsOffset + 1)
      expect(forNode.source.loc.end.line).toBe(1)
      expect(forNode.source.loc.end.column).toBe(
        itemsOffset + 1 + `items`.length
      )
    })

    test('skipped key', () => {
      const source = '<span v-for="( item,, index ) in items" />'
      const { node: forNode } = parseWithForTransform(source)

      const itemOffset = source.indexOf('item')
      const value = forNode.valueAlias as SimpleExpressionNode
      expect(value.content).toBe('item')
      expect(value.loc.start.offset).toBe(itemOffset)
      expect(value.loc.start.line).toBe(1)
      expect(value.loc.start.column).toBe(itemOffset + 1)
      expect(value.loc.end.line).toBe(1)
      expect(value.loc.end.column).toBe(itemOffset + 1 + `item`.length)

      const indexOffset = source.indexOf('index')
      const index = forNode.objectIndexAlias as SimpleExpressionNode
      expect(index.content).toBe('index')
      expect(index.loc.start.offset).toBe(indexOffset)
      expect(index.loc.start.line).toBe(1)
      expect(index.loc.start.column).toBe(indexOffset + 1)
      expect(index.loc.end.line).toBe(1)
      expect(index.loc.end.column).toBe(indexOffset + 1 + `index`.length)

      const itemsOffset = source.indexOf('items')
      expect((forNode.source as SimpleExpressionNode).content).toBe('items')
      expect(forNode.source.loc.start.offset).toBe(itemsOffset)
      expect(forNode.source.loc.start.line).toBe(1)
      expect(forNode.source.loc.start.column).toBe(itemsOffset + 1)
      expect(forNode.source.loc.end.line).toBe(1)
      expect(forNode.source.loc.end.column).toBe(
        itemsOffset + 1 + `items`.length
      )
    })
  })

  describe('prefixIdentifiers: true', () => {
    test('should prefix v-for source', () => {
      const { node } = parseWithForTransform(`<div v-for="i in list"/>`, {
        prefixIdentifiers: true
      })
      expect(node.source).toMatchObject({
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: `_ctx.list`
      })
    })

    test('should prefix v-for source w/ complex expression', () => {
      const { node } = parseWithForTransform(
        `<div v-for="i in list.concat([foo])"/>`,
        { prefixIdentifiers: true }
      )
      expect(node.source).toMatchObject({
        type: NodeTypes.COMPOUND_EXPRESSION,
        children: [
          { content: `_ctx.list` },
          `.`,
          { content: `concat` },
          `([`,
          { content: `_ctx.foo` },
          `])`
        ]
      })
    })

    test('should not prefix v-for alias', () => {
      const { node } = parseWithForTransform(
        `<div v-for="i in list">{{ i }}{{ j }}</div>`,
        { prefixIdentifiers: true }
      )
      const div = node.children[0] as ElementNode
      expect((div.children[0] as InterpolationNode).content).toMatchObject({
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: `i`
      })
      expect((div.children[1] as InterpolationNode).content).toMatchObject({
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: `_ctx.j`
      })
    })

    test('should not prefix v-for aliases (multiple)', () => {
      const { node } = parseWithForTransform(
        `<div v-for="(i, j, k) in list">{{ i + j + k }}{{ l }}</div>`,
        { prefixIdentifiers: true }
      )
      const div = node.children[0] as ElementNode
      expect((div.children[0] as InterpolationNode).content).toMatchObject({
        type: NodeTypes.COMPOUND_EXPRESSION,
        children: [
          { content: `i` },
          ` + `,
          { content: `j` },
          ` + `,
          { content: `k` }
        ]
      })
      expect((div.children[1] as InterpolationNode).content).toMatchObject({
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: `_ctx.l`
      })
    })

    test('should prefix id outside of v-for', () => {
      const { node } = parseWithForTransform(
        `<div><div v-for="i in list" />{{ i }}</div>`,
        { prefixIdentifiers: true }
      )
      expect((node.children[1] as InterpolationNode).content).toMatchObject({
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: `_ctx.i`
      })
    })

    test('nested v-for', () => {
      const { node } = parseWithForTransform(
        `<div v-for="i in list">
          <div v-for="i in list">{{ i + j }}</div>{{ i }}
        </div>`,
        { prefixIdentifiers: true }
      )
      const outerDiv = node.children[0] as ElementNode
      const innerFor = outerDiv.children[0] as ForNode
      const innerExp = (innerFor.children[0] as ElementNode)
        .children[0] as InterpolationNode
      expect(innerExp.content).toMatchObject({
        type: NodeTypes.COMPOUND_EXPRESSION,
        children: [{ content: 'i' }, ` + `, { content: `_ctx.j` }]
      })

      // when an inner v-for shadows a variable of an outer v-for and exit,
      // it should not cause the outer v-for's alias to be removed from known ids
      const outerExp = outerDiv.children[1] as InterpolationNode
      expect(outerExp.content).toMatchObject({
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: `i`
      })
    })

    test('v-for aliases w/ complex expressions', () => {
      const { node } = parseWithForTransform(
        `<div v-for="({ foo = bar, baz: [qux = quux] }) in list">
          {{ foo + bar + baz + qux + quux }}
        </div>`,
        { prefixIdentifiers: true }
      )
      expect(node.valueAlias!).toMatchObject({
        type: NodeTypes.COMPOUND_EXPRESSION,
        children: [
          `{ `,
          { content: `foo` },
          ` = `,
          { content: `_ctx.bar` },
          `, baz: [`,
          { content: `qux` },
          ` = `,
          { content: `_ctx.quux` },
          `] }`
        ]
      })
      const div = node.children[0] as ElementNode
      expect((div.children[0] as InterpolationNode).content).toMatchObject({
        type: NodeTypes.COMPOUND_EXPRESSION,
        children: [
          { content: `foo` },
          ` + `,
          { content: `_ctx.bar` },
          ` + `,
          { content: `_ctx.baz` },
          ` + `,
          { content: `qux` },
          ` + `,
          { content: `_ctx.quux` }
        ]
      })
    })

    test('element v-for key expression prefixing', () => {
      const {
        node: { codegenNode }
      } = parseWithForTransform(
        '<div v-for="item in items" :key="itemKey(item)">test</div>',
        { prefixIdentifiers: true }
      )
      const innerBlock = codegenNode.children.arguments[1].returns
      expect(innerBlock).toMatchObject({
        type: NodeTypes.VNODE_CALL,
        tag: `"div"`,
        props: createObjectMatcher({
          key: {
            type: NodeTypes.COMPOUND_EXPRESSION,
            children: [
              // should prefix outer scope references
              { content: `_ctx.itemKey` },
              `(`,
              // should NOT prefix in scope variables
              { content: `item` },
              `)`
            ]
          }
        })
      })
    })

    // #2085
    test('template v-for key expression prefixing', () => {
      const {
        node: { codegenNode }
      } = parseWithForTransform(
        '<template v-for="item in items" :key="itemKey(item)">test</template>',
        { prefixIdentifiers: true }
      )
      const innerBlock = codegenNode.children.arguments[1].returns
      expect(innerBlock).toMatchObject({
        type: NodeTypes.VNODE_CALL,
        tag: FRAGMENT,
        props: createObjectMatcher({
          key: {
            type: NodeTypes.COMPOUND_EXPRESSION,
            children: [
              // should prefix outer scope references
              { content: `_ctx.itemKey` },
              `(`,
              // should NOT prefix in scope variables
              { content: `item` },
              `)`
            ]
          }
        })
      })
    })
  })

  describe('codegen', () => {
    function assertSharedCodegen(
      node: ForCodegenNode,
      keyed: boolean = false,
      customReturn: boolean = false,
      disableTracking: boolean = true
    ) {
      expect(node).toMatchObject({
        type: NodeTypes.VNODE_CALL,
        tag: FRAGMENT,
        disableTracking,
        patchFlag: !disableTracking
          ? genFlagText(PatchFlags.STABLE_FRAGMENT)
          : keyed
            ? genFlagText(PatchFlags.KEYED_FRAGMENT)
            : genFlagText(PatchFlags.UNKEYED_FRAGMENT),
        children: {
          type: NodeTypes.JS_CALL_EXPRESSION,
          callee: RENDER_LIST,
          arguments: [
            {}, // to be asserted by each test
            {
              type: NodeTypes.JS_FUNCTION_EXPRESSION,
              returns: customReturn
                ? {}
                : {
                    type: NodeTypes.VNODE_CALL,
                    isBlock: disableTracking
                  }
            }
          ]
        }
      })
      const renderListArgs = node.children.arguments
      return {
        source: renderListArgs[0] as SimpleExpressionNode,
        params: (renderListArgs[1] as any).params,
        returns: (renderListArgs[1] as any).returns,
        innerVNodeCall: customReturn ? null : (renderListArgs[1] as any).returns
      }
    }

    test('basic v-for', () => {
      const {
        root,
        node: { codegenNode }
      } = parseWithForTransform('<span v-for="(item) in items" />')
      expect(assertSharedCodegen(codegenNode)).toMatchObject({
        source: { content: `items` },
        params: [{ content: `item` }],
        innerVNodeCall: {
          tag: `"span"`
        }
      })
      expect(generate(root).code).toMatchSnapshot()
    })

    test('value + key + index', () => {
      const {
        root,
        node: { codegenNode }
      } = parseWithForTransform('<span v-for="(item, key, index) in items" />')
      expect(assertSharedCodegen(codegenNode)).toMatchObject({
        source: { content: `items` },
        params: [{ content: `item` }, { content: `key` }, { content: `index` }]
      })
      expect(generate(root).code).toMatchSnapshot()
    })

    test('skipped value', () => {
      const {
        root,
        node: { codegenNode }
      } = parseWithForTransform('<span v-for="(, key, index) in items" />')
      expect(assertSharedCodegen(codegenNode)).toMatchObject({
        source: { content: `items` },
        params: [{ content: `_` }, { content: `key` }, { content: `index` }]
      })
      expect(generate(root).code).toMatchSnapshot()
    })

    test('skipped key', () => {
      const {
        root,
        node: { codegenNode }
      } = parseWithForTransform('<span v-for="(item,,index) in items" />')
      expect(assertSharedCodegen(codegenNode)).toMatchObject({
        source: { content: `items` },
        params: [{ content: `item` }, { content: `__` }, { content: `index` }]
      })
      expect(generate(root).code).toMatchSnapshot()
    })

    test('skipped value & key', () => {
      const {
        root,
        node: { codegenNode }
      } = parseWithForTransform('<span v-for="(,,index) in items" />')
      expect(assertSharedCodegen(codegenNode)).toMatchObject({
        source: { content: `items` },
        params: [{ content: `_` }, { content: `__` }, { content: `index` }]
      })
      expect(generate(root).code).toMatchSnapshot()
    })

    test('v-for with constant expression', () => {
      const {
        root,
        node: { codegenNode }
      } = parseWithForTransform('<p v-for="item in 10">{{item}}</p>', {
        prefixIdentifiers: true
      })

      expect(
        assertSharedCodegen(
          codegenNode,
          false /* keyed */,
          false /* customReturn */,
          false /* disableTracking */
        )
      ).toMatchObject({
        source: { content: `10`, constType: ConstantTypes.CAN_STRINGIFY },
        params: [{ content: `item` }],
        innerVNodeCall: {
          tag: `"p"`,
          props: undefined,
          isBlock: false,
          children: {
            type: NodeTypes.INTERPOLATION,
            content: {
              type: NodeTypes.SIMPLE_EXPRESSION,
              content: 'item',
              isStatic: false,
              constType: ConstantTypes.NOT_CONSTANT
            }
          },
          patchFlag: genFlagText(PatchFlags.TEXT)
        }
      })
      expect(root.helpers).toContain(CREATE_VNODE)
      expect(generate(root).code).toMatchSnapshot()
    })

    test('template v-for', () => {
      const {
        root,
        node: { codegenNode }
      } = parseWithForTransform(
        '<template v-for="item in items">hello<span/></template>'
      )
      expect(assertSharedCodegen(codegenNode)).toMatchObject({
        source: { content: `items` },
        params: [{ content: `item` }],
        innerVNodeCall: {
          tag: FRAGMENT,
          props: undefined,
          isBlock: true,
          children: [
            { type: NodeTypes.TEXT, content: `hello` },
            { type: NodeTypes.ELEMENT, tag: `span` }
          ],
          patchFlag: genFlagText(PatchFlags.STABLE_FRAGMENT)
        }
      })
      expect(generate(root).code).toMatchSnapshot()
    })

    test('template v-for w/ <slot/>', () => {
      const {
        root,
        node: { codegenNode }
      } = parseWithForTransform(
        '<template v-for="item in items"><slot/></template>'
      )
      expect(
        assertSharedCodegen(codegenNode, false, true /* custom return */)
      ).toMatchObject({
        source: { content: `items` },
        params: [{ content: `item` }],
        returns: {
          type: NodeTypes.JS_CALL_EXPRESSION,
          callee: RENDER_SLOT
        }
      })
      expect(generate(root).code).toMatchSnapshot()
    })

    // #1907
    test('template v-for key injection with single child', () => {
      const {
        root,
        node: { codegenNode }
      } = parseWithForTransform(
        '<template v-for="item in items" :key="item.id"><span :id="item.id" /></template>'
      )
      expect(assertSharedCodegen(codegenNode, true)).toMatchObject({
        source: { content: `items` },
        params: [{ content: `item` }],
        innerVNodeCall: {
          type: NodeTypes.VNODE_CALL,
          tag: `"span"`,
          props: createObjectMatcher({
            key: '[item.id]',
            id: '[item.id]'
          })
        }
      })
      expect(generate(root).code).toMatchSnapshot()
    })

    test('v-for on <slot/>', () => {
      const {
        root,
        node: { codegenNode }
      } = parseWithForTransform('<slot v-for="item in items"></slot>')
      expect(
        assertSharedCodegen(codegenNode, false, true /* custom return */)
      ).toMatchObject({
        source: { content: `items` },
        params: [{ content: `item` }],
        returns: {
          type: NodeTypes.JS_CALL_EXPRESSION,
          callee: RENDER_SLOT
        }
      })
      expect(generate(root).code).toMatchSnapshot()
    })

    test('keyed v-for', () => {
      const {
        root,
        node: { codegenNode }
      } = parseWithForTransform('<span v-for="(item) in items" :key="item" />')
      expect(assertSharedCodegen(codegenNode, true)).toMatchObject({
        source: { content: `items` },
        params: [{ content: `item` }],
        innerVNodeCall: {
          tag: `"span"`,
          props: createObjectMatcher({
            key: `[item]`
          })
        }
      })
      expect(generate(root).code).toMatchSnapshot()
    })

    test('keyed v-for (stable fragment)', () => {
      const {
        root,
        node: { codegenNode }
      } = parseWithForTransform('<span v-for="(item) in 10" :key="item" />', {
        prefixIdentifiers: true
      })
      expect(
        assertSharedCodegen(codegenNode, true, false, false)
      ).toMatchObject({
        source: { content: `10` },
        params: [{ content: `item` }],
        innerVNodeCall: {
          tag: `"span"`,
          props: createObjectMatcher({
            key: `[item]`
          })
        }
      })
      expect(generate(root).code).toMatchSnapshot()
    })

    test('keyed template v-for', () => {
      const {
        root,
        node: { codegenNode }
      } = parseWithForTransform(
        '<template v-for="item in items" :key="item">hello<span/></template>'
      )
      expect(assertSharedCodegen(codegenNode, true)).toMatchObject({
        source: { content: `items` },
        params: [{ content: `item` }],
        innerVNodeCall: {
          tag: FRAGMENT,
          props: createObjectMatcher({
            key: `[item]`
          }),
          children: [
            { type: NodeTypes.TEXT, content: `hello` },
            { type: NodeTypes.ELEMENT, tag: `span` }
          ],
          patchFlag: genFlagText(PatchFlags.STABLE_FRAGMENT)
        }
      })
      expect(generate(root).code).toMatchSnapshot()
    })

    test('v-if + v-for', () => {
      const {
        root,
        node: { codegenNode }
      } = parseWithForTransform(`<div v-if="ok" v-for="i in list"/>`)
      expect(codegenNode).toMatchObject({
        type: NodeTypes.JS_CONDITIONAL_EXPRESSION,
        test: { content: `ok` },
        consequent: {
          type: NodeTypes.VNODE_CALL,
          props: createObjectMatcher({
            key: `[0]`
          }),
          isBlock: true,
          disableTracking: true,
          patchFlag: genFlagText(PatchFlags.UNKEYED_FRAGMENT),
          children: {
            type: NodeTypes.JS_CALL_EXPRESSION,
            callee: RENDER_LIST,
            arguments: [
              { content: `list` },
              {
                type: NodeTypes.JS_FUNCTION_EXPRESSION,
                params: [{ content: `i` }],
                returns: {
                  type: NodeTypes.VNODE_CALL,
                  tag: `"div"`,
                  isBlock: true
                }
              }
            ]
          }
        }
      })
      expect(generate(root).code).toMatchSnapshot()
    })

    // 1637
    test('v-if + v-for on <template>', () => {
      const {
        root,
        node: { codegenNode }
      } = parseWithForTransform(`<template v-if="ok" v-for="i in list"/>`)
      expect(codegenNode).toMatchObject({
        type: NodeTypes.JS_CONDITIONAL_EXPRESSION,
        test: { content: `ok` },
        consequent: {
          type: NodeTypes.VNODE_CALL,
          props: createObjectMatcher({
            key: `[0]`
          }),
          isBlock: true,
          disableTracking: true,
          patchFlag: genFlagText(PatchFlags.UNKEYED_FRAGMENT),
          children: {
            type: NodeTypes.JS_CALL_EXPRESSION,
            callee: RENDER_LIST,
            arguments: [
              { content: `list` },
              {
                type: NodeTypes.JS_FUNCTION_EXPRESSION,
                params: [{ content: `i` }],
                returns: {
                  type: NodeTypes.VNODE_CALL,
                  tag: FRAGMENT,
                  isBlock: true
                }
              }
            ]
          }
        }
      })
      expect(generate(root).code).toMatchSnapshot()
    })

    test('v-for on element with custom directive', () => {
      const {
        root,
        node: { codegenNode }
      } = parseWithForTransform('<div v-for="i in list" v-foo/>')
      const { returns } = assertSharedCodegen(codegenNode, false, true)
      expect(returns).toMatchObject({
        type: NodeTypes.VNODE_CALL,
        directives: { type: NodeTypes.JS_ARRAY_EXPRESSION }
      })
      expect(generate(root).code).toMatchSnapshot()
    })
  })
})
