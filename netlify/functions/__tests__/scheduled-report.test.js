import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@netlify/blobs', () => ({ getStore: vi.fn() }))
vi.mock('../_utils/google.js', () => ({ getAuthenticatedClient: vi.fn() }))

import { getStore } from '@netlify/blobs'
import { getAuthenticatedClient } from '../_utils/google.js'
import { handler } from '../scheduled-report.js'

describe('scheduled-report handler', () => {
  beforeEach(() => vi.clearAllMocks())

  it('stores report with correct key (YYYY-MM-DD-weekly.json)', async () => {
    const mockReportStore = { set: vi.fn().mockResolvedValue(undefined) }
    const mockAuthStore = { get: vi.fn().mockResolvedValue({ access_token: 'tok', expiry_date: Date.now() + 3600_000 }) }
    getStore.mockImplementation((n) =>
      n === 'auth' ? mockAuthStore : mockReportStore
    )
    getAuthenticatedClient.mockResolvedValue({ client: {}, tokens: {} })

    const res = await handler({}, {})
    expect(res.statusCode).toBe(200)

    const today = new Date().toISOString().slice(0, 10)
    expect(mockReportStore.set).toHaveBeenCalledWith(
      `reports/${today}-weekly.json`,
      expect.any(String)
    )
  })

  it('returns 200 with report summary on success', async () => {
    const mockReportStore = { set: vi.fn().mockResolvedValue(undefined) }
    const mockAuthStore = { get: vi.fn().mockResolvedValue({ access_token: 'tok', expiry_date: Date.now() + 3600_000 }) }
    getStore.mockImplementation((n) =>
      n === 'auth' ? mockAuthStore : mockReportStore
    )
    getAuthenticatedClient.mockResolvedValue({ client: {}, tokens: {} })

    const res = await handler({}, {})
    const body = JSON.parse(res.body)
    expect(body.reportKey).toContain('weekly.json')
    expect(body.generatedAt).toBeDefined()
  })

  it('returns stored report on GET ?action=download', async () => {
    const storedReport = { generatedAt: '2026-03-24T08:00:00Z', weekEnding: '2026-03-24', summary: {} }
    const mockReportStore = { get: vi.fn().mockResolvedValue(storedReport) }
    getStore.mockReturnValue(mockReportStore)

    const res = await handler({ httpMethod: 'GET', queryStringParameters: { action: 'download', date: '2026-03-24' } }, {})
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual(storedReport)
  })

  it('returns 404 on GET ?action=download when report not found', async () => {
    const mockReportStore = { get: vi.fn().mockResolvedValue(null) }
    getStore.mockReturnValue(mockReportStore)

    const res = await handler({ httpMethod: 'GET', queryStringParameters: { action: 'download', date: '2026-03-24' } }, {})
    expect(res.statusCode).toBe(404)
  })
})
