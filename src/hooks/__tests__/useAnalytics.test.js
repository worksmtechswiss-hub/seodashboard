// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

global.fetch = vi.fn()

const wrapper = ({ children }) =>
  createElement(QueryClientProvider, {
    client: new QueryClient({ defaultOptions: { queries: { retry: false } } }),
    children,
  })

import { useAnalytics } from '../useAnalytics'

describe('useAnalytics', () => {
  beforeEach(() => vi.clearAllMocks())

  it('does not fetch when propertyId is empty', async () => {
    const { result } = renderHook(() => useAnalytics(''), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(fetch).not.toHaveBeenCalled()
  })

  it('calls the correct endpoint with propertyId', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ propertyId: 'properties/123', sessions: 4200 }),
    })
    renderHook(() => useAnalytics('properties/123'), { wrapper })
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    const [url, opts] = fetch.mock.calls[0]
    expect(url).toBe('/.netlify/functions/analytics')
    expect(JSON.parse(opts.body).propertyId).toBe('properties/123')
  })
})
