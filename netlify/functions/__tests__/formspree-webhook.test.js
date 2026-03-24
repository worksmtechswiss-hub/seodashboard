import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@netlify/blobs', () => ({ getStore: vi.fn() }))

import { getStore } from '@netlify/blobs'
import { handler } from '../formspree-webhook.js'

describe('formspree-webhook handler', () => {
  beforeEach(() => vi.clearAllMocks())

  it('stores submission on POST', async () => {
    const mockStore = { set: vi.fn().mockResolvedValue(undefined) }
    getStore.mockReturnValue(mockStore)

    const payload = {
      formId: 'mykkkaed',
      id: 'sub-123',
      data: { name: 'Alice', email: 'alice@example.com' },
      submittedAt: '2026-03-24T10:00:00Z',
    }
    const event = { httpMethod: 'POST', body: JSON.stringify(payload) }
    const res = await handler(event, {})

    expect(res.statusCode).toBe(200)
    expect(mockStore.set).toHaveBeenCalledWith(
      'forms/submissions/mykkkaed/sub-123',
      expect.stringContaining('"name":"Alice"')
    )
  })

  it('returns 400 on POST with missing formId', async () => {
    const event = { httpMethod: 'POST', body: JSON.stringify({ id: 'x', data: {} }) }
    const res = await handler(event, {})
    expect(res.statusCode).toBe(400)
  })

  it('lists submissions on GET', async () => {
    const subs = [
      { key: 'forms/submissions/mykkkaed/sub-1' },
      { key: 'forms/submissions/mykkkaed/sub-2' },
    ]
    const stored = { id: 'sub-1', formId: 'mykkkaed', name: 'Alice', email: 'a@b.com', date: '2026-03-24', status: 'new' }
    const mockStore = {
      list: vi.fn().mockResolvedValue({ blobs: subs }),
      get: vi.fn().mockResolvedValue(stored),
    }
    getStore.mockReturnValue(mockStore)

    const res = await handler({ httpMethod: 'GET' }, {})
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(2)
  })
})
