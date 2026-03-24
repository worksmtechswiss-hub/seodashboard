/**
 * Check if Google account is connected.
 * Returns true if auth tokens exist in Netlify Blobs.
 */
export async function checkAuthStatus() {
  try {
    const res = await fetch('/.netlify/functions/google-auth?action=status')
    const { authenticated } = await res.json()
    return !!authenticated
  } catch {
    return false
  }
}

/**
 * Fetch Google OAuth URL and redirect the user there.
 */
export async function redirectToLogin() {
  const res = await fetch('/.netlify/functions/google-auth?action=login')
  const { redirectUrl } = await res.json()
  window.location.assign(redirectUrl)
}
