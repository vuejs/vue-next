import { CompilerOptions, generate, parse, transform } from '@vue/compiler-core'
import { transformFilter } from '../../src/transforms/transformFilter'
import { transformIf } from '../../src/transforms/vIf'
import { transformFor } from '../../src/transforms/vFor'
import { transformElement } from '../../src/transforms/transformElement'

function parseWithFilter(template: string, options: CompilerOptions = {}) {
  const ast = parse(template)

  transform(ast, {
    nodeTransforms: [
      transformIf,
      transformFor,
      transformFilter,
      transformElement
    ],
    ...options
  })

  return ast
}

describe('compiler: transform filter', () => {
  test('basic usage', () => {
    const ast = parseWithFilter('{{ msg | upper }}')

    expect(generate(ast).code).toMatchSnapshot()
  })

  test('chained usage', () => {
    const ast = parseWithFilter('{{ msg | upper | reverse}}')

    expect(generate(ast).code).toMatchSnapshot()
  })

  test('basic usage with element', () => {
    const ast = parseWithFilter('<div>{{ msg | upper }}</div>')

    expect(generate(ast).code).toMatchSnapshot()
  })

  test('basic usage with element v-bind', () => {
    const ast = parseWithFilter(`
				<div
          v-bind:id="id | upper | reverse"
          :class="cls | reverse"
          :ref="ref | lower">
        </div>`)

    expect(generate(ast).code).toMatchSnapshot()
  })
})
