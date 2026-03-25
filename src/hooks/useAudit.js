import { useMutation } from '@tanstack/react-query'

async function runAudit(params) {
  const res = await fetch('/.netlify/functions/seo-audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || `Audit failed (${res.status})`)
  }
  return res.json()
}

/**
 * Mutation hook for running SEO audits.
 * Usage: const { mutate, data, isPending, error } = useAudit()
 *        mutate({ type: 'site', domain: 'example.com' })
 */
export function useAudit() {
  return useMutation({
    mutationFn: runAudit,
  })
}
