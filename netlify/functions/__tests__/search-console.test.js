import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@netlify/blobs', () => ({
  getStore: vi.fn(),
}))

vi.mock('../_utils/google.js', () => ({
  getAuthenticatedClient: vi.fn(),
}))

vi.mock('../_utils/cache.js', () => ({
  getCached: vi.fn(),
  setCached: vi.fn().mockResolvedValue(undefined),
}))

import { getStore } from '@netlify/blobs'
import { getAuthenticatedClient } from '../_utils/google.js'
import { getCached, setCached } from '../_utils/cache.js'
import { handler } from '../search-console.js'

const makeEvent = (body = {}) => ({
  httpMethod: 'POST',
  body: JSON.stringify(body),
  headers: {},
})

const mockGscData = { clicks: 1000, impressions: 50000, ctr: 2.0, position: 7.5, rows: [] }

describe('search-console handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getStore.mockReturnValue({ get: vi.fn().mockResolvedValue({ access_token: 'tok' }) })
  })

  it('returns 401 when not authenticated', async () => {
    getStore.mockImplementation((name) => {
      if (name === 'auth') return { get: vi.fn().mockResolvedValue(null) }
      return { get: vi.fn(), set: vi.fn() }
    })
    const res = await handler(makeEvent({ domain: 'techflow.io' }), {})
    expect(res.statusCode).toBe(401)
  })

  it('returns cached data on cache hit', async () => {
    getStore.mockImplementation((name) => {
      if (name === 'auth') return { get: vi.fn().mockResolvedValue({ access_token: 'tok', expiry_date: Date.now() + 3600_000 }) }
      return { get: vi.fn(), set: vi.fn() }
    })
    getAuthenticatedClient.mockResolvedValue({ client: {}, tokens: {} })
    getCached.mockResolvedValue(mockGscData)

    const res = await handler(makeEvent({ domain: 'techflow.io' }), {})
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual(mockGscData)
    expect(setCached).not.toHaveBeenCalled()
  })

  it('fetches from API and caches on cache miss', async () => {
    const today = new Date().toISOString().slice(0, 10)
    getStore.mockImplementation((name) => {
      if (name === 'auth') return { get: vi.fn().mockResolvedValue({ access_token: 'tok', expiry_date: Date.now() + 3600_000 }) }
      return { get: vi.fn(), set: vi.fn() }
    })
    getCached.mockResolvedValue(null) // cache miss

    const mockWebmasters = {
      searchanalytics: {
        query: vi.fn().mockResolvedValue({
          data: { rows: [{ keys: [], clicks: 500, impressions: 20000, ctr: 0.025, position: 8.0 }] },
        }),
      },
    }
    getAuthenticatedClient.mockResolvedValue({
      client: { request: vi.fn() },
      tokens: {},
    })

    // Mock googleapis webmasters resource
    vi.doMock('googleapis', () => ({
      google: { webmasters: vi.fn().mockReturnValue(mockWebmasters) },
    }))

    const res = await handler(makeEvent({ domain: 'techflow.io' }), {})
    expect(setCached).toHaveBeenCalled()
  })

  it('returns 400 when domain is missing', async () => {
    const res = await handler(makeEvent({}), {})
    expect(res.statusCode).toBe(400)
  })
})
