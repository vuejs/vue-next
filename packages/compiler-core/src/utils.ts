import {
  SourceLocation,
  Position,
  ElementNode,
  NodeTypes,
  CallExpression,
  SequenceExpression,
  createSequenceExpression,
  createCallExpression,
  DirectiveNode,
  ElementTypes,
  TemplateChildNode,
  RootNode,
  ObjectExpression,
  Property,
  JSChildNode,
  createObjectExpression,
  SlotOutletNode,
  TemplateNode,
  BlockCodegenNode,
  ElementCodegenNode,
  SlotOutletCodegenNode,
  ComponentCodegenNode,
  ExpressionNode
} from './ast'
import { parse } from 'acorn'
import { walk } from 'estree-walker'
import { TransformContext } from './transform'
import { OPEN_BLOCK, MERGE_PROPS, RENDER_SLOT } from './runtimeHelpers'
import { isString, isFunction } from '@vue/shared'

// cache node requires
// lazy require dependencies so that they don't end up in rollup's dep graph
// and thus can be tree-shaken in browser builds.
let _parse: typeof parse
let _walk: typeof walk

export function loadDep(name: string) {
  if (typeof process !== 'undefined' && isFunction(require)) {
    return require(name)
  } else {
    // This is only used when we are building a dev-only build of the compiler
    // which runs in the browser but also uses Node deps.
    return (window as any)._deps[name]
  }
}

export const parseJS: typeof parse = (code, options) => {
  assert(
    !__BROWSER__,
    `Expression AST analysis can only be performed in non-browser builds.`
  )
  const parse = _parse || (_parse = loadDep('acorn').parse)
  return parse(code, options)
}

export const walkJS: typeof walk = (ast, walker) => {
  assert(
    !__BROWSER__,
    `Expression AST analysis can only be performed in non-browser builds.`
  )
  const walk = _walk || (_walk = loadDep('estree-walker').walk)
  return walk(ast, walker)
}

const nonIdentifierRE = /^\d|[^\$\w]/
export const isSimpleIdentifier = (name: string): boolean =>
  !nonIdentifierRE.test(name)

const memberExpRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\[[^\]]+\])*$/
export const isMemberExpression = (path: string): boolean =>
  memberExpRE.test(path)

export function getInnerRange(
  loc: SourceLocation,
  offset: number,
  length?: number
): SourceLocation {
  __DEV__ && assert(offset <= loc.source.length)
  const source = loc.source.substr(offset, length)
  const newLoc: SourceLocation = {
    source,
    start: advancePositionWithClone(loc.start, loc.source, offset),
    end: loc.end
  }

  if (length != null) {
    __DEV__ && assert(offset + length <= loc.source.length)
    newLoc.end = advancePositionWithClone(
      loc.start,
      loc.source,
      offset + length
    )
  }

  return newLoc
}

export function advancePositionWithClone(
  pos: Position,
  source: string,
  numberOfCharacters: number = source.length
): Position {
  return advancePositionWithMutation({ ...pos }, source, numberOfCharacters)
}

// advance by mutation without cloning (for performance reasons), since this
// gets called a lot in the parser
export function advancePositionWithMutation(
  pos: Position,
  source: string,
  numberOfCharacters: number = source.length
): Position {
  let linesCount = 0
  let lastNewLinePos = -1
  for (let i = 0; i < numberOfCharacters; i++) {
    if (source.charCodeAt(i) === 10 /* newline char code */) {
      linesCount++
      lastNewLinePos = i
    }
  }

  pos.offset += numberOfCharacters
  pos.line += linesCount
  pos.column =
    lastNewLinePos === -1
      ? pos.column + numberOfCharacters
      : Math.max(1, numberOfCharacters - lastNewLinePos)

  return pos
}

export function assert(condition: boolean, msg?: string) {
  /* istanbul ignore if */
  if (!condition) {
    throw new Error(msg || `unexpected compiler condition`)
  }
}

export function findDir(
  node: ElementNode,
  name: string | RegExp,
  allowEmpty: boolean = false
): DirectiveNode | undefined {
  for (let i = 0; i < node.props.length; i++) {
    const p = node.props[i]
    if (
      p.type === NodeTypes.DIRECTIVE &&
      (allowEmpty || p.exp) &&
      (isString(name) ? p.name === name : name.test(p.name))
    ) {
      return p
    }
  }
}

export function findProp(
  node: ElementNode,
  name: string,
  dynamicOnly: boolean = false
): ElementNode['props'][0] | undefined {
  for (let i = 0; i < node.props.length; i++) {
    const p = node.props[i]
    if (p.type === NodeTypes.ATTRIBUTE) {
      if (dynamicOnly) continue
      if (p.name === name && p.value && !p.value.isEmpty) {
        return p
      }
    } else if (
      p.name === 'bind' &&
      p.arg &&
      p.arg.type === NodeTypes.SIMPLE_EXPRESSION &&
      p.arg.isStatic &&
      p.arg.content === name &&
      p.exp
    ) {
      return p
    }
  }
}

export function createBlockExpression(
  blockExp: BlockCodegenNode,
  context: TransformContext
): SequenceExpression {
  return createSequenceExpression([
    createCallExpression(context.helper(OPEN_BLOCK)),
    blockExp
  ])
}

export const isVSlot = (p: ElementNode['props'][0]): p is DirectiveNode =>
  p.type === NodeTypes.DIRECTIVE && p.name === 'slot'

export const isTemplateNode = (
  node: RootNode | TemplateChildNode
): node is TemplateNode =>
  node.type === NodeTypes.ELEMENT && node.tagType === ElementTypes.TEMPLATE

export const isSlotOutlet = (
  node: RootNode | TemplateChildNode
): node is SlotOutletNode =>
  node.type === NodeTypes.ELEMENT && node.tagType === ElementTypes.SLOT

export function injectProp(
  node: ElementCodegenNode | ComponentCodegenNode | SlotOutletCodegenNode,
  prop: Property,
  context: TransformContext
) {
  let propsWithInjection: ObjectExpression | CallExpression
  const props =
    node.callee === RENDER_SLOT ? node.arguments[2] : node.arguments[1]
  if (props == null || isString(props)) {
    propsWithInjection = createObjectExpression([prop])
  } else if (props.type === NodeTypes.JS_CALL_EXPRESSION) {
    // merged props... add ours
    // only inject key to object literal if it's the first argument so that
    // if doesn't override user provided keys
    const first = props.arguments[0] as string | JSChildNode
    if (!isString(first) && first.type === NodeTypes.JS_OBJECT_EXPRESSION) {
      first.properties.unshift(prop)
    } else {
      props.arguments.unshift(createObjectExpression([prop]))
    }
    propsWithInjection = props
  } else if (props.type === NodeTypes.JS_OBJECT_EXPRESSION) {
    props.properties.unshift(prop)
    propsWithInjection = props
  } else {
    // single v-bind with expression, return a merged replacement
    propsWithInjection = createCallExpression(context.helper(MERGE_PROPS), [
      createObjectExpression([prop]),
      props
    ])
  }
  if (node.callee === RENDER_SLOT) {
    node.arguments[2] = propsWithInjection
  } else {
    node.arguments[1] = propsWithInjection
  }
}

export function toValidAssetId(
  name: string,
  type: 'component' | 'directive' | 'filter'
): string {
  return `_${type}_${name.replace(/[^\w]/g, '_')}`
}

export function isEmptyExpression(node: ExpressionNode) {
  return node.type === NodeTypes.SIMPLE_EXPRESSION && !node.content.trim()
}
