import { ParserOptions } from '../src/options'
import { baseParse, TextModes } from '../src/parse'
import { ErrorCodes } from '../src/errors'
import {
  CommentNode,
  ElementNode,
  ElementTypes,
  Namespaces,
  NodeTypes,
  Position,
  TextNode,
  InterpolationNode,
  ConstantTypes
} from '../src/ast'

describe('compiler: parse', () => {
  describe('Text', () => {
    test('simple text', () => {
      const ast = baseParse('some text')
      const text = ast.children[0] as TextNode

      expect(text).toStrictEqual({
        type: NodeTypes.TEXT,
        content: 'some text',
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 9, line: 1, column: 10 },
          source: 'some text'
        }
      })
    })

    test('simple text with invalid end tag', () => {
      const onError = jest.fn()
      const ast = baseParse('some text</div>', {
        onError
      })
      const text = ast.children[0] as TextNode

      expect(onError).toBeCalled()
      expect(text).toStrictEqual({
        type: NodeTypes.TEXT,
        content: 'some text',
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 9, line: 1, column: 10 },
          source: 'some text'
        }
      })
    })

    test('text with interpolation', () => {
      const ast = baseParse('some {{ foo + bar }} text')
      const text1 = ast.children[0] as TextNode
      const text2 = ast.children[2] as TextNode

      expect(text1).toStrictEqual({
        type: NodeTypes.TEXT,
        content: 'some ',
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 5, line: 1, column: 6 },
          source: 'some '
        }
      })
      expect(text2).toStrictEqual({
        type: NodeTypes.TEXT,
        content: ' text',
        loc: {
          start: { offset: 20, line: 1, column: 21 },
          end: { offset: 25, line: 1, column: 26 },
          source: ' text'
        }
      })
    })

    test('text with interpolation which has `<`', () => {
      const ast = baseParse('some {{ a<b && c>d }} text')
      const text1 = ast.children[0] as TextNode
      const text2 = ast.children[2] as TextNode

      expect(text1).toStrictEqual({
        type: NodeTypes.TEXT,
        content: 'some ',
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 5, line: 1, column: 6 },
          source: 'some '
        }
      })
      expect(text2).toStrictEqual({
        type: NodeTypes.TEXT,
        content: ' text',
        loc: {
          start: { offset: 21, line: 1, column: 22 },
          end: { offset: 26, line: 1, column: 27 },
          source: ' text'
        }
      })
    })

    test('text with mix of tags and interpolations', () => {
      const ast = baseParse('some <span>{{ foo < bar + foo }} text</span>')
      const text1 = ast.children[0] as TextNode
      const text2 = (ast.children[1] as ElementNode).children![1] as TextNode

      expect(text1).toStrictEqual({
        type: NodeTypes.TEXT,
        content: 'some ',
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 5, line: 1, column: 6 },
          source: 'some '
        }
      })
      expect(text2).toStrictEqual({
        type: NodeTypes.TEXT,
        content: ' text',
        loc: {
          start: { offset: 32, line: 1, column: 33 },
          end: { offset: 37, line: 1, column: 38 },
          source: ' text'
        }
      })
    })

    test('lonely "<" doesn\'t separate nodes', () => {
      const ast = baseParse('a < b', {
        onError: err => {
          if (err.code !== ErrorCodes.INVALID_FIRST_CHARACTER_OF_TAG_NAME) {
            throw err
          }
        }
      })
      const text = ast.children[0] as TextNode

      expect(text).toStrictEqual({
        type: NodeTypes.TEXT,
        content: 'a < b',
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 5, line: 1, column: 6 },
          source: 'a < b'
        }
      })
    })

    test('lonely "{{" doesn\'t separate nodes', () => {
      const ast = baseParse('a {{ b', {
        onError: error => {
          if (error.code !== ErrorCodes.X_MISSING_INTERPOLATION_END) {
            throw error
          }
        }
      })
      const text = ast.children[0] as TextNode

      expect(text).toStrictEqual({
        type: NodeTypes.TEXT,
        content: 'a {{ b',
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 6, line: 1, column: 7 },
          source: 'a {{ b'
        }
      })
    })
  })

  describe('Interpolation', () => {
    test('simple interpolation', () => {
      const ast = baseParse('{{message}}')
      const interpolation = ast.children[0] as InterpolationNode

      expect(interpolation).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: `message`,
          isStatic: false,
          constType: ConstantTypes.NOT_CONSTANT,
          loc: {
            start: { offset: 2, line: 1, column: 3 },
            end: { offset: 9, line: 1, column: 10 },
            source: `message`
          }
        },
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 11, line: 1, column: 12 },
          source: '{{message}}'
        }
      })
    })

    test('it can have tag-like notation', () => {
      const ast = baseParse('{{ a<b }}')
      const interpolation = ast.children[0] as InterpolationNode

      expect(interpolation).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: `a<b`,
          isStatic: false,
          constType: ConstantTypes.NOT_CONSTANT,
          loc: {
            start: { offset: 3, line: 1, column: 4 },
            end: { offset: 6, line: 1, column: 7 },
            source: 'a<b'
          }
        },
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 9, line: 1, column: 10 },
          source: '{{ a<b }}'
        }
      })
    })

    test('it can have tag-like notation (2)', () => {
      const ast = baseParse('{{ a<b }}{{ c>d }}')
      const interpolation1 = ast.children[0] as InterpolationNode
      const interpolation2 = ast.children[1] as InterpolationNode

      expect(interpolation1).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: `a<b`,
          isStatic: false,
          constType: ConstantTypes.NOT_CONSTANT,
          loc: {
            start: { offset: 3, line: 1, column: 4 },
            end: { offset: 6, line: 1, column: 7 },
            source: 'a<b'
          }
        },
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 9, line: 1, column: 10 },
          source: '{{ a<b }}'
        }
      })

      expect(interpolation2).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          isStatic: false,
          constType: ConstantTypes.NOT_CONSTANT,
          content: 'c>d',
          loc: {
            start: { offset: 12, line: 1, column: 13 },
            end: { offset: 15, line: 1, column: 16 },
            source: 'c>d'
          }
        },
        loc: {
          start: { offset: 9, line: 1, column: 10 },
          end: { offset: 18, line: 1, column: 19 },
          source: '{{ c>d }}'
        }
      })
    })

    test('it can have tag-like notation (3)', () => {
      const ast = baseParse('<div>{{ "</div>" }}</div>')
      const element = ast.children[0] as ElementNode
      const interpolation = element.children[0] as InterpolationNode

      expect(interpolation).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          isStatic: false,
          // The `constType` is the default value and will be determined in `transformExpression`.
          constType: ConstantTypes.NOT_CONSTANT,
          content: '"</div>"',
          loc: {
            start: { offset: 8, line: 1, column: 9 },
            end: { offset: 16, line: 1, column: 17 },
            source: '"</div>"'
          }
        },
        loc: {
          start: { offset: 5, line: 1, column: 6 },
          end: { offset: 19, line: 1, column: 20 },
          source: '{{ "</div>" }}'
        }
      })
    })

    test('custom delimiters', () => {
      const ast = baseParse('<p>{msg}</p>', {
        delimiters: ['{', '}']
      })
      const element = ast.children[0] as ElementNode
      const interpolation = element.children[0] as InterpolationNode

      expect(interpolation).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: `msg`,
          isStatic: false,
          constType: ConstantTypes.NOT_CONSTANT,
          loc: {
            start: { offset: 4, line: 1, column: 5 },
            end: { offset: 7, line: 1, column: 8 },
            source: 'msg'
          }
        },
        loc: {
          start: { offset: 3, line: 1, column: 4 },
          end: { offset: 8, line: 1, column: 9 },
          source: '{msg}'
        }
      })
    })
  })

  describe('Comment', () => {
    test('empty comment', () => {
      const ast = baseParse('<!---->')
      const comment = ast.children[0] as CommentNode

      expect(comment).toStrictEqual({
        type: NodeTypes.COMMENT,
        content: '',
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 7, line: 1, column: 8 },
          source: '<!---->'
        }
      })
    })

    test('simple comment', () => {
      const ast = baseParse('<!--abc-->')
      const comment = ast.children[0] as CommentNode

      expect(comment).toStrictEqual({
        type: NodeTypes.COMMENT,
        content: 'abc',
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 10, line: 1, column: 11 },
          source: '<!--abc-->'
        }
      })
    })

    test('two comments', () => {
      const ast = baseParse('<!--abc--><!--def-->')
      const comment1 = ast.children[0] as CommentNode
      const comment2 = ast.children[1] as CommentNode

      expect(comment1).toStrictEqual({
        type: NodeTypes.COMMENT,
        content: 'abc',
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 10, line: 1, column: 11 },
          source: '<!--abc-->'
        }
      })
      expect(comment2).toStrictEqual({
        type: NodeTypes.COMMENT,
        content: 'def',
        loc: {
          start: { offset: 10, line: 1, column: 11 },
          end: { offset: 20, line: 1, column: 21 },
          source: '<!--def-->'
        }
      })
    })

    test('comments option', () => {
      __DEV__ = false
      const astDefaultComment = baseParse('<!--abc-->')
      const astNoComment = baseParse('<!--abc-->', { comments: false })
      const astWithComments = baseParse('<!--abc-->', { comments: true })
      __DEV__ = true

      expect(astDefaultComment.children).toHaveLength(0)
      expect(astNoComment.children).toHaveLength(0)
      expect(astWithComments.children).toHaveLength(1)
    })

    // #2217
    test('comments in the <pre> tag should be removed in production mode', () => {
      __DEV__ = false
      const rawText = `<p/><!-- foo --><p/>`
      const ast = baseParse(`<pre>${rawText}</pre>`)
      __DEV__ = true

      expect((ast.children[0] as ElementNode).children).toMatchObject([
        {
          type: NodeTypes.ELEMENT,
          tag: 'p'
        },
        {
          type: NodeTypes.ELEMENT,
          tag: 'p'
        }
      ])
    })
  })

  describe('Element', () => {
    test('simple div', () => {
      const ast = baseParse('<div>hello</div>')
      const element = ast.children[0] as ElementNode

      expect(element).toStrictEqual({
        type: NodeTypes.ELEMENT,
        ns: Namespaces.HTML,
        tag: 'div',
        tagType: ElementTypes.ELEMENT,
        codegenNode: undefined,
        props: [],
        isSelfClosing: false,
        children: [
          {
            type: NodeTypes.TEXT,
            content: 'hello',
            loc: {
              start: { offset: 5, line: 1, column: 6 },
              end: { offset: 10, line: 1, column: 11 },
              source: 'hello'
            }
          }
        ],
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 16, line: 1, column: 17 },
          source: '<div>hello</div>'
        }
      })
    })

    test('empty', () => {
      const ast = baseParse('<div></div>')
      const element = ast.children[0] as ElementNode

      expect(element).toStrictEqual({
        type: NodeTypes.ELEMENT,
        ns: Namespaces.HTML,
        tag: 'div',
        tagType: ElementTypes.ELEMENT,
        codegenNode: undefined,
        props: [],
        isSelfClosing: false,
        children: [],
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 11, line: 1, column: 12 },
          source: '<div></div>'
        }
      })
    })

    test('self closing', () => {
      const ast = baseParse('<div/>after')
      const element = ast.children[0] as ElementNode

      expect(element).toStrictEqual({
        type: NodeTypes.ELEMENT,
        ns: Namespaces.HTML,
        tag: 'div',
        tagType: ElementTypes.ELEMENT,
        codegenNode: undefined,
        props: [],

        isSelfClosing: true,
        children: [],
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 6, line: 1, column: 7 },
          source: '<div/>'
        }
      })
    })

    test('void element', () => {
      const ast = baseParse('<img>after', {
        isVoidTag: tag => tag === 'img'
      })
      const element = ast.children[0] as ElementNode

      expect(element).toStrictEqual({
        type: NodeTypes.ELEMENT,
        ns: Namespaces.HTML,
        tag: 'img',
        tagType: ElementTypes.ELEMENT,
        codegenNode: undefined,
        props: [],

        isSelfClosing: false,
        children: [],
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 5, line: 1, column: 6 },
          source: '<img>'
        }
      })
    })

    test('template element with directives', () => {
      const ast = baseParse('<template v-if="ok"></template>')
      const element = ast.children[0]
      expect(element).toMatchObject({
        type: NodeTypes.ELEMENT,
        tagType: ElementTypes.TEMPLATE
      })
    })

    test('template element without directives', () => {
      const ast = baseParse('<template></template>')
      const element = ast.children[0]
      expect(element).toMatchObject({
        type: NodeTypes.ELEMENT,
        tagType: ElementTypes.ELEMENT
      })
    })

    test('native element with `isNativeTag`', () => {
      const ast = baseParse('<div></div><comp></comp><Comp></Comp>', {
        isNativeTag: tag => tag === 'div'
      })

      expect(ast.children[0]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tag: 'div',
        tagType: ElementTypes.ELEMENT
      })

      expect(ast.children[1]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tag: 'comp',
        tagType: ElementTypes.COMPONENT
      })

      expect(ast.children[2]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tag: 'Comp',
        tagType: ElementTypes.COMPONENT
      })
    })

    test('native element without `isNativeTag`', () => {
      const ast = baseParse('<div></div><comp></comp><Comp></Comp>')

      expect(ast.children[0]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tag: 'div',
        tagType: ElementTypes.ELEMENT
      })

      expect(ast.children[1]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tag: 'comp',
        tagType: ElementTypes.ELEMENT
      })

      expect(ast.children[2]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tag: 'Comp',
        tagType: ElementTypes.COMPONENT
      })
    })

    test('v-is with `isNativeTag`', () => {
      const ast = baseParse(
        `<div></div><div v-is="'foo'"></div><Comp></Comp>`,
        {
          isNativeTag: tag => tag === 'div'
        }
      )

      expect(ast.children[0]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tag: 'div',
        tagType: ElementTypes.ELEMENT
      })

      expect(ast.children[1]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tag: 'div',
        tagType: ElementTypes.COMPONENT
      })

      expect(ast.children[2]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tag: 'Comp',
        tagType: ElementTypes.COMPONENT
      })
    })

    test('v-is without `isNativeTag`', () => {
      const ast = baseParse(`<div></div><div v-is="'foo'"></div><Comp></Comp>`)

      expect(ast.children[0]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tag: 'div',
        tagType: ElementTypes.ELEMENT
      })

      expect(ast.children[1]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tag: 'div',
        tagType: ElementTypes.COMPONENT
      })

      expect(ast.children[2]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tag: 'Comp',
        tagType: ElementTypes.COMPONENT
      })
    })

    test('custom element', () => {
      const ast = baseParse('<div></div><comp></comp>', {
        isNativeTag: tag => tag === 'div',
        isCustomElement: tag => tag === 'comp'
      })

      expect(ast.children[0]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tag: 'div',
        tagType: ElementTypes.ELEMENT
      })

      expect(ast.children[1]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tag: 'comp',
        tagType: ElementTypes.ELEMENT
      })
    })

    test('built-in component', () => {
      const ast = baseParse('<div></div><comp></comp>', {
        isBuiltInComponent: tag => (tag === 'comp' ? Symbol() : void 0)
      })

      expect(ast.children[0]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tag: 'div',
        tagType: ElementTypes.ELEMENT
      })

      expect(ast.children[1]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tag: 'comp',
        tagType: ElementTypes.COMPONENT
      })
    })

    test('slot element', () => {
      const ast = baseParse('<slot></slot><Comp></Comp>')

      expect(ast.children[0]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tag: 'slot',
        tagType: ElementTypes.SLOT
      })

      expect(ast.children[1]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tag: 'Comp',
        tagType: ElementTypes.COMPONENT
      })
    })

    test('attribute with no value', () => {
      const ast = baseParse('<div id></div>')
      const element = ast.children[0] as ElementNode

      expect(element).toStrictEqual({
        type: NodeTypes.ELEMENT,
        ns: Namespaces.HTML,
        tag: 'div',
        tagType: ElementTypes.ELEMENT,
        codegenNode: undefined,
        props: [
          {
            type: NodeTypes.ATTRIBUTE,
            name: 'id',
            value: undefined,
            loc: {
              start: { offset: 5, line: 1, column: 6 },
              end: { offset: 7, line: 1, column: 8 },
              source: 'id'
            }
          }
        ],

        isSelfClosing: false,
        children: [],
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 14, line: 1, column: 15 },
          source: '<div id></div>'
        }
      })
    })

    test('attribute with empty value, double quote', () => {
      const ast = baseParse('<div id=""></div>')
      const element = ast.children[0] as ElementNode

      expect(element).toStrictEqual({
        type: NodeTypes.ELEMENT,
        ns: Namespaces.HTML,
        tag: 'div',
        tagType: ElementTypes.ELEMENT,
        codegenNode: undefined,
        props: [
          {
            type: NodeTypes.ATTRIBUTE,
            name: 'id',
            value: {
              type: NodeTypes.TEXT,
              content: '',
              loc: {
                start: { offset: 8, line: 1, column: 9 },
                end: { offset: 10, line: 1, column: 11 },
                source: '""'
              }
            },
            loc: {
              start: { offset: 5, line: 1, column: 6 },
              end: { offset: 10, line: 1, column: 11 },
              source: 'id=""'
            }
          }
        ],

        isSelfClosing: false,
        children: [],
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 17, line: 1, column: 18 },
          source: '<div id=""></div>'
        }
      })
    })

    test('attribute with empty value, single quote', () => {
      const ast = baseParse("<div id=''></div>")
      const element = ast.children[0] as ElementNode

      expect(element).toStrictEqual({
        type: NodeTypes.ELEMENT,
        ns: Namespaces.HTML,
        tag: 'div',
        tagType: ElementTypes.ELEMENT,
        codegenNode: undefined,
        props: [
          {
            type: NodeTypes.ATTRIBUTE,
            name: 'id',
            value: {
              type: NodeTypes.TEXT,
              content: '',
              loc: {
                start: { offset: 8, line: 1, column: 9 },
                end: { offset: 10, line: 1, column: 11 },
                source: "''"
              }
            },
            loc: {
              start: { offset: 5, line: 1, column: 6 },
              end: { offset: 10, line: 1, column: 11 },
              source: "id=''"
            }
          }
        ],

        isSelfClosing: false,
        children: [],
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 17, line: 1, column: 18 },
          source: "<div id=''></div>"
        }
      })
    })

    test('attribute with value, double quote', () => {
      const ast = baseParse('<div id=">\'"></div>')
      const element = ast.children[0] as ElementNode

      expect(element).toStrictEqual({
        type: NodeTypes.ELEMENT,
        ns: Namespaces.HTML,
        tag: 'div',
        tagType: ElementTypes.ELEMENT,
        codegenNode: undefined,
        props: [
          {
            type: NodeTypes.ATTRIBUTE,
            name: 'id',
            value: {
              type: NodeTypes.TEXT,
              content: ">'",
              loc: {
                start: { offset: 8, line: 1, column: 9 },
                end: { offset: 12, line: 1, column: 13 },
                source: '">\'"'
              }
            },
            loc: {
              start: { offset: 5, line: 1, column: 6 },
              end: { offset: 12, line: 1, column: 13 },
              source: 'id=">\'"'
            }
          }
        ],

        isSelfClosing: false,
        children: [],
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 19, line: 1, column: 20 },
          source: '<div id=">\'"></div>'
        }
      })
    })

    test('attribute with value, single quote', () => {
      const ast = baseParse("<div id='>\"'></div>")
      const element = ast.children[0] as ElementNode

      expect(element).toStrictEqual({
        type: NodeTypes.ELEMENT,
        ns: Namespaces.HTML,
        tag: 'div',
        tagType: ElementTypes.ELEMENT,
        codegenNode: undefined,
        props: [
          {
            type: NodeTypes.ATTRIBUTE,
            name: 'id',
            value: {
              type: NodeTypes.TEXT,
              content: '>"',
              loc: {
                start: { offset: 8, line: 1, column: 9 },
                end: { offset: 12, line: 1, column: 13 },
                source: "'>\"'"
              }
            },
            loc: {
              start: { offset: 5, line: 1, column: 6 },
              end: { offset: 12, line: 1, column: 13 },
              source: "id='>\"'"
            }
          }
        ],

        isSelfClosing: false,
        children: [],
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 19, line: 1, column: 20 },
          source: "<div id='>\"'></div>"
        }
      })
    })

    test('attribute with value, unquoted', () => {
      const ast = baseParse('<div id=a/></div>')
      const element = ast.children[0] as ElementNode

      expect(element).toStrictEqual({
        type: NodeTypes.ELEMENT,
        ns: Namespaces.HTML,
        tag: 'div',
        tagType: ElementTypes.ELEMENT,
        codegenNode: undefined,
        props: [
          {
            type: NodeTypes.ATTRIBUTE,
            name: 'id',
            value: {
              type: NodeTypes.TEXT,
              content: 'a/',
              loc: {
                start: { offset: 8, line: 1, column: 9 },
                end: { offset: 10, line: 1, column: 11 },
                source: 'a/'
              }
            },
            loc: {
              start: { offset: 5, line: 1, column: 6 },
              end: { offset: 10, line: 1, column: 11 },
              source: 'id=a/'
            }
          }
        ],

        isSelfClosing: false,
        children: [],
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 17, line: 1, column: 18 },
          source: '<div id=a/></div>'
        }
      })
    })

    test('multiple attributes', () => {
      const ast = baseParse('<div id=a class="c" inert style=\'\'></div>')
      const element = ast.children[0] as ElementNode

      expect(element).toStrictEqual({
        type: NodeTypes.ELEMENT,
        ns: Namespaces.HTML,
        tag: 'div',
        tagType: ElementTypes.ELEMENT,
        codegenNode: undefined,
        props: [
          {
            type: NodeTypes.ATTRIBUTE,
            name: 'id',
            value: {
              type: NodeTypes.TEXT,
              content: 'a',
              loc: {
                start: { offset: 8, line: 1, column: 9 },
                end: { offset: 9, line: 1, column: 10 },
                source: 'a'
              }
            },
            loc: {
              start: { offset: 5, line: 1, column: 6 },
              end: { offset: 9, line: 1, column: 10 },
              source: 'id=a'
            }
          },
          {
            type: NodeTypes.ATTRIBUTE,
            name: 'class',
            value: {
              type: NodeTypes.TEXT,
              content: 'c',
              loc: {
                start: { offset: 16, line: 1, column: 17 },
                end: { offset: 19, line: 1, column: 20 },
                source: '"c"'
              }
            },
            loc: {
              start: { offset: 10, line: 1, column: 11 },
              end: { offset: 19, line: 1, column: 20 },
              source: 'class="c"'
            }
          },
          {
            type: NodeTypes.ATTRIBUTE,
            name: 'inert',
            value: undefined,
            loc: {
              start: { offset: 20, line: 1, column: 21 },
              end: { offset: 25, line: 1, column: 26 },
              source: 'inert'
            }
          },
          {
            type: NodeTypes.ATTRIBUTE,
            name: 'style',
            value: {
              type: NodeTypes.TEXT,
              content: '',
              loc: {
                start: { offset: 32, line: 1, column: 33 },
                end: { offset: 34, line: 1, column: 35 },
                source: "''"
              }
            },
            loc: {
              start: { offset: 26, line: 1, column: 27 },
              end: { offset: 34, line: 1, column: 35 },
              source: "style=''"
            }
          }
        ],

        isSelfClosing: false,
        children: [],
        loc: {
          start: { offset: 0, line: 1, column: 1 },
          end: { offset: 41, line: 1, column: 42 },
          source: '<div id=a class="c" inert style=\'\'></div>'
        }
      })
    })

    test('directive with no value', () => {
      const ast = baseParse('<div v-if/>')
      const directive = (ast.children[0] as ElementNode).props[0]

      expect(directive).toStrictEqual({
        type: NodeTypes.DIRECTIVE,
        name: 'if',
        arg: undefined,
        modifiers: [],
        exp: undefined,
        loc: {
          start: { offset: 5, line: 1, column: 6 },
          end: { offset: 9, line: 1, column: 10 },
          source: 'v-if'
        }
      })
    })

    test('directive with value', () => {
      const ast = baseParse('<div v-if="a"/>')
      const directive = (ast.children[0] as ElementNode).props[0]

      expect(directive).toStrictEqual({
        type: NodeTypes.DIRECTIVE,
        name: 'if',
        arg: undefined,
        modifiers: [],
        exp: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'a',
          isStatic: false,
          constType: ConstantTypes.NOT_CONSTANT,
          loc: {
            start: { offset: 11, line: 1, column: 12 },
            end: { offset: 12, line: 1, column: 13 },
            source: 'a'
          }
        },
        loc: {
          start: { offset: 5, line: 1, column: 6 },
          end: { offset: 13, line: 1, column: 14 },
          source: 'v-if="a"'
        }
      })
    })

    test('directive with argument', () => {
      const ast = baseParse('<div v-on:click/>')
      const directive = (ast.children[0] as ElementNode).props[0]

      expect(directive).toStrictEqual({
        type: NodeTypes.DIRECTIVE,
        name: 'on',
        arg: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'click',
          isStatic: true,
          constType: ConstantTypes.CAN_STRINGIFY,

          loc: {
            source: 'click',
            start: {
              column: 11,
              line: 1,
              offset: 10
            },
            end: {
              column: 16,
              line: 1,
              offset: 15
            }
          }
        },
        modifiers: [],
        exp: undefined,
        loc: {
          start: { offset: 5, line: 1, column: 6 },
          end: { offset: 15, line: 1, column: 16 },
          source: 'v-on:click'
        }
      })
    })

    test('directive with dynamic argument', () => {
      const ast = baseParse('<div v-on:[event]/>')
      const directive = (ast.children[0] as ElementNode).props[0]

      expect(directive).toStrictEqual({
        type: NodeTypes.DIRECTIVE,
        name: 'on',
        arg: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'event',
          isStatic: false,
          constType: ConstantTypes.NOT_CONSTANT,

          loc: {
            source: '[event]',
            start: {
              column: 11,
              line: 1,
              offset: 10
            },
            end: {
              column: 18,
              line: 1,
              offset: 17
            }
          }
        },
        modifiers: [],
        exp: undefined,
        loc: {
          start: { offset: 5, line: 1, column: 6 },
          end: { offset: 17, line: 1, column: 18 },
          source: 'v-on:[event]'
        }
      })
    })

    test('directive with a modifier', () => {
      const ast = baseParse('<div v-on.enter/>')
      const directive = (ast.children[0] as ElementNode).props[0]

      expect(directive).toStrictEqual({
        type: NodeTypes.DIRECTIVE,
        name: 'on',
        arg: undefined,
        modifiers: ['enter'],
        exp: undefined,
        loc: {
          start: { offset: 5, line: 1, column: 6 },
          end: { offset: 15, line: 1, column: 16 },
          source: 'v-on.enter'
        }
      })
    })

    test('directive with two modifiers', () => {
      const ast = baseParse('<div v-on.enter.exact/>')
      const directive = (ast.children[0] as ElementNode).props[0]

      expect(directive).toStrictEqual({
        type: NodeTypes.DIRECTIVE,
        name: 'on',
        arg: undefined,
        modifiers: ['enter', 'exact'],
        exp: undefined,
        loc: {
          start: { offset: 5, line: 1, column: 6 },
          end: { offset: 21, line: 1, column: 22 },
          source: 'v-on.enter.exact'
        }
      })
    })

    test('directive with argument and modifiers', () => {
      const ast = baseParse('<div v-on:click.enter.exact/>')
      const directive = (ast.children[0] as ElementNode).props[0]

      expect(directive).toStrictEqual({
        type: NodeTypes.DIRECTIVE,
        name: 'on',
        arg: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'click',
          isStatic: true,
          constType: ConstantTypes.CAN_STRINGIFY,

          loc: {
            source: 'click',
            start: {
              column: 11,
              line: 1,
              offset: 10
            },
            end: {
              column: 16,
              line: 1,
              offset: 15
            }
          }
        },
        modifiers: ['enter', 'exact'],
        exp: undefined,
        loc: {
          start: { offset: 5, line: 1, column: 6 },
          end: { offset: 27, line: 1, column: 28 },
          source: 'v-on:click.enter.exact'
        }
      })
    })

    test('directive with dynamic argument and modifiers', () => {
      const ast = baseParse('<div v-on:[a.b].camel/>')
      const directive = (ast.children[0] as ElementNode).props[0]

      expect(directive).toStrictEqual({
        type: NodeTypes.DIRECTIVE,
        name: 'on',
        arg: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'a.b',
          isStatic: false,
          constType: ConstantTypes.NOT_CONSTANT,

          loc: {
            source: '[a.b]',
            start: {
              column: 11,
              line: 1,
              offset: 10
            },
            end: {
              column: 16,
              line: 1,
              offset: 15
            }
          }
        },
        modifiers: ['camel'],
        exp: undefined,
        loc: {
          start: { offset: 5, line: 1, column: 6 },
          end: { offset: 21, line: 1, column: 22 },
          source: 'v-on:[a.b].camel'
        }
      })
    })

    test('v-bind shorthand', () => {
      const ast = baseParse('<div :a=b />')
      const directive = (ast.children[0] as ElementNode).props[0]

      expect(directive).toStrictEqual({
        type: NodeTypes.DIRECTIVE,
        name: 'bind',
        arg: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'a',
          isStatic: true,
          constType: ConstantTypes.CAN_STRINGIFY,

          loc: {
            source: 'a',
            start: {
              column: 7,
              line: 1,
              offset: 6
            },
            end: {
              column: 8,
              line: 1,
              offset: 7
            }
          }
        },
        modifiers: [],
        exp: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'b',
          isStatic: false,
          constType: ConstantTypes.NOT_CONSTANT,

          loc: {
            start: { offset: 8, line: 1, column: 9 },
            end: { offset: 9, line: 1, column: 10 },
            source: 'b'
          }
        },
        loc: {
          start: { offset: 5, line: 1, column: 6 },
          end: { offset: 9, line: 1, column: 10 },
          source: ':a=b'
        }
      })
    })

    test('v-bind shorthand with modifier', () => {
      const ast = baseParse('<div :a.sync=b />')
      const directive = (ast.children[0] as ElementNode).props[0]

      expect(directive).toStrictEqual({
        type: NodeTypes.DIRECTIVE,
        name: 'bind',
        arg: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'a',
          isStatic: true,
          constType: ConstantTypes.CAN_STRINGIFY,

          loc: {
            source: 'a',
            start: {
              column: 7,
              line: 1,
              offset: 6
            },
            end: {
              column: 8,
              line: 1,
              offset: 7
            }
          }
        },
        modifiers: ['sync'],
        exp: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'b',
          isStatic: false,
          constType: ConstantTypes.NOT_CONSTANT,

          loc: {
            start: { offset: 13, line: 1, column: 14 },
            end: { offset: 14, line: 1, column: 15 },
            source: 'b'
          }
        },
        loc: {
          start: { offset: 5, line: 1, column: 6 },
          end: { offset: 14, line: 1, column: 15 },
          source: ':a.sync=b'
        }
      })
    })

    test('v-on shorthand', () => {
      const ast = baseParse('<div @a=b />')
      const directive = (ast.children[0] as ElementNode).props[0]

      expect(directive).toStrictEqual({
        type: NodeTypes.DIRECTIVE,
        name: 'on',
        arg: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'a',
          isStatic: true,
          constType: ConstantTypes.CAN_STRINGIFY,

          loc: {
            source: 'a',
            start: {
              column: 7,
              line: 1,
              offset: 6
            },
            end: {
              column: 8,
              line: 1,
              offset: 7
            }
          }
        },
        modifiers: [],
        exp: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'b',
          isStatic: false,
          constType: ConstantTypes.NOT_CONSTANT,

          loc: {
            start: { offset: 8, line: 1, column: 9 },
            end: { offset: 9, line: 1, column: 10 },
            source: 'b'
          }
        },
        loc: {
          start: { offset: 5, line: 1, column: 6 },
          end: { offset: 9, line: 1, column: 10 },
          source: '@a=b'
        }
      })
    })

    test('v-on shorthand with modifier', () => {
      const ast = baseParse('<div @a.enter=b />')
      const directive = (ast.children[0] as ElementNode).props[0]

      expect(directive).toStrictEqual({
        type: NodeTypes.DIRECTIVE,
        name: 'on',
        arg: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'a',
          isStatic: true,
          constType: ConstantTypes.CAN_STRINGIFY,

          loc: {
            source: 'a',
            start: {
              column: 7,
              line: 1,
              offset: 6
            },
            end: {
              column: 8,
              line: 1,
              offset: 7
            }
          }
        },
        modifiers: ['enter'],
        exp: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'b',
          isStatic: false,
          constType: ConstantTypes.NOT_CONSTANT,

          loc: {
            start: { offset: 14, line: 1, column: 15 },
            end: { offset: 15, line: 1, column: 16 },
            source: 'b'
          }
        },
        loc: {
          start: { offset: 5, line: 1, column: 6 },
          end: { offset: 15, line: 1, column: 16 },
          source: '@a.enter=b'
        }
      })
    })

    test('v-slot shorthand', () => {
      const ast = baseParse('<Comp #a="{ b }" />')
      const directive = (ast.children[0] as ElementNode).props[0]

      expect(directive).toStrictEqual({
        type: NodeTypes.DIRECTIVE,
        name: 'slot',
        arg: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'a',
          isStatic: true,
          constType: ConstantTypes.CAN_STRINGIFY,
          loc: {
            source: 'a',
            start: {
              column: 8,
              line: 1,
              offset: 7
            },
            end: {
              column: 9,
              line: 1,
              offset: 8
            }
          }
        },
        modifiers: [],
        exp: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: '{ b }',
          isStatic: false,
          // The `constType` is the default value and will be determined in transformExpression
          constType: ConstantTypes.NOT_CONSTANT,
          loc: {
            start: { offset: 10, line: 1, column: 11 },
            end: { offset: 15, line: 1, column: 16 },
            source: '{ b }'
          }
        },
        loc: {
          start: { offset: 6, line: 1, column: 7 },
          end: { offset: 16, line: 1, column: 17 },
          source: '#a="{ b }"'
        }
      })
    })

    // #1241 special case for 2.x compat
    test('v-slot arg containing dots', () => {
      const ast = baseParse('<Comp v-slot:foo.bar="{ a }" />')
      const directive = (ast.children[0] as ElementNode).props[0]

      expect(directive).toMatchObject({
        type: NodeTypes.DIRECTIVE,
        name: 'slot',
        arg: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'foo.bar',
          isStatic: true,
          constType: ConstantTypes.CAN_STRINGIFY,
          loc: {
            source: 'foo.bar',
            start: {
              column: 14,
              line: 1,
              offset: 13
            },
            end: {
              column: 21,
              line: 1,
              offset: 20
            }
          }
        }
      })
    })

    test('v-pre', () => {
      const ast = baseParse(
        `<div v-pre :id="foo"><Comp/>{{ bar }}</div>\n` +
          `<div :id="foo"><Comp/>{{ bar }}</div>`
      )

      const divWithPre = ast.children[0] as ElementNode
      expect(divWithPre.props).toMatchObject([
        {
          type: NodeTypes.ATTRIBUTE,
          name: `:id`,
          value: {
            type: NodeTypes.TEXT,
            content: `foo`
          },
          loc: {
            source: `:id="foo"`,
            start: {
              line: 1,
              column: 12
            },
            end: {
              line: 1,
              column: 21
            }
          }
        }
      ])
      expect(divWithPre.children[0]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tagType: ElementTypes.ELEMENT,
        tag: `Comp`
      })
      expect(divWithPre.children[1]).toMatchObject({
        type: NodeTypes.TEXT,
        content: `{{ bar }}`
      })

      // should not affect siblings after it
      const divWithoutPre = ast.children[1] as ElementNode
      expect(divWithoutPre.props).toMatchObject([
        {
          type: NodeTypes.DIRECTIVE,
          name: `bind`,
          arg: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            isStatic: true,
            content: `id`
          },
          exp: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            isStatic: false,
            content: `foo`
          },
          loc: {
            source: `:id="foo"`,
            start: {
              line: 2,
              column: 6
            },
            end: {
              line: 2,
              column: 15
            }
          }
        }
      ])
      expect(divWithoutPre.children[0]).toMatchObject({
        type: NodeTypes.ELEMENT,
        tagType: ElementTypes.COMPONENT,
        tag: `Comp`
      })
      expect(divWithoutPre.children[1]).toMatchObject({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: `bar`,
          isStatic: false
        }
      })
    })

    test('end tags are case-insensitive.', () => {
      const ast = baseParse('<div>hello</DIV>after')
      const element = ast.children[0] as ElementNode
      const text = element.children[0] as TextNode

      expect(text).toStrictEqual({
        type: NodeTypes.TEXT,
        content: 'hello',
        loc: {
          start: { offset: 5, line: 1, column: 6 },
          end: { offset: 10, line: 1, column: 11 },
          source: 'hello'
        }
      })
    })
  })

  test('self closing single tag', () => {
    const ast = baseParse('<div :class="{ some: condition }" />')

    expect(ast.children).toHaveLength(1)
    expect(ast.children[0]).toMatchObject({ tag: 'div' })
  })

  test('self closing multiple tag', () => {
    const ast = baseParse(
      `<div :class="{ some: condition }" />\n` +
        `<p v-bind:style="{ color: 'red' }"/>`
    )

    expect(ast).toMatchSnapshot()

    expect(ast.children).toHaveLength(2)
    expect(ast.children[0]).toMatchObject({ tag: 'div' })
    expect(ast.children[1]).toMatchObject({ tag: 'p' })
  })

  test('valid html', () => {
    const ast = baseParse(
      `<div :class="{ some: condition }">\n` +
        `  <p v-bind:style="{ color: 'red' }"/>\n` +
        `  <!-- a comment with <html> inside it -->\n` +
        `</div>`
    )

    expect(ast).toMatchSnapshot()

    expect(ast.children).toHaveLength(1)
    const el = ast.children[0] as any
    expect(el).toMatchObject({
      tag: 'div'
    })
    expect(el.children).toHaveLength(2)
    expect(el.children[0]).toMatchObject({
      tag: 'p'
    })
    expect(el.children[1]).toMatchObject({
      type: NodeTypes.COMMENT
    })
  })

  test('invalid html', () => {
    expect(() => {
      baseParse(`<div>\n<span>\n</div>\n</span>`)
    }).toThrow('Element is missing end tag.')

    const spy = jest.fn()
    const ast = baseParse(`<div>\n<span>\n</div>\n</span>`, {
      onError: spy
    })

    expect(spy.mock.calls).toMatchObject([
      [
        {
          code: ErrorCodes.X_MISSING_END_TAG,
          loc: {
            start: {
              offset: 6,
              line: 2,
              column: 1
            }
          }
        }
      ],
      [
        {
          code: ErrorCodes.X_INVALID_END_TAG,
          loc: {
            start: {
              offset: 20,
              line: 4,
              column: 1
            }
          }
        }
      ]
    ])

    expect(ast).toMatchSnapshot()
  })

  test('parse with correct location info', () => {
    const [foo, bar, but, baz] = baseParse(
      `
foo
 is {{ bar }} but {{ baz }}`.trim()
    ).children

    let offset = 0
    expect(foo.loc.start).toEqual({ line: 1, column: 1, offset })
    offset += foo.loc.source.length
    expect(foo.loc.end).toEqual({ line: 2, column: 5, offset })

    expect(bar.loc.start).toEqual({ line: 2, column: 5, offset })
    const barInner = (bar as InterpolationNode).content
    offset += 3
    expect(barInner.loc.start).toEqual({ line: 2, column: 8, offset })
    offset += barInner.loc.source.length
    expect(barInner.loc.end).toEqual({ line: 2, column: 11, offset })
    offset += 3
    expect(bar.loc.end).toEqual({ line: 2, column: 14, offset })

    expect(but.loc.start).toEqual({ line: 2, column: 14, offset })
    offset += but.loc.source.length
    expect(but.loc.end).toEqual({ line: 2, column: 19, offset })

    expect(baz.loc.start).toEqual({ line: 2, column: 19, offset })
    const bazInner = (baz as InterpolationNode).content
    offset += 3
    expect(bazInner.loc.start).toEqual({ line: 2, column: 22, offset })
    offset += bazInner.loc.source.length
    expect(bazInner.loc.end).toEqual({ line: 2, column: 25, offset })
    offset += 3
    expect(baz.loc.end).toEqual({ line: 2, column: 28, offset })
  })

  describe('decodeEntities option', () => {
    test('use default map', () => {
      const ast: any = baseParse('&gt;&lt;&amp;&apos;&quot;&foo;')

      expect(ast.children.length).toBe(1)
      expect(ast.children[0].type).toBe(NodeTypes.TEXT)
      expect(ast.children[0].content).toBe('><&\'"&foo;')
    })

    test('use the given map', () => {
      const ast: any = baseParse('&amp;&cups;', {
        decodeEntities: text => text.replace('&cups;', '\u222A\uFE00'),
        onError: () => {} // Ignore errors
      })

      expect(ast.children.length).toBe(1)
      expect(ast.children[0].type).toBe(NodeTypes.TEXT)
      expect(ast.children[0].content).toBe('&amp;\u222A\uFE00')
    })
  })

  describe('whitespace management', () => {
    it('should remove whitespaces at start/end inside an element', () => {
      const ast = baseParse(`<div>   <span/>    </div>`)
      expect((ast.children[0] as ElementNode).children.length).toBe(1)
    })

    it('should remove whitespaces w/ newline between elements', () => {
      const ast = baseParse(`<div/> \n <div/> \n <div/>`)
      expect(ast.children.length).toBe(3)
      expect(ast.children.every(c => c.type === NodeTypes.ELEMENT)).toBe(true)
    })

    it('should remove whitespaces adjacent to comments', () => {
      const ast = baseParse(`<div/> \n <!--foo--> <div/>`)
      expect(ast.children.length).toBe(3)
      expect(ast.children[0].type).toBe(NodeTypes.ELEMENT)
      expect(ast.children[1].type).toBe(NodeTypes.COMMENT)
      expect(ast.children[2].type).toBe(NodeTypes.ELEMENT)
    })

    it('should remove whitespaces w/ newline between comments and elements', () => {
      const ast = baseParse(`<div/> \n <!--foo--> \n <div/>`)
      expect(ast.children.length).toBe(3)
      expect(ast.children[0].type).toBe(NodeTypes.ELEMENT)
      expect(ast.children[1].type).toBe(NodeTypes.COMMENT)
      expect(ast.children[2].type).toBe(NodeTypes.ELEMENT)
    })

    it('should NOT remove whitespaces w/ newline between interpolations', () => {
      const ast = baseParse(`{{ foo }} \n {{ bar }}`)
      expect(ast.children.length).toBe(3)
      expect(ast.children[0].type).toBe(NodeTypes.INTERPOLATION)
      expect(ast.children[1]).toMatchObject({
        type: NodeTypes.TEXT,
        content: ' '
      })
      expect(ast.children[2].type).toBe(NodeTypes.INTERPOLATION)
    })

    it('should NOT remove whitespaces w/o newline between elements', () => {
      const ast = baseParse(`<div/> <div/> <div/>`)
      expect(ast.children.length).toBe(5)
      expect(ast.children.map(c => c.type)).toMatchObject([
        NodeTypes.ELEMENT,
        NodeTypes.TEXT,
        NodeTypes.ELEMENT,
        NodeTypes.TEXT,
        NodeTypes.ELEMENT
      ])
    })

    it('should condense consecutive whitespaces in text', () => {
      const ast = baseParse(`   foo  \n    bar     baz     `)
      expect((ast.children[0] as TextNode).content).toBe(` foo bar baz `)
    })

    it('should remove leading newline character immediately following the pre element start tag', () => {
      const ast = baseParse(`<pre>\n  foo  bar  </pre>`, {
        isPreTag: tag => tag === 'pre'
      })
      expect(ast.children).toHaveLength(1)
      const preElement = ast.children[0] as ElementNode
      expect(preElement.children).toHaveLength(1)
      expect((preElement.children[0] as TextNode).content).toBe(`  foo  bar  `)
    })

    it('should NOT remove leading newline character immediately following child-tag of pre element', () => {
      const ast = baseParse(`<pre><span></span>\n  foo  bar  </pre>`, {
        isPreTag: tag => tag === 'pre'
      })
      const preElement = ast.children[0] as ElementNode
      expect(preElement.children).toHaveLength(2)
      expect((preElement.children[1] as TextNode).content).toBe(
        `\n  foo  bar  `
      )
    })

    it('should NOT condense whitespaces in RCDATA text mode', () => {
      const ast = baseParse(`<textarea>Text:\n   foo</textarea>`, {
        getTextMode: ({ tag }) =>
          tag === 'textarea' ? TextModes.RCDATA : TextModes.DATA
      })
      const preElement = ast.children[0] as ElementNode
      expect(preElement.children).toHaveLength(1)
      expect((preElement.children[0] as TextNode).content).toBe(`Text:\n   foo`)
    })
  })

  describe('Errors', () => {
    const patterns: {
      [key: string]: Array<{
        code: string
        errors: Array<{ type: ErrorCodes; loc: Position }>
        options?: Partial<ParserOptions>
      }>
    } = {
      ABRUPT_CLOSING_OF_EMPTY_COMMENT: [
        {
          code: '<template><!--></template>',
          errors: [
            {
              type: ErrorCodes.ABRUPT_CLOSING_OF_EMPTY_COMMENT,
              loc: { offset: 10, line: 1, column: 11 }
            }
          ]
        },
        {
          code: '<template><!---></template>',
          errors: [
            {
              type: ErrorCodes.ABRUPT_CLOSING_OF_EMPTY_COMMENT,
              loc: { offset: 10, line: 1, column: 11 }
            }
          ]
        },
        {
          code: '<template><!----></template>',
          errors: []
        }
      ],
      CDATA_IN_HTML_CONTENT: [
        {
          code: '<template><![CDATA[cdata]]></template>',
          errors: [
            {
              type: ErrorCodes.CDATA_IN_HTML_CONTENT,
              loc: { offset: 10, line: 1, column: 11 }
            }
          ]
        },
        {
          code: '<template><svg><![CDATA[cdata]]></svg></template>',
          errors: []
        }
      ],
      DUPLICATE_ATTRIBUTE: [
        {
          code: '<template><div id="" id=""></div></template>',
          errors: [
            {
              type: ErrorCodes.DUPLICATE_ATTRIBUTE,
              loc: { offset: 21, line: 1, column: 22 }
            }
          ]
        }
      ],
      END_TAG_WITH_ATTRIBUTES: [
        {
          code: '<template><div></div id=""></template>',
          errors: [
            {
              type: ErrorCodes.END_TAG_WITH_ATTRIBUTES,
              loc: { offset: 21, line: 1, column: 22 }
            }
          ]
        }
      ],
      END_TAG_WITH_TRAILING_SOLIDUS: [
        {
          code: '<template><div></div/></template>',
          errors: [
            {
              type: ErrorCodes.END_TAG_WITH_TRAILING_SOLIDUS,
              loc: { offset: 20, line: 1, column: 21 }
            }
          ]
        }
      ],
      EOF_BEFORE_TAG_NAME: [
        {
          code: '<template><',
          errors: [
            {
              type: ErrorCodes.EOF_BEFORE_TAG_NAME,
              loc: { offset: 11, line: 1, column: 12 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: '<template></',
          errors: [
            {
              type: ErrorCodes.EOF_BEFORE_TAG_NAME,
              loc: { offset: 12, line: 1, column: 13 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        }
      ],
      EOF_IN_CDATA: [
        {
          code: '<template><svg><![CDATA[cdata',
          errors: [
            {
              type: ErrorCodes.EOF_IN_CDATA,
              loc: { offset: 29, line: 1, column: 30 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: '<template><svg><![CDATA[',
          errors: [
            {
              type: ErrorCodes.EOF_IN_CDATA,
              loc: { offset: 24, line: 1, column: 25 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        }
      ],
      EOF_IN_COMMENT: [
        {
          code: '<template><!--comment',
          errors: [
            {
              type: ErrorCodes.EOF_IN_COMMENT,
              loc: { offset: 21, line: 1, column: 22 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: '<template><!--',
          errors: [
            {
              type: ErrorCodes.EOF_IN_COMMENT,
              loc: { offset: 14, line: 1, column: 15 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        // Bogus comments don't throw eof-in-comment error.
        // https://html.spec.whatwg.org/multipage/parsing.html#bogus-comment-state
        {
          code: '<template><!',
          errors: [
            {
              type: ErrorCodes.INCORRECTLY_OPENED_COMMENT,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: '<template><!-',
          errors: [
            {
              type: ErrorCodes.INCORRECTLY_OPENED_COMMENT,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: '<template><!abc',
          errors: [
            {
              type: ErrorCodes.INCORRECTLY_OPENED_COMMENT,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        }
      ],
      EOF_IN_SCRIPT_HTML_COMMENT_LIKE_TEXT: [
        {
          code: "<script><!--console.log('hello')",
          errors: [
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            },
            {
              type: ErrorCodes.EOF_IN_SCRIPT_HTML_COMMENT_LIKE_TEXT,
              loc: { offset: 32, line: 1, column: 33 }
            }
          ]
        },
        {
          code: "<script>console.log('hello')",
          errors: [
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        }
      ],
      EOF_IN_TAG: [
        {
          code: '<template><div',
          errors: [
            {
              type: ErrorCodes.EOF_IN_TAG,
              loc: { offset: 14, line: 1, column: 15 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: '<template><div ',
          errors: [
            {
              type: ErrorCodes.EOF_IN_TAG,
              loc: { offset: 15, line: 1, column: 16 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: '<template><div id',
          errors: [
            {
              type: ErrorCodes.EOF_IN_TAG,
              loc: { offset: 17, line: 1, column: 18 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: '<template><div id ',
          errors: [
            {
              type: ErrorCodes.EOF_IN_TAG,
              loc: { offset: 18, line: 1, column: 19 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: '<template><div id =',
          errors: [
            {
              type: ErrorCodes.MISSING_ATTRIBUTE_VALUE,
              loc: { offset: 19, line: 1, column: 20 }
            },
            {
              type: ErrorCodes.EOF_IN_TAG,
              loc: { offset: 19, line: 1, column: 20 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: "<template><div id='abc",
          errors: [
            {
              type: ErrorCodes.EOF_IN_TAG,
              loc: { offset: 22, line: 1, column: 23 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: '<template><div id="abc',
          errors: [
            {
              type: ErrorCodes.EOF_IN_TAG,
              loc: { offset: 22, line: 1, column: 23 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: "<template><div id='abc'",
          errors: [
            {
              type: ErrorCodes.EOF_IN_TAG,
              loc: { offset: 23, line: 1, column: 24 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: '<template><div id="abc"',
          errors: [
            {
              type: ErrorCodes.EOF_IN_TAG,
              loc: { offset: 23, line: 1, column: 24 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: '<template><div id=abc',
          errors: [
            {
              type: ErrorCodes.EOF_IN_TAG,
              loc: { offset: 21, line: 1, column: 22 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: "<template><div id='abc'/",
          errors: [
            {
              type: ErrorCodes.UNEXPECTED_SOLIDUS_IN_TAG,
              loc: { offset: 23, line: 1, column: 24 }
            },
            {
              type: ErrorCodes.EOF_IN_TAG,
              loc: { offset: 24, line: 1, column: 25 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: '<template><div id="abc"/',
          errors: [
            {
              type: ErrorCodes.UNEXPECTED_SOLIDUS_IN_TAG,
              loc: { offset: 23, line: 1, column: 24 }
            },
            {
              type: ErrorCodes.EOF_IN_TAG,
              loc: { offset: 24, line: 1, column: 25 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: '<template><div id=abc /',
          errors: [
            {
              type: ErrorCodes.UNEXPECTED_SOLIDUS_IN_TAG,
              loc: { offset: 22, line: 1, column: 23 }
            },
            {
              type: ErrorCodes.EOF_IN_TAG,
              loc: { offset: 23, line: 1, column: 24 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: '<div></div',
          errors: [
            {
              type: ErrorCodes.EOF_IN_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            }
          ]
        }
      ],
      INCORRECTLY_CLOSED_COMMENT: [
        {
          code: '<template><!--comment--!></template>',
          errors: [
            {
              type: ErrorCodes.INCORRECTLY_CLOSED_COMMENT,
              loc: { offset: 10, line: 1, column: 11 }
            }
          ]
        }
      ],
      INCORRECTLY_OPENED_COMMENT: [
        {
          code: '<template><!></template>',
          errors: [
            {
              type: ErrorCodes.INCORRECTLY_OPENED_COMMENT,
              loc: { offset: 10, line: 1, column: 11 }
            }
          ]
        },
        {
          code: '<template><!-></template>',
          errors: [
            {
              type: ErrorCodes.INCORRECTLY_OPENED_COMMENT,
              loc: { offset: 10, line: 1, column: 11 }
            }
          ]
        },
        {
          code: '<template><!ELEMENT br EMPTY></template>',
          errors: [
            {
              type: ErrorCodes.INCORRECTLY_OPENED_COMMENT,
              loc: { offset: 10, line: 1, column: 11 }
            }
          ]
        },
        // Just ignore doctype.
        {
          code: '<!DOCTYPE html>',
          errors: []
        }
      ],
      INVALID_FIRST_CHARACTER_OF_TAG_NAME: [
        {
          code: '<template>a < b</template>',
          errors: [
            {
              type: ErrorCodes.INVALID_FIRST_CHARACTER_OF_TAG_NAME,
              loc: { offset: 13, line: 1, column: 14 }
            }
          ]
        },
        {
          code: '<template><�></template>',
          errors: [
            {
              type: ErrorCodes.INVALID_FIRST_CHARACTER_OF_TAG_NAME,
              loc: { offset: 11, line: 1, column: 12 }
            }
          ]
        },
        {
          code: '<template>a </ b</template>',
          errors: [
            {
              type: ErrorCodes.INVALID_FIRST_CHARACTER_OF_TAG_NAME,
              loc: { offset: 14, line: 1, column: 15 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: '<template></�></template>',
          errors: [
            {
              type: ErrorCodes.INVALID_FIRST_CHARACTER_OF_TAG_NAME,
              loc: { offset: 12, line: 1, column: 13 }
            }
          ]
        },
        // Don't throw invalid-first-character-of-tag-name in interpolation
        {
          code: '<template>{{a < b}}</template>',
          errors: []
        }
      ],
      MISSING_ATTRIBUTE_VALUE: [
        {
          code: '<template><div id=></div></template>',
          errors: [
            {
              type: ErrorCodes.MISSING_ATTRIBUTE_VALUE,
              loc: { offset: 18, line: 1, column: 19 }
            }
          ]
        },
        {
          code: '<template><div id= ></div></template>',
          errors: [
            {
              type: ErrorCodes.MISSING_ATTRIBUTE_VALUE,
              loc: { offset: 19, line: 1, column: 20 }
            }
          ]
        },
        {
          code: '<template><div id= /></div></template>',
          errors: []
        }
      ],
      MISSING_END_TAG_NAME: [
        {
          code: '<template></></template>',
          errors: [
            {
              type: ErrorCodes.MISSING_END_TAG_NAME,
              loc: { offset: 12, line: 1, column: 13 }
            }
          ]
        }
      ],
      MISSING_WHITESPACE_BETWEEN_ATTRIBUTES: [
        {
          code: '<template><div id="foo"class="bar"></div></template>',
          errors: [
            {
              type: ErrorCodes.MISSING_WHITESPACE_BETWEEN_ATTRIBUTES,
              loc: { offset: 23, line: 1, column: 24 }
            }
          ]
        },
        // CR doesn't appear in tokenization phase, but all CR are removed in preprocessing.
        // https://html.spec.whatwg.org/multipage/parsing.html#preprocessing-the-input-stream
        {
          code: '<template><div id="foo"\r\nclass="bar"></div></template>',
          errors: []
        }
      ],
      NESTED_COMMENT: [
        {
          code: '<template><!--a<!--b--></template>',
          errors: [
            {
              type: ErrorCodes.NESTED_COMMENT,
              loc: { offset: 15, line: 1, column: 16 }
            }
          ]
        },
        {
          code: '<template><!--a<!--b<!--c--></template>',
          errors: [
            {
              type: ErrorCodes.NESTED_COMMENT,
              loc: { offset: 15, line: 1, column: 16 }
            },
            {
              type: ErrorCodes.NESTED_COMMENT,
              loc: { offset: 20, line: 1, column: 21 }
            }
          ]
        },
        {
          code: '<template><!--a<!--b<!----></template>',
          errors: [
            {
              type: ErrorCodes.NESTED_COMMENT,
              loc: { offset: 15, line: 1, column: 16 }
            }
          ]
        },
        {
          code: '<template><!--a<!--></template>',
          errors: []
        },
        {
          code: '<template><!--a<!--',
          errors: [
            {
              type: ErrorCodes.EOF_IN_COMMENT,
              loc: { offset: 19, line: 1, column: 20 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        }
      ],
      UNEXPECTED_CHARACTER_IN_ATTRIBUTE_NAME: [
        {
          code: "<template><div a\"bc=''></div></template>",
          errors: [
            {
              type: ErrorCodes.UNEXPECTED_CHARACTER_IN_ATTRIBUTE_NAME,
              loc: { offset: 16, line: 1, column: 17 }
            }
          ]
        },
        {
          code: "<template><div a'bc=''></div></template>",
          errors: [
            {
              type: ErrorCodes.UNEXPECTED_CHARACTER_IN_ATTRIBUTE_NAME,
              loc: { offset: 16, line: 1, column: 17 }
            }
          ]
        },
        {
          code: "<template><div a<bc=''></div></template>",
          errors: [
            {
              type: ErrorCodes.UNEXPECTED_CHARACTER_IN_ATTRIBUTE_NAME,
              loc: { offset: 16, line: 1, column: 17 }
            }
          ]
        }
      ],
      UNEXPECTED_CHARACTER_IN_UNQUOTED_ATTRIBUTE_VALUE: [
        {
          code: '<template><div foo=bar"></div></template>',
          errors: [
            {
              type: ErrorCodes.UNEXPECTED_CHARACTER_IN_UNQUOTED_ATTRIBUTE_VALUE,
              loc: { offset: 22, line: 1, column: 23 }
            }
          ]
        },
        {
          code: "<template><div foo=bar'></div></template>",
          errors: [
            {
              type: ErrorCodes.UNEXPECTED_CHARACTER_IN_UNQUOTED_ATTRIBUTE_VALUE,
              loc: { offset: 22, line: 1, column: 23 }
            }
          ]
        },
        {
          code: '<template><div foo=bar<div></div></template>',
          errors: [
            {
              type: ErrorCodes.UNEXPECTED_CHARACTER_IN_UNQUOTED_ATTRIBUTE_VALUE,
              loc: { offset: 22, line: 1, column: 23 }
            }
          ]
        },
        {
          code: '<template><div foo=bar=baz></div></template>',
          errors: [
            {
              type: ErrorCodes.UNEXPECTED_CHARACTER_IN_UNQUOTED_ATTRIBUTE_VALUE,
              loc: { offset: 22, line: 1, column: 23 }
            }
          ]
        },
        {
          code: '<template><div foo=bar`></div></template>',
          errors: [
            {
              type: ErrorCodes.UNEXPECTED_CHARACTER_IN_UNQUOTED_ATTRIBUTE_VALUE,
              loc: { offset: 22, line: 1, column: 23 }
            }
          ]
        }
      ],
      UNEXPECTED_EQUALS_SIGN_BEFORE_ATTRIBUTE_NAME: [
        {
          code: '<template><div =foo=bar></div></template>',
          errors: [
            {
              type: ErrorCodes.UNEXPECTED_EQUALS_SIGN_BEFORE_ATTRIBUTE_NAME,
              loc: { offset: 15, line: 1, column: 16 }
            }
          ]
        },
        {
          code: '<template><div =></div></template>',
          errors: [
            {
              type: ErrorCodes.UNEXPECTED_EQUALS_SIGN_BEFORE_ATTRIBUTE_NAME,
              loc: { offset: 15, line: 1, column: 16 }
            }
          ]
        }
      ],
      UNEXPECTED_QUESTION_MARK_INSTEAD_OF_TAG_NAME: [
        {
          code: '<template><?xml?></template>',
          errors: [
            {
              type: ErrorCodes.UNEXPECTED_QUESTION_MARK_INSTEAD_OF_TAG_NAME,
              loc: { offset: 11, line: 1, column: 12 }
            }
          ]
        }
      ],
      UNEXPECTED_SOLIDUS_IN_TAG: [
        {
          code: '<template><div a/b></div></template>',
          errors: [
            {
              type: ErrorCodes.UNEXPECTED_SOLIDUS_IN_TAG,
              loc: { offset: 16, line: 1, column: 17 }
            }
          ]
        }
      ],
      X_INVALID_END_TAG: [
        {
          code: '<template></div></template>',
          errors: [
            {
              type: ErrorCodes.X_INVALID_END_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            }
          ]
        },
        {
          code: '<template></div></div></template>',
          errors: [
            {
              type: ErrorCodes.X_INVALID_END_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_INVALID_END_TAG,
              loc: { offset: 16, line: 1, column: 17 }
            }
          ]
        },
        {
          code: "<template>{{'</div>'}}</template>",
          errors: []
        },
        {
          code: '<textarea></div></textarea>',
          errors: []
        },
        {
          code: '<svg><![CDATA[</div>]]></svg>',
          errors: []
        },
        {
          code: '<svg><!--</div>--></svg>',
          errors: []
        }
      ],
      X_MISSING_END_TAG: [
        {
          code: '<template><div></template>',
          errors: [
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            }
          ]
        },
        {
          code: '<template><div>',
          errors: [
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 10, line: 1, column: 11 }
            },
            {
              type: ErrorCodes.X_MISSING_END_TAG,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        }
      ],
      X_MISSING_INTERPOLATION_END: [
        {
          code: '{{ foo',
          errors: [
            {
              type: ErrorCodes.X_MISSING_INTERPOLATION_END,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: '{{',
          errors: [
            {
              type: ErrorCodes.X_MISSING_INTERPOLATION_END,
              loc: { offset: 0, line: 1, column: 1 }
            }
          ]
        },
        {
          code: '{{}}',
          errors: []
        }
      ],
      X_MISSING_DYNAMIC_DIRECTIVE_ARGUMENT_END: [
        {
          code: `<div v-foo:[sef fsef] />`,
          errors: [
            {
              type: ErrorCodes.X_MISSING_DYNAMIC_DIRECTIVE_ARGUMENT_END,
              loc: { offset: 15, line: 1, column: 16 }
            }
          ]
        }
      ]
    }

    for (const key of Object.keys(patterns) as (keyof (typeof patterns))[]) {
      describe(key, () => {
        for (const { code, errors, options } of patterns[key]) {
          test(
            code.replace(
              /[\r\n]/g,
              c => `\\x0${c.codePointAt(0)!.toString(16)};`
            ),
            () => {
              const spy = jest.fn()
              const ast = baseParse(code, {
                getNamespace: (tag, parent) => {
                  const ns = parent ? parent.ns : Namespaces.HTML
                  if (ns === Namespaces.HTML) {
                    if (tag === 'svg') {
                      return (Namespaces.HTML + 1) as any
                    }
                  }
                  return ns
                },
                getTextMode: ({ tag }) => {
                  if (tag === 'textarea') {
                    return TextModes.RCDATA
                  }
                  if (tag === 'script') {
                    return TextModes.RAWTEXT
                  }
                  return TextModes.DATA
                },
                ...options,
                onError: spy
              })

              expect(
                spy.mock.calls.map(([err]) => ({
                  type: err.code,
                  loc: err.loc.start
                }))
              ).toMatchObject(errors)
              expect(ast).toMatchSnapshot()
            }
          )
        }
      })
    }
  })
})
