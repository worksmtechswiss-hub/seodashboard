// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'

// Mock fetch globally
global.fetch = vi.fn()

import { checkAuthStatus, redirectToLogin } from '../auth'

describe('checkAuthStatus', () => {
  it('returns true when API responds authenticated:true', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ authenticated: true }),
    })
    const result = await checkAuthStatus()
    expect(result).toBe(true)
    expect(fetch).toHaveBeenCalledWith('/.netlify/functions/google-auth?action=status')
  })

  it('returns false when API responds authenticated:false', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ authenticated: false }),
    })
    const result = await checkAuthStatus()
    expect(result).toBe(false)
  })

  it('returns false when fetch throws (offline/unavailable)', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'))
    const result = await checkAuthStatus()
    expect(result).toBe(false)
  })
})

describe('redirectToLogin', () => {
  it('fetches the login URL and redirects', async () => {
    const mockRedirectUrl = 'https://accounts.google.com/auth?mock'
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ redirectUrl: mockRedirectUrl }),
    })
    const assignSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { assign: assignSpy },
      writable: true,
    })
    await redirectToLogin()
    expect(assignSpy).toHaveBeenCalledWith(mockRedirectUrl)
  })
})
