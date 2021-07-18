import { HMRRuntime } from '../src/hmr'
import '../src/hmr'
import { ComponentOptions, InternalRenderFunction } from '../src/component'
import {
  render,
  nodeOps,
  h,
  serializeInner,
  triggerEvent,
  TestElement,
  nextTick,
  withDirectives,
  ObjectDirective
} from '@vue/runtime-test'
import * as runtimeTest from '@vue/runtime-test'
import { baseCompile } from '@vue/compiler-core'

declare var __VUE_HMR_RUNTIME__: HMRRuntime
const { createRecord, rerender, reload } = __VUE_HMR_RUNTIME__

function compileToFunction(template: string) {
  const { code } = baseCompile(template)
  const render = new Function('Vue', code)(
    runtimeTest
  ) as InternalRenderFunction
  render._rc = true // isRuntimeCompiled
  return render
}

describe('hot module replacement', () => {
  test('inject global runtime', () => {
    expect(createRecord).toBeDefined()
    expect(rerender).toBeDefined()
    expect(reload).toBeDefined()
  })

  test('createRecord', () => {
    expect(createRecord('test1', {})).toBe(true)
    // if id has already been created, should return false
    expect(createRecord('test1', {})).toBe(false)
  })

  test('rerender', async () => {
    const root = nodeOps.createElement('div')
    const parentId = 'test2-parent'
    const childId = 'test2-child'

    const Child: ComponentOptions = {
      __hmrId: childId,
      render: compileToFunction(`<div><slot/></div>`)
    }
    createRecord(childId, Child)

    const Parent: ComponentOptions = {
      __hmrId: parentId,
      data() {
        return { count: 0 }
      },
      components: { Child },
      render: compileToFunction(
        `<div @click="count++">{{ count }}<Child>{{ count }}</Child></div>`
      )
    }
    createRecord(parentId, Parent)

    render(h(Parent), root)
    expect(serializeInner(root)).toBe(`<div>0<div>0</div></div>`)

    // Perform some state change. This change should be preserved after the
    // re-render!
    triggerEvent(root.children[0] as TestElement, 'click')
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>1<div>1</div></div>`)

    // // Update text while preserving state
    rerender(
      parentId,
      compileToFunction(
        `<div @click="count++">{{ count }}!<Child>{{ count }}</Child></div>`
      )
    )
    expect(serializeInner(root)).toBe(`<div>1!<div>1</div></div>`)

    // Should force child update on slot content change
    rerender(
      parentId,
      compileToFunction(
        `<div @click="count++">{{ count }}!<Child>{{ count }}!</Child></div>`
      )
    )
    expect(serializeInner(root)).toBe(`<div>1!<div>1!</div></div>`)

    // Should force update element children despite block optimization
    rerender(
      parentId,
      compileToFunction(
        `<div @click="count++">{{ count }}<span>{{ count }}</span>
        <Child>{{ count }}!</Child>
      </div>`
      )
    )
    expect(serializeInner(root)).toBe(`<div>1<span>1</span><div>1!</div></div>`)

    // Should force update child slot elements
    rerender(
      parentId,
      compileToFunction(
        `<div @click="count++">
        <Child><span>{{ count }}</span></Child>
      </div>`
      )
    )
    expect(serializeInner(root)).toBe(`<div><div><span>1</span></div></div>`)
  })

  test('reload', async () => {
    const root = nodeOps.createElement('div')
    const childId = 'test3-child'
    const unmountSpy = jest.fn()
    const mountSpy = jest.fn()

    const Child: ComponentOptions = {
      __hmrId: childId,
      data() {
        return { count: 0 }
      },
      unmounted: unmountSpy,
      render: compileToFunction(`<div @click="count++">{{ count }}</div>`)
    }
    createRecord(childId, Child)

    const Parent: ComponentOptions = {
      render: () => h(Child)
    }

    render(h(Parent), root)
    expect(serializeInner(root)).toBe(`<div>0</div>`)

    reload(childId, {
      __hmrId: childId,
      data() {
        return { count: 1 }
      },
      mounted: mountSpy,
      render: compileToFunction(`<div @click="count++">{{ count }}</div>`)
    })
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>1</div>`)
    expect(unmountSpy).toHaveBeenCalledTimes(1)
    expect(mountSpy).toHaveBeenCalledTimes(1)
  })

  test('reload class component', async () => {
    const root = nodeOps.createElement('div')
    const childId = 'test4-child'
    const unmountSpy = jest.fn()
    const mountSpy = jest.fn()

    class Child {
      static __vccOpts: ComponentOptions = {
        __hmrId: childId,
        data() {
          return { count: 0 }
        },
        unmounted: unmountSpy,
        render: compileToFunction(`<div @click="count++">{{ count }}</div>`)
      }
    }
    createRecord(childId, Child)

    const Parent: ComponentOptions = {
      render: () => h(Child)
    }

    render(h(Parent), root)
    expect(serializeInner(root)).toBe(`<div>0</div>`)

    class UpdatedChild {
      static __vccOpts: ComponentOptions = {
        __hmrId: childId,
        data() {
          return { count: 1 }
        },
        mounted: mountSpy,
        render: compileToFunction(`<div @click="count++">{{ count }}</div>`)
      }
    }

    reload(childId, UpdatedChild)
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>1</div>`)
    expect(unmountSpy).toHaveBeenCalledTimes(1)
    expect(mountSpy).toHaveBeenCalledTimes(1)
  })

  // #1156 - static nodes should retain DOM element reference across updates
  // when HMR is active
  test('static el reference', async () => {
    const root = nodeOps.createElement('div')
    const id = 'test-static-el'

    const template = `<div>
    <div>{{ count }}</div>
    <button @click="count++">++</button>
  </div>`

    const Comp: ComponentOptions = {
      __hmrId: id,
      data() {
        return { count: 0 }
      },
      render: compileToFunction(template)
    }
    createRecord(id, Comp)

    render(h(Comp), root)
    expect(serializeInner(root)).toBe(
      `<div><div>0</div><button>++</button></div>`
    )

    // 1. click to trigger update
    triggerEvent((root as any).children[0].children[1], 'click')
    await nextTick()
    expect(serializeInner(root)).toBe(
      `<div><div>1</div><button>++</button></div>`
    )

    // 2. trigger HMR
    rerender(
      id,
      compileToFunction(template.replace(`<button`, `<button class="foo"`))
    )
    expect(serializeInner(root)).toBe(
      `<div><div>1</div><button class="foo">++</button></div>`
    )
  })

  // #1157 - component should force full props update when HMR is active
  test('force update child component w/ static props', () => {
    const root = nodeOps.createElement('div')
    const parentId = 'test-force-props-parent'
    const childId = 'test-force-props-child'

    const Child: ComponentOptions = {
      __hmrId: childId,
      props: {
        msg: String
      },
      render: compileToFunction(`<div>{{ msg }}</div>`)
    }
    createRecord(childId, Child)

    const Parent: ComponentOptions = {
      __hmrId: parentId,
      components: { Child },
      render: compileToFunction(`<Child msg="foo" />`)
    }
    createRecord(parentId, Parent)

    render(h(Parent), root)
    expect(serializeInner(root)).toBe(`<div>foo</div>`)

    rerender(parentId, compileToFunction(`<Child msg="bar" />`))
    expect(serializeInner(root)).toBe(`<div>bar</div>`)
  })

  // #1305 - component should remove class
  test('remove static class from parent', () => {
    const root = nodeOps.createElement('div')
    const parentId = 'test-force-class-parent'
    const childId = 'test-force-class-child'

    const Child: ComponentOptions = {
      __hmrId: childId,
      render: compileToFunction(`<div>child</div>`)
    }
    createRecord(childId, Child)

    const Parent: ComponentOptions = {
      __hmrId: parentId,
      components: { Child },
      render: compileToFunction(`<Child class="test" />`)
    }
    createRecord(parentId, Parent)

    render(h(Parent), root)
    expect(serializeInner(root)).toBe(`<div class="test">child</div>`)

    rerender(parentId, compileToFunction(`<Child/>`))
    expect(serializeInner(root)).toBe(`<div>child</div>`)
  })

  test('rerender if any parent in the parent chain', () => {
    const root = nodeOps.createElement('div')
    const parent = 'test-force-props-parent-'
    const childId = 'test-force-props-child'

    const numberOfParents = 5

    const Child: ComponentOptions = {
      __hmrId: childId,
      render: compileToFunction(`<div>child</div>`)
    }
    createRecord(childId, Child)

    const components: ComponentOptions[] = []

    for (let i = 0; i < numberOfParents; i++) {
      const parentId = `${parent}${i}`
      const parentComp: ComponentOptions = {
        __hmrId: parentId
      }
      components.push(parentComp)
      if (i === 0) {
        parentComp.render = compileToFunction(`<Child />`)
        parentComp.components = {
          Child
        }
      } else {
        parentComp.render = compileToFunction(`<Parent />`)
        parentComp.components = {
          Parent: components[i - 1]
        }
      }

      createRecord(parentId, parentComp)
    }

    const last = components[components.length - 1]

    render(h(last), root)
    expect(serializeInner(root)).toBe(`<div>child</div>`)

    rerender(last.__hmrId!, compileToFunction(`<Parent class="test"/>`))
    expect(serializeInner(root)).toBe(`<div class="test">child</div>`)
  })

  // #3302
  test('rerender with Teleport', () => {
    const root = nodeOps.createElement('div')
    const target = nodeOps.createElement('div')
    const parentId = 'parent-teleport'

    const Child: ComponentOptions = {
      data() {
        return {
          // style is used to ensure that the div tag will be tracked by Teleport
          style: {},
          target
        }
      },
      render: compileToFunction(`
        <teleport :to="target">
          <div :style="style">
            <slot/>
          </div>
        </teleport>
      `)
    }

    const Parent: ComponentOptions = {
      __hmrId: parentId,
      components: { Child },
      render: compileToFunction(`
        <Child>
          <template #default>
            <div>1</div>
          </template>
        </Child>
      `)
    }
    createRecord(parentId, Parent)

    render(h(Parent), root)
    expect(serializeInner(root)).toBe(
      `<!--teleport start--><!--teleport end-->`
    )
    expect(serializeInner(target)).toBe(`<div style={}><div>1</div></div>`)

    rerender(
      parentId,
      compileToFunction(`
      <Child>
        <template #default>
          <div>1</div>
          <div>2</div>
        </template>
      </Child>
    `)
    )
    expect(serializeInner(root)).toBe(
      `<!--teleport start--><!--teleport end-->`
    )
    expect(serializeInner(target)).toBe(
      `<div style={}><div>1</div><div>2</div></div>`
    )
  })

  describe('HMR with directives', () => {
    function assertHooks(
      dir: ObjectDirective,
      calls: Record<keyof ObjectDirective, number>
    ) {
      Object.keys(dir).forEach(hookName => {
        expect(dir[hookName as keyof ObjectDirective]).toHaveBeenCalledTimes(
          calls[hookName as keyof ObjectDirective]
        )
      })
    }

    test('should invoke the appropriate hooks when patching with HRM', async () => {
      const root = nodeOps.createElement('div')
      const dir = {
        beforeMount: jest.fn(),
        mounted: jest.fn(),
        beforeUpdate: jest.fn(),
        updated: jest.fn(),
        beforeUnmount: jest.fn(),
        unmounted: jest.fn()
      }
      const compId = 'parentId'
      const Comp = {
        __hmrId: compId,
        name: 'Parent',
        render() {
          return withDirectives(h('div', 'foo'), [[dir]])
        }
      }
      createRecord(compId, Comp)

      render(h(Comp), root)
      expect(serializeInner(root)).toBe(`<div>foo</div>`)
      assertHooks(dir, {
        created: 1,
        beforeMount: 1,
        mounted: 1,
        beforeUpdate: 0,
        updated: 0,
        beforeUnmount: 0,
        unmounted: 0,
        getSSRProps: 0
      })

      // should invoke the beforeUmount/unmounted hooks when the dir is removed
      rerender(compId, () => {
        return h('div', 'bar')
      })
      await nextTick()
      expect(serializeInner(root)).toBe(`<div>bar</div>`)
      assertHooks(dir, {
        created: 1,
        beforeMount: 1,
        mounted: 1,
        beforeUpdate: 0,
        updated: 0,
        beforeUnmount: 1,
        unmounted: 1,
        getSSRProps: 0
      })

      // should invoke the beforeMount/mounted hooks when the dir is added again
      rerender(compId, () => {
        return withDirectives(h('div', 'foo'), [[dir]])
      })
      await nextTick()
      expect(serializeInner(root)).toBe(`<div>foo</div>`)
      assertHooks(dir, {
        created: 2,
        beforeMount: 2,
        mounted: 2,
        beforeUpdate: 0,
        updated: 0,
        beforeUnmount: 1,
        unmounted: 1,
        getSSRProps: 0
      })

      // should invoke the beforeUpdate/updated hooks when the dir is always there
      rerender(compId, () => {
        return withDirectives(h('div', 'bar'), [[dir]])
      })
      await nextTick()
      expect(serializeInner(root)).toBe(`<div>bar</div>`)
      assertHooks(dir, {
        created: 2,
        beforeMount: 2,
        mounted: 2,
        beforeUpdate: 1,
        updated: 1,
        beforeUnmount: 1,
        unmounted: 1,
        getSSRProps: 0
      })
    })
  })
})
