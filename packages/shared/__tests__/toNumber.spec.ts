import { toNumber } from '../src'

describe('utils/toNumber', () => {
  test('number', () => {
    expect(toNumber(1)).toBe(1)
    expect(toNumber(1.3)).toBe(1.3)
    expect(toNumber(NaN)).toBe(NaN)
  })

  test('string', () => {
    expect(toNumber('123')).toBe(123)
    expect(toNumber('3.14')).toBe(3.14)
    expect(toNumber('3.14aa')).toBe('3.14aa')
    expect(toNumber('aa3.14')).toBe('aa3.14')
  })
})
