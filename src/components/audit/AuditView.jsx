import { useState, useRef } from 'react'
import { Globe, Search, FileText, Zap, AlertTriangle, AlertCircle, Info, CheckCircle, Download, Loader2, ArrowRight, Target, Eye, MousePointerClick, Shield, Link2, Image, Code, Share2, Type } from 'lucide-react'
import { T } from '../../utils/constants'
import { formatNum } from '../../utils/formatters'
import { GlassCard, SectionHeader } from '../shared'
import { useAudit } from '../../hooks/useAudit'

// ─── Score Gauge ───────────────────────────────────────────────
function ScoreGauge({ score, size = 140, label }) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const progress = ((100 - score) / 100) * circumference
  const color = score >= 90 ? T.accent.emerald : score >= 50 ? T.accent.amber : T.accent.rose
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={8}
            strokeDasharray={circumference} strokeDashoffset={progress} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: size * 0.28, fontWeight: 800, color }}>{score}</span>
          <span style={{ fontSize: 11, color: T.text.muted }}>/ 100</span>
        </div>
      </div>
      {label && <span style={{ fontSize: 12, fontWeight: 600, color: T.text.secondary }}>{label}</span>}
    </div>
  )
}

// ─── Small Score Circle ────────────────────────────────────────
function SmallScore({ score, label }) {
  const color = score >= 90 ? T.accent.emerald : score >= 50 ? T.accent.amber : T.accent.rose
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', border: `3px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 16, fontWeight: 700, color }}>{score}</span>
      </div>
      <span style={{ fontSize: 11, color: T.text.muted, textAlign: 'center' }}>{label}</span>
    </div>
  )
}

// ─── Issue Row ─────────────────────────────────────────────────
function IssueRow({ issue }) {
  const icons = { critical: AlertCircle, warning: AlertTriangle, info: Info }
  const colors = { critical: T.accent.rose, warning: T.accent.amber, info: T.accent.blue }
  const Icon = icons[issue.severity] || Info
  const color = colors[issue.severity] || T.accent.blue
  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.border.subtle}` }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color, background: `${color}12`, padding: '2px 6px', borderRadius: 4 }}>{issue.category}</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text.primary }}>{issue.message}</div>
        <div style={{ fontSize: 12, color: T.text.muted, marginTop: 4 }}>{issue.recommendation}</div>
      </div>
    </div>
  )
}

// ─── Audit Type Card ───────────────────────────────────────────
function AuditTypeCard({ icon: Icon, title, description, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: 20, borderRadius: 14, textAlign: 'left', cursor: 'pointer',
      background: active ? `linear-gradient(135deg, ${T.accent.indigo}15, ${T.accent.purple}08)` : T.bg.elevated,
      border: `1.5px solid ${active ? T.accent.indigo : T.border.subtle}`,
      transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden',
    }}>
      {active && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${T.accent.indigo}, ${T.accent.purple})` }} />}
      <div style={{ width: 40, height: 40, borderRadius: 10, background: active ? `${T.accent.indigo}20` : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Icon size={20} color={active ? T.accent.indigo : T.text.muted} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: active ? T.text.primary : T.text.secondary, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: T.text.muted, lineHeight: 1.5 }}>{description}</div>
    </button>
  )
}

