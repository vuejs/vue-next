import { createApp, mergeProps, withCtx } from 'vue'
import { renderToString } from '../src/renderToString'
import { ssrRenderComponent, ssrRenderAttrs, ssrRenderSlot } from '../src'

describe('ssr: scopedId runtime behavior', () => {
  test('id on component root', async () => {
    const Child = {
      ssrRender: (ctx: any, push: any, parent: any, attrs: any) => {
        push(`<div${ssrRenderAttrs(attrs)}></div>`)
      }
    }

    const Comp = {
      __scopeId: 'parent',
      ssrRender: (ctx: any, push: any, parent: any) => {
        push(ssrRenderComponent(Child), null, null, parent)
      }
    }

    const result = await renderToString(createApp(Comp))
    expect(result).toBe(`<div parent></div>`)
  })

  test('id and :slotted on component root', async () => {
    const Child = {
      // <div></div>
      ssrRender: (_: any, push: any, _parent: any, attrs: any) => {
        push(`<div${ssrRenderAttrs(attrs)} child></div>`)
      }
    }

    const Wrapper = {
      __scopeId: 'wrapper',
      ssrRender: (ctx: any, push: any, parent: any) => {
        // <slot/>
        ssrRenderSlot(
          ctx.$slots,
          'default',
          {},
          null,
          push,
          parent,
          'wrapper-s'
        )
      }
    }

    const Comp = {
      __scopeId: 'parent',
      ssrRender: (_: any, push: any, parent: any) => {
        // <Wrapper><Child/></Wrapper>
        push(
          ssrRenderComponent(
            Wrapper,
            null,
            {
              default: withCtx(
                (_: any, push: any, parent: any, scopeId: string) => {
                  push(ssrRenderComponent(Child, null, null, parent, scopeId))
                }
              ),
              _: 1
            } as any,
            parent
          )
        )
      }
    }

    const result = await renderToString(createApp(Comp))
    expect(result).toBe(`<!--[--><div parent wrapper-s child></div><!--]-->`)
  })

  // #2892
  test(':slotted on forwarded slots', async () => {
    const Wrapper = {
      __scopeId: 'wrapper',
      ssrRender: (ctx: any, push: any, parent: any, attrs: any) => {
        // <div class="wrapper"><slot/></div>
        push(
          `<div${ssrRenderAttrs(
            mergeProps({ class: 'wrapper' }, attrs)
          )} wrapper>`
        )
        ssrRenderSlot(
          ctx.$slots,
          'default',
          {},
          null,
          push,
          parent,
          'wrapper-s'
        )
        push(`</div>`)
      }
    }

    const Slotted = {
      __scopeId: 'slotted',
      ssrRender: (ctx: any, push: any, parent: any, attrs: any) => {
        // <Wrapper><slot/></Wrapper>
        push(
          ssrRenderComponent(
            Wrapper,
            attrs,
            {
              default: withCtx(
                (_: any, push: any, parent: any, scopeId: string) => {
                  ssrRenderSlot(
                    ctx.$slots,
                    'default',
                    {},
                    null,
                    push,
                    parent,
                    'slotted-s' + scopeId
                  )
                }
              ),
              _: 1
            } as any,
            parent
          )
        )
      }
    }

    const Root = {
      __scopeId: 'root',
      // <Slotted><div></div></Slotted>
      ssrRender: (_: any, push: any, parent: any, attrs: any) => {
        push(
          ssrRenderComponent(
            Slotted,
            attrs,
            {
              default: withCtx(
                (_: any, push: any, parent: any, scopeId: string) => {
                  push(`<div root${scopeId}></div>`)
                }
              ),
              _: 1
            } as any,
            parent
          )
        )
      }
    }

    const result = await renderToString(createApp(Root))
    expect(result).toBe(
      `<div class="wrapper" root slotted wrapper>` +
        `<!--[--><!--[--><div root slotted-s wrapper-s></div><!--]--><!--]-->` +
        `</div>`
    )
  })
})
