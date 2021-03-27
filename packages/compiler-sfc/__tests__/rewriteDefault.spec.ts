import { rewriteDefault } from '../src'

describe('compiler sfc: rewriteDefault', () => {
  test('without export default', () => {
    expect(rewriteDefault(`export  a = {}`, 'script')).toMatchInlineSnapshot(`
      "export  a = {}
      const script = {}"
    `)
  })

  test('rewrite export default', () => {
    expect(
      rewriteDefault(`export  default {}`, 'script')
    ).toMatchInlineSnapshot(`"const script = {}"`)
  })

  test('rewrite export named default', () => {
    expect(
      rewriteDefault(
        `const a = 1 \n export { a as b, a as default, a as c}`,
        'script'
      )
    ).toMatchInlineSnapshot(`
      "const a = 1 
       export { a as b,  a as c}
      const script = a"
    `)
  })

  test('w/ comments', async () => {
    expect(rewriteDefault(`// export default\nexport default {}`, 'script'))
      .toMatchInlineSnapshot(`
      "// export default
      const script = {}"
    `)
  })

  test('export default class', async () => {
    expect(rewriteDefault(`export default class Foo {}`, 'script'))
      .toMatchInlineSnapshot(`
      "class Foo {}
      const script = Foo"
    `)
  })

  test('export default class w/ comments', async () => {
    expect(
      rewriteDefault(`// export default\nexport default class Foo {}`, 'script')
    ).toMatchInlineSnapshot(`
      "// export default
      class Foo {}
      const script = Foo"
    `)
  })

  test('export default class w/ comments 2', async () => {
    expect(
      rewriteDefault(
        `export default {}\n` + `// export default class Foo {}`,
        'script'
      )
    ).toMatchInlineSnapshot(`
      "const script = {}
      // export default class Foo {}"
    `)
  })

  test('export default class w/ comments 3', async () => {
    expect(
      rewriteDefault(
        `/*\nexport default class Foo {}*/\n` + `export default class Bar {}`,
        'script'
      )
    ).toMatchInlineSnapshot(`
      "/*
      export default class Foo {}*/
      const script = class Bar {}"
    `)
  })
})
