import {
  App,
  createApp,
  createVNode,
  ssrContextKey,
  ssrUtils,
  VNode
} from 'vue'
import { isPromise, isString } from '@vue/shared'
import { SSRContext, renderComponentVNode, SSRBuffer } from './render'

const { isVNode } = ssrUtils

async function unrollBuffer(buffer: SSRBuffer): Promise<string> {
  if (buffer.hasAsync) {
    let ret = ''
    for (let i = 0; i < buffer.length; i++) {
      let item = buffer[i]
      if (isPromise(item)) {
        item = await item
      }
      if (isString(item)) {
        ret += item
      } else {
        ret += await unrollBuffer(item)
      }
    }
    return ret
  } else {
    // sync buffer can be more efficiently unrolled without unnecessary await
    // ticks
    return unrollBufferSync(buffer)
  }
}

function unrollBufferSync(buffer: SSRBuffer): string {
  let ret = ''
  for (let i = 0; i < buffer.length; i++) {
    let item = buffer[i]
    if (isString(item)) {
      ret += item
    } else {
      // since this is a sync buffer, child buffers are never promises
      ret += unrollBufferSync(item as SSRBuffer)
    }
  }
  return ret
}

/**
 * Get the rendering context for an app including teleports
 * https://github.com/vuejs/vue-next/issues/2574
 */
export async function renderToContext(
  input: App,
  context: SSRContext = {}
): Promise<{ context: SSRContext; result: string }> {
  // rendering an app
  const vnode = createVNode(input._component, input._props)
  vnode.appContext = input._context

  // provide the ssr context to the tree
  input.provide(ssrContextKey, context)
  const buffer = await renderComponentVNode(vnode)

  await resolveTeleports(context)

  const result = await unrollBuffer(buffer)

  return { result, context }
}

export async function renderToString(
  input: App | VNode,
  context: SSRContext = {}
): Promise<string> {
  if (isVNode(input)) {
    // raw vnode, wrap with app (for context)
    return renderToString(createApp({ render: () => input }), context)
  }

  const { result } = await renderToContext(input, context)

  return result
}

async function resolveTeleports(context: SSRContext) {
  if (context.__teleportBuffers) {
    context.teleports = context.teleports || {}
    for (const key in context.__teleportBuffers) {
      // note: it's OK to await sequentially here because the Promises were
      // created eagerly in parallel.
      context.teleports[key] = await unrollBuffer((await Promise.all(
        context.__teleportBuffers[key]
      )) as SSRBuffer)
    }
  }
}
