import { MousePointerClick, Eye, TrendingUp, Target, Send, Shield, Bot, CheckCircle, RefreshCw, Clock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { T } from '../../utils/constants'
import { formatNum } from '../../utils/formatters'
import { clicksData as mockClicksData, impressionsData as mockImpressionsData, aiAgentActions } from '../../utils/mock-data'
import { GlassCard, MetricCard, SectionHeader, Badge, ChartTooltip, PositionChange } from '../shared'
import { useSiteList } from '../../hooks/useSiteList'
import { useMultiDomainGSC } from '../../hooks/useMultiDomainGSC'
import { useKeywords } from '../../hooks/useKeywords'

export function DashboardView() {
  const { domains, isAuthenticated } = useSiteList()
  const { totals, mergedRows, domains: domainResults } = useMultiDomainGSC(domains)
  const { keywords } = useKeywords(domains)

  const totalClicks = totals.clicks
  const totalImpressions = totals.impressions
  const avgCTR = totals.ctr
  const avgPosition = totals.position
  const totalForms = 0 // Formspree data is separate
  const healthyCount = domainResults.filter((d) => !d.isError && !d.isLoading).length
  const siteCount = domains.length

  // Use real daily data for charts when available, else mock
  const hasRealRows = mergedRows.length > 0
  const clicksChartData = hasRealRows
    ? mergedRows.map((r) => ({ date: r.date, value: r.clicks }))
    : mockClicksData
  const impressionsChartData = hasRealRows
    ? mergedRows.map((r) => ({ date: r.date, value: r.impressions }))
    : mockImpressionsData

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <MetricCard icon={MousePointerClick} label="Total Clicks" value={formatNum(totalClicks)} changeType="up" color={T.accent.blue} subtitle={isAuthenticated ? "GSC live data" : "Across all websites"} />
        <MetricCard icon={Eye} label="Total Impressions" value={formatNum(totalImpressions)} changeType="up" color={T.accent.purple} subtitle="Last 30 days" />
        <MetricCard icon={TrendingUp} label="Avg. CTR" value={`${avgCTR}%`} changeType="up" color={T.accent.emerald} subtitle="Click-through rate" />
        <MetricCard icon={Target} label="Avg. Position" value={avgPosition} changeType="up" color={T.accent.cyan} subtitle="Google Search" />
        <MetricCard icon={Send} label="Form Leads" value={totalForms} color={T.accent.amber} subtitle="Via Formspree" />
        <MetricCard icon={Shield} label="Sites Healthy" value={`${healthyCount}/${siteCount}`} color={T.accent.emerald} subtitle={isAuthenticated ? "GSC connected" : "SEO health score >85"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <GlassCard>
          <SectionHeader icon={MousePointerClick} title="Clicks Trend" subtitle="Cumulative daily clicks" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={clicksChartData}>
              <defs>
                <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.accent.blue} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={T.accent.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: T.text.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.text.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatNum} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="value" stroke={T.accent.blue} strokeWidth={2.5} fill="url(#clicksGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <SectionHeader icon={Eye} title="Impressions Trend" subtitle="Cumulative daily impressions" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={impressionsChartData}>
              <defs>
                <linearGradient id="impGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.accent.purple} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={T.accent.purple} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: T.text.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.text.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatNum} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="value" stroke={T.accent.purple} strokeWidth={2.5} fill="url(#impGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <GlassCard glow={T.glow.indigo}>
          <SectionHeader icon={Bot} title="AI Agent Activity" subtitle="Automated SEO optimizations" action={<Badge variant="success">3 active</Badge>} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {aiAgentActions.slice(0, 4).map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border.subtle}` }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: a.status === "completed" ? `${T.accent.emerald}15` : a.status === "in_progress" ? `${T.accent.blue}15` : `${T.accent.amber}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {a.status === "completed" ? <CheckCircle size={16} color={T.accent.emerald} /> : a.status === "in_progress" ? <RefreshCw size={16} color={T.accent.blue} /> : <Clock size={16} color={T.accent.amber} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.text.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.action}</div>
                  <div style={{ fontSize: 11, color: T.text.muted, display: "flex", gap: 8, marginTop: 2 }}>
                    <span>{a.domain}</span>
                    <span style={{ color: T.accent.emerald }}>{a.impact}</span>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: T.text.muted, flexShrink: 0 }}>{a.time}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader icon={Target} title="Top Keywords" subtitle="Best performing keywords" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {keywords.slice(0, 5).map((kw, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border.subtle}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: kw.position <= 3 ? `${T.accent.emerald}15` : kw.position <= 10 ? `${T.accent.blue}15` : `${T.accent.amber}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: kw.position <= 3 ? T.accent.emerald : kw.position <= 10 ? T.accent.blue : T.accent.amber }}>
                  {Math.round(kw.position)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.text.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{kw.keyword}</div>
                  <div style={{ fontSize: 11, color: T.text.muted }}>
                    {kw.domain ? kw.domain : kw.volume ? `${formatNum(kw.volume)} vol/mo` : `${formatNum(kw.clicks)} clicks`}
                  </div>
                </div>
                {kw.prevPosition ? (
                  <PositionChange current={kw.position} previous={kw.prevPosition} />
                ) : (
                  <span style={{ fontSize: 12, color: T.accent.emerald, fontWeight: 600 }}>{formatNum(kw.clicks)}</span>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
