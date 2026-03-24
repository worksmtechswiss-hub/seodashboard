import { useQuery } from '@tanstack/react-query'
import { websites as mockWebsites } from '../utils/mock-data'

async function fetchGscSites() {
  const res = await fetch('/.netlify/functions/gsc-sites')
  if (!res.ok) throw new Error(`GSC sites error ${res.status}`)
  return res.json()
}

/**
 * Fetch the list of sites from Google Search Console.
 * Falls back to mock websites when unauthenticated.
 * @returns {{ sites: Array, isLoading: boolean, isAuthenticated: boolean }}
 */
export function useSiteList() {
  const query = useQuery({
    queryKey: ['gsc-sites'],
    queryFn: fetchGscSites,
    staleTime: 300_000, // 5 min
    gcTime: 600_000,
    retry: false,
  })

  const isAuthenticated = !query.isError && !!query.data?.sites
  const gscSites = query.data?.sites || []

  // When authenticated, use GSC sites; otherwise fall back to mock
  const sites = isAuthenticated
    ? gscSites.map((s, i) => ({
        id: i + 1,
        domain: s.domain,
        siteUrl: s.siteUrl,
        permissionLevel: s.permissionLevel,
      }))
    : mockWebsites

  return {
    sites,
    domains: sites.map((s) => s.domain),
    isLoading: query.isLoading,
    isAuthenticated,
  }
}
