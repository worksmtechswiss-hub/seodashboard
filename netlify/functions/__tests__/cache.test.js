import { describe, it, expect, vi } from 'vitest'
import { getCached, setCached } from '../_utils/cache.js'

describe('getCached', () => {
  it('returns data when cache is fresh', async () => {
    const store = { get: vi.fn().mockResolvedValue({ data: { clicks: 100 }, cachedAt: Date.now() - 1_000 }) }
    const result = await getCached(store, 'key', 3_600_000)
    expect(result).toEqual({ clicks: 100 })
  })

  it('returns null when cache is expired', async () => {
    const store = { get: vi.fn().mockResolvedValue({ data: { clicks: 100 }, cachedAt: Date.now() - 7_200_000 }) }
    const result = await getCached(store, 'key', 3_600_000)
    expect(result).toBeNull()
  })

  it('returns null when key does not exist (store returns null)', async () => {
    const store = { get: vi.fn().mockResolvedValue(null) }
    const result = await getCached(store, 'key', 3_600_000)
    expect(result).toBeNull()
  })

  it('returns null when store throws (key missing in prod)', async () => {
    const store = { get: vi.fn().mockRejectedValue(new Error('not found')) }
    const result = await getCached(store, 'key', 3_600_000)
    expect(result).toBeNull()
  })
})

describe('setCached', () => {
  it('calls store.set with JSON-encoded data and current cachedAt', async () => {
    const store = { set: vi.fn().mockResolvedValue(undefined) }
    const before = Date.now()
    await setCached(store, 'my-key', { clicks: 42 })
    const after = Date.now()

    expect(store.set).toHaveBeenCalledOnce()
    const [key, raw] = store.set.mock.calls[0]
    expect(key).toBe('my-key')
    const parsed = JSON.parse(raw)
    expect(parsed.data).toEqual({ clicks: 42 })
    expect(parsed.cachedAt).toBeGreaterThanOrEqual(before)
    expect(parsed.cachedAt).toBeLessThanOrEqual(after)
  })
})
