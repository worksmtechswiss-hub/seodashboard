import { useQuery } from '@tanstack/react-query'

async function fetchGa4Data(propertyId, dateRange) {
  const res = await fetch('/.netlify/functions/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ propertyId, dateRange }),
  })
  if (!res.ok) throw new Error(`GA4 error ${res.status}`)
  return res.json()
}

/**
 * Fetch GA4 data for a single property.
 * @param {string} propertyId - e.g. "properties/123456789"
 * @param {number} dateRange - days (default 30)
 */
export function useAnalytics(propertyId, dateRange = 30) {
  return useQuery({
    queryKey: ['ga4', propertyId, dateRange],
    queryFn: () => fetchGa4Data(propertyId, dateRange),
    staleTime: 60_000,
    gcTime: 300_000,
    retry: false,
    enabled: !!propertyId,
  })
}
