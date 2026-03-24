import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock googleapis before importing the module under test
vi.mock('googleapis', () => {
  const createMockClient = () => ({
    generateAuthUrl: vi.fn().mockReturnValue('https://accounts.google.com/o/oauth2/v2/auth?mock'),
    getToken: vi.fn(),
    setCredentials: vi.fn(),
    refreshAccessToken: vi.fn(),
  })

  return {
    google: {
      auth: {
        OAuth2: class {
          constructor() {
            return createMockClient()
          }
        },
      },
    },
  }
})

import { createOAuth2Client, isTokenExpired, getAuthenticatedClient } from '../_utils/google.js'

beforeEach(() => {
  process.env.GOOGLE_CLIENT_ID = 'test-client-id'
  process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'
  process.env.GOOGLE_REDIRECT_URI = 'https://example.com/auth'
})

describe('isTokenExpired', () => {
  it('returns true when expiry_date is in the past', () => {
    expect(isTokenExpired({ expiry_date: Date.now() - 1_000 })).toBe(true)
  })
  it('returns false when expiry_date is in the future', () => {
    expect(isTokenExpired({ expiry_date: Date.now() + 60_000 })).toBe(false)
  })
  it('returns true when expiry_date is missing', () => {
    expect(isTokenExpired({})).toBe(true)
  })
  it('returns true when tokens is null', () => {
    expect(isTokenExpired(null)).toBe(true)
  })
})

describe('createOAuth2Client', () => {
  it('creates a client object (uses env vars)', () => {
    const client = createOAuth2Client()
    expect(client).toBeDefined()
    expect(typeof client.generateAuthUrl).toBe('function')
  })
})

describe('getAuthenticatedClient', () => {
  it('returns client without refreshing when token is fresh', async () => {
    const freshTokens = { access_token: 'abc', expiry_date: Date.now() + 60_000 }
    const authStore = { set: vi.fn() }
    const { client, tokens } = await getAuthenticatedClient(freshTokens, authStore)
    expect(client).toBeDefined()
    expect(tokens).toBe(freshTokens)
    expect(authStore.set).not.toHaveBeenCalled()
  })

  it('refreshes and stores new tokens when expired', async () => {
    vi.clearAllMocks()

    const newCredentials = { access_token: 'new', expiry_date: Date.now() + 3_600_000 }
    const expiredTokens = { access_token: 'old', refresh_token: 'rt', expiry_date: Date.now() - 1_000 }
    const authStore = { set: vi.fn().mockResolvedValue(undefined) }

    // Capture the created client instance for mock setup
    let capturedClient = null
    const { google } = await import('googleapis')
    const OrigOAuth2 = google.auth.OAuth2

    // Replace mock to capture and configure the client
    google.auth.OAuth2 = class {
      constructor() {
        capturedClient = {
          generateAuthUrl: vi.fn().mockReturnValue('https://accounts.google.com/o/oauth2/v2/auth?mock'),
          getToken: vi.fn(),
          setCredentials: vi.fn(),
          refreshAccessToken: vi.fn().mockResolvedValue({ credentials: newCredentials }),
        }
        return capturedClient
      }
    }

    const { tokens } = await getAuthenticatedClient(expiredTokens, authStore)
    expect(authStore.set).toHaveBeenCalledOnce()
    expect(tokens).toEqual(newCredentials)

    // Restore original
    google.auth.OAuth2 = OrigOAuth2
  })
})
