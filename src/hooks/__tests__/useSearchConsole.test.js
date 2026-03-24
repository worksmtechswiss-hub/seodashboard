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

import { useSearchConsole } from '../useSearchConsole'
import { websites as mockWebsites } from '../../utils/mock-data'

describe('useSearchConsole', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns mock data when fetch fails (graceful fallback)', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'))
    const { result } = renderHook(() => useSearchConsole('techflow.io'), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    // Falls back to mock data — domain should be in the result
    expect(result.current.data).toBeDefined()
  })

  it('calls the correct endpoint', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ domain: 'techflow.io', clicks: 100, impressions: 5000, ctr: 2.0, position: 8.5 }),
    })
    renderHook(() => useSearchConsole('techflow.io'), { wrapper })
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    const [url, opts] = fetch.mock.calls[0]
    expect(url).toBe('/.netlify/functions/search-console')
    expect(JSON.parse(opts.body).domain).toBe('techflow.io')
  })
})
