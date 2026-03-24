import { getStore } from '@netlify/blobs'
import { createOAuth2Client, AUTH_SCOPES } from './_utils/google.js'

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const handler = async (event) => {
  const { action, code } = event.queryStringParameters || {}

  // ── Login: generate Google OAuth URL ─────────────────────────────
  if (action === 'login') {
    const client = createOAuth2Client()
    const redirectUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: AUTH_SCOPES,
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
      const client = createOAuth2Client()
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
