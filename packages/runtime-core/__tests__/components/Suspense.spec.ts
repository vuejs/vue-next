import {
  h,
  ref,
  Suspense,
  ComponentOptions,
  render,
  nodeOps,
  serializeInner,
  nextTick,
  onMounted,
  watch,
  watchEffect,
  onUnmounted,
  onErrorCaptured,
  shallowRef
} from '@vue/runtime-test'
import { createApp } from 'vue'

describe('Suspense', () => {
  const deps: Promise<any>[] = []

  beforeEach(() => {
    deps.length = 0
  })

  // a simple async factory for testing purposes only.
  function defineAsyncComponent<T extends ComponentOptions>(
    comp: T,
    delay: number = 0
  ) {
    return {
      setup(props: any, { slots }: any) {
        const p = new Promise(resolve => {
          setTimeout(() => {
            resolve(() => h(comp, props, slots))
          }, delay)
        })
        // in Node 12, due to timer/nextTick mechanism change, we have to wait
        // an extra tick to avoid race conditions
        deps.push(p.then(() => Promise.resolve()))
        return p
      }
    }
  }

  test('fallback content', async () => {
    const Async = defineAsyncComponent({
      render() {
        return h('div', 'async')
      }
    })

    const Comp = {
      setup() {
        return () =>
          h(Suspense, null, {
            default: h(Async),
            fallback: h('div', 'fallback')
          })
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>fallback</div>`)

    await Promise.all(deps)
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>async</div>`)
  })

  test('emits events', async () => {
    const Async = defineAsyncComponent({
      render() {
        return h('div', 'async')
      }
    })

    const onFallback = jest.fn()
    const onResolve = jest.fn()
    const onPending = jest.fn()

    const show = ref(true)
    const Comp = {
      setup() {
        return () =>
          h(
            Suspense,
            {
              onFallback,
              onResolve,
              onPending,
              // force displaying the fallback right away
              timeout: 0
            },
            {
              default: () => (show.value ? h(Async) : null),
              fallback: h('div', 'fallback')
            }
          )
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(onFallback).toHaveBeenCalledTimes(1)
    expect(onPending).toHaveBeenCalledTimes(1)
    expect(onResolve).toHaveBeenCalledTimes(0)

    await Promise.all(deps)
    await nextTick()
    expect(onFallback).toHaveBeenCalledTimes(1)
    expect(onPending).toHaveBeenCalledTimes(1)
    expect(onResolve).toHaveBeenCalledTimes(1)

    show.value = false
    await nextTick()
    expect(onFallback).toHaveBeenCalledTimes(1)
    expect(onPending).toHaveBeenCalledTimes(2)
    expect(onResolve).toHaveBeenCalledTimes(2)

    deps.length = 0
    show.value = true
    await nextTick()
    expect(onFallback).toHaveBeenCalledTimes(2)
    expect(onPending).toHaveBeenCalledTimes(3)
    expect(onResolve).toHaveBeenCalledTimes(2)

    await Promise.all(deps)
    await nextTick()
    expect(onFallback).toHaveBeenCalledTimes(2)
    expect(onPending).toHaveBeenCalledTimes(3)
    expect(onResolve).toHaveBeenCalledTimes(3)
  })

  test('nested async deps', async () => {
    const calls: string[] = []

    const AsyncOuter = defineAsyncComponent({
      setup() {
        onMounted(() => {
          calls.push('outer mounted')
        })
        return () => h(AsyncInner)
      }
    })

    const AsyncInner = defineAsyncComponent(
      {
        setup() {
          onMounted(() => {
            calls.push('inner mounted')
          })
          return () => h('div', 'inner')
        }
      },
      10
    )

    const Comp = {
      setup() {
        return () =>
          h(Suspense, null, {
            default: h(AsyncOuter),
            fallback: h('div', 'fallback')
          })
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>fallback</div>`)
    expect(calls).toEqual([])

    await deps[0]
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>fallback</div>`)
    expect(calls).toEqual([])

    await Promise.all(deps)
    await nextTick()
    expect(calls).toEqual([`outer mounted`, `inner mounted`])
    expect(serializeInner(root)).toBe(`<div>inner</div>`)
  })

  test('onResolve', async () => {
    const Async = defineAsyncComponent({
      render() {
        return h('div', 'async')
      }
    })

    const onResolve = jest.fn()

    const Comp = {
      setup() {
        return () =>
          h(
            Suspense,
            {
              onResolve
            },
            {
              default: h(Async),
              fallback: h('div', 'fallback')
            }
          )
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>fallback</div>`)
    expect(onResolve).not.toHaveBeenCalled()

    await Promise.all(deps)
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>async</div>`)
    expect(onResolve).toHaveBeenCalled()
  })

  test('buffer mounted/updated hooks & post flush watch callbacks', async () => {
    const deps: Promise<any>[] = []
    const calls: string[] = []
    const toggle = ref(true)

    const Async = {
      async setup() {
        const p = new Promise(r => setTimeout(r, 1))
        // extra tick needed for Node 12+
        deps.push(p.then(() => Promise.resolve()))

        watchEffect(
          () => {
            calls.push('watch effect')
          },
          { flush: 'post' }
        )

        const count = ref(0)
        watch(
          count,
          () => {
            calls.push('watch callback')
          },
          { flush: 'post' }
        )
        count.value++ // trigger the watcher now

        onMounted(() => {
          calls.push('mounted')
        })

        onUnmounted(() => {
          calls.push('unmounted')
        })

        await p
        return () => h('div', 'async')
      }
    }

    const Comp = {
      setup() {
        return () =>
          h(Suspense, null, {
            default: toggle.value ? h(Async) : null,
            fallback: h('div', 'fallback')
          })
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>fallback</div>`)
    expect(calls).toEqual([])

    await Promise.all(deps)
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>async</div>`)
    expect(calls).toEqual([`watch effect`, `watch callback`, `mounted`])

    // effects inside an already resolved suspense should happen at normal timing
    toggle.value = false
    await nextTick()
    await nextTick()
    expect(serializeInner(root)).toBe(`<!---->`)
    expect(calls).toEqual([
      `watch effect`,
      `watch callback`,
      `mounted`,
      'unmounted'
    ])
  })

  // #1059
  test('mounted/updated hooks & fallback component', async () => {
    const deps: Promise<any>[] = []
    const calls: string[] = []
    const toggle = ref(true)

    const Async = {
      async setup() {
        const p = new Promise(r => setTimeout(r, 1))
        // extra tick needed for Node 12+
        deps.push(p.then(() => Promise.resolve()))

        await p
        return () => h('div', 'async')
      }
    }

    const Fallback = {
      setup() {
        onMounted(() => {
          calls.push('mounted')
        })

        onUnmounted(() => {
          calls.push('unmounted')
        })
        return () => h('div', 'fallback')
      }
    }

    const Comp = {
      setup() {
        return () =>
          h(Suspense, null, {
            default: toggle.value ? h(Async) : null,
            fallback: h(Fallback)
          })
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>fallback</div>`)
    expect(calls).toEqual([`mounted`])

    await Promise.all(deps)
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>async</div>`)
    expect(calls).toEqual([`mounted`, `unmounted`])
  })

  test('content update before suspense resolve', async () => {
    const Async = defineAsyncComponent({
      props: { msg: String },
      setup(props: any) {
        return () => h('div', props.msg)
      }
    })

    const msg = ref('foo')

    const Comp = {
      setup() {
        return () =>
          h(Suspense, null, {
            default: h(Async, { msg: msg.value }),
            fallback: h('div', `fallback ${msg.value}`)
          })
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>fallback foo</div>`)

    // value changed before resolve
    msg.value = 'bar'
    await nextTick()
    // fallback content should be updated
    expect(serializeInner(root)).toBe(`<div>fallback bar</div>`)

    await Promise.all(deps)
    await nextTick()
    // async component should receive updated props/slots when resolved
    expect(serializeInner(root)).toBe(`<div>bar</div>`)
  })

  // mount/unmount hooks should not even fire
  test('unmount before suspense resolve', async () => {
    const deps: Promise<any>[] = []
    const calls: string[] = []
    const toggle = ref(true)

    const Async = {
      async setup() {
        const p = new Promise(r => setTimeout(r, 1))
        deps.push(p)

        watchEffect(
          () => {
            calls.push('watch effect')
          },
          { flush: 'post' }
        )

        const count = ref(0)
        watch(
          count,
          () => {
            calls.push('watch callback')
          },
          { flush: 'post' }
        )
        count.value++ // trigger the watcher now

        onMounted(() => {
          calls.push('mounted')
        })

        onUnmounted(() => {
          calls.push('unmounted')
        })

        await p
        return () => h('div', 'async')
      }
    }

    const Comp = {
      setup() {
        return () =>
          h(Suspense, null, {
            default: toggle.value ? h(Async) : null,
            fallback: h('div', 'fallback')
          })
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>fallback</div>`)
    expect(calls).toEqual([])

    // remove the async dep before it's resolved
    toggle.value = false
    await nextTick()
    // should cause the suspense to resolve immediately
    expect(serializeInner(root)).toBe(`<!---->`)

    await Promise.all(deps)
    await nextTick()
    expect(serializeInner(root)).toBe(`<!---->`)
    // should discard effects
    expect(calls).toEqual([])
  })

  test('unmount suspense after resolve', async () => {
    const toggle = ref(true)
    const unmounted = jest.fn()

    const Async = defineAsyncComponent({
      setup() {
        onUnmounted(unmounted)
        return () => h('div', 'async')
      }
    })

    const Comp = {
      setup() {
        return () =>
          toggle.value
            ? h(Suspense, null, {
                default: h(Async),
                fallback: h('div', 'fallback')
              })
            : null
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>fallback</div>`)

    await Promise.all(deps)
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>async</div>`)
    expect(unmounted).not.toHaveBeenCalled()

    toggle.value = false
    await nextTick()
    expect(serializeInner(root)).toBe(`<!---->`)
    expect(unmounted).toHaveBeenCalled()
  })

  test('unmount suspense before resolve', async () => {
    const toggle = ref(true)
    const mounted = jest.fn()
    const unmounted = jest.fn()

    const Async = defineAsyncComponent({
      setup() {
        onMounted(mounted)
        onUnmounted(unmounted)
        return () => h('div', 'async')
      }
    })

    const Comp = {
      setup() {
        return () =>
          toggle.value
            ? h(Suspense, null, {
                default: h(Async),
                fallback: h('div', 'fallback')
              })
            : null
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>fallback</div>`)

    toggle.value = false
    await nextTick()
    expect(serializeInner(root)).toBe(`<!---->`)
    expect(mounted).not.toHaveBeenCalled()
    expect(unmounted).not.toHaveBeenCalled()

    await Promise.all(deps)
    await nextTick()
    // should not resolve and cause unmount
    expect(mounted).not.toHaveBeenCalled()
    expect(unmounted).not.toHaveBeenCalled()
  })

  test('nested suspense (parent resolves first)', async () => {
    const calls: string[] = []

    const AsyncOuter = defineAsyncComponent(
      {
        setup: () => {
          onMounted(() => {
            calls.push('outer mounted')
          })
          return () => h('div', 'async outer')
        }
      },
      1
    )

    const AsyncInner = defineAsyncComponent(
      {
        setup: () => {
          onMounted(() => {
            calls.push('inner mounted')
          })
          return () => h('div', 'async inner')
        }
      },
      10
    )

    const Inner = {
      setup() {
        return () =>
          h(Suspense, null, {
            default: h(AsyncInner),
            fallback: h('div', 'fallback inner')
          })
      }
    }

    const Comp = {
      setup() {
        return () =>
          h(Suspense, null, {
            default: h('div', [h(AsyncOuter), h(Inner)]),
            fallback: h('div', 'fallback outer')
          })
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>fallback outer</div>`)

    await deps[0]
    await nextTick()
    expect(serializeInner(root)).toBe(
      `<div><div>async outer</div><div>fallback inner</div></div>`
    )
    expect(calls).toEqual([`outer mounted`])

    await Promise.all(deps)
    await nextTick()
    expect(serializeInner(root)).toBe(
      `<div><div>async outer</div><div>async inner</div></div>`
    )
    expect(calls).toEqual([`outer mounted`, `inner mounted`])
  })

  test('nested suspense (child resolves first)', async () => {
    const calls: string[] = []

    const AsyncOuter = defineAsyncComponent(
      {
        setup: () => {
          onMounted(() => {
            calls.push('outer mounted')
          })
          return () => h('div', 'async outer')
        }
      },
      10
    )

    const AsyncInner = defineAsyncComponent(
      {
        setup: () => {
          onMounted(() => {
            calls.push('inner mounted')
          })
          return () => h('div', 'async inner')
        }
      },
      1
    )

    const Inner = {
      setup() {
        return () =>
          h(Suspense, null, {
            default: h(AsyncInner),
            fallback: h('div', 'fallback inner')
          })
      }
    }

    const Comp = {
      setup() {
        return () =>
          h(Suspense, null, {
            default: h('div', [h(AsyncOuter), h(Inner)]),
            fallback: h('div', 'fallback outer')
          })
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>fallback outer</div>`)

    await deps[1]
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>fallback outer</div>`)
    expect(calls).toEqual([])

    await Promise.all(deps)
    await nextTick()
    expect(serializeInner(root)).toBe(
      `<div><div>async outer</div><div>async inner</div></div>`
    )
    expect(calls).toEqual([`inner mounted`, `outer mounted`])
  })

  test('error handling', async () => {
    const Async = {
      async setup() {
        throw new Error('oops')
      }
    }

    const Comp = {
      setup() {
        const errorMessage = ref<string | null>(null)
        onErrorCaptured(err => {
          errorMessage.value =
            err instanceof Error
              ? err.message
              : `A non-Error value thrown: ${err}`
          return false
        })

        return () =>
          errorMessage.value
            ? h('div', errorMessage.value)
            : h(Suspense, null, {
                default: h(Async),
                fallback: h('div', 'fallback')
              })
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>fallback</div>`)

    await Promise.all(deps)
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>oops</div>`)
  })

  // #3857
  test('error handling w/ template optimization', async () => {
    const Async = {
      async setup() {
        throw new Error('oops')
      }
    }

    const Comp = {
      template: `
      <div v-if="errorMessage">{{ errorMessage }}</div>
      <Suspense v-else>
        <div>
          <Async />
        </div>
        <template #fallback>
          <div>fallback</div>
        </template>
      </Suspense>
      `,
      components: { Async },
      setup() {
        const errorMessage = ref<string | null>(null)
        onErrorCaptured(err => {
          errorMessage.value =
            err instanceof Error
              ? err.message
              : `A non-Error value thrown: ${err}`
          return false
        })
        return { errorMessage }
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>fallback</div>`)

    await Promise.all(deps)
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>oops</div>`)
  })

  it('combined usage (nested async + nested suspense + multiple deps)', async () => {
    const msg = ref('nested msg')
    const calls: number[] = []

    const AsyncChildWithSuspense = defineAsyncComponent({
      props: { msg: String },
      setup(props: any) {
        onMounted(() => {
          calls.push(0)
        })
        return () =>
          h(Suspense, null, {
            default: h(AsyncInsideNestedSuspense, { msg: props.msg }),
            fallback: h('div', 'nested fallback')
          })
      }
    })

    const AsyncInsideNestedSuspense = defineAsyncComponent(
      {
        props: { msg: String },
        setup(props: any) {
          onMounted(() => {
            calls.push(2)
          })
          return () => h('div', props.msg)
        }
      },
      20
    )

    const AsyncChildParent = defineAsyncComponent({
      props: { msg: String },
      setup(props: any) {
        onMounted(() => {
          calls.push(1)
        })
        return () => h(NestedAsyncChild, { msg: props.msg })
      }
    })

    const NestedAsyncChild = defineAsyncComponent(
      {
        props: { msg: String },
        setup(props: any) {
          onMounted(() => {
            calls.push(3)
          })
          return () => h('div', props.msg)
        }
      },
      10
    )

    const MiddleComponent = {
      setup() {
        return () =>
          h(AsyncChildWithSuspense, {
            msg: msg.value
          })
      }
    }

    const Comp = {
      setup() {
        return () =>
          h(Suspense, null, {
            default: h('div', [
              h(MiddleComponent),
              h(AsyncChildParent, {
                msg: 'root async'
              })
            ]),
            fallback: h('div', 'root fallback')
          })
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>root fallback</div>`)
    expect(calls).toEqual([])

    /**
     * <Root>
     *   <Suspense>
     *     <MiddleComponent>
     *       <AsyncChildWithSuspense> (0: resolves on macrotask)
     *         <Suspense>
     *           <AsyncInsideNestedSuspense> (2: resolves on macrotask + 20ms)
     *     <AsyncChildParent> (1: resolves on macrotask)
     *       <NestedAsyncChild> (3: resolves on macrotask + 10ms)
     */

    // both top level async deps resolved, but there is another nested dep
    // so should still be in fallback state
    await Promise.all([deps[0], deps[1]])
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>root fallback</div>`)
    expect(calls).toEqual([])

    // root suspense all deps resolved. should show root content now
    // with nested suspense showing fallback content
    await deps[3]
    await nextTick()
    expect(serializeInner(root)).toBe(
      `<div><div>nested fallback</div><div>root async</div></div>`
    )
    expect(calls).toEqual([0, 1, 3])

    // change state for the nested component before it resolves
    msg.value = 'nested changed'

    // all deps resolved, nested suspense should resolve now
    await Promise.all(deps)
    await nextTick()
    expect(serializeInner(root)).toBe(
      `<div><div>nested changed</div><div>root async</div></div>`
    )
    expect(calls).toEqual([0, 1, 3, 2])

    // should update just fine after resolve
    msg.value = 'nested changed again'
    await nextTick()
    expect(serializeInner(root)).toBe(
      `<div><div>nested changed again</div><div>root async</div></div>`
    )
  })

  test('switching branches', async () => {
    const calls: string[] = []
    const toggle = ref(true)

    const Foo = defineAsyncComponent({
      setup() {
        onMounted(() => {
          calls.push('foo mounted')
        })
        onUnmounted(() => {
          calls.push('foo unmounted')
        })
        return () => h('div', ['foo', h(FooNested)])
      }
    })

    const FooNested = defineAsyncComponent(
      {
        setup() {
          onMounted(() => {
            calls.push('foo nested mounted')
          })
          onUnmounted(() => {
            calls.push('foo nested unmounted')
          })
          return () => h('div', 'foo nested')
        }
      },
      10
    )

    const Bar = defineAsyncComponent(
      {
        setup() {
          onMounted(() => {
            calls.push('bar mounted')
          })
          onUnmounted(() => {
            calls.push('bar unmounted')
          })
          return () => h('div', 'bar')
        }
      },
      10
    )

    const Comp = {
      setup() {
        return () =>
          h(Suspense, null, {
            default: toggle.value ? h(Foo) : h(Bar),
            fallback: h('div', 'fallback')
          })
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>fallback</div>`)
    expect(calls).toEqual([])

    await deps[0]
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>fallback</div>`)
    expect(calls).toEqual([])

    await Promise.all(deps)
    await nextTick()
    expect(calls).toEqual([`foo mounted`, `foo nested mounted`])
    expect(serializeInner(root)).toBe(`<div>foo<div>foo nested</div></div>`)

    // toggle
    toggle.value = false
    await nextTick()
    expect(deps.length).toBe(3)
    // should remain on current view
    expect(calls).toEqual([`foo mounted`, `foo nested mounted`])
    expect(serializeInner(root)).toBe(`<div>foo<div>foo nested</div></div>`)

    await Promise.all(deps)
    await nextTick()
    const tempCalls = [
      `foo mounted`,
      `foo nested mounted`,
      `bar mounted`,
      `foo nested unmounted`,
      `foo unmounted`
    ]
    expect(calls).toEqual(tempCalls)
    expect(serializeInner(root)).toBe(`<div>bar</div>`)

    // toggle back
    toggle.value = true
    await nextTick()
    // should remain
    expect(calls).toEqual(tempCalls)
    expect(serializeInner(root)).toBe(`<div>bar</div>`)

    await deps[3]
    await nextTick()
    // still pending...
    expect(calls).toEqual(tempCalls)
    expect(serializeInner(root)).toBe(`<div>bar</div>`)

    await Promise.all(deps)
    await nextTick()
    expect(calls).toEqual([
      ...tempCalls,
      `foo mounted`,
      `foo nested mounted`,
      `bar unmounted`
    ])
    expect(serializeInner(root)).toBe(`<div>foo<div>foo nested</div></div>`)
  })

  test('display previous branch when timeout + no fallback slot is provided', async () => {
    const toggle = ref(false)
    let resolve = () => {}
    let promise: Promise<void>
    function createPromise() {
      promise = new Promise<void>(r => {
        resolve = r
      })

      return promise
    }

    const Foo = {
      async setup() {
        await createPromise()
        return () => h('div', ['foo'])
      }
    }

    const onPending = jest.fn()
    const onFallback = jest.fn()
    const onResolve = jest.fn()

    const Comp = {
      setup() {
        return () =>
          h(
            Suspense,
            { timeout: 0, onPending, onFallback, onResolve },
            {
              default: toggle.value ? h(Foo) : 'other'
            }
          )
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`other`)
    expect(onPending).toHaveBeenCalledTimes(0)
    expect(onFallback).toHaveBeenCalledTimes(0)
    expect(onResolve).toHaveBeenCalledTimes(1)

    toggle.value = true
    await nextTick()
    expect(serializeInner(root)).toBe(`other`)
    expect(onPending).toHaveBeenCalledTimes(1)
    expect(onFallback).toHaveBeenCalledTimes(0)
    expect(onResolve).toHaveBeenCalledTimes(1)

    resolve()
    await promise!
    await nextTick()
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>foo</div>`)
    expect(onPending).toHaveBeenCalledTimes(1)
    expect(onFallback).toHaveBeenCalledTimes(0)
    expect(onResolve).toHaveBeenCalledTimes(2)
  })

  test('branch switch to 3rd branch before resolve', async () => {
    const calls: string[] = []

    const makeComp = (name: string, delay = 0) =>
      defineAsyncComponent(
        {
          setup() {
            onMounted(() => {
              calls.push(`${name} mounted`)
            })
            onUnmounted(() => {
              calls.push(`${name} unmounted`)
            })
            return () => h('div', [name])
          }
        },
        delay
      )

    const One = makeComp('one')
    const Two = makeComp('two', 10)
    const Three = makeComp('three', 20)

    const view = shallowRef(One)

    const Comp = {
      setup() {
        return () =>
          h(Suspense, null, {
            default: h(view.value),
            fallback: h('div', 'fallback')
          })
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>fallback</div>`)
    expect(calls).toEqual([])

    await deps[0]
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>one</div>`)
    expect(calls).toEqual([`one mounted`])

    view.value = Two
    await nextTick()
    expect(deps.length).toBe(2)

    // switch before two resovles
    view.value = Three
    await nextTick()
    expect(deps.length).toBe(3)

    // dep for two resolves
    await deps[1]
    await nextTick()
    // should still be on view one
    expect(serializeInner(root)).toBe(`<div>one</div>`)
    expect(calls).toEqual([`one mounted`])

    await deps[2]
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>three</div>`)
    expect(calls).toEqual([`one mounted`, `three mounted`, `one unmounted`])
  })

  test('branch switch back before resolve', async () => {
    const calls: string[] = []

    const makeComp = (name: string, delay = 0) =>
      defineAsyncComponent(
        {
          setup() {
            onMounted(() => {
              calls.push(`${name} mounted`)
            })
            onUnmounted(() => {
              calls.push(`${name} unmounted`)
            })
            return () => h('div', [name])
          }
        },
        delay
      )

    const One = makeComp('one')
    const Two = makeComp('two', 10)

    const view = shallowRef(One)

    const Comp = {
      setup() {
        return () =>
          h(Suspense, null, {
            default: h(view.value),
            fallback: h('div', 'fallback')
          })
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>fallback</div>`)
    expect(calls).toEqual([])

    await deps[0]
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>one</div>`)
    expect(calls).toEqual([`one mounted`])

    view.value = Two
    await nextTick()
    expect(deps.length).toBe(2)

    // switch back before two resovles
    view.value = One
    await nextTick()
    expect(deps.length).toBe(2)

    // dep for two resolves
    await deps[1]
    await nextTick()
    // should still be on view one
    expect(serializeInner(root)).toBe(`<div>one</div>`)
    expect(calls).toEqual([`one mounted`])
  })

  test('branch switch timeout + fallback', async () => {
    const calls: string[] = []

    const makeComp = (name: string, delay = 0) =>
      defineAsyncComponent(
        {
          setup() {
            onMounted(() => {
              calls.push(`${name} mounted`)
            })
            onUnmounted(() => {
              calls.push(`${name} unmounted`)
            })
            return () => h('div', [name])
          }
        },
        delay
      )

    const One = makeComp('one')
    const Two = makeComp('two', 20)

    const view = shallowRef(One)

    const Comp = {
      setup() {
        return () =>
          h(
            Suspense,
            {
              timeout: 10
            },
            {
              default: h(view.value),
              fallback: h('div', 'fallback')
            }
          )
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>fallback</div>`)
    expect(calls).toEqual([])

    await deps[0]
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>one</div>`)
    expect(calls).toEqual([`one mounted`])

    view.value = Two
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>one</div>`)
    expect(calls).toEqual([`one mounted`])

    await new Promise(r => setTimeout(r, 10))
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>fallback</div>`)
    expect(calls).toEqual([`one mounted`, `one unmounted`])

    await deps[1]
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>two</div>`)
    expect(calls).toEqual([`one mounted`, `one unmounted`, `two mounted`])
  })

  // #2214
  // Since suspense renders its own root like a component, it should not patch
  // its content in optimized mode.
  test('should not miss nested element updates when used in templates', async () => {
    const n = ref(1)
    const Comp = {
      setup() {
        return { n }
      },
      template: `
      <Suspense>
        <div><span>{{ n }}</span></div>
      </Suspense>
      `
    }
    const root = document.createElement('div')
    createApp(Comp).mount(root)
    expect(root.innerHTML).toBe(`<div><span>1</span></div>`)

    n.value++
    await nextTick()
    expect(root.innerHTML).toBe(`<div><span>2</span></div>`)
  })

  // #2215
  test('toggling nested async setup component inside already resolved suspense', async () => {
    const toggle = ref(false)
    const Child = {
      async setup() {
        return () => h('div', 'child')
      }
    }
    const Parent = () => h('div', ['parent', toggle.value ? h(Child) : null])
    const Comp = {
      setup() {
        return () => h(Suspense, () => h(Parent))
      }
    }

    const root = nodeOps.createElement('div')
    render(h(Comp), root)
    expect(serializeInner(root)).toBe(`<div>parent<!----></div>`)

    toggle.value = true
    // wait for flush
    await nextTick()
    // wait for child async setup resolve
    await nextTick()
    // child should be rendered now instead of stuck in limbo
    expect(serializeInner(root)).toBe(`<div>parent<div>child</div></div>`)

    toggle.value = false
    await nextTick()
    expect(serializeInner(root)).toBe(`<div>parent<!----></div>`)
  })
})
