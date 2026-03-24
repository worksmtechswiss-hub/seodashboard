import { getStore, connectLambda } from '@netlify/blobs'
import { google } from 'googleapis'
import { getAuthenticatedClient } from './_utils/google.js'
import { getCached, setCached } from './_utils/cache.js'

const GA4_TTL_MS = 14_400_000  // 4 hours

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const handler = async (event) => {
  connectLambda(event)
  const { propertyId, dateRange = 30 } = JSON.parse(event.body || '{}')

  if (!propertyId) return json(400, { error: 'propertyId is required' })

  // Check auth
  const authStore = getStore('auth')
  const storedTokens = await authStore.get('tokens', { type: 'json' }).catch(() => null)
  if (!storedTokens) return json(401, { error: 'Not authenticated. Call ?action=login first.' })

  const cacheStore = getStore('seo-cache')
  const today = new Date().toISOString().slice(0, 10)
  const propertyIdClean = propertyId.replace('properties/', '')
  const cacheKey = `ga4/${propertyIdClean}/${today}`

  // Return cache if fresh
  const cached = await getCached(cacheStore, cacheKey, GA4_TTL_MS)
  if (cached) return json(200, cached)

  // Fetch from GA4 API
  try {
    const { client } = await getAuthenticatedClient(storedTokens, authStore)
    const analyticsData = google.analyticsdata({ version: 'v1beta', auth: client })

    const endDate = 'today'
    const startDate = `${dateRange}daysAgo`

    const { data } = await analyticsData.properties.runReport({
      property: propertyId,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
        ],
      },
    })

    const row = data.rows?.[0]?.metricValues || []
    const result = {
      propertyId,
      sessions: parseInt(row[0]?.value || '0'),
      pageviews: parseInt(row[1]?.value || '0'),
      bounceRate: parseFloat(row[2]?.value || '0').toFixed(2),
    }

    await setCached(cacheStore, cacheKey, result)
    return json(200, result)
  } catch (err) {
    return json(500, { error: 'GA4 API error', detail: err.message })
  }
}
