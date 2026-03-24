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
import { handler } from '../analytics.js'

const makeEvent = (body = {}) => ({
  httpMethod: 'POST',
  body: JSON.stringify(body),
  headers: {},
})

const mockGa4Data = { propertyId: 'properties/123', sessions: 1000, pageviews: 3000, bounceRate: 45.5 }

describe('analytics handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getStore.mockReturnValue({ get: vi.fn().mockResolvedValue({ access_token: 'tok' }) })
  })

  it('returns 401 when not authenticated', async () => {
    getStore.mockImplementation((name) => {
      if (name === 'auth') return { get: vi.fn().mockResolvedValue(null) }
      return { get: vi.fn(), set: vi.fn() }
    })
    const res = await handler(makeEvent({ propertyId: 'properties/123' }), {})
    expect(res.statusCode).toBe(401)
  })

  it('returns 400 when propertyId is missing', async () => {
    const res = await handler(makeEvent({}), {})
    expect(res.statusCode).toBe(400)
  })

  it('returns cached data on cache hit', async () => {
    getStore.mockImplementation((name) => {
      if (name === 'auth') return { get: vi.fn().mockResolvedValue({ access_token: 'tok', expiry_date: Date.now() + 3600_000 }) }
      return { get: vi.fn(), set: vi.fn() }
    })
    getAuthenticatedClient.mockResolvedValue({ client: {}, tokens: {} })
    getCached.mockResolvedValue(mockGa4Data)

    const res = await handler(makeEvent({ propertyId: 'properties/123' }), {})
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual(mockGa4Data)
    expect(setCached).not.toHaveBeenCalled()
  })
})
