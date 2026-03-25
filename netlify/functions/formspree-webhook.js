import { getStore, connectLambda } from '@netlify/blobs'

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  },
  body: JSON.stringify(body),
})

export const handler = async (event) => {
  connectLambda(event)

  if (event.httpMethod === 'OPTIONS') return json(200, {})

  const store = getStore('form-submissions')

  // ── GET: list all stored submissions ────────────────────────────
  if (event.httpMethod === 'GET') {
    try {
      const { blobs } = await store.list()
      const submissions = []
      for (const blob of blobs) {
        try {
          const data = await store.get(blob.key, { type: 'json' })
          if (data) submissions.push(data)
        } catch (e) {
          // skip corrupted entries
        }
      }
      // Sort by date descending
      submissions.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      return json(200, submissions)
    } catch (err) {
      return json(200, []) // Return empty array on store errors
    }
  }

  // ── POST: receive Formspree webhook ─────────────────────────────
  try {
    const payload = JSON.parse(event.body || '{}')

    // Formspree sends different payload structures depending on plugin version
    const formId = payload.formId || payload.form_id || payload._formId || ''
    const id = payload.id || payload.submissionId || payload._id || `sub-${Date.now()}`
    const data = payload.data || payload
    const submittedAt = payload.submittedAt || payload.created_at || new Date().toISOString()

    const submission = {
      id,
      formId,
      name: data.name || data.Name || data._name || data.full_name || '',
      email: data.email || data.Email || data._replyto || data._email || '',
      website: data.website || data.Website || data._website || formId || '',
      page: data._subject || data.subject || data.page || '/',
      date: submittedAt,
      status: 'new',
    }

    // Use a flat key with timestamp for reliable listing
    const key = `${Date.now()}-${id}`
    await store.setJSON(key, submission)

    return json(200, { received: true, id, key })
  } catch (err) {
    return json(500, { error: 'Failed to store submission', detail: err.message })
  }
}
