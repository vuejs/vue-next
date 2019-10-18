import {
  RootNode,
  TemplateChildNode,
  TextNode,
  CommentNode,
  ExpressionNode,
  NodeTypes,
  JSChildNode,
  CallExpression,
  ArrayExpression,
  ObjectExpression,
  SourceLocation,
  Position,
  InterpolationNode,
  CompoundExpressionNode,
  SimpleExpressionNode,
  FunctionExpression,
  SequenceExpression,
  ConditionalExpression
} from './ast'
import { SourceMapGenerator, RawSourceMap } from 'source-map'
import {
  advancePositionWithMutation,
  assert,
  isSimpleIdentifier,
  loadDep,
  toValidAssetId
} from './utils'
import { isString, isArray, isSymbol } from '@vue/shared'
import {
  TO_STRING,
  CREATE_VNODE,
  COMMENT,
  helperNameMap,
  RESOLVE_COMPONENT,
  RESOLVE_DIRECTIVE,
  RESOLVE_FILTER
} from './runtimeHelpers'

type CodegenNode = TemplateChildNode | JSChildNode

export interface CodegenOptions {
  // - Module mode will generate ES module import statements for helpers
  //   and export the render function as the default export.
  // - Function mode will generate a single `const { helpers... } = Vue`
  //   statement and return the render function. It is meant to be used with
  //   `new Function(code)()` to generate a render function at runtime.
  // Default: 'function'
  mode?: 'module' | 'function'
  // Prefix suitable identifiers with _ctx.
  // If this option is false, the generated code will be wrapped in a
  // `with (this) { ... }` block.
  // Default: false
  prefixIdentifiers?: boolean
  // Generate source map?
  // Default: false
  sourceMap?: boolean
  // Filename for source map generation.
  // Default: `template.vue.html`
  filename?: string
}

export interface CodegenResult {
  code: string
  ast: RootNode
  map?: RawSourceMap
}

export interface CodegenContext extends Required<CodegenOptions> {
  source: string
  code: string
  line: number
  column: number
  offset: number
  indentLevel: number
  map?: SourceMapGenerator
  helper(key: symbol): string
  push(code: string, node?: CodegenNode, openOnly?: boolean): void
  resetMapping(loc: SourceLocation): void
  indent(): void
  deindent(withoutNewLine?: boolean): void
  newline(): void
}

function createCodegenContext(
  ast: RootNode,
  {
    mode = 'function',
    prefixIdentifiers = mode === 'module',
    sourceMap = false,
    filename = `template.vue.html`
  }: CodegenOptions
): CodegenContext {
  const context: CodegenContext = {
    mode,
    prefixIdentifiers,
    sourceMap,
    filename,
    source: ast.loc.source,
    code: ``,
    column: 1,
    line: 1,
    offset: 0,
    indentLevel: 0,

    // lazy require source-map implementation, only in non-browser builds!
    map:
      __BROWSER__ || !sourceMap
        ? undefined
        : new (loadDep('source-map')).SourceMapGenerator(),

    helper(key) {
      const name = helperNameMap[key]
      return prefixIdentifiers ? name : `_${name}`
    },
    push(code, node, openOnly) {
      context.code += code
      if (!__BROWSER__ && context.map) {
        if (node) {
          let name
          if (node.type === NodeTypes.SIMPLE_EXPRESSION && !node.isStatic) {
            const content = node.content.replace(/^_ctx\./, '')
            if (content !== node.content && isSimpleIdentifier(content)) {
              name = content
            }
          }
          addMapping(node.loc.start, name)
        }
        advancePositionWithMutation(context, code)
        if (node && !openOnly) {
          addMapping(node.loc.end)
        }
      }
    },
    resetMapping(loc: SourceLocation) {
      if (!__BROWSER__ && context.map) {
        addMapping(loc.start)
      }
    },
    indent() {
      newline(++context.indentLevel)
    },
    deindent(withoutNewLine = false) {
      if (withoutNewLine) {
        --context.indentLevel
      } else {
        newline(--context.indentLevel)
      }
    },
    newline() {
      newline(context.indentLevel)
    }
  }

  function newline(n: number) {
    context.push('\n' + `  `.repeat(n))
  }

  function addMapping(loc: Position, name?: string) {
    context.map!.addMapping({
      name,
      source: context.filename,
      original: {
        line: loc.line,
        column: loc.column - 1 // source-map column is 0 based
      },
      generated: {
        line: context.line,
        column: context.column - 1
      }
    })
  }

  if (!__BROWSER__ && context.map) {
    context.map.setSourceContent(filename, context.source)
  }
  return context
}

