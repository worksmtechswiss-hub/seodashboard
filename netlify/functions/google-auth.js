import { getStore } from '@netlify/blobs'

const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
]

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const handler = async (event) => {
  const { action, code } = event.queryStringParameters || {}

  // ── Login: generate Google OAuth URL ─────────────────────────────
  if (action === 'login') {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: 'seo-dashboard',
    })
    return json(200, { redirectUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params}` })
  }

  // ── Status: check if tokens exist ────────────────────────────────
  if (action === 'status') {
    const authStore = getStore('auth')
    const tokens = await authStore.get('tokens', { type: 'json' }).catch(() => null)
    return json(200, { authenticated: tokens !== null })
  }

  // ── Callback: exchange code for tokens ───────────────────────────
  if (code) {
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI,
          grant_type: 'authorization_code',
        }).toString(),
      })

      const tokens = await tokenRes.json()
      if (tokens.error) {
        return json(400, { error: 'Token exchange failed', detail: tokens.error_description || tokens.error })
      }

      const authStore = getStore('auth')
      await authStore.set('tokens', JSON.stringify(tokens))
      return {
        statusCode: 302,
        headers: {
          Location: '/#/',
          'Set-Cookie': 'seo_auth=1; HttpOnly; Secure; SameSite=Lax; Path=/',
          'Content-Type': 'text/plain',
        },
        body: '',
      }
    } catch (err) {
      return json(500, { error: 'OAuth exchange failed', detail: err.message })
    }
  }

  return json(400, { error: 'Invalid request. Use ?action=login, ?action=status, or ?code=...' })
}
