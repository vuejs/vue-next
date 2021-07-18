/* eslint-disable no-restricted-globals */
import {
  ConcreteComponent,
  ComponentInternalInstance,
  ComponentOptions,
  InternalRenderFunction,
  ClassComponent,
  isClassComponent
} from './component'
import { queueJob, queuePostFlushCb } from './scheduler'
import { extend, getGlobalThis } from '@vue/shared'
import { warn } from './warning'

export let isHmrUpdating = false

export const hmrDirtyComponents = new Set<ConcreteComponent>()

export interface HMRRuntime {
  createRecord: typeof createRecord
  rerender: typeof rerender
  reload: typeof reload
}

// Expose the HMR runtime on the global object
// This makes it entirely tree-shakable without polluting the exports and makes
// it easier to be used in toolings like vue-loader
// Note: for a component to be eligible for HMR it also needs the __hmrId option
// to be set so that its instances can be registered / removed.
if (__DEV__) {
  getGlobalThis().__VUE_HMR_RUNTIME__ = {
    createRecord: tryWrap(createRecord),
    rerender: tryWrap(rerender),
    reload: tryWrap(reload)
  } as HMRRuntime
}

type HMRRecord = {
  component: ComponentOptions
  instances: Set<ComponentInternalInstance>
}

const map: Map<string, HMRRecord> = new Map()

export function registerHMR(instance: ComponentInternalInstance) {
  const id = instance.type.__hmrId!
  let record = map.get(id)
  if (!record) {
    createRecord(id, instance.type as ComponentOptions)
    record = map.get(id)!
  }
  record.instances.add(instance)
}

export function unregisterHMR(instance: ComponentInternalInstance) {
  map.get(instance.type.__hmrId!)!.instances.delete(instance)
}

function createRecord(
  id: string,
  component: ComponentOptions | ClassComponent
): boolean {
  if (!component) {
    warn(
      `HMR API usage is out of date.\n` +
        `Please upgrade vue-loader/vite/rollup-plugin-vue or other relevant ` +
        `dependency that handles Vue SFC compilation.`
    )
    component = {}
  }
  if (map.has(id)) {
    return false
  }
  map.set(id, {
    component: isClassComponent(component) ? component.__vccOpts : component,
    instances: new Set()
  })
  return true
}

function rerender(id: string, newRender?: Function) {
  const record = map.get(id)
  if (!record) return
  if (newRender) record.component.render = newRender
  // Array.from creates a snapshot which avoids the set being mutated during
  // updates
  Array.from(record.instances).forEach(instance => {
    if (newRender) {
      instance.render = newRender as InternalRenderFunction
    }
    instance.renderCache = []
    // this flag forces child components with slot content to update
    isHmrUpdating = true
    instance.update()
    isHmrUpdating = false
  })
}

function reload(id: string, newComp: ComponentOptions | ClassComponent) {
  const record = map.get(id)
  if (!record) return
  // Array.from creates a snapshot which avoids the set being mutated during
  // updates
  const { component, instances } = record

  if (!hmrDirtyComponents.has(component)) {
    // 1. Update existing comp definition to match new one
    newComp = isClassComponent(newComp) ? newComp.__vccOpts : newComp
    extend(component, newComp)
    for (const key in component) {
      if (key !== '__file' && !(key in newComp)) {
        delete (component as any)[key]
      }
    }
    // 2. Mark component dirty. This forces the renderer to replace the component
    // on patch.
    hmrDirtyComponents.add(component)
    // 3. Make sure to unmark the component after the reload.
    queuePostFlushCb(() => {
      hmrDirtyComponents.delete(component)
    })
  }

  Array.from(instances).forEach(instance => {
    if (instance.parent) {
      // 4. Force the parent instance to re-render. This will cause all updated
      // components to be unmounted and re-mounted. Queue the update so that we
      // don't end up forcing the same parent to re-render multiple times.
      queueJob(instance.parent.update)
    } else if (instance.appContext.reload) {
      // root instance mounted via createApp() has a reload method
      instance.appContext.reload()
    } else if (typeof window !== 'undefined') {
      // root instance inside tree created via raw render(). Force reload.
      window.location.reload()
    } else {
      console.warn(
        '[HMR] Root or manually mounted instance modified. Full reload required.'
      )
    }
  })
}

function tryWrap(fn: (id: string, arg: any) => any): Function {
  return (id: string, arg: any) => {
    try {
      return fn(id, arg)
    } catch (e) {
      console.error(e)
      console.warn(
        `[HMR] Something went wrong during Vue component hot-reload. ` +
          `Full reload required.`
      )
    }
  }
}
