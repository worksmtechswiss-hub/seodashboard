import { useQueries } from '@tanstack/react-query'
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
 * Fetch GSC data for multiple domains in parallel.
 * @param {string[]} domains - array of bare domains
 * @param {number} dateRange - days of data (default 30)
 */
export function useMultiDomainGSC(domains = [], dateRange = 30) {
  const results = useQueries({
    queries: domains.map((domain) => {
      const mockSite = mockWebsites.find((w) => w.domain === domain)
      return {
        queryKey: ['gsc', domain, dateRange],
        queryFn: () => fetchGscData(domain, dateRange),
        staleTime: 60_000,
        gcTime: 300_000,
        retry: false,
        placeholderData: mockSite ?? {
          domain,
          clicks: 0,
          impressions: 0,
          ctr: 0,
          position: 0,
          rows: [],
        },
      }
    }),
  })

  const domainResults = results.map((r, i) => ({
    domain: domains[i],
    data: r.data,
    isLoading: r.isLoading,
    isError: r.isError,
  }))

  const loaded = domainResults.filter((d) => d.data)
  const count = loaded.length || 1

  const totals = {
    clicks: loaded.reduce((s, d) => s + (d.data?.clicks || 0), 0),
    impressions: loaded.reduce((s, d) => s + (d.data?.impressions || 0), 0),
    ctr: parseFloat(
      (loaded.reduce((s, d) => s + (d.data?.ctr || 0), 0) / count).toFixed(2)
    ),
    position: parseFloat(
      (loaded.reduce((s, d) => s + (d.data?.position || 0), 0) / count).toFixed(
        1
      )
    ),
  }

  // Merge daily rows from all domains into a single timeline
  const allRows = loaded.flatMap((d) => d.data?.rows || [])
  const rowsByDate = {}
  for (const row of allRows) {
    if (!row.date) continue
    if (!rowsByDate[row.date]) rowsByDate[row.date] = { clicks: 0, impressions: 0 }
    rowsByDate[row.date].clicks += row.clicks || 0
    rowsByDate[row.date].impressions += row.impressions || 0
  }
  const mergedRows = Object.entries(rowsByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }))

  return {
    domains: domainResults,
    totals,
    mergedRows,
    isLoading: results.some((r) => r.isLoading),
    isAllLoaded: results.every((r) => !r.isLoading),
    isError: results.some((r) => r.isError),
  }
}
