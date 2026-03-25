import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Globe, MousePointerClick, Eye, TrendingUp, Target, ExternalLink } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { T } from '../../utils/constants'
import { formatNum } from '../../utils/formatters'
import { GlassCard, MetricCard, SectionHeader, ChartTooltip, PositionChange } from '../shared'
import { useSearchConsole } from '../../hooks/useSearchConsole'
import { useKeywords } from '../../hooks/useKeywords'
import { useAppStore } from '../../store/app-store'

export function WebsiteDetailView() {
  const { domain } = useParams()
  const navigate = useNavigate()
  const dateRange = useAppStore((s) => s.dateRange)

  const { data: gsc, isLoading } = useSearchConsole(domain, dateRange)
  const { keywords: allKeywords, isMockData } = useKeywords([domain], dateRange)

  // Filter keywords to this domain only
  const keywords = useMemo(() => {
    if (isMockData) return allKeywords.filter((kw) => kw.url?.includes(domain)).slice(0, 10)
    return allKeywords.slice(0, 10)
  }, [allKeywords, domain, isMockData])

  const rows = gsc?.rows || []
  const clicksData = rows.map((r) => ({ date: r.date, value: r.clicks }))
  const impressionsData = rows.map((r) => ({ date: r.date, value: r.impressions }))

  // Daily breakdown for bar chart (last 14 days max)
  const dailyBreakdown = rows.slice(-14).map((r) => ({
    date: new Date(r.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    clicks: r.clicks,
    impressions: r.impressions,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Back button + domain header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => navigate('/websites')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 10,
            background: T.bg.elevated, border: `1px solid ${T.border.subtle}`,
            color: T.text.secondary, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            transition: 'border-color 0.15s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = T.accent.indigo}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = T.border.subtle}
        >
          <ArrowLeft size={14} />
          Back to Websites
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `linear-gradient(135deg, ${T.accent.indigo}20, ${T.accent.blue}10)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Globe size={20} color={T.accent.indigo} />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text.primary, margin: 0 }}>{domain}</h2>
            <span style={{ fontSize: 12, color: T.text.muted }}>Detailed performance overview</span>
          </div>
        </div>
        <a
          href={`https://${domain}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 10,
            background: `${T.accent.indigo}15`, border: `1px solid ${T.accent.indigo}30`,
            color: T.accent.indigo, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          <ExternalLink size={14} />
          Visit Site
        </a>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <MetricCard icon={MousePointerClick} label="Clicks" value={formatNum(gsc?.clicks ?? 0)} color={T.accent.blue} subtitle={`Last ${dateRange} days`} />
        <MetricCard icon={Eye} label="Impressions" value={formatNum(gsc?.impressions ?? 0)} color={T.accent.purple} subtitle={`Last ${dateRange} days`} />
        <MetricCard icon={TrendingUp} label="CTR" value={`${gsc?.ctr ?? 0}%`} color={T.accent.emerald} subtitle="Click-through rate" />
        <MetricCard icon={Target} label="Avg. Position" value={gsc?.position ?? 0} color={T.accent.cyan} subtitle="Google Search" />
      </div>

      {/* Trend charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <GlassCard>
          <SectionHeader icon={MousePointerClick} title="Clicks Trend" subtitle={`Daily clicks for ${domain}`} />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={clicksData}>
              <defs>
                <linearGradient id="detailClicksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.accent.blue} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={T.accent.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: T.text.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.text.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatNum} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="value" stroke={T.accent.blue} strokeWidth={2.5} fill="url(#detailClicksGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <SectionHeader icon={Eye} title="Impressions Trend" subtitle={`Daily impressions for ${domain}`} />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={impressionsData}>
              <defs>
                <linearGradient id="detailImpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.accent.purple} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={T.accent.purple} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: T.text.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.text.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatNum} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="value" stroke={T.accent.purple} strokeWidth={2.5} fill="url(#detailImpGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Daily breakdown bar chart */}
      {dailyBreakdown.length > 0 && (
        <GlassCard>
          <SectionHeader icon={TrendingUp} title="Daily Breakdown" subtitle="Clicks vs Impressions (last 14 days)" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dailyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: T.text.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="clicks" tick={{ fill: T.text.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatNum} />
              <YAxis yAxisId="impressions" orientation="right" tick={{ fill: T.text.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatNum} />
              <Tooltip content={<ChartTooltip />} />
              <Bar yAxisId="clicks" dataKey="clicks" fill={T.accent.blue} radius={[4, 4, 0, 0]} barSize={16} opacity={0.85} />
              <Bar yAxisId="impressions" dataKey="impressions" fill={T.accent.purple} radius={[4, 4, 0, 0]} barSize={16} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.text.muted }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: T.accent.blue }} /> Clicks
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.text.muted }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: T.accent.purple }} /> Impressions
            </div>
          </div>
        </GlassCard>
      )}

      {/* Keywords for this domain */}
      <GlassCard>
        <SectionHeader icon={Target} title="Top Keywords" subtitle={`Best performing keywords for ${domain}`} />
        {keywords.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 600, color: T.text.muted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: `1px solid ${T.border.subtle}` }}>Keyword</th>
                  <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 600, color: T.text.muted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', borderBottom: `1px solid ${T.border.subtle}` }}>Position</th>
                  <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 600, color: T.text.muted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', borderBottom: `1px solid ${T.border.subtle}` }}>Clicks</th>
                  <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 600, color: T.text.muted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', borderBottom: `1px solid ${T.border.subtle}` }}>Impressions</th>
                  <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 600, color: T.text.muted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', borderBottom: `1px solid ${T.border.subtle}` }}>CTR</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw, i) => {
                  const posColor = kw.position <= 3 ? T.accent.emerald : kw.position <= 10 ? T.accent.blue : kw.position <= 20 ? T.accent.amber : T.text.muted
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.border.subtle}` }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: T.text.primary }}>{kw.keyword || kw.query}</div>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: posColor }}>{Math.round(kw.position)}</span>
                          {kw.prevPosition && <PositionChange current={kw.position} previous={kw.prevPosition} />}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: T.text.primary }}>{formatNum(kw.clicks)}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: 13, color: T.text.secondary }}>{formatNum(kw.impressions)}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: 13, color: T.accent.emerald, fontWeight: 600 }}>{kw.ctr != null ? `${(typeof kw.ctr === 'number' && kw.ctr < 1 ? (kw.ctr * 100).toFixed(2) : kw.ctr)}%` : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 32, textAlign: 'center', color: T.text.muted, fontSize: 13 }}>
            {isLoading ? 'Loading keywords...' : 'No keyword data available for this domain'}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
