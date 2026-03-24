import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@netlify/blobs', () => ({
  getStore: vi.fn(),
}))

vi.mock('../_utils/google.js', () => ({
  createOAuth2Client: vi.fn(() => ({
    generateAuthUrl: vi.fn().mockReturnValue('https://accounts.google.com/auth?mock'),
    getToken: vi.fn().mockResolvedValue({ tokens: { access_token: 'tok', expiry_date: Date.now() + 3600_000 } }),
  })),
  AUTH_SCOPES: ['https://www.googleapis.com/auth/webmasters.readonly'],
}))

import { getStore } from '@netlify/blobs'
import { handler } from '../google-auth.js'

const makeEvent = (params = {}) => ({
  httpMethod: 'GET',
  queryStringParameters: params,
  headers: {},
})

describe('google-auth handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns redirect URL for ?action=login', async () => {
    const res = await handler(makeEvent({ action: 'login' }), {})
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).redirectUrl).toContain('accounts.google.com')
  })

  it('returns authenticated:false when no tokens stored (?action=status)', async () => {
    getStore.mockReturnValue({ get: vi.fn().mockResolvedValue(null) })
    const res = await handler(makeEvent({ action: 'status' }), {})
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).authenticated).toBe(false)
  })

  it('returns authenticated:true when tokens exist (?action=status)', async () => {
    getStore.mockReturnValue({ get: vi.fn().mockResolvedValue({ access_token: 'tok' }) })
    const res = await handler(makeEvent({ action: 'status' }), {})
    expect(JSON.parse(res.body).authenticated).toBe(true)
  })

  it('exchanges code and redirects to /# on success', async () => {
    const mockStore = { set: vi.fn().mockResolvedValue(undefined) }
    getStore.mockReturnValue(mockStore)
    const res = await handler(makeEvent({ code: 'auth-code-123' }), {})
    expect(res.statusCode).toBe(302)
    expect(res.headers['Location']).toBe('/#/')
    expect(res.headers['Set-Cookie']).toContain('seo_auth=1')
    expect(mockStore.set).toHaveBeenCalledWith('tokens', expect.any(String))
  })

  it('returns 400 for unknown requests', async () => {
    const res = await handler(makeEvent({}), {})
    expect(res.statusCode).toBe(400)
  })
})
