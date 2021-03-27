import {
  Comment,
  Component,
  ComponentInternalInstance,
  ComponentOptions,
  DirectiveBinding,
  Fragment,
  mergeProps,
  ssrUtils,
  Static,
  Text,
  VNode,
  VNodeArrayChildren,
  VNodeProps,
  warn
} from 'vue'
import {
  escapeHtml,
  escapeHtmlComment,
  isFunction,
  isPromise,
  isString,
  isVoidTag,
  ShapeFlags,
  isArray,
  NOOP
} from '@vue/shared'
import { ssrRenderAttrs } from './helpers/ssrRenderAttrs'
import { ssrCompile } from './helpers/ssrCompile'
import { ssrRenderTeleport } from './helpers/ssrRenderTeleport'

const {
  createComponentInstance,
  setCurrentRenderingInstance,
  setupComponent,
  renderComponentRoot,
  normalizeVNode
} = ssrUtils

export type SSRBuffer = SSRBufferItem[] & { hasAsync?: boolean }
export type SSRBufferItem = string | SSRBuffer | Promise<SSRBuffer>
export type PushFn = (item: SSRBufferItem) => void
export type Props = Record<string, unknown>

export type SSRContext = {
  [key: string]: any
  teleports?: Record<string, string>
  __teleportBuffers?: Record<string, SSRBuffer>
}

// Each component has a buffer array.
// A buffer array can contain one of the following:
// - plain string
// - A resolved buffer (recursive arrays of strings that can be unrolled
//   synchronously)
// - An async buffer (a Promise that resolves to a resolved buffer)
export function createBuffer() {
  let appendable = false
  const buffer: SSRBuffer = []
  return {
    getBuffer(): SSRBuffer {
      // Return static buffer and await on items during unroll stage
      return buffer
    },
    push(item: SSRBufferItem) {
      const isStringItem = isString(item)
      if (appendable && isStringItem) {
        buffer[buffer.length - 1] += item as string
      } else {
        buffer.push(item)
      }
      appendable = isStringItem
      if (isPromise(item) || (isArray(item) && item.hasAsync)) {
        // promise, or child buffer with async, mark as async.
        // this allows skipping unnecessary await ticks during unroll stage
        buffer.hasAsync = true
      }
    }
  }
}

export function renderComponentVNode(
  vnode: VNode,
  parentComponent: ComponentInternalInstance | null = null,
  slotScopeId?: string
): SSRBuffer | Promise<SSRBuffer> {
  const instance = createComponentInstance(vnode, parentComponent, null)
  const res = setupComponent(instance, true /* isSSR */)
  const hasAsyncSetup = isPromise(res)
  const prefetch = (vnode.type as ComponentOptions).serverPrefetch
  if (hasAsyncSetup || prefetch) {
    let p = hasAsyncSetup ? (res as Promise<void>) : Promise.resolve()
    if (prefetch) {
      p = p.then(() => prefetch.call(instance.proxy)).catch(err => {
        warn(`[@vue/server-renderer]: Uncaught error in serverPrefetch:\n`, err)
      })
    }
    return p.then(() => renderComponentSubTree(instance, slotScopeId))
  } else {
    return renderComponentSubTree(instance, slotScopeId)
  }
}

function renderComponentSubTree(
  instance: ComponentInternalInstance,
  slotScopeId?: string
): SSRBuffer | Promise<SSRBuffer> {
  const comp = instance.type as Component
  const { getBuffer, push } = createBuffer()
  if (isFunction(comp)) {
    renderVNode(
      push,
      (instance.subTree = renderComponentRoot(instance)),
      instance
    )
  } else {
    if (
      (!instance.render || instance.render === NOOP) &&
      !instance.ssrRender &&
      !comp.ssrRender &&
      isString(comp.template)
    ) {
      comp.ssrRender = ssrCompile(comp.template, instance)
    }

    const ssrRender = instance.ssrRender || comp.ssrRender
    if (ssrRender) {
      // optimized
      // resolve fallthrough attrs
      let attrs =
        instance.type.inheritAttrs !== false ? instance.attrs : undefined

      // inherited scopeId
      const scopeId = instance.vnode.scopeId
      if (scopeId || slotScopeId) {
        attrs = { ...attrs }
        if (scopeId) attrs[scopeId] = ''
        if (slotScopeId) attrs[slotScopeId.trim()] = ''
      }

      // set current rendering instance for asset resolution
      const prev = setCurrentRenderingInstance(instance)
      ssrRender(
        instance.proxy,
        push,
        instance,
        attrs,
        // compiler-optimized bindings
        instance.props,
        instance.setupState,
        instance.data,
        instance.ctx
      )
      setCurrentRenderingInstance(prev)
    } else if (instance.render && instance.render !== NOOP) {
      renderVNode(
        push,
        (instance.subTree = renderComponentRoot(instance)),
        instance
      )
    } else {
      warn(
        `Component ${
          comp.name ? `${comp.name} ` : ``
        } is missing template or render function.`
      )
      push(`<!---->`)
    }
  }
  return getBuffer()
}

