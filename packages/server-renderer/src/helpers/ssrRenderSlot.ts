import { ComponentInternalInstance, Slots } from 'vue'
import { Props, PushFn, renderVNodeChildren, SSRBufferItem } from '../render'

export type SSRSlots = Record<string, SSRSlot>
export type SSRSlot = (
  props: Props,
  push: PushFn,
  parentComponent: ComponentInternalInstance | null,
  scopeId: string | null
) => void

export function ssrRenderSlot(
  slots: Slots | SSRSlots,
  slotName: string,
  slotProps: Props,
  fallbackRenderFn: (() => void) | null,
  push: PushFn,
  parentComponent: ComponentInternalInstance,
  slotScopeId?: string | null
) {
  // template-compiled slots are always rendered as fragments
  push(`<!--[-->`)
  const slotFn = slots[slotName]
  if (slotFn) {
    const slotBuffer: SSRBufferItem[] = []
    const bufferedPush = (item: SSRBufferItem) => {
      slotBuffer.push(item)
    }
    const ret = slotFn(
      slotProps,
      bufferedPush,
      parentComponent,
      slotScopeId ? ' ' + slotScopeId : ''
    )
    if (Array.isArray(ret)) {
      // normal slot
      renderVNodeChildren(push, ret, parentComponent)
    } else {
      // ssr slot.
      // check if the slot renders all comments, in which case use the fallback
      let isEmptySlot = true
      for (let i = 0; i < slotBuffer.length; i++) {
        if (!isComment(slotBuffer[i])) {
          isEmptySlot = false
          break
        }
      }
      if (isEmptySlot) {
        if (fallbackRenderFn) {
          fallbackRenderFn()
        }
      } else {
        for (let i = 0; i < slotBuffer.length; i++) {
          push(slotBuffer[i])
        }
      }
    }
  } else if (fallbackRenderFn) {
    fallbackRenderFn()
  }
  push(`<!--]-->`)
}

const commentRE = /^<!--.*-->$/
function isComment(item: SSRBufferItem) {
  return typeof item === 'string' && commentRE.test(item)
}
