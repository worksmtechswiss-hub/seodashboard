import { useQuery } from '@tanstack/react-query'
import { websites as mockWebsites } from '../utils/mock-data'

async function fetchGscData(domain, dateRange) {
  const res = await fetch('/.netlify/functions/search-console', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain, dateRange }),
  })
  if (!res.ok) throw new Error(`GSC error ${res.status}`)
  return res.json()
}

/**
 * Fetch GSC data for a single domain.
 * Falls back to mock data when unauthenticated or on error.
 * @param {string} domain - bare domain like "techflow.io"
 * @param {number} dateRange - days of data to fetch (default 30)
 */
export function useSearchConsole(domain, dateRange = 30) {
  const mockSite = mockWebsites.find((w) => w.domain === domain)

  return useQuery({
    queryKey: ['gsc', domain, dateRange],
    queryFn: () => fetchGscData(domain, dateRange),
    staleTime: 60_000,
    gcTime: 300_000,
    retry: false,
    // If the query fails (unauthenticated / offline), return mock data as placeholder
    placeholderData: mockSite ?? { domain, clicks: 0, impressions: 0, ctr: 0, position: 0, rows: [] },
  })
}