export function renderVNode(
  push: PushFn,
  vnode: VNode,
  parentComponent: ComponentInternalInstance
) {
  const { type, shapeFlag, children } = vnode
  switch (type) {
    case Text:
      push(escapeHtml(children as string))
      break
    case Comment:
      push(
        children ? `<!--${escapeHtmlComment(children as string)}-->` : `<!---->`
      )
      break
    case Static:
      push(children as string)
      break
    case Fragment:
      push(`<!--[-->`) // open
      renderVNodeChildren(push, children as VNodeArrayChildren, parentComponent)
      push(`<!--]-->`) // close
      break
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        renderElementVNode(push, vnode, parentComponent)
      } else if (shapeFlag & ShapeFlags.COMPONENT) {
        push(renderComponentVNode(vnode, parentComponent))
      } else if (shapeFlag & ShapeFlags.TELEPORT) {
        renderTeleportVNode(push, vnode, parentComponent)
      } else if (shapeFlag & ShapeFlags.SUSPENSE) {
        renderVNode(push, vnode.ssContent!, parentComponent)
      } else {
        warn(
          '[@vue/server-renderer] Invalid VNode type:',
          type,
          `(${typeof type})`
        )
      }
  }
}

export function renderVNodeChildren(
  push: PushFn,
  children: VNodeArrayChildren,
  parentComponent: ComponentInternalInstance
) {
  for (let i = 0; i < children.length; i++) {
    renderVNode(push, normalizeVNode(children[i]), parentComponent)
  }
}

function renderElementVNode(
  push: PushFn,
  vnode: VNode,
  parentComponent: ComponentInternalInstance
) {
  const tag = vnode.type as string
  let { props, children, shapeFlag, scopeId, dirs } = vnode
  let openTag = `<${tag}`

  if (dirs) {
    props = applySSRDirectives(vnode, props, dirs)
  }

  if (props) {
    openTag += ssrRenderAttrs(props, tag)
  }

  openTag += resolveScopeId(scopeId, vnode, parentComponent)

  push(openTag + `>`)
  if (!isVoidTag(tag)) {
    let hasChildrenOverride = false
    if (props) {
      if (props.innerHTML) {
        hasChildrenOverride = true
        push(props.innerHTML)
      } else if (props.textContent) {
        hasChildrenOverride = true
        push(escapeHtml(props.textContent))
      } else if (tag === 'textarea' && props.value) {
        hasChildrenOverride = true
        push(escapeHtml(props.value))
      }
    }
    if (!hasChildrenOverride) {
      if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        push(escapeHtml(children as string))
      } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        renderVNodeChildren(
          push,
          children as VNodeArrayChildren,
          parentComponent
        )
      }
    }
    push(`</${tag}>`)
  }
}

function resolveScopeId(
  scopeId: string | null,
  vnode: VNode,
  parentComponent: ComponentInternalInstance | null
) {
  let res = ``
  if (scopeId) {
    res = ` ${scopeId}`
  }
  if (parentComponent) {
    const treeOwnerId = parentComponent.type.__scopeId
    // vnode's own scopeId and the current rendering component's scopeId is
    // different - this is a slot content node.
    if (treeOwnerId && treeOwnerId !== scopeId) {
      res += ` ${treeOwnerId}-s`
    }
    if (vnode === parentComponent.subTree) {
      res += resolveScopeId(
        parentComponent.vnode.scopeId,
        parentComponent.vnode,
        parentComponent.parent
      )
    }
  }
  return res
}

function applySSRDirectives(
  vnode: VNode,
  rawProps: VNodeProps | null,
  dirs: DirectiveBinding[]
): VNodeProps {
  const toMerge: VNodeProps[] = []
  for (let i = 0; i < dirs.length; i++) {
    const binding = dirs[i]
    const {
      dir: { getSSRProps }
    } = binding
    if (getSSRProps) {
      const props = getSSRProps(binding, vnode)
      if (props) toMerge.push(props)
    }
  }
  return mergeProps(rawProps || {}, ...toMerge)
}

function renderTeleportVNode(
  push: PushFn,
  vnode: VNode,
  parentComponent: ComponentInternalInstance
) {
  const target = vnode.props && vnode.props.to
  const disabled = vnode.props && vnode.props.disabled
  if (!target) {
    warn(`[@vue/server-renderer] Teleport is missing target prop.`)
    return []
  }
  if (!isString(target)) {
    warn(
      `[@vue/server-renderer] Teleport target must be a query selector string.`
    )
    return []
  }
  ssrRenderTeleport(
    push,
    push => {
      renderVNodeChildren(
        push,
        vnode.children as VNodeArrayChildren,
        parentComponent
      )
    },
    target,
    disabled || disabled === '',
    parentComponent
  )
}
