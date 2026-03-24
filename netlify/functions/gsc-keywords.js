import { getStore } from '@netlify/blobs'
import { google } from 'googleapis'
import { getAuthenticatedClient } from './_utils/google.js'
import { getCached, setCached } from './_utils/cache.js'

const KW_TTL_MS = 3_600_000 // 1 hour

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const handler = async (event) => {
  const { domain, dateRange = 30 } = JSON.parse(event.body || '{}')

  if (!domain) return json(400, { error: 'domain is required' })

  // Check auth
  const authStore = getStore('auth')
  const storedTokens = await authStore.get('tokens', { type: 'json' }).catch(() => null)
  if (!storedTokens) return json(401, { error: 'Not authenticated. Call ?action=login first.' })

  const cacheStore = getStore('seo-cache')
  const today = new Date().toISOString().slice(0, 10)
  const cacheKey = `gsc/${domain}/keywords/${today}`

  // Return cache if fresh
  const cached = await getCached(cacheStore, cacheKey, KW_TTL_MS)
  if (cached) return json(200, cached)

  try {
    const { client } = await getAuthenticatedClient(storedTokens, authStore)
    const webmasters = google.webmasters({ version: 'v3', auth: client })

    const endDate = new Date().toISOString().slice(0, 10)
    const startDate = new Date(Date.now() - dateRange * 86_400_000).toISOString().slice(0, 10)

    const { data } = await webmasters.searchanalytics.query({
      siteUrl: `sc-domain:${domain}`,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 50,
      },
    })

    const keywords = (data.rows || []).map((row) => ({
      keyword: row.keys[0],
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: parseFloat(((row.ctr || 0) * 100).toFixed(2)),
      position: parseFloat((row.position || 0).toFixed(1)),
    }))

    const result = { domain, keywords }
    await setCached(cacheStore, cacheKey, result)
    return json(200, result)
  } catch (err) {
    return json(500, { error: 'GSC keywords error', detail: err.message })
  }
}
