import { getStore } from '@netlify/blobs'
import { OAuth2Client } from 'google-auth-library'

const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
]

function createClient() {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const handler = async (event) => {
  const { action, code } = event.queryStringParameters || {}

  // ── Login: generate Google OAuth URL ─────────────────────────────
  if (action === 'login') {
    const client = createClient()
    const redirectUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state: 'seo-dashboard',
      prompt: 'consent',
    })
    return json(200, { redirectUrl })
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
      const client = createClient()
      const { tokens } = await client.getToken(code)
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
