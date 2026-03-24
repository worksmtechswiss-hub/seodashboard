import { useQuery } from '@tanstack/react-query'
import { formSubmissions as mockSubmissions } from '../utils/mock-data'

async function fetchSubmissions() {
  const res = await fetch('/.netlify/functions/formspree-webhook')
  if (!res.ok) throw new Error(`Formspree submissions error ${res.status}`)
  return res.json()
}

/**
 * Fetch form submissions stored from Formspree webhooks.
 * Falls back to mock data as placeholder data when unauthenticated or offline.
 */
export function useFormspree() {
  return useQuery({
    queryKey: ['formspree', 'submissions'],
    queryFn: fetchSubmissions,
    staleTime: 60_000,
    gcTime: 300_000,
    retry: false,
    placeholderData: mockSubmissions,
  })
}