export function generate(
  ast: RootNode,
  options: CodegenOptions = {}
): CodegenResult {
  const context = createCodegenContext(ast, options)
  const {
    mode,
    push,
    helper,
    prefixIdentifiers,
    indent,
    deindent,
    newline
  } = context
  const hasHelpers = ast.helpers.length > 0
  const useWithBlock = !prefixIdentifiers && mode !== 'module'

  // preambles
  if (mode === 'function') {
    // Generate const declaration for helpers
    // In prefix mode, we place the const declaration at top so it's done
    // only once; But if we not prefixing, we place the declaration inside the
    // with block so it doesn't incur the `in` check cost for every helper access.
    if (hasHelpers) {
      if (prefixIdentifiers) {
        push(`const { ${ast.helpers.map(helper).join(', ')} } = Vue\n`)
      } else {
        // "with" mode.
        // save Vue in a separate variable to avoid collision
        push(`const _Vue = Vue\n`)
        // in "with" mode, helpers are declared inside the with block to avoid
        // has check cost, but hoists are lifted out of the function - we need
        // to provide the helper here.
        if (ast.hoists.length) {
          push(`const _${helperNameMap[CREATE_VNODE]} = Vue.createVNode\n`)
          if (ast.helpers.includes(COMMENT)) {
            push(`const _${helperNameMap[COMMENT]} = Vue.Comment\n`)
          }
        }
      }
    }
    genHoists(ast.hoists, context)
    newline()
    push(`return `)
  } else {
    // generate import statements for helpers
    if (hasHelpers) {
      push(`import { ${ast.helpers.map(helper).join(', ')} } from "vue"\n`)
    }
    genHoists(ast.hoists, context)
    newline()
    push(`export default `)
  }

  // enter render function
  push(`function render() {`)
  indent()

  if (useWithBlock) {
    push(`with (this) {`)
    indent()
    // function mode const declarations should be inside with block
    // also they should be renamed to avoid collision with user properties
    if (hasHelpers) {
      push(
        `const { ${ast.helpers
          .map(s => `${helperNameMap[s]}: _${helperNameMap[s]}`)
          .join(', ')} } = _Vue`
      )
      newline()
      newline()
    }
  } else {
    push(`const _ctx = this`)
    newline()
  }

  // generate asset resolution statements
  if (ast.components.length) {
    genAssets(ast.components, 'component', context)
  }
  if (ast.directives.length) {
    genAssets(ast.directives, 'directive', context)
  }
  if (ast.filters.length) {
    genAssets(ast.filters, 'filter', context)
  }
  if (ast.components.length || ast.directives.length) {
    newline()
  }

  // generate the VNode tree expression
  push(`return `)
  if (ast.codegenNode) {
    genNode(ast.codegenNode, context)
  } else {
    push(`null`)
  }

  if (useWithBlock) {
    deindent()
    push(`}`)
  }

  deindent()
  push(`}`)
  return {
    ast,
    code: context.code,
    map: context.map ? context.map.toJSON() : undefined
  }
}

const assetMap = {
  component: RESOLVE_COMPONENT,
  directive: RESOLVE_DIRECTIVE,
  filter: RESOLVE_FILTER
}

function genAssets(
  assets: string[],
  type: 'component' | 'directive' | 'filter',
  context: CodegenContext
) {
  let resolver = context.helper(assetMap[type])
  for (let i = 0; i < assets.length; i++) {
    const id = assets[i]
    context.push(
      `const ${toValidAssetId(id, type)} = ${resolver}(${JSON.stringify(id)})`
    )
    context.newline()
  }
}

