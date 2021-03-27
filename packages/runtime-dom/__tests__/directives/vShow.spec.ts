import {
  withDirectives,
  defineComponent,
  h,
  nextTick,
  VNode,
  ref,
  watch
} from '@vue/runtime-core'
import { render, Transition, vShow } from '@vue/runtime-dom'

const withVShow = (node: VNode, exp: any) =>
  withDirectives(node, [[vShow, exp]])

let root: any

beforeEach(() => {
  root = document.createElement('div')
})

describe('runtime-dom: v-show directive', () => {
  test('should check show value is truthy', async () => {
    const component = defineComponent({
      data() {
        return { value: true }
      },
      render() {
        return [withVShow(h('div'), this.value)]
      }
    })
    render(h(component), root)

    const $div = root.querySelector('div')

    expect($div.style.display).toEqual('')
  })

  test('should check show value is falsy', async () => {
    const component = defineComponent({
      data() {
        return { value: false }
      },
      render() {
        return [withVShow(h('div'), this.value)]
      }
    })
    render(h(component), root)

    const $div = root.querySelector('div')

    expect($div.style.display).toEqual('none')
  })

  it('should update show value changed', async () => {
    const component = defineComponent({
      data() {
        return { value: true }
      },
      render() {
        return [withVShow(h('div'), this.value)]
      }
    })
    render(h(component), root)

    const $div = root.querySelector('div')
    const data = root._vnode.component.data

    expect($div.style.display).toEqual('')

    data.value = false
    await nextTick()
    expect($div.style.display).toEqual('none')

    data.value = {}
    await nextTick()
    expect($div.style.display).toEqual('')

    data.value = 0
    await nextTick()
    expect($div.style.display).toEqual('none')

    data.value = []
    await nextTick()
    expect($div.style.display).toEqual('')

    data.value = null
    await nextTick()
    expect($div.style.display).toEqual('none')

    data.value = '0'
    await nextTick()
    expect($div.style.display).toEqual('')

    data.value = undefined
    await nextTick()
    expect($div.style.display).toEqual('none')

    data.value = 1
    await nextTick()
    expect($div.style.display).toEqual('')
  })

  test('should respect display value in style attribute', async () => {
    const component = defineComponent({
      data() {
        return { value: true }
      },
      render() {
        return [
          withVShow(h('div', { style: { display: 'block' } }), this.value)
        ]
      }
    })
    render(h(component), root)

    const $div = root.querySelector('div')
    const data = root._vnode.component.data

    expect($div.style.display).toEqual('block')

    data.value = false
    await nextTick()
    expect($div.style.display).toEqual('none')

    data.value = true
    await nextTick()
    expect($div.style.display).toEqual('block')
  })

  // #2583
  test('the value of `display` set by v-show should not be overwritten by the style attribute when updated', async () => {
    const style = ref('width: 100px')
    const display = ref(false)
    const component = defineComponent({
      render() {
        return withVShow(h('div', { style: style.value }), display.value)
      }
    })
    render(h(component), root)

    const $div = root.querySelector('div')

    expect($div.style.display).toEqual('none')

    style.value = 'width: 50px'
    await nextTick()
    expect($div.style.display).toEqual('none')

    display.value = true
    await nextTick()
    expect($div.style.display).toEqual('')
  })

  // #2583, #2757
  test('the value of `display` set by v-show should not be overwritten by the style attribute when updated (with Transition)', async () => {
    const style = ref('width: 100px')
    const display = ref(false)
    const component = defineComponent({
      setup() {
        const innerValue = ref(false)
        watch(display, val => {
          innerValue.value = val
        })
        return () => {
          return h(Transition, () =>
            withVShow(
              h('div', { style: style.value }, innerValue.value),
              display.value
            )
          )
        }
      }
    })
    render(h(component), root)

    const $div = root.querySelector('div')

    expect($div.style.display).toEqual('none')

    style.value = 'width: 50px'
    await nextTick()
    expect($div.style.display).toEqual('none')

    display.value = true
    await nextTick()
    expect($div.style.display).toEqual('')
  })
})