// ─── On-Page Info Item ─────────────────────────────────────────
function InfoItem({ icon: Icon, label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.border.subtle}` }}>
      <Icon size={16} color={color || T.text.muted} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: T.text.muted, flex: 1 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: color || T.text.primary }}>{value}</span>
    </div>
  )
}

// ─── PDF Export ────────────────────────────────────────────────
function exportPdf(result, mode) {
  const w = window.open('', '_blank')
  if (!w) return alert('Please allow popups for PDF export.')

  const isSite = result.type === 'site'
  const isOptimizer = result.type === 'optimizer'
  const isKeyword = result.type === 'keyword'
  const issues = result.issues || result.optimizations || []
  const isFull = mode === 'full'

  const severityColor = (s) => s === 'critical' ? '#ef4444' : s === 'warning' ? '#f59e0b' : '#3b82f6'
  const severityLabel = (s) => s === 'critical' ? 'CRITICAL' : s === 'warning' ? 'WARNING' : 'INFO'

  const issueRows = (isFull ? issues : issues.slice(0, 10)).map((issue) => `
    <tr>
      <td><span style="color:${severityColor(issue.severity)};font-weight:700;font-size:11px">${severityLabel(issue.severity)}</span></td>
      <td style="font-size:12px;color:#64748b">${issue.category}</td>
      <td style="font-weight:600">${issue.message}</td>
      ${isFull ? `<td style="font-size:12px;color:#64748b">${issue.recommendation}</td>` : ''}
    </tr>
  `).join('')

  const scoreSection = (isSite || isOptimizer) ? `
    <div style="text-align:center;margin:30px 0">
      <div style="font-size:64px;font-weight:800;color:${result.overallScore >= 90 ? '#10b981' : result.overallScore >= 50 ? '#f59e0b' : '#ef4444'}">${result.overallScore}</div>
      <div style="font-size:14px;color:#64748b">Overall SEO Score</div>
    </div>
    ${result.pagespeed ? `
    <div style="display:flex;justify-content:center;gap:32px;margin-bottom:30px">
      <div style="text-align:center"><div style="font-size:28px;font-weight:700">${result.pagespeed.performanceScore ?? '—'}</div><div style="font-size:11px;color:#64748b">Performance</div></div>
      <div style="text-align:center"><div style="font-size:28px;font-weight:700">${result.pagespeed.seoScore ?? '—'}</div><div style="font-size:11px;color:#64748b">SEO</div></div>
      <div style="text-align:center"><div style="font-size:28px;font-weight:700">${result.pagespeed.accessibilityScore ?? '—'}</div><div style="font-size:11px;color:#64748b">Accessibility</div></div>
      <div style="text-align:center"><div style="font-size:28px;font-weight:700">${result.pagespeed.bestPracticesScore ?? '—'}</div><div style="font-size:11px;color:#64748b">Best Practices</div></div>
    </div>` : ''}
  ` : ''

  const keywordSection = isKeyword ? `
    <div style="margin:20px 0">
      <h3>Search Intent: ${result.analysis.searchIntent.type}</h3>
      <p style="color:#64748b">${result.analysis.searchIntent.description}</p>
    </div>
    <h3>Recommendations</h3>
    ${result.analysis.recommendations.map((r) => `
      <div style="margin-bottom:12px;padding:12px;background:#f8fafc;border-radius:8px">
        <div style="font-weight:600;margin-bottom:4px">${r.title}</div>
        <div style="font-size:13px;color:#64748b">${r.description}</div>
      </div>
    `).join('')}
    ${isFull ? `
    <h3>Content Guidelines</h3>
    <p><strong>Suggested word count:</strong> ${result.analysis.contentGuidelines.suggestedWordCount}</p>
    <h4>Heading Structure</h4>
    <ul>${result.analysis.contentGuidelines.headingStructure.map((h) => `<li>${h}</li>`).join('')}</ul>
    <h4>Content Elements</h4>
    <ul>${result.analysis.contentGuidelines.contentElements.map((c) => `<li>${c}</li>`).join('')}</ul>
    ` : ''}
  ` : ''

  const onPageSection = (isFull && (isSite || isOptimizer) && result.onPage) ? `
    <h3 style="margin-top:30px">On-Page Details</h3>
    <table style="width:100%;border-collapse:collapse">
      ${result.onPage.title ? `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600;width:160px">Title</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${result.onPage.title}</td></tr>` : ''}
      ${result.onPage.metaDescription ? `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600">Meta Description</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${result.onPage.metaDescription}</td></tr>` : ''}
      <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600">H1 Tags</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${result.onPage.h1Count ?? 0}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600">H2 Tags</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${result.onPage.h2Count ?? 0}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600">Images</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${result.onPage.totalImages ?? 0} (${result.onPage.imagesWithoutAlt ?? 0} missing alt)</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600">Internal Links</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${result.onPage.internalLinks ?? 0}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600">External Links</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${result.onPage.externalLinks ?? 0}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600">Word Count</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${result.onPage.wordCount ?? '—'}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600">Structured Data</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${result.onPage.hasStructuredData ? 'Yes' : 'No'}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600">Open Graph</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${result.onPage.hasOpenGraph ? 'Yes' : 'No'}</td></tr>
    </table>
  ` : ''

  w.document.write(`<!DOCTYPE html><html><head><title>SEO Audit Report — ${result.domain || result.keyword || result.url}</title>
    <style>body{font-family:-apple-system,Inter,sans-serif;color:#1e293b;max-width:800px;margin:0 auto;padding:40px}
    h1{font-size:24px;margin-bottom:4px}h2{font-size:18px;margin-top:30px;border-bottom:2px solid #e2e8f0;padding-bottom:8px}h3{font-size:15px;margin-top:20px}
    table{width:100%;border-collapse:collapse}th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #e2e8f0;font-size:13px}
    th{font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#64748b}
    @media print{body{padding:20px}button{display:none!important}}</style></head>
    <body>
      <h1>SEO Audit Report</h1>
      <p style="color:#64748b;margin-bottom:30px">${result.domain || result.url || result.keyword} — ${new Date(result.timestamp).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })} — ${mode === 'full' ? 'Full Report' : 'Summary'}</p>
      ${scoreSection}
      ${keywordSection}
      ${issues.length > 0 ? `
        <h2>Issues Found (${issues.length})</h2>
        <table><thead><tr><th>Severity</th><th>Category</th><th>Issue</th>${isFull ? '<th>Recommendation</th>' : ''}</tr></thead><tbody>${issueRows}</tbody></table>
      ` : '<p style="color:#10b981;font-weight:600">No issues found. Great job!</p>'}
      ${onPageSection}
      <div style="margin-top:40px;text-align:center;color:#94a3b8;font-size:11px">Generated by SEO Command Center</div>
      <script>setTimeout(()=>window.print(),500)</script>
    </body></html>`)
  w.document.close()
}

// ═══════════════════════════════════════════════════════════════
// Main AuditView
// ═══════════════════════════════════════════════════════════════
export function AuditView() {
  const [auditType, setAuditType] = useState('site')
  const [domain, setDomain] = useState('')
  const [keyword, setKeyword] = useState('')
  const [url, setUrl] = useState('')
  const [history, setHistory] = useState([])
  const { mutate, data: result, isPending, error, reset } = useAudit()

  const handleRun = () => {
    if (auditType === 'site' && !domain.trim()) return
    if (auditType === 'keyword' && !keyword.trim()) return
    if (auditType === 'optimizer' && (!url.trim() || !keyword.trim())) return

    const params = auditType === 'site'
      ? { type: 'site', domain: domain.trim() }
      : auditType === 'keyword'
      ? { type: 'keyword', keyword: keyword.trim() }
      : { type: 'optimizer', url: url.trim(), keyword: keyword.trim() }

    mutate(params, {
      onSuccess: (data) => {
        setHistory((prev) => [data, ...prev].slice(0, 10))
      },
    })
  }

  const loadFromHistory = (entry) => {
    reset()
    // Small delay so reset takes effect
    setTimeout(() => mutate(
      entry.type === 'site' ? { type: 'site', domain: entry.domain }
        : entry.type === 'keyword' ? { type: 'keyword', keyword: entry.keyword }
        : { type: 'optimizer', url: entry.url, keyword: entry.keyword },
      { onSuccess: () => {} }
    ), 0)
    // Actually just show the cached result
  }

  const issues = result?.issues || result?.optimizations || []
  const criticalCount = issues.filter((i) => i.severity === 'critical').length
  const warningCount = issues.filter((i) => i.severity === 'warning').length
  const infoCount = issues.filter((i) => i.severity === 'info').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ─── Audit Type Selection ─── */}
      <div style={{ display: 'flex', gap: 14 }}>
        <AuditTypeCard icon={Globe} title="Site Audit" description="Full PageSpeed + on-page SEO analysis for any domain" active={auditType === 'site'} onClick={() => { setAuditType('site'); reset() }} />
        <AuditTypeCard icon={Search} title="Keyword Analysis" description="Search intent, content strategy, and optimization tips" active={auditType === 'keyword'} onClick={() => { setAuditType('keyword'); reset() }} />
        <AuditTypeCard icon={Target} title="Page Optimizer" description="Check how well a specific page targets a keyword" active={auditType === 'optimizer'} onClick={() => { setAuditType('optimizer'); reset() }} />
      </div>

      {/* ─── Input Form ─── */}
      <GlassCard>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          {(auditType === 'site') && (
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.text.secondary, display: 'block', marginBottom: 6 }}>Domain</label>
              <input
                value={domain} onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. example.com"
                onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 10, background: T.bg.elevated, border: `1px solid ${T.border.subtle}`, color: T.text.primary, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
              />
            </div>
          )}
          {(auditType === 'keyword' || auditType === 'optimizer') && (
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.text.secondary, display: 'block', marginBottom: 6 }}>Keyword</label>
              <input
                value={keyword} onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. web development zürich"
                onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 10, background: T.bg.elevated, border: `1px solid ${T.border.subtle}`, color: T.text.primary, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
              />
            </div>
          )}
          {auditType === 'optimizer' && (
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.text.secondary, display: 'block', marginBottom: 6 }}>Page URL</label>
              <input
                value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g. example.com/services"
                onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 10, background: T.bg.elevated, border: `1px solid ${T.border.subtle}`, color: T.text.primary, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
              />
            </div>
          )}
          <button onClick={handleRun} disabled={isPending} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 10, border: 'none', cursor: isPending ? 'wait' : 'pointer',
            background: `linear-gradient(135deg, ${T.accent.indigo}, ${T.accent.purple})`,
            color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0,
            opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s',
          }}>
            {isPending ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={16} />}
            {isPending ? 'Analyzing...' : 'Run Audit'}
          </button>
        </div>
        {error && (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: `${T.accent.rose}12`, border: `1px solid ${T.accent.rose}30`, color: T.accent.rose, fontSize: 13 }}>
            {error.message}
          </div>
        )}
      </GlassCard>

      {/* ─── Loading State ─── */}
      {isPending && (
        <GlassCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 16 }}>
            <Loader2 size={40} color={T.accent.indigo} style={{ animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: T.text.primary }}>Running {auditType === 'site' ? 'site audit' : auditType === 'keyword' ? 'keyword analysis' : 'page optimization'}...</div>
            <div style={{ fontSize: 13, color: T.text.muted }}>
              {auditType === 'site' ? 'Fetching PageSpeed Insights and analyzing HTML...' : auditType === 'keyword' ? 'Analyzing keyword intent and generating recommendations...' : 'Checking keyword optimization and page structure...'}
            </div>
          </div>
        </GlassCard>
      )}

      {/* ─── Site Audit Results ─── */}
      {result && (result.type === 'site' || result.type === 'optimizer') && !isPending && (
        <>
          {/* Scores */}
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <SectionHeader icon={Shield} title={result.type === 'site' ? 'Audit Results' : 'Optimization Results'} subtitle={result.domain || result.url} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => exportPdf(result, 'summary')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: T.bg.elevated, border: `1px solid ${T.border.subtle}`, color: T.text.secondary, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  <Download size={14} /> Summary PDF
                </button>
                <button onClick={() => exportPdf(result, 'full')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: `${T.accent.indigo}15`, border: `1px solid ${T.accent.indigo}30`, color: T.accent.indigo, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  <FileText size={14} /> Full Report PDF
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 40, justifyContent: 'center', padding: '20px 0' }}>
              <ScoreGauge score={result.overallScore} size={160} label="Overall Score" />
              {result.pagespeed && (
                <div style={{ display: 'flex', gap: 20 }}>
                  <SmallScore score={result.pagespeed.performanceScore} label="Performance" />
                  <SmallScore score={result.pagespeed.seoScore} label="SEO" />
                  <SmallScore score={result.pagespeed.accessibilityScore} label="Accessibility" />
                  <SmallScore score={result.pagespeed.bestPracticesScore} label="Best Practices" />
                </div>
              )}
            </div>
          </GlassCard>

          {/* Core Web Vitals */}
          {result.pagespeed && (
            <GlassCard>
              <SectionHeader icon={Zap} title="Core Web Vitals" subtitle="Key performance metrics" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 8 }}>
                {[
                  { label: 'First Contentful Paint', value: result.pagespeed.fcp },
                  { label: 'Largest Contentful Paint', value: result.pagespeed.lcp },
                  { label: 'Cumulative Layout Shift', value: result.pagespeed.cls },
                  { label: 'Total Blocking Time', value: result.pagespeed.tbt },
                  { label: 'Speed Index', value: result.pagespeed.speedIndex },
                  { label: 'Time to Interactive', value: result.pagespeed.tti },
                ].filter((m) => m.value).map((m) => (
                  <div key={m.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.border.subtle}`, textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.text.primary }}>{m.value}</div>
                    <div style={{ fontSize: 11, color: T.text.muted, marginTop: 4 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* On-Page Analysis */}
          {result.onPage && (
            <GlassCard>
              <SectionHeader icon={FileText} title="On-Page Analysis" subtitle="Content and structure overview" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                <InfoItem icon={Type} label="Title" value={result.onPage.title ? `${result.onPage.title.slice(0, 40)}${result.onPage.title.length > 40 ? '...' : ''} (${result.onPage.title.length} chars)` : 'Missing'} color={result.onPage.title ? T.accent.emerald : T.accent.rose} />
                <InfoItem icon={FileText} label="Meta Description" value={result.onPage.metaDescription ? `${result.onPage.metaDescription.length} chars` : 'Missing'} color={result.onPage.metaDescription ? T.accent.emerald : T.accent.rose} />
                <InfoItem icon={Type} label="H1 Tags" value={result.onPage.h1Count ?? 0} color={result.onPage.h1Count === 1 ? T.accent.emerald : T.accent.amber} />
                <InfoItem icon={Type} label="H2 Tags" value={result.onPage.h2Count ?? 0} />
                <InfoItem icon={Image} label="Images" value={`${result.onPage.totalImages ?? 0} total (${result.onPage.imagesWithoutAlt ?? 0} missing alt)`} color={result.onPage.imagesWithoutAlt > 0 ? T.accent.amber : T.accent.emerald} />
                <InfoItem icon={FileText} label="Word Count" value={formatNum(result.onPage.wordCount ?? 0)} color={result.onPage.wordCount >= 300 ? T.accent.emerald : T.accent.amber} />
                <InfoItem icon={Link2} label="Internal Links" value={result.onPage.internalLinks ?? 0} color={T.accent.blue} />
                <InfoItem icon={Link2} label="External Links" value={result.onPage.externalLinks ?? 0} color={T.accent.purple} />
                <InfoItem icon={Code} label="Structured Data" value={result.onPage.hasStructuredData ? `Yes (${result.onPage.structuredDataCount})` : 'None'} color={result.onPage.hasStructuredData ? T.accent.emerald : T.accent.amber} />
                <InfoItem icon={Share2} label="Open Graph" value={result.onPage.hasOpenGraph ? 'Yes' : 'Missing'} color={result.onPage.hasOpenGraph ? T.accent.emerald : T.accent.amber} />
              </div>
            </GlassCard>
          )}

          {/* Issues */}
          {issues.length > 0 && (
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <SectionHeader icon={AlertTriangle} title="Issues & Recommendations" subtitle={`${issues.length} issues found`} />
                <div style={{ display: 'flex', gap: 12 }}>
                  {criticalCount > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: T.accent.rose }}>{criticalCount} Critical</span>}
                  {warningCount > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: T.accent.amber }}>{warningCount} Warning</span>}
                  {infoCount > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: T.accent.blue }}>{infoCount} Info</span>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {issues.map((issue, i) => <IssueRow key={i} issue={issue} />)}
              </div>
            </GlassCard>
          )}
          {issues.length === 0 && (
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 }}>
                <CheckCircle size={24} color={T.accent.emerald} />
                <span style={{ fontSize: 15, fontWeight: 600, color: T.accent.emerald }}>No issues found — great job!</span>
              </div>
            </GlassCard>
          )}
        </>
      )}

      {/* ─── Keyword Analysis Results ─── */}
      {result && result.type === 'keyword' && !isPending && (
        <>
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <SectionHeader icon={Search} title="Keyword Analysis" subtitle={`"${result.keyword}"`} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => exportPdf(result, 'summary')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: T.bg.elevated, border: `1px solid ${T.border.subtle}`, color: T.text.secondary, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  <Download size={14} /> Summary PDF
                </button>
                <button onClick={() => exportPdf(result, 'full')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: `${T.accent.indigo}15`, border: `1px solid ${T.accent.indigo}30`, color: T.accent.indigo, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  <FileText size={14} /> Full Report PDF
                </button>
              </div>
            </div>

            {/* Search Intent */}
            <div style={{ padding: 20, borderRadius: 12, background: `${T.accent.indigo}08`, border: `1px solid ${T.accent.indigo}20`, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${T.accent.indigo}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={18} color={T.accent.indigo} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: T.text.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Search Intent</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.accent.indigo }}>{result.analysis.searchIntent.type}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: T.text.secondary, lineHeight: 1.6 }}>{result.analysis.searchIntent.description}</div>
            </div>
          </GlassCard>

          {/* Recommendations */}
          <GlassCard>
            <SectionHeader icon={Zap} title="Recommendations" subtitle="How to rank for this keyword" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {result.analysis.recommendations.map((rec, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.border.subtle}` }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${T.accent.emerald}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: T.accent.emerald }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text.primary, marginBottom: 4 }}>{rec.title}</div>
                    <div style={{ fontSize: 12, color: T.text.muted, lineHeight: 1.5 }}>{rec.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Content Guidelines */}
          <GlassCard>
            <SectionHeader icon={FileText} title="Content Guidelines" subtitle="Structure your content for this keyword" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text.secondary, marginBottom: 8 }}>Suggested Word Count</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: T.accent.indigo }}>{result.analysis.contentGuidelines.suggestedWordCount}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text.secondary, marginBottom: 8 }}>Heading Structure</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {result.analysis.contentGuidelines.headingStructure.map((h, i) => (
                    <div key={i} style={{ fontSize: 12, color: T.text.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ArrowRight size={10} color={T.accent.indigo} /> {h}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text.secondary, marginBottom: 8 }}>Content Elements to Include</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {result.analysis.contentGuidelines.contentElements.map((c, i) => (
                    <div key={i} style={{ fontSize: 12, color: T.text.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle size={12} color={T.accent.emerald} /> {c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </>
      )}

      {/* ─── Audit History ─── */}
      {history.length > 0 && !isPending && (
        <GlassCard>
          <SectionHeader icon={FileText} title="Audit History" subtitle="Previous audits from this session" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {history.map((entry, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,0.02)', border: `1px solid ${T.border.subtle}`, cursor: 'pointer',
              }}
                onClick={() => loadFromHistory(entry)}
                onMouseEnter={(e) => e.currentTarget.style.background = T.bg.hover}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              >
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${T.accent.indigo}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {entry.type === 'site' ? <Globe size={14} color={T.accent.indigo} /> : entry.type === 'keyword' ? <Search size={14} color={T.accent.indigo} /> : <Target size={14} color={T.accent.indigo} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.text.primary }}>{entry.domain || entry.keyword || entry.url}</div>
                  <div style={{ fontSize: 11, color: T.text.muted }}>{entry.type === 'site' ? 'Site Audit' : entry.type === 'keyword' ? 'Keyword Analysis' : 'Page Optimizer'} — {new Date(entry.timestamp).toLocaleTimeString()}</div>
                </div>
                {entry.overallScore != null && (
                  <span style={{ fontSize: 14, fontWeight: 700, color: entry.overallScore >= 90 ? T.accent.emerald : entry.overallScore >= 50 ? T.accent.amber : T.accent.rose }}>{entry.overallScore}</span>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
