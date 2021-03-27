import { nodeOps } from '../src/nodeOps'

describe('runtime-dom: node-ops', () => {
  test('the _value property should be cloned', () => {
    const el = nodeOps.createElement('input') as HTMLDivElement & {
      _value: any
    }
    el._value = 1
    const cloned = nodeOps.cloneNode!(el) as HTMLDivElement & { _value: any }
    expect(cloned._value).toBe(1)
  })

  test("the <select>'s multiple attr should be set in createElement", () => {
    const el = nodeOps.createElement('select', false, undefined, {
      multiple: ''
    }) as HTMLSelectElement
    const option1 = nodeOps.createElement('option') as HTMLOptionElement
    const option2 = nodeOps.createElement('option') as HTMLOptionElement
    option1.selected = true
    option2.selected = true
    nodeOps.insert(option1, el)
    nodeOps.insert(option2, el)

    expect(el.multiple).toBe(true)
    expect(option1.selected).toBe(true)
    expect(option2.selected).toBe(true)
  })
})
