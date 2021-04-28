import {
  TransitionProps,
  addTransitionClass,
  removeTransitionClass,
  ElementWithTransition,
  getTransitionInfo,
  resolveTransitionProps,
  TransitionPropsValidators,
  forceReflow
} from './Transition'
import {
  Fragment,
  VNode,
  warn,
  resolveTransitionHooks,
  useTransitionState,
  getTransitionRawChildren,
  getCurrentInstance,
  setTransitionHooks,
  createVNode,
  onUpdated,
  SetupContext,
  toRaw
} from '@vue/runtime-core'
import { extend, PatchFlags } from '@vue/shared'

interface Position {
  top: number
  left: number
}

const positionMap = new WeakMap<VNode, Position>()
const newPositionMap = new WeakMap<VNode, Position>()

export type TransitionGroupProps = Omit<TransitionProps, 'mode'> & {
  tag?: string
  moveClass?: string
}

const TransitionGroupImpl = {
  name: 'TransitionGroup',

  props: /*#__PURE__*/ extend({}, TransitionPropsValidators, {
    tag: String,
    moveClass: String
  }),

  setup(props: TransitionGroupProps, { slots }: SetupContext) {
    const instance = getCurrentInstance()!
    const state = useTransitionState()
    let prevChildren: VNode[]
    let children: VNode[]

    onUpdated(() => {
      // children is guaranteed to exist after initial render
      if (!prevChildren.length) {
        return
      }
      const moveClass = props.moveClass || `${props.name || 'v'}-move`

      if (
        !hasCSSTransform(
          prevChildren[0].el as ElementWithTransition,
          instance.vnode.el as Node,
          moveClass
        )
      ) {
        return
      }

      // we divide the work into three loops to avoid mixing DOM reads and writes
      // in each iteration - which helps prevent layout thrashing.
      prevChildren.forEach(callPendingCbs)
      prevChildren.forEach(recordPosition)
      const movedChildren = prevChildren.filter(applyTranslation)

      // force reflow to put everything in position
      forceReflow()

      movedChildren.forEach(c => {
        const el = c.el as ElementWithTransition
        const style = el.style
        addTransitionClass(el, moveClass)
        style.transform = style.webkitTransform = style.transitionDuration = ''
        const cb = ((el as any)._moveCb = (e: TransitionEvent) => {
          if (e && e.target !== el) {
            return
          }
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener('transitionend', cb)
            ;(el as any)._moveCb = null
            removeTransitionClass(el, moveClass)
          }
        })
        el.addEventListener('transitionend', cb)
      })
    })

    return () => {
      const slotContent = slots.default && slots.default()
      const rawProps = toRaw(props)
      const cssTransitionProps = resolveTransitionProps(rawProps)
      const tag = rawProps.tag || Fragment

      const keyedChildren: VNode[] = []
      if (slotContent) {
        for (let j = 0; j < slotContent.length; j++) {
          const child = slotContent[j]
          if (child.type === Fragment) {
            keyedChildren.push(...(child.children as VNode[]))
            if (__DEV__ && !(child.patchFlag & PatchFlags.KEYED_FRAGMENT)) {
              warn(`<TransitionGroup> children must be keyed.`)
            }
          } else {
            keyedChildren.push(child)
            if (__DEV__ && child.key == null) {
              warn(`<TransitionGroup> children must be keyed.`)
            }
          }
        }
      }

      prevChildren = children
      children = getTransitionRawChildren(keyedChildren)

      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        setTransitionHooks(
          child,
          resolveTransitionHooks(child, cssTransitionProps, state, instance)
        )
      }

      if (prevChildren) {
        for (let i = 0; i < prevChildren.length; i++) {
          const child = prevChildren[i]
          setTransitionHooks(
            child,
            resolveTransitionHooks(child, cssTransitionProps, state, instance)
          )
          positionMap.set(child, (child.el as Element).getBoundingClientRect())
        }
      }
      return createVNode(tag, null, keyedChildren)
    }
  }
}

/**
 * TransitionGroup does not support "mode" so we need to remove it from the
 * props declarations, but direct delete operation is considered a side effect
 * and will make the entire transition feature non-tree-shakeable, so we do it
 * in a function and mark the function's invocation as pure.
 */
const removeMode = (props: any) => delete props.mode
/*#__PURE__*/ removeMode(TransitionGroupImpl.props)

export const TransitionGroup = (TransitionGroupImpl as unknown) as {
  new (): {
    $props: TransitionGroupProps
  }
}

function callPendingCbs(c: VNode) {
  const el = c.el as any
  if (el._moveCb) {
    el._moveCb()
  }
  if (el._enterCb) {
    el._enterCb()
  }
}

function recordPosition(c: VNode) {
  newPositionMap.set(c, (c.el as Element).getBoundingClientRect())
}

function applyTranslation(c: VNode): VNode | undefined {
  const oldPos = positionMap.get(c)!
  const newPos = newPositionMap.get(c)!
  const dx = oldPos.left - newPos.left
  const dy = oldPos.top - newPos.top
  if (dx || dy) {
    const s = (c.el as HTMLElement).style
    s.transform = s.webkitTransform = `translate(${dx}px,${dy}px)`
    s.transitionDuration = '0s'
    return c
  }
}

function hasCSSTransform(
  el: ElementWithTransition,
  root: Node,
  moveClass: string
): boolean {
  // Detect whether an element with the move class applied has
  // CSS transitions. Since the element may be inside an entering
  // transition at this very moment, we make a clone of it and remove
  // all other transition classes applied to ensure only the move class
  // is applied.
  const clone = el.cloneNode() as HTMLElement
  if (el._vtc) {
    el._vtc.forEach(cls => {
      cls.split(/\s+/).forEach(c => c && clone.classList.remove(c))
    })
  }
  moveClass.split(/\s+/).forEach(c => c && clone.classList.add(c))
  clone.style.display = 'none'
  const container = (root.nodeType === 1
    ? root
    : root.parentNode) as HTMLElement
  container.appendChild(clone)
  const { hasTransform } = getTransitionInfo(clone)
  container.removeChild(clone)
  return hasTransform
}
