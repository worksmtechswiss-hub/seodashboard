/**
 * Read from a Netlify Blobs store with TTL check.
 * Returns null on miss, expiry, or error.
 * @param {object} store - Netlify Blobs store instance
 * @param {string} key
 * @param {number} ttlMs - max cache age in milliseconds
 */
export async function getCached(store, key, ttlMs) {
  try {
    const entry = await store.get(key, { type: 'json' })
    if (entry && Date.now() - entry.cachedAt < ttlMs) {
      return entry.data
    }
  } catch {
    // key doesn't exist or JSON parse error — treat as miss
  }
  return null
}

/**
 * Write data to a Netlify Blobs store with current timestamp.
 * @param {object} store - Netlify Blobs store instance
 * @param {string} key
 * @param {*} data
 */
export async function setCached(store, key, data) {
  await store.set(key, JSON.stringify({ data, cachedAt: Date.now() }))
}
