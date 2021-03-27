import { compile } from '../src'

describe('ssr: components', () => {
  test('basic', () => {
    expect(compile(`<foo id="a" :prop="b" />`).code).toMatchInlineSnapshot(`
      "const { resolveComponent: _resolveComponent, mergeProps: _mergeProps } = require(\\"vue\\")
      const { ssrRenderComponent: _ssrRenderComponent } = require(\\"@vue/server-renderer\\")

      return function ssrRender(_ctx, _push, _parent, _attrs) {
        const _component_foo = _resolveComponent(\\"foo\\")

        _push(_ssrRenderComponent(_component_foo, _mergeProps({
          id: \\"a\\",
          prop: _ctx.b
        }, _attrs), null, _parent))
      }"
    `)
  })

  test('dynamic component', () => {
    expect(compile(`<component is="foo" prop="b" />`).code)
      .toMatchInlineSnapshot(`
      "const { resolveDynamicComponent: _resolveDynamicComponent, mergeProps: _mergeProps, createVNode: _createVNode } = require(\\"vue\\")
      const { ssrRenderVNode: _ssrRenderVNode } = require(\\"@vue/server-renderer\\")

      return function ssrRender(_ctx, _push, _parent, _attrs) {
        _ssrRenderVNode(_push, _createVNode(_resolveDynamicComponent(\\"foo\\"), _mergeProps({ prop: \\"b\\" }, _attrs), null), _parent)
      }"
    `)

    expect(compile(`<component :is="foo" prop="b" />`).code)
      .toMatchInlineSnapshot(`
      "const { resolveDynamicComponent: _resolveDynamicComponent, mergeProps: _mergeProps, createVNode: _createVNode } = require(\\"vue\\")
      const { ssrRenderVNode: _ssrRenderVNode } = require(\\"@vue/server-renderer\\")

      return function ssrRender(_ctx, _push, _parent, _attrs) {
        _ssrRenderVNode(_push, _createVNode(_resolveDynamicComponent(_ctx.foo), _mergeProps({ prop: \\"b\\" }, _attrs), null), _parent)
      }"
    `)
  })

  describe('slots', () => {
    test('implicit default slot', () => {
      expect(compile(`<foo>hello<div/></foo>`).code).toMatchInlineSnapshot(`
        "const { resolveComponent: _resolveComponent, withCtx: _withCtx, createVNode: _createVNode, createTextVNode: _createTextVNode } = require(\\"vue\\")
        const { ssrRenderComponent: _ssrRenderComponent } = require(\\"@vue/server-renderer\\")

        return function ssrRender(_ctx, _push, _parent, _attrs) {
          const _component_foo = _resolveComponent(\\"foo\\")

          _push(_ssrRenderComponent(_component_foo, _attrs, {
            default: _withCtx((_, _push, _parent, _scopeId) => {
              if (_push) {
                _push(\`hello<div\${_scopeId}></div>\`)
              } else {
                return [
                  _createTextVNode(\\"hello\\"),
                  _createVNode(\\"div\\")
                ]
              }
            }),
            _: 1 /* STABLE */
          }, _parent))
        }"
      `)
    })

    test('explicit default slot', () => {
      expect(compile(`<foo v-slot="{ msg }">{{ msg + outer }}</foo>`).code)
        .toMatchInlineSnapshot(`
        "const { resolveComponent: _resolveComponent, withCtx: _withCtx, toDisplayString: _toDisplayString, createTextVNode: _createTextVNode } = require(\\"vue\\")
        const { ssrRenderComponent: _ssrRenderComponent, ssrInterpolate: _ssrInterpolate } = require(\\"@vue/server-renderer\\")

        return function ssrRender(_ctx, _push, _parent, _attrs) {
          const _component_foo = _resolveComponent(\\"foo\\")

          _push(_ssrRenderComponent(_component_foo, _attrs, {
            default: _withCtx(({ msg }, _push, _parent, _scopeId) => {
              if (_push) {
                _push(\`\${_ssrInterpolate(msg + _ctx.outer)}\`)
              } else {
                return [
                  _createTextVNode(_toDisplayString(msg + _ctx.outer), 1 /* TEXT */)
                ]
              }
            }),
            _: 1 /* STABLE */
          }, _parent))
        }"
      `)
    })

    test('named slots', () => {
      expect(
        compile(`<foo>
        <template v-slot>foo</template>
        <template v-slot:named>bar</template>
      </foo>`).code
      ).toMatchInlineSnapshot(`
        "const { resolveComponent: _resolveComponent, withCtx: _withCtx, createTextVNode: _createTextVNode } = require(\\"vue\\")
        const { ssrRenderComponent: _ssrRenderComponent } = require(\\"@vue/server-renderer\\")

        return function ssrRender(_ctx, _push, _parent, _attrs) {
          const _component_foo = _resolveComponent(\\"foo\\")

          _push(_ssrRenderComponent(_component_foo, _attrs, {
            default: _withCtx((_, _push, _parent, _scopeId) => {
              if (_push) {
                _push(\`foo\`)
              } else {
                return [
                  _createTextVNode(\\"foo\\")
                ]
              }
            }),
            named: _withCtx((_, _push, _parent, _scopeId) => {
              if (_push) {
                _push(\`bar\`)
              } else {
                return [
                  _createTextVNode(\\"bar\\")
                ]
              }
            }),
            _: 1 /* STABLE */
          }, _parent))
        }"
      `)
    })

    test('v-if slot', () => {
      expect(
        compile(`<foo>
        <template v-slot:named v-if="ok">foo</template>
      </foo>`).code
      ).toMatchInlineSnapshot(`
        "const { resolveComponent: _resolveComponent, withCtx: _withCtx, createTextVNode: _createTextVNode, createSlots: _createSlots } = require(\\"vue\\")
        const { ssrRenderComponent: _ssrRenderComponent } = require(\\"@vue/server-renderer\\")

        return function ssrRender(_ctx, _push, _parent, _attrs) {
          const _component_foo = _resolveComponent(\\"foo\\")

          _push(_ssrRenderComponent(_component_foo, _attrs, _createSlots({ _: 2 /* DYNAMIC */ }, [
            (_ctx.ok)
              ? {
                  name: \\"named\\",
                  fn: _withCtx((_, _push, _parent, _scopeId) => {
                    if (_push) {
                      _push(\`foo\`)
                    } else {
                      return [
                        _createTextVNode(\\"foo\\")
                      ]
                    }
                  })
                }
              : undefined
          ]), _parent))
        }"
      `)
    })

    test('v-for slot', () => {
      expect(
        compile(`<foo>
        <template v-for="key in names" v-slot:[key]="{ msg }">{{ msg + key + bar }}</template>
      </foo>`).code
      ).toMatchInlineSnapshot(`
        "const { resolveComponent: _resolveComponent, withCtx: _withCtx, toDisplayString: _toDisplayString, createTextVNode: _createTextVNode, renderList: _renderList, createSlots: _createSlots } = require(\\"vue\\")
        const { ssrRenderComponent: _ssrRenderComponent, ssrInterpolate: _ssrInterpolate } = require(\\"@vue/server-renderer\\")

        return function ssrRender(_ctx, _push, _parent, _attrs) {
          const _component_foo = _resolveComponent(\\"foo\\")

          _push(_ssrRenderComponent(_component_foo, _attrs, _createSlots({ _: 2 /* DYNAMIC */ }, [
            _renderList(_ctx.names, (key) => {
              return {
                name: key,
                fn: _withCtx(({ msg }, _push, _parent, _scopeId) => {
                  if (_push) {
                    _push(\`\${_ssrInterpolate(msg + key + _ctx.bar)}\`)
                  } else {
                    return [
                      _createTextVNode(_toDisplayString(msg + _ctx.key + _ctx.bar), 1 /* TEXT */)
                    ]
                  }
                })
              }
            })
          ]), _parent))
        }"
      `)
    })

    test('nested transform scoping in vnode branch', () => {
      expect(
        compile(`<foo>
        <template v-slot:foo="{ list }">
          <div v-if="ok">
            <span v-for="i in list"></span>
          </div>
        </template>
        <template v-slot:bar="{ ok }">
          <div v-if="ok">
            <span v-for="i in list"></span>
          </div>
        </template>
      </foo>`).code
      ).toMatchInlineSnapshot(`
        "const { resolveComponent: _resolveComponent, withCtx: _withCtx, renderList: _renderList, Fragment: _Fragment, openBlock: _openBlock, createBlock: _createBlock, createCommentVNode: _createCommentVNode } = require(\\"vue\\")
        const { ssrRenderComponent: _ssrRenderComponent, ssrRenderList: _ssrRenderList } = require(\\"@vue/server-renderer\\")

        return function ssrRender(_ctx, _push, _parent, _attrs) {
          const _component_foo = _resolveComponent(\\"foo\\")

          _push(_ssrRenderComponent(_component_foo, _attrs, {
            foo: _withCtx(({ list }, _push, _parent, _scopeId) => {
              if (_push) {
                if (_ctx.ok) {
                  _push(\`<div\${_scopeId}><!--[-->\`)
                  _ssrRenderList(list, (i) => {
                    _push(\`<span\${_scopeId}></span>\`)
                  })
                  _push(\`<!--]--></div>\`)
                } else {
                  _push(\`<!---->\`)
                }
              } else {
                return [
                  (_ctx.ok)
                    ? (_openBlock(), _createBlock(\\"div\\", { key: 0 }, [
                        (_openBlock(true), _createBlock(_Fragment, null, _renderList(list, (i) => {
                          return (_openBlock(), _createBlock(\\"span\\"))
                        }), 256 /* UNKEYED_FRAGMENT */))
                      ]))
                    : _createCommentVNode(\\"v-if\\", true)
                ]
              }
            }),
            bar: _withCtx(({ ok }, _push, _parent, _scopeId) => {
              if (_push) {
                if (ok) {
                  _push(\`<div\${_scopeId}><!--[-->\`)
                  _ssrRenderList(_ctx.list, (i) => {
                    _push(\`<span\${_scopeId}></span>\`)
                  })
                  _push(\`<!--]--></div>\`)
                } else {
                  _push(\`<!---->\`)
                }
              } else {
                return [
                  ok
                    ? (_openBlock(), _createBlock(\\"div\\", { key: 0 }, [
                        (_openBlock(true), _createBlock(_Fragment, null, _renderList(_ctx.list, (i) => {
                          return (_openBlock(), _createBlock(\\"span\\"))
                        }), 256 /* UNKEYED_FRAGMENT */))
                      ]))
                    : _createCommentVNode(\\"v-if\\", true)
                ]
              }
            }),
            _: 1 /* STABLE */
          }, _parent))
        }"
      `)
    })

    test('built-in fallthroughs', () => {
      expect(compile(`<transition><div/></transition>`).code)
        .toMatchInlineSnapshot(`
        "
        return function ssrRender(_ctx, _push, _parent, _attrs) {
          _push(\`<div></div>\`)
        }"
      `)

      expect(compile(`<keep-alive><foo/></keep-alive>`).code)
        .toMatchInlineSnapshot(`
        "const { resolveComponent: _resolveComponent } = require(\\"vue\\")
        const { ssrRenderComponent: _ssrRenderComponent } = require(\\"@vue/server-renderer\\")

        return function ssrRender(_ctx, _push, _parent, _attrs) {
          const _component_foo = _resolveComponent(\\"foo\\")

          _push(_ssrRenderComponent(_component_foo, null, null, _parent))
        }"
      `)
    })

    // transition-group should flatten and concat its children fragments into
    // a single one
    describe('transition-group', () => {
      test('basic', () => {
        expect(
          compile(
            `<transition-group><div v-for="i in list"/></transition-group>`
          ).code
        ).toMatchInlineSnapshot(`
          "const { ssrRenderList: _ssrRenderList } = require(\\"@vue/server-renderer\\")

          return function ssrRender(_ctx, _push, _parent, _attrs) {
            _push(\`<!--[-->\`)
            _ssrRenderList(_ctx.list, (i) => {
              _push(\`<div></div>\`)
            })
            _push(\`<!--]-->\`)
          }"
        `)
      })

      test('with static tag', () => {
        expect(
          compile(
            `<transition-group tag="ul"><div v-for="i in list"/></transition-group>`
          ).code
        ).toMatchInlineSnapshot(`
          "const { ssrRenderList: _ssrRenderList } = require(\\"@vue/server-renderer\\")

          return function ssrRender(_ctx, _push, _parent, _attrs) {
            _push(\`<ul>\`)
            _ssrRenderList(_ctx.list, (i) => {
              _push(\`<div></div>\`)
            })
            _push(\`</ul>\`)
          }"
        `)
      })

      test('with dynamic tag', () => {
        expect(
          compile(
            `<transition-group :tag="someTag"><div v-for="i in list"/></transition-group>`
          ).code
        ).toMatchInlineSnapshot(`
          "const { ssrRenderList: _ssrRenderList } = require(\\"@vue/server-renderer\\")

          return function ssrRender(_ctx, _push, _parent, _attrs) {
            _push(\`<\${_ctx.someTag}>\`)
            _ssrRenderList(_ctx.list, (i) => {
              _push(\`<div></div>\`)
            })
            _push(\`</\${_ctx.someTag}>\`)
          }"
        `)
      })

      test('with multi fragments children', () => {
        expect(
          compile(
            `<transition-group>
              <div v-for="i in 10"/>
              <div v-for="i in 10"/>
              <template v-if="ok"><div>ok</div></template>
            </transition-group>`
          ).code
        ).toMatchInlineSnapshot(`
          "const { ssrRenderList: _ssrRenderList } = require(\\"@vue/server-renderer\\")

          return function ssrRender(_ctx, _push, _parent, _attrs) {
            _push(\`<!--[-->\`)
            _ssrRenderList(10, (i) => {
              _push(\`<div></div>\`)
            })
            _ssrRenderList(10, (i) => {
              _push(\`<div></div>\`)
            })
            if (_ctx.ok) {
              _push(\`<div>ok</div>\`)
            } else {
              _push(\`<!---->\`)
            }
            _push(\`<!--]-->\`)
          }"
        `)
      })
    })
  })
})
