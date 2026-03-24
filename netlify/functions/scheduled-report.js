import { getStore } from '@netlify/blobs'
import { getAuthenticatedClient } from './_utils/google.js'

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const handler = async (event, context) => {
  const today = new Date().toISOString().slice(0, 10)

  // ── GET ?action=download: serve a stored report ───────────────────
  const params = event.queryStringParameters || {}
  if (event.httpMethod === 'GET' && params.action === 'download') {
    const date = params.date || today
    const reportKey = `reports/${date}-weekly.json`
    const reportStore = getStore('reports')
    try {
      const report = await reportStore.get(reportKey, { type: 'json' })
      if (!report) return json(404, { error: 'Report not found. Run the report first.' })
      return json(200, report)
    } catch {
      return json(404, { error: 'Report not found.' })
    }
  }

  const reportKey = `reports/${today}-weekly.json`

  const authStore = getStore('auth')
  const storedTokens = await authStore.get('tokens', { type: 'json' }).catch(() => null)

  // If no auth (can happen on first cron run), store an empty report stub
  const report = {
    generatedAt: new Date().toISOString(),
    weekEnding: today,
    authenticated: !!storedTokens,
    summary: {},
    note: storedTokens ? 'Full report generated.' : 'No Google credentials found — connect Google first.',
  }

  if (storedTokens) {
    try {
      // In production, would aggregate GSC data here across all sites
      // For now, record auth state and placeholder
      await getAuthenticatedClient(storedTokens, authStore)
      report.summary = { status: 'ready', sites: 0, message: 'Aggregated GSC data on next full release' }
    } catch (err) {
      report.summary = { error: err.message }
    }
  }

  const reportStore = getStore('reports')
  await reportStore.set(reportKey, JSON.stringify(report))

  return json(200, { reportKey, generatedAt: report.generatedAt })
}
