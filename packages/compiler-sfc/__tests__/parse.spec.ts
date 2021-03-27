import { parse } from '../src'
import { baseParse, baseCompile } from '@vue/compiler-core'
import { SourceMapConsumer } from 'source-map'

describe('compiler:sfc', () => {
  describe('source map', () => {
    test('style block', () => {
      // Padding determines how many blank lines will there be before the style block
      const padding = Math.round(Math.random() * 10)
      const style = parse(
        `${'\n'.repeat(padding)}<style>\n.color {\n color: red;\n }\n</style>\n`
      ).descriptor.styles[0]

      expect(style.map).not.toBeUndefined()

      const consumer = new SourceMapConsumer(style.map!)
      consumer.eachMapping(mapping => {
        expect(mapping.originalLine - mapping.generatedLine).toBe(padding)
      })
    })

    test('script block', () => {
      // Padding determines how many blank lines will there be before the style block
      const padding = Math.round(Math.random() * 10)
      const script = parse(
        `${'\n'.repeat(padding)}<script>\nconsole.log(1)\n }\n</script>\n`
      ).descriptor.script

      expect(script!.map).not.toBeUndefined()

      const consumer = new SourceMapConsumer(script!.map!)
      consumer.eachMapping(mapping => {
        expect(mapping.originalLine - mapping.generatedLine).toBe(padding)
      })
    })

    test('custom block', () => {
      const padding = Math.round(Math.random() * 10)
      const custom = parse(
        `${'\n'.repeat(padding)}<i18n>\n{\n  "greeting": "hello"\n}\n</i18n>\n`
      ).descriptor.customBlocks[0]

      expect(custom!.map).not.toBeUndefined()

      const consumer = new SourceMapConsumer(custom!.map!)
      consumer.eachMapping(mapping => {
        expect(mapping.originalLine - mapping.generatedLine).toBe(padding)
      })
    })
  })

  test('pad content', () => {
    const content = `
<template>
<div></div>
</template>
<script>
export default {}
</script>
<style>
h1 { color: red }
</style>
<i18n>
{ "greeting": "hello" }
</i18n>
`
    const padFalse = parse(content.trim(), { pad: false }).descriptor
    expect(padFalse.template!.content).toBe('\n<div></div>\n')
    expect(padFalse.script!.content).toBe('\nexport default {}\n')
    expect(padFalse.styles[0].content).toBe('\nh1 { color: red }\n')
    expect(padFalse.customBlocks[0].content).toBe('\n{ "greeting": "hello" }\n')

    const padTrue = parse(content.trim(), { pad: true }).descriptor
    expect(padTrue.script!.content).toBe(
      Array(3 + 1).join('//\n') + '\nexport default {}\n'
    )
    expect(padTrue.styles[0].content).toBe(
      Array(6 + 1).join('\n') + '\nh1 { color: red }\n'
    )
    expect(padTrue.customBlocks[0].content).toBe(
      Array(9 + 1).join('\n') + '\n{ "greeting": "hello" }\n'
    )

    const padLine = parse(content.trim(), { pad: 'line' }).descriptor
    expect(padLine.script!.content).toBe(
      Array(3 + 1).join('//\n') + '\nexport default {}\n'
    )
    expect(padLine.styles[0].content).toBe(
      Array(6 + 1).join('\n') + '\nh1 { color: red }\n'
    )
    expect(padLine.customBlocks[0].content).toBe(
      Array(9 + 1).join('\n') + '\n{ "greeting": "hello" }\n'
    )

    const padSpace = parse(content.trim(), { pad: 'space' }).descriptor
    expect(padSpace.script!.content).toBe(
      `<template>\n<div></div>\n</template>\n<script>`.replace(/./g, ' ') +
        '\nexport default {}\n'
    )
    expect(padSpace.styles[0].content).toBe(
      `<template>\n<div></div>\n</template>\n<script>\nexport default {}\n</script>\n<style>`.replace(
        /./g,
        ' '
      ) + '\nh1 { color: red }\n'
    )
    expect(padSpace.customBlocks[0].content).toBe(
      `<template>\n<div></div>\n</template>\n<script>\nexport default {}\n</script>\n<style>\nh1 { color: red }\n</style>\n<i18n>`.replace(
        /./g,
        ' '
      ) + '\n{ "greeting": "hello" }\n'
    )
  })

  test('should keep template nodes with no content', () => {
    const { descriptor } = parse(`<template/>`)
    expect(descriptor.template).toBeTruthy()
    expect(descriptor.template!.content).toBeFalsy()
  })

  test('should ignore other nodes with no content', () => {
    expect(parse(`<script/>`).descriptor.script).toBe(null)
    expect(parse(`<style/>`).descriptor.styles.length).toBe(0)
    expect(parse(`<custom/>`).descriptor.customBlocks.length).toBe(0)
  })

  test('handle empty nodes with src attribute', () => {
    const { descriptor } = parse(`<script src="com"/>`)
    expect(descriptor.script).toBeTruthy()
    expect(descriptor.script!.content).toBeFalsy()
    expect(descriptor.script!.attrs['src']).toBe('com')
  })

  test('nested templates', () => {
    const content = `
    <template v-if="ok">ok</template>
    <div><div></div></div>
    `
    const { descriptor } = parse(`<template>${content}</template>`)
    expect(descriptor.template!.content).toBe(content)
  })

  test('treat empty lang attribute as the html', () => {
    const content = `<div><template v-if="ok">ok</template></div>`
    const { descriptor, errors } = parse(
      `<template lang="">${content}</template>`
    )
    expect(descriptor.template!.content).toBe(content)
    expect(errors.length).toBe(0)
  })

  // #1120
  test('alternative template lang should be treated as plain text', () => {
    const content = `p(v-if="1 < 2") test`
    const { descriptor, errors } = parse(
      `<template lang="pug">` + content + `</template>`
    )
    expect(errors.length).toBe(0)
    expect(descriptor.template!.content).toBe(content)
  })

  //#2566
  test('div lang should not be treated as plain text', () => {
    const { errors } = parse(`
    <template lang="pug">
      <div lang="">
        <div></div>
      </div>
    </template>
    `)
    expect(errors.length).toBe(0)
  })

  test('slotted detection', async () => {
    expect(parse(`<template>hi</template>`).descriptor.slotted).toBe(false)
    expect(
      parse(`<template>hi</template><style>h1{color:red;}</style>`).descriptor
        .slotted
    ).toBe(false)
    expect(
      parse(
        `<template>hi</template><style scoped>:slotted(h1){color:red;}</style>`
      ).descriptor.slotted
    ).toBe(true)
    expect(
      parse(
        `<template>hi</template><style scoped>::v-slotted(h1){color:red;}</style>`
      ).descriptor.slotted
    ).toBe(true)
  })

  test('error tolerance', () => {
    const { errors } = parse(`<template>`)
    expect(errors.length).toBe(1)
  })

  test('should parse as DOM by default', () => {
    const { errors } = parse(`<template><input></template>`)
    expect(errors.length).toBe(0)
  })

  test('custom compiler', () => {
    const { errors } = parse(`<template><input></template>`, {
      compiler: {
        parse: baseParse,
        compile: baseCompile
      }
    })
    expect(errors.length).toBe(1)
  })

  test('treat custom blocks as raw text', () => {
    const { errors, descriptor } = parse(`<foo> <-& </foo>`)
    expect(errors.length).toBe(0)
    expect(descriptor.customBlocks[0].content).toBe(` <-& `)
  })

  describe('warnings', () => {
    function assertWarning(errors: Error[], msg: string) {
      expect(errors.some(e => e.message.match(msg))).toBe(true)
    }

    test('should only allow single template element', () => {
      assertWarning(
        parse(`<template><div/></template><template><div/></template>`).errors,
        `Single file component can contain only one <template> element`
      )
    })

    test('should only allow single script element', () => {
      assertWarning(
        parse(`<script>console.log(1)</script><script>console.log(1)</script>`)
          .errors,
        `Single file component can contain only one <script> element`
      )
    })

    test('should only allow single script setup element', () => {
      assertWarning(
        parse(
          `<script setup>console.log(1)</script><script setup>console.log(1)</script>`
        ).errors,
        `Single file component can contain only one <script setup> element`
      )
    })

    test('should not warn script & script setup', () => {
      expect(
        parse(
          `<script setup>console.log(1)</script><script>console.log(1)</script>`
        ).errors.length
      ).toBe(0)
    })
  })
})
