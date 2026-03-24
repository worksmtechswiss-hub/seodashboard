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

import { useFormspree } from '../useFormspree'
import { formSubmissions as mockSubs } from '../../utils/mock-data'

describe('useFormspree', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns mock data as placeholder when fetch fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('offline'))
    const { result } = renderHook(() => useFormspree(), { wrapper })
    // placeholderData is available immediately
    expect(result.current.data).toEqual(mockSubs)
  })

  it('calls the correct endpoint', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'x', name: 'Alice' }],
    })
    const { result } = renderHook(() => useFormspree(), { wrapper })
    await waitFor(() => !result.current.isLoading)
    expect(fetch).toHaveBeenCalledWith('/.netlify/functions/formspree-webhook')
  })
})
