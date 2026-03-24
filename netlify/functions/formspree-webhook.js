import { getStore, connectLambda } from '@netlify/blobs'

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const handler = async (event) => {
  connectLambda(event)
  const formsStore = getStore('forms')

  // ── GET: list all stored submissions ────────────────────────────
  if (event.httpMethod === 'GET') {
    const { blobs } = await formsStore.list({ prefix: 'forms/submissions/' })
    const submissions = await Promise.all(
      blobs.map((b) => formsStore.get(b.key, { type: 'json' }))
    )
    return json(200, submissions.filter(Boolean))
  }

  // ── POST: receive Formspree webhook ─────────────────────────────
  const payload = JSON.parse(event.body || '{}')
  const { formId, id, data = {}, submittedAt } = payload

  if (!formId || !id) return json(400, { error: 'formId and id are required' })

  const submission = {
    id,
    formId,
    name: data.name || data._name || '',
    email: data.email || data._replyto || '',
    website: formId,
    page: data._subject || '/',
    date: submittedAt || new Date().toISOString(),
    status: 'new',
  }

  await formsStore.set(
    `forms/submissions/${formId}/${id}`,
    JSON.stringify(submission)
  )

  return json(200, { received: true, id })
}
