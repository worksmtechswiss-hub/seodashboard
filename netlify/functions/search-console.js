import { getStore, connectLambda } from '@netlify/blobs'
import { getAccessToken, googleFetch } from './_utils/google.js'
import { getCached, setCached } from './_utils/cache.js'

const GSC_TTL_MS = 3_600_000  // 1 hour

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const handler = async (event) => {
  connectLambda(event)
  const { domain, dateRange = 30, invalidate = false } = JSON.parse(event.body || '{}')

  if (!domain) return json(400, { error: 'domain is required' })

  // Check auth
  const authStore = getStore('auth')
  const storedTokens = await authStore.get('tokens', { type: 'json' }).catch(() => null)
  if (!storedTokens) return json(401, { error: 'Not authenticated. Call ?action=login first.' })

  const cacheStore = getStore('seo-cache')
  const today = new Date().toISOString().slice(0, 10)
  const cacheKey = `gsc/${domain}/${today}`

  // Return cache if fresh and not invalidating
  if (!invalidate) {
    const cached = await getCached(cacheStore, cacheKey, GSC_TTL_MS)
    if (cached) return json(200, cached)
  }

  // Fetch from GSC API
  try {
    const accessToken = await getAccessToken(storedTokens, authStore)

    const endDate = new Date().toISOString().slice(0, 10)
    const startDate = new Date(Date.now() - dateRange * 86_400_000).toISOString().slice(0, 10)

    const data = await googleFetch(
      `https://www.googleapis.com/webmasters/v3/sites/sc-domain%3A${domain}/searchAnalytics/query`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['date'],
          rowLimit: dateRange,
        }),
      }
    )

    const rows = data.rows || []
    const totals = rows.reduce(
      (acc, row) => ({
        clicks: acc.clicks + (row.clicks || 0),
        impressions: acc.impressions + (row.impressions || 0),
        ctr: acc.ctr + (row.ctr || 0),
        position: acc.position + (row.position || 0),
      }),
      { clicks: 0, impressions: 0, ctr: 0, position: 0 }
    )
    const count = rows.length || 1

    const result = {
      domain,
      clicks: Math.round(totals.clicks),
      impressions: Math.round(totals.impressions),
      ctr: parseFloat((totals.ctr / count * 100).toFixed(2)),
      position: parseFloat((totals.position / count).toFixed(1)),
      rows: rows.map((r) => ({ date: r.keys?.[0], clicks: r.clicks, impressions: r.impressions })),
    }

    await setCached(cacheStore, cacheKey, result)
    return json(200, result)
  } catch (err) {
    return json(500, { error: 'GSC API error', detail: err.message })
  }
}
