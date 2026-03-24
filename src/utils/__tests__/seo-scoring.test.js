import { describe, it, expect } from 'vitest'
import { calculateHealthScore, healthStatus } from '../seo-scoring'

describe('calculateHealthScore', () => {
  it('returns 100 for a perfect site with no issues', () => {
    expect(calculateHealthScore({})).toBe(100)
  })
  it('deducts 10 for missing description', () => {
    expect(calculateHealthScore({ missingDescription: true })).toBe(90)
  })
  it('deducts 8 for bad title length', () => {
    expect(calculateHealthScore({ badTitleLength: true })).toBe(92)
  })
  it('caps meta category at 0 — all meta issues still yields 75 total', () => {
    // meta: -10 -8 -7 = -25, floored at 0. Other 3 categories = 25 each = 75
    expect(calculateHealthScore({ missingDescription: true, badTitleLength: true, badDescLength: true })).toBe(75)
  })
  it('deducts 15 for very low page speed', () => {
    expect(calculateHealthScore({ pageSpeedLow: true })).toBe(85)
  })
  it('deducts 8 for medium page speed', () => {
    expect(calculateHealthScore({ pageSpeedMedium: true })).toBe(92)
  })
  it('stacks pageSpeedLow and pageSpeedMedium deductions when both set', () => {
    // Both set: 25 -15 -8 = 2 for performance category → score = 77
    expect(calculateHealthScore({ pageSpeedLow: true, pageSpeedMedium: true })).toBe(77)
  })
  it('returns 0 for a completely broken site', () => {
    expect(calculateHealthScore({
      missingDescription: true, badTitleLength: true, badDescLength: true,
      pageSpeedLow: true, highCLS: true,
      missingAltTags: true, brokenLinks: true, missingH1: true,
      noSitemap: true, noRobotsTxt: true, notHttps: true,
    })).toBe(0)
  })
})

describe('healthStatus', () => {
  it('returns healthy for score >= 85', () => {
    expect(healthStatus(85)).toBe('healthy')
    expect(healthStatus(100)).toBe('healthy')
  })
  it('returns warning for score 70-84', () => {
    expect(healthStatus(70)).toBe('warning')
    expect(healthStatus(84)).toBe('warning')
  })
  it('returns critical for score below 70', () => {
    expect(healthStatus(69)).toBe('critical')
    expect(healthStatus(0)).toBe('critical')
  })
})
