import { google } from 'googleapis'

const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
]

export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

export const AUTH_SCOPES = SCOPES

/**
 * Returns true if tokens are expired or missing.
 */
export function isTokenExpired(tokens) {
  if (!tokens?.expiry_date) return true
  return tokens.expiry_date < Date.now()
}

/**
 * Returns an authenticated OAuth2 client.
 * Refreshes and persists tokens if expired.
 * @param {object} tokens - stored credentials {access_token, refresh_token, expiry_date}
 * @param {object} authStore - Netlify Blobs store for auth/tokens
 * @returns {Promise<{client: OAuth2Client, tokens: object}>}
 */
export async function getAuthenticatedClient(tokens, authStore) {
  const client = createOAuth2Client()
  client.setCredentials(tokens)

  if (isTokenExpired(tokens)) {
    const { credentials } = await client.refreshAccessToken()
    client.setCredentials(credentials)
    await authStore.set('tokens', JSON.stringify(credentials))
    return { client, tokens: credentials }
  }

  return { client, tokens }
}