function genHoists(hoists: JSChildNode[], context: CodegenContext) {
  if (!hoists.length) {
    return
  }
  context.newline()
  hoists.forEach((exp, i) => {
    context.push(`const _hoisted_${i + 1} = `)
    genNode(exp, context)
    context.newline()
  })
}

function isText(n: string | CodegenNode) {
  return (
    isString(n) ||
    n.type === NodeTypes.SIMPLE_EXPRESSION ||
    n.type === NodeTypes.TEXT ||
    n.type === NodeTypes.INTERPOLATION ||
    n.type === NodeTypes.COMPOUND_EXPRESSION
  )
}

function genNodeListAsArray(
  nodes: (string | CodegenNode | TemplateChildNode[])[],
  context: CodegenContext
) {
  const multilines =
    nodes.length > 3 ||
    ((!__BROWSER__ || __DEV__) && nodes.some(n => isArray(n) || !isText(n)))
  context.push(`[`)
  multilines && context.indent()
  genNodeList(nodes, context, multilines)
  multilines && context.deindent()
  context.push(`]`)
}

function genNodeList(
  nodes: (string | symbol | CodegenNode | TemplateChildNode[])[],
  context: CodegenContext,
  multilines: boolean = false
) {
  const { push, newline } = context
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (isString(node)) {
      push(node)
    } else if (isArray(node)) {
      genNodeListAsArray(node, context)
    } else {
      genNode(node, context)
    }
    if (i < nodes.length - 1) {
      if (multilines) {
        push(',')
        newline()
      } else {
        push(', ')
      }
    }
  }
}

function genNode(node: CodegenNode | symbol | string, context: CodegenContext) {
  if (isString(node)) {
    context.push(node)
    return
  }
  if (isSymbol(node)) {
    context.push(context.helper(node))
    return
  }
  switch (node.type) {
    case NodeTypes.ELEMENT:
    case NodeTypes.IF:
    case NodeTypes.FOR:
      __DEV__ &&
        assert(
          node.codegenNode != null,
          `Codegen node is missing for element/if/for node. ` +
            `Apply appropriate transforms first.`
        )
      genNode(node.codegenNode!, context)
      break
    case NodeTypes.TEXT:
      genText(node, context)
      break
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context)
      break
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context)
      break
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context)
      break
    case NodeTypes.COMMENT:
      genComment(node, context)
      break
    case NodeTypes.JS_CALL_EXPRESSION:
      genCallExpression(node, context)
      break
    case NodeTypes.JS_OBJECT_EXPRESSION:
      genObjectExpression(node, context)
      break
    case NodeTypes.JS_ARRAY_EXPRESSION:
      genArrayExpression(node, context)
      break
    case NodeTypes.JS_FUNCTION_EXPRESSION:
      genFunctionExpression(node, context)
      break
    case NodeTypes.JS_SEQUENCE_EXPRESSION:
      genSequenceExpression(node, context)
      break
    case NodeTypes.JS_CONDITIONAL_EXPRESSION:
      genConditionalExpression(node, context)
      break
    /* istanbul ignore next */
    default:
      if (__DEV__) {
        assert(false, `unhandled codegen node type: ${(node as any).type}`)
        // make sure we exhaust all possible types
        const exhaustiveCheck: never = node
        return exhaustiveCheck
      }
  }
}

function genText(
  node: TextNode | SimpleExpressionNode,
  context: CodegenContext
) {
  context.push(JSON.stringify(node.content), node)
}

function genExpression(node: SimpleExpressionNode, context: CodegenContext) {
  const { content, isStatic } = node
  context.push(isStatic ? JSON.stringify(content) : content, node)
}

function genInterpolation(node: InterpolationNode, context: CodegenContext) {
  const { push, helper } = context
  push(`${helper(TO_STRING)}(`)
  genNode(node.content, context)
  push(`)`)
}

function genCompoundExpression(
  node: CompoundExpressionNode,
  context: CodegenContext
) {
  for (let i = 0; i < node.children!.length; i++) {
    const child = node.children![i]
    if (isString(child)) {
      context.push(child)
    } else {
      genNode(child, context)
    }
  }
}

