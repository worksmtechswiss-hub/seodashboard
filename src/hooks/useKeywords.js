import { useQueries } from '@tanstack/react-query'
import { keywords as mockKeywords } from '../utils/mock-data'

async function fetchKeywords(domain, dateRange) {
  const res = await fetch('/.netlify/functions/gsc-keywords', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain, dateRange }),
  })
  if (!res.ok) throw new Error(`GSC keywords error ${res.status}`)
  return res.json()
}

/**
 * Fetch keywords from GSC for multiple domains.
 * Falls back to mock keywords when unauthenticated.
 * @param {string[]} domains - array of bare domains
 * @param {number} dateRange - days (default 30)
 */
export function useKeywords(domains = [], dateRange = 30) {
  const results = useQueries({
    queries: domains.map((domain) => ({
      queryKey: ['gsc-keywords', domain, dateRange],
      queryFn: () => fetchKeywords(domain, dateRange),
      staleTime: 60_000,
      gcTime: 300_000,
      retry: false,
    })),
  })

  // Merge keywords from all domains
  const allKeywords = results.flatMap((r, i) =>
    (r.data?.keywords || []).map((kw) => ({ ...kw, domain: domains[i] }))
  )

  // Sort by clicks descending
  allKeywords.sort((a, b) => b.clicks - a.clicks)

  const hasRealData = allKeywords.length > 0

  return {
    keywords: hasRealData ? allKeywords : mockKeywords,
    isLoading: results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
    isMockData: !hasRealData,
  }
}
