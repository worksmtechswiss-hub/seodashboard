import { describe, it, expect } from 'vitest'
import { formatNum } from '../formatters'

describe('formatNum', () => {
  it('returns raw number as string for values under 1000', () => {
    expect(formatNum(999)).toBe('999')
  })
  it('formats thousands with K suffix', () => {
    expect(formatNum(1500)).toBe('1.5K')
  })
  it('formats millions with M suffix', () => {
    expect(formatNum(2400000)).toBe('2.4M')
  })
  it('handles zero', () => {
    expect(formatNum(0)).toBe('0')
  })
})
