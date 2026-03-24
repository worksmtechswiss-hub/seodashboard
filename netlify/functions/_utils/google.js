/**
 * Pure-fetch Google API utilities — no googleapis or google-auth-library needed.
 */

export function isTokenExpired(tokens) {
  if (!tokens?.expiry_date) return true
  return tokens.expiry_date < Date.now()
}

/**
 * Returns a valid access token, refreshing if expired.
 * @param {object} tokens - { access_token, refresh_token, expiry_date }
 * @param {object} authStore - Netlify Blobs store
 * @returns {Promise<string>} valid access_token
 */
export async function getAccessToken(tokens, authStore) {
  if (!isTokenExpired(tokens)) return tokens.access_token

  // Refresh the token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token',
    }).toString(),
  })

  const refreshed = await res.json()
  if (refreshed.error) throw new Error(refreshed.error_description || refreshed.error)

  const updated = {
    ...tokens,
    access_token: refreshed.access_token,
    expiry_date: Date.now() + (refreshed.expires_in || 3600) * 1000,
  }
  await authStore.set('tokens', JSON.stringify(updated))
  return updated.access_token
}

/**
 * Call a Google REST API with auth.
 */
export async function googleFetch(url, accessToken, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Google API ${res.status}: ${err}`)
  }
  return res.json()
}
