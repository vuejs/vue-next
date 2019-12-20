import {
  onMounted,
  onErrorCaptured,
  render,
  h,
  nodeOps,
  watch,
  ref,
  nextTick,
  mockWarn,
  computed,
  createComponent
} from '@vue/runtime-test'
import { setErrorRecovery } from '../src/errorHandling'

describe('error handling', () => {
  mockWarn()

  beforeEach(() => {
    setErrorRecovery(true)
  })

  afterEach(() => {
    setErrorRecovery(false)
  })

  test('propagation', () => {
    const err = new Error('foo')
    const fn = jest.fn()

    const Comp = {
      setup() {
        onErrorCaptured((err, instance, info) => {
          fn(err, info, 'root')
          return true
        })
        return () => h(Child)
      }
    }

    const Child = {
      setup() {
        onErrorCaptured((err, instance, info) => {
          fn(err, info, 'child')
        })
        return () => h(GrandChild)
      }
    }

    const GrandChild = {
      setup() {
        onMounted(() => {
          throw err
        })
        return () => null
      }
    }

    render(h(Comp), nodeOps.createElement('div'))
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith(err, 'mounted hook', 'root')
    expect(fn).toHaveBeenCalledWith(err, 'mounted hook', 'child')
  })

  test('propagation stoppage', () => {
    const err = new Error('foo')
    const fn = jest.fn()

    const Comp = {
      setup() {
        onErrorCaptured((err, instance, info) => {
          fn(err, info, 'root')
          return true
        })
        return () => h(Child)
      }
    }

    const Child = {
      setup() {
        onErrorCaptured((err, instance, info) => {
          fn(err, info, 'child')
          return true
        })
        return () => h(GrandChild)
      }
    }

    const GrandChild = {
      setup() {
        onMounted(() => {
          throw err
        })
        return () => null
      }
    }

    render(h(Comp), nodeOps.createElement('div'))
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(err, 'mounted hook', 'child')
  })

  test('async error handling', async () => {
    const err = new Error('foo')
    const fn = jest.fn()

    const Comp = {
      setup() {
        onErrorCaptured((err, instance, info) => {
          fn(err, info)
          return true
        })
        return () => h(Child)
      }
    }

    const Child = {
      setup() {
        onMounted(async () => {
          throw err
        })
      },
      render() {}
    }

    render(h(Comp), nodeOps.createElement('div'))
    expect(fn).not.toHaveBeenCalled()
    await new Promise(r => setTimeout(r))
    expect(fn).toHaveBeenCalledWith(err, 'mounted hook')
  })

  test('error thrown in onErrorCaptured', () => {
    const err = new Error('foo')
    const err2 = new Error('bar')
    const fn = jest.fn()

    const Comp = {
      setup() {
        onErrorCaptured((err, instance, info) => {
          fn(err, info)
          return true
        })
        return () => h(Child)
      }
    }

    const Child = {
      setup() {
        onErrorCaptured(() => {
          throw err2
        })
        return () => h(GrandChild)
      }
    }

    const GrandChild = {
      setup() {
        onMounted(() => {
          throw err
        })
        return () => null
      }
    }

    render(h(Comp), nodeOps.createElement('div'))
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledWith(err, 'mounted hook')
    expect(fn).toHaveBeenCalledWith(err2, 'errorCaptured hook')
  })

  test('setup function', () => {
    const err = new Error('foo')
    const fn = jest.fn()

    const Comp = {
      setup() {
        onErrorCaptured((err, instance, info) => {
          fn(err, info)
          return true
        })
        return () => h(Child)
      }
    }

    const Child = {
      setup() {
        throw err
      },
      render() {}
    }

    render(h(Comp), nodeOps.createElement('div'))
    expect(fn).toHaveBeenCalledWith(err, 'setup function')
  })

  test('in render function', () => {
    const err = new Error('foo')
    const fn = jest.fn()

    const Comp = {
      setup() {
        onErrorCaptured((err, instance, info) => {
          fn(err, info)
          return true
        })
        return () => h(Child)
      }
    }

    const Child = {
      setup() {
        return () => {
          throw err
        }
      }
    }

    render(h(Comp), nodeOps.createElement('div'))
    expect(fn).toHaveBeenCalledWith(err, 'render function')
  })

  test('in function ref', () => {
    const err = new Error('foo')
    const ref = () => {
      throw err
    }
    const fn = jest.fn()

    const Comp = {
      setup() {
        onErrorCaptured((err, instance, info) => {
          fn(err, info)
          return true
        })
        return () => h(Child)
      }
    }

    const Child = createComponent(() => () => h('div', { ref }))

    render(h(Comp), nodeOps.createElement('div'))
    expect(fn).toHaveBeenCalledWith(err, 'ref function')
  })

  test('in watch (simple usage)', () => {
    const err = new Error('foo')
    const fn = jest.fn()

    const Comp = {
      setup() {
        onErrorCaptured((err, instance, info) => {
          fn(err, info)
          return true
        })
        return () => h(Child)
      }
    }

    const Child = {
      setup() {
        watch(() => {
          throw err
        })
        return () => null
      }
    }

    render(h(Comp), nodeOps.createElement('div'))
    expect(fn).toHaveBeenCalledWith(err, 'watcher callback')
  })

  test('in read-only computed', () => {
    const err = new Error('foo')
    const fn = jest.fn()

    const Comp = {
      setup() {
        onErrorCaptured((err, instance, info) => {
          fn(err, info)
          return true
        })
        return () => h(Child)
      }
    }

    const Child = {
      setup() {
        const comp = computed(() => {
          throw err
        })
        comp.value
        return () => null
      }
    }

    render(h(Comp), nodeOps.createElement('div'))
    expect(fn).toHaveBeenCalledWith(err, 'computed getter')
  })

  test('in writable computed', () => {
    const err = new Error('foo')
    const fn = jest.fn()

    const Comp = {
      setup() {
        onErrorCaptured((err, instance, info) => {
          fn(err, info)
          return true
        })
        return () => h(Child)
      }
    }

    const Child = {
      setup() {
        const comp = computed({
          get: () => {
            throw err
          },
          set: (v: string) => {
            throw err
          }
        })

        comp.value = 'a'

        return () => null
      }
    }

    render(h(Comp), nodeOps.createElement('div'))
    expect(fn).toHaveBeenCalledWith(err, 'computed setter')
  })

  test('in watch getter', () => {
    const err = new Error('foo')
    const fn = jest.fn()

    const Comp = {
      setup() {
        onErrorCaptured((err, instance, info) => {
          fn(err, info)
          return true
        })
        return () => h(Child)
      }
    }

    const Child = {
      setup() {
        watch(
          () => {
            throw err
          },
          () => {}
        )
        return () => null
      }
    }

    render(h(Comp), nodeOps.createElement('div'))
    expect(fn).toHaveBeenCalledWith(err, 'watcher getter')
  })

  test('in watch callback', () => {
    const err = new Error('foo')
    const fn = jest.fn()

    const Comp = {
      setup() {
        onErrorCaptured((err, instance, info) => {
          fn(err, info)
          return true
        })
        return () => h(Child)
      }
    }

    const Child = {
      setup() {
        watch(
          () => 1,
          () => {
            throw err
          }
        )
        return () => null
      }
    }

    render(h(Comp), nodeOps.createElement('div'))
    expect(fn).toHaveBeenCalledWith(err, 'watcher callback')
  })

  test('in watch cleanup', async () => {
    const err = new Error('foo')
    const count = ref(0)
    const fn = jest.fn()

    const Comp = {
      setup() {
        onErrorCaptured((err, instance, info) => {
          fn(err, info)
          return true
        })
        return () => h(Child)
      }
    }

    const Child = {
      setup() {
        watch(onCleanup => {
          count.value
          onCleanup(() => {
            throw err
          })
        })
        return () => null
      }
    }

    render(h(Comp), nodeOps.createElement('div'))

    count.value++
    await nextTick()
    expect(fn).toHaveBeenCalledWith(err, 'watcher cleanup function')
  })

  test('in component event handler', () => {
    const err = new Error('foo')
    const fn = jest.fn()

    const Comp = {
      setup() {
        onErrorCaptured((err, instance, info) => {
          fn(err, info)
          return true
        })
        return () =>
          h(Child, {
            onFoo: () => {
              throw err
            }
          })
      }
    }

    const Child = {
      setup(props: any, { emit }: any) {
        emit('foo')
        return () => null
      }
    }

    render(h(Comp), nodeOps.createElement('div'))
    expect(fn).toHaveBeenCalledWith(err, 'component event handler')
  })

  it('should warn unhandled', () => {
    const onError = jest.spyOn(console, 'error')
    onError.mockImplementation(() => {})
    const groupCollapsed = jest.spyOn(console, 'groupCollapsed')
    groupCollapsed.mockImplementation(() => {})
    const log = jest.spyOn(console, 'log')
    log.mockImplementation(() => {})

    const err = new Error('foo')
    const fn = jest.fn()

    const Comp = {
      setup() {
        onErrorCaptured((err, instance, info) => {
          fn(err, info)
        })
        return () => h(Child)
      }
    }

    const Child = {
      setup() {
        throw err
      },
      render() {}
    }

    render(h(Comp), nodeOps.createElement('div'))
    expect(fn).toHaveBeenCalledWith(err, 'setup function')
    expect(
      `Unhandled error during execution of setup function`
    ).toHaveBeenWarned()
    expect(onError).toHaveBeenCalledWith(err)

    onError.mockRestore()
    groupCollapsed.mockRestore()
    log.mockRestore()
  })

  // native event handler handling should be tested in respective renderers
})
