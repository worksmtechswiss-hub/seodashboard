import { getStore, connectLambda } from '@netlify/blobs'
import { google } from 'googleapis'
import { getAuthenticatedClient } from './_utils/google.js'
import { getCached, setCached } from './_utils/cache.js'

const SITES_TTL_MS = 3_600_000 // 1 hour

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const handler = async (event) => {
  connectLambda(event)
  // Check auth
  const authStore = getStore('auth')
  const storedTokens = await authStore.get('tokens', { type: 'json' }).catch(() => null)
  if (!storedTokens) return json(401, { error: 'Not authenticated. Call ?action=login first.' })

  const cacheStore = getStore('seo-cache')
  const cacheKey = 'gsc/sites-list'

  // Return cache if fresh
  const cached = await getCached(cacheStore, cacheKey, SITES_TTL_MS)
  if (cached) return json(200, cached)

  try {
    const { client } = await getAuthenticatedClient(storedTokens, authStore)
    const webmasters = google.webmasters({ version: 'v3', auth: client })

    const { data } = await webmasters.sites.list()
    const siteEntries = data.siteEntry || []

    // Parse GSC sites into a clean domain list
    const sites = siteEntries.map((entry) => {
      const raw = entry.siteUrl || ''
      let domain = raw

      // sc-domain:example.com → example.com
      if (raw.startsWith('sc-domain:')) {
        domain = raw.replace('sc-domain:', '')
      }
      // https://example.com/ → example.com
      else {
        domain = raw.replace(/^https?:\/\//, '').replace(/\/$/, '')
      }

      return {
        siteUrl: raw,
        domain,
        permissionLevel: entry.permissionLevel,
      }
    })

    const result = { sites }
    await setCached(cacheStore, cacheKey, result)
    return json(200, result)
  } catch (err) {
    return json(500, { error: 'GSC sites list error', detail: err.message })
  }
}
