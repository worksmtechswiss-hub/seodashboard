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
    const rawBody = event.body || '{}'
    console.log('Webhook POST body:', rawBody)

    const payload = JSON.parse(rawBody)
    console.log('Parsed payload keys:', Object.keys(payload))

    // Formspree simple webhooks send form fields directly at the top level
    // Structured webhooks wrap in { formId, id, data, submittedAt }
    const isStructured = !!(payload.formId || payload.form_id)

    const formId = payload.formId || payload.form_id || payload._formId || payload._form_id || ''
    const id = payload.id || payload.submissionId || payload._id || `sub-${Date.now()}`
    const data = isStructured ? (payload.data || payload) : payload
    const submittedAt = payload.submittedAt || payload.created_at || payload._date || new Date().toISOString()

    const submission = {
      id,
      formId,
      name: data.name || data.Name || data._name || data.full_name || data.Vorname || data.vorname || '',
      email: data.email || data.Email || data._replyto || data._email || data['e-mail'] || '',
      phone: data.phone || data.Phone || data.telefon || data.Telefon || data.tel || '',
      message: data.message || data.Message || data.nachricht || data.Nachricht || '',
      website: data.website || data.Website || data._website || formId || '',
      page: data._subject || data.subject || data.page || data._host || '/',
      date: submittedAt,
      status: 'new',
      // Store the full raw payload for debugging
      _raw: payload,
    }

    const key = `${Date.now()}-${id}`
    await store.setJSON(key, submission)

    console.log('Stored submission:', key, JSON.stringify(submission))
    return json(200, { received: true, id, key })
  } catch (err) {
    console.error('Webhook error:', err.message, err.stack)
    return json(500, { error: 'Failed to store submission', detail: err.message })
  }
}
