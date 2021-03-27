import { getCompiledString } from './utils'
import { compile } from '../src'

describe('ssr: element', () => {
  test('basic elements', () => {
    expect(getCompiledString(`<div></div>`)).toMatchInlineSnapshot(
      `"\`<div></div>\`"`
    )
    expect(getCompiledString(`<div/>`)).toMatchInlineSnapshot(
      `"\`<div></div>\`"`
    )
  })

  test('nested elements', () => {
    expect(
      getCompiledString(`<div><span></span><span></span></div>`)
    ).toMatchInlineSnapshot(`"\`<div><span></span><span></span></div>\`"`)
  })

  test('void element', () => {
    expect(getCompiledString(`<input>`)).toMatchInlineSnapshot(`"\`<input>\`"`)
  })

  describe('children override', () => {
    test('v-html', () => {
      expect(getCompiledString(`<div v-html="foo"/>`)).toMatchInlineSnapshot(`
        "\`<div>\${
            _ctx.foo
          }</div>\`"
      `)
    })

    test('v-text', () => {
      expect(getCompiledString(`<div v-text="foo"/>`)).toMatchInlineSnapshot(`
        "\`<div>\${
            _ssrInterpolate(_ctx.foo)
          }</div>\`"
      `)
    })

    test('<textarea> with dynamic value', () => {
      expect(getCompiledString(`<textarea :value="foo"/>`))
        .toMatchInlineSnapshot(`
        "\`<textarea>\${
            _ssrInterpolate(_ctx.foo)
          }</textarea>\`"
      `)
    })

    test('<textarea> with static value', () => {
      expect(
        getCompiledString(`<textarea value="fo&gt;o"/>`)
      ).toMatchInlineSnapshot(`"\`<textarea>fo&gt;o</textarea>\`"`)
    })

    test('<textarea> with dynamic v-bind', () => {
      expect(compile(`<textarea v-bind="obj">fallback</textarea>`).code)
        .toMatchInlineSnapshot(`
        "const { mergeProps: _mergeProps } = require(\\"vue\\")
        const { ssrRenderAttrs: _ssrRenderAttrs, ssrInterpolate: _ssrInterpolate } = require(\\"@vue/server-renderer\\")

        return function ssrRender(_ctx, _push, _parent, _attrs) {
          let _temp0

          _push(\`<textarea\${
            _ssrRenderAttrs(_temp0 = _mergeProps(_ctx.obj, _attrs), \\"textarea\\")
          }>\${
            _ssrInterpolate((\\"value\\" in _temp0) ? _temp0.value : \\"fallback\\")
          }</textarea>\`)
        }"
      `)
    })

    test('multiple _ssrInterpolate at parent and child import dependency once', () => {
      expect(
        compile(`<div>{{ hello }}<textarea v-bind="a"></textarea></div>`).code
      ).toMatchInlineSnapshot(`
        "const { ssrRenderAttrs: _ssrRenderAttrs, ssrInterpolate: _ssrInterpolate } = require(\\"@vue/server-renderer\\")

        return function ssrRender(_ctx, _push, _parent, _attrs) {
          let _temp0

          _push(\`<div\${
            _ssrRenderAttrs(_attrs)
          }>\${
            _ssrInterpolate(_ctx.hello)
          }<textarea\${
            _ssrRenderAttrs(_temp0 = _ctx.a, \\"textarea\\")
          }>\${
            _ssrInterpolate((\\"value\\" in _temp0) ? _temp0.value : \\"\\")
          }</textarea></div>\`)
        }"
      `)
    })

    test('should pass tag to custom elements w/ dynamic v-bind', () => {
      expect(
        compile(`<my-foo v-bind="obj"></my-foo>`, {
          isCustomElement: () => true
        }).code
      ).toMatchInlineSnapshot(`
        "const { mergeProps: _mergeProps } = require(\\"vue\\")
        const { ssrRenderAttrs: _ssrRenderAttrs } = require(\\"@vue/server-renderer\\")

        return function ssrRender(_ctx, _push, _parent, _attrs) {
          _push(\`<my-foo\${_ssrRenderAttrs(_mergeProps(_ctx.obj, _attrs), \\"my-foo\\")}></my-foo>\`)
        }"
      `)
    })
  })

  describe('attrs', () => {
    test('static attrs', () => {
      expect(
        getCompiledString(`<div id="foo" class="bar"></div>`)
      ).toMatchInlineSnapshot(`"\`<div id=\\"foo\\" class=\\"bar\\"></div>\`"`)
    })

    test('ignore static key/ref', () => {
      expect(
        getCompiledString(`<div key="1" ref="el"></div>`)
      ).toMatchInlineSnapshot(`"\`<div></div>\`"`)
    })

    test('ignore v-bind key/ref', () => {
      expect(
        getCompiledString(`<div :key="1" :ref="el"></div>`)
      ).toMatchInlineSnapshot(`"\`<div></div>\`"`)
    })

    test('v-bind:class', () => {
      expect(getCompiledString(`<div id="foo" :class="bar"></div>`))
        .toMatchInlineSnapshot(`
        "\`<div id=\\"foo\\" class=\\"\${
            _ssrRenderClass(_ctx.bar)
          }\\"></div>\`"
      `)
    })

    test('static class + v-bind:class', () => {
      expect(getCompiledString(`<div class="foo" :class="bar"></div>`))
        .toMatchInlineSnapshot(`
        "\`<div class=\\"\${
            _ssrRenderClass([_ctx.bar, \\"foo\\"])
          }\\"></div>\`"
      `)
    })

    test('v-bind:class + static class', () => {
      expect(getCompiledString(`<div :class="bar" class="foo"></div>`))
        .toMatchInlineSnapshot(`
        "\`<div class=\\"\${
            _ssrRenderClass([_ctx.bar, \\"foo\\"])
          }\\"></div>\`"
      `)
    })

    test('v-bind:style', () => {
      expect(getCompiledString(`<div id="foo" :style="bar"></div>`))
        .toMatchInlineSnapshot(`
        "\`<div id=\\"foo\\" style=\\"\${
            _ssrRenderStyle(_ctx.bar)
          }\\"></div>\`"
      `)
    })

    test('static style + v-bind:style', () => {
      expect(getCompiledString(`<div style="color:red;" :style="bar"></div>`))
        .toMatchInlineSnapshot(`
        "\`<div style=\\"\${
            _ssrRenderStyle([{\\"color\\":\\"red\\"}, _ctx.bar])
          }\\"></div>\`"
      `)
    })

    test('v-bind:arg (boolean)', () => {
      expect(getCompiledString(`<input type="checkbox" :checked="checked">`))
        .toMatchInlineSnapshot(`
        "\`<input type=\\"checkbox\\"\${
            (_ctx.checked) ? \\" checked\\" : \\"\\"
          }>\`"
      `)
    })

    test('v-bind:arg (non-boolean)', () => {
      expect(getCompiledString(`<div :id="id" class="bar"></div>`))
        .toMatchInlineSnapshot(`
        "\`<div\${
            _ssrRenderAttr(\\"id\\", _ctx.id)
          } class=\\"bar\\"></div>\`"
      `)
    })

    test('v-bind:[arg]', () => {
      expect(getCompiledString(`<div v-bind:[key]="value"></div>`))
        .toMatchInlineSnapshot(`
        "\`<div\${
            _ssrRenderAttrs({ [_ctx.key || \\"\\"]: _ctx.value })
          }></div>\`"
      `)

      expect(getCompiledString(`<div class="foo" v-bind:[key]="value"></div>`))
        .toMatchInlineSnapshot(`
        "\`<div\${
            _ssrRenderAttrs({
              class: \\"foo\\",
              [_ctx.key || \\"\\"]: _ctx.value
            })
          }></div>\`"
      `)

      expect(getCompiledString(`<div :id="id" v-bind:[key]="value"></div>`))
        .toMatchInlineSnapshot(`
        "\`<div\${
            _ssrRenderAttrs({
              id: _ctx.id,
              [_ctx.key || \\"\\"]: _ctx.value
            })
          }></div>\`"
      `)
    })

    test('v-bind="obj"', () => {
      expect(getCompiledString(`<div v-bind="obj"></div>`))
        .toMatchInlineSnapshot(`
        "\`<div\${
            _ssrRenderAttrs(_ctx.obj)
          }></div>\`"
      `)

      expect(getCompiledString(`<div class="foo" v-bind="obj"></div>`))
        .toMatchInlineSnapshot(`
        "\`<div\${
            _ssrRenderAttrs(_mergeProps({ class: \\"foo\\" }, _ctx.obj))
          }></div>\`"
      `)

      expect(getCompiledString(`<div :id="id" v-bind="obj"></div>`))
        .toMatchInlineSnapshot(`
        "\`<div\${
            _ssrRenderAttrs(_mergeProps({ id: _ctx.id }, _ctx.obj))
          }></div>\`"
      `)

      // dynamic key + v-bind="object"
      expect(getCompiledString(`<div :[key]="id" v-bind="obj"></div>`))
        .toMatchInlineSnapshot(`
        "\`<div\${
            _ssrRenderAttrs(_mergeProps({ [_ctx.key || \\"\\"]: _ctx.id }, _ctx.obj))
          }></div>\`"
      `)

      // should merge class and :class
      expect(getCompiledString(`<div class="a" :class="b" v-bind="obj"></div>`))
        .toMatchInlineSnapshot(`
        "\`<div\${
            _ssrRenderAttrs(_mergeProps({
              class: [\\"a\\", _ctx.b]
            }, _ctx.obj))
          }></div>\`"
      `)

      // should merge style and :style
      expect(
        getCompiledString(
          `<div style="color:red;" :style="b" v-bind="obj"></div>`
        )
      ).toMatchInlineSnapshot(`
        "\`<div\${
            _ssrRenderAttrs(_mergeProps({
              style: [{\\"color\\":\\"red\\"}, _ctx.b]
            }, _ctx.obj))
          }></div>\`"
      `)
    })

    test('should ignore v-on', () => {
      expect(
        getCompiledString(`<div id="foo" @click="bar"/>`)
      ).toMatchInlineSnapshot(`"\`<div id=\\"foo\\"></div>\`"`)
      expect(
        getCompiledString(`<div id="foo" v-on="bar"/>`)
      ).toMatchInlineSnapshot(`"\`<div id=\\"foo\\"></div>\`"`)
      expect(getCompiledString(`<div v-bind="foo" v-on="bar"/>`))
        .toMatchInlineSnapshot(`
        "\`<div\${
            _ssrRenderAttrs(_ctx.foo)
          }></div>\`"
      `)
    })
  })
})