function genExpressionAsPropertyKey(
  node: ExpressionNode,
  context: CodegenContext
) {
  const { push } = context
  if (node.type === NodeTypes.COMPOUND_EXPRESSION) {
    push(`[`)
    genCompoundExpression(node, context)
    push(`]`)
  } else if (node.isStatic) {
    // only quote keys if necessary
    const text = isSimpleIdentifier(node.content)
      ? node.content
      : JSON.stringify(node.content)
    push(text, node)
  } else {
    push(`[${node.content}]`, node)
  }
}

function genComment(node: CommentNode, context: CodegenContext) {
  if (__DEV__) {
    const { push, helper } = context
    push(
      `${helper(CREATE_VNODE)}(${helper(COMMENT)}, null, ${JSON.stringify(
        node.content
      )})`,
      node
    )
  }
}

// JavaScript
function genCallExpression(node: CallExpression, context: CodegenContext) {
  const callee = isString(node.callee)
    ? node.callee
    : context.helper(node.callee)
  context.push(callee + `(`, node, true)
  genNodeList(node.arguments, context)
  context.push(`)`)
}

function genObjectExpression(node: ObjectExpression, context: CodegenContext) {
  const { push, indent, deindent, newline, resetMapping } = context
  const { properties } = node
  if (!properties.length) {
    push(`{}`, node)
    return
  }
  const multilines =
    properties.length > 1 ||
    ((!__BROWSER__ || __DEV__) &&
      properties.some(p => p.value.type !== NodeTypes.SIMPLE_EXPRESSION))
  push(multilines ? `{` : `{ `)
  multilines && indent()
  for (let i = 0; i < properties.length; i++) {
    const { key, value, loc } = properties[i]
    resetMapping(loc) // reset source mapping for every property.
    // key
    genExpressionAsPropertyKey(key, context)
    push(`: `)
    // value
    genNode(value, context)
    if (i < properties.length - 1) {
      // will only reach this if it's multilines
      push(`,`)
      newline()
    }
  }
  multilines && deindent()
  const lastChar = context.code[context.code.length - 1]
  push(multilines || /[\])}]/.test(lastChar) ? `}` : ` }`)
}

function genArrayExpression(node: ArrayExpression, context: CodegenContext) {
  genNodeListAsArray(node.elements, context)
}

function genFunctionExpression(
  node: FunctionExpression,
  context: CodegenContext
) {
  const { push, indent, deindent } = context
  const { params, returns, newline } = node
  push(`(`, node)
  if (isArray(params)) {
    genNodeList(params, context)
  } else if (params) {
    genNode(params, context)
  }
  push(`) => `)
  if (newline) {
    push(`{`)
    indent()
    push(`return `)
  }
  if (isArray(returns)) {
    genNodeListAsArray(returns, context)
  } else {
    genNode(returns, context)
  }
  if (newline) {
    deindent()
    push(`}`)
  }
}

function genConditionalExpression(
  node: ConditionalExpression,
  context: CodegenContext
) {
  const { test, consequent, alternate } = node
  const { push, indent, deindent, newline } = context
  if (test.type === NodeTypes.SIMPLE_EXPRESSION) {
    const needsParens = !isSimpleIdentifier(test.content)
    needsParens && push(`(`)
    genExpression(test, context)
    needsParens && push(`)`)
  } else {
    push(`(`)
    genCompoundExpression(test, context)
    push(`)`)
  }
  indent()
  context.indentLevel++
  push(`? `)
  genNode(consequent, context)
  context.indentLevel--
  newline()
  push(`: `)
  const isNested = alternate.type === NodeTypes.JS_CONDITIONAL_EXPRESSION
  if (!isNested) {
    context.indentLevel++
  }
  genNode(alternate, context)
  if (!isNested) {
    context.indentLevel--
  }
  deindent(true /* without newline */)
}

function genSequenceExpression(
  node: SequenceExpression,
  context: CodegenContext
) {
  context.push(`(`)
  genNodeList(node.expressions, context)
  context.push(`)`)
}
