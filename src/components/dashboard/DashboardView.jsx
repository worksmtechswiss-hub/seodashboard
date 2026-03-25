import { useState, useMemo } from 'react'
import { MousePointerClick, Eye, TrendingUp, Target, Send, Shield, Trophy, Tag, ChevronDown } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { T } from '../../utils/constants'
import { formatNum } from '../../utils/formatters'
import { clicksData as mockClicksData, impressionsData as mockImpressionsData, websites as mockWebsites } from '../../utils/mock-data'
import { GlassCard, MetricCard, SectionHeader, Badge, ChartTooltip, PositionChange } from '../shared'
import { useSiteList } from '../../hooks/useSiteList'
import { useMultiDomainGSC } from '../../hooks/useMultiDomainGSC'
import { useKeywords } from '../../hooks/useKeywords'
import { useAppStore, businessTags } from '../../store/app-store'

const performerFilters = [
  { label: 'Yesterday', days: 1 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 14 Days', days: 14 },
  { label: 'Last 30 Days', days: 30 },
]

export function DashboardView() {
  const [performerDays, setPerformerDays] = useState(7)
  const [expandedDay, setExpandedDay] = useState(null)
  const dateRange = useAppStore((s) => s.dateRange)
  const activeBusinessFilter = useAppStore((s) => s.activeBusinessFilter)
  const setActiveBusinessFilter = useAppStore((s) => s.setActiveBusinessFilter)
  const websiteTags = useAppStore((s) => s.websiteTags)
  const { domains: allDomains, isAuthenticated } = useSiteList()

  // Filter domains by active business tag
  const domains = useMemo(() => {
    if (!activeBusinessFilter) return allDomains
    return allDomains.filter((d) => websiteTags[d] === activeBusinessFilter)
  }, [allDomains, activeBusinessFilter, websiteTags])

  const { totals, mergedRows, domains: domainResults } = useMultiDomainGSC(domains, dateRange)
  const { keywords } = useKeywords(domains, dateRange)

  const totalClicks = totals.clicks
  const totalImpressions = totals.impressions
  const avgCTR = totals.ctr
  const avgPosition = totals.position
  const totalForms = 0 // Formspree data is separate
  const healthyCount = domainResults.filter((d) => !d.isError && !d.isLoading).length
  const siteCount = domains.length

  // Use real daily data for charts when available, else mock (sliced to match dateRange)
  const hasRealRows = mergedRows.length > 0
  const clicksChartData = hasRealRows
    ? mergedRows.map((r) => ({ date: r.date, value: r.clicks }))
    : mockClicksData.slice(-dateRange)
  const impressionsChartData = hasRealRows
    ? mergedRows.map((r) => ({ date: r.date, value: r.impressions }))
    : mockImpressionsData.slice(-dateRange)

  // Compute daily top performers — top 10 websites per day ranked by clicks & impressions
  const topPerformers = (() => {
    const hasRealDomainData = domainResults.some((d) => d.data?.rows?.length > 0)
    if (hasRealDomainData) {
      const byDate = {}
      for (const dr of domainResults) {
        if (!dr.data?.rows) continue
        for (const row of dr.data.rows) {
          if (!row.date) continue
          if (!byDate[row.date]) byDate[row.date] = []
          byDate[row.date].push({ domain: dr.domain, clicks: row.clicks || 0, impressions: row.impressions || 0 })
        }
      }
      return Object.entries(byDate)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, performerDays)
        .map(([date, entries]) => ({
          date,
          displayDate: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric', weekday: 'short' }),
          byClicks: [...entries].sort((a, b) => b.clicks - a.clicks).slice(0, 10),
          byImpressions: [...entries].sort((a, b) => b.impressions - a.impressions).slice(0, 10),
        }))
    }
    // Mock fallback
    return Array.from({ length: performerDays }, (_, i) => {
      const d = new Date(Date.now() - i * 86400000)
      const shuffled = [...mockWebsites].sort(() => Math.random() - 0.5).slice(0, 10)
      return {
        date: d.toISOString().slice(0, 10),
        displayDate: d.toLocaleDateString('en', { month: 'short', day: 'numeric', weekday: 'short' }),
        byClicks: shuffled.map((w) => ({ domain: w.domain, clicks: Math.round(w.clicks / 30 + (Math.random() - 0.5) * 200), impressions: Math.round(w.impressions / 30 + (Math.random() - 0.5) * 5000) })).sort((a, b) => b.clicks - a.clicks),
        byImpressions: shuffled.map((w) => ({ domain: w.domain, clicks: Math.round(w.clicks / 30 + (Math.random() - 0.5) * 200), impressions: Math.round(w.impressions / 30 + (Math.random() - 0.5) * 5000) })).sort((a, b) => b.impressions - a.impressions),
      }
    })
  })()

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Business filter */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Tag size={15} color={T.text.muted} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: T.text.muted, marginRight: 4 }}>Business:</span>
        {[{ label: 'All', value: null }, ...businessTags.map((t) => ({ label: t, value: t }))].map((f) => (
          <button
            key={f.label}
            onClick={() => setActiveBusinessFilter(f.value)}
            style={{
              padding: "6px 14px", fontSize: 12, fontWeight: 600, borderRadius: 8,
              border: `1px solid ${activeBusinessFilter === f.value ? T.accent.indigo : T.border.subtle}`,
              background: activeBusinessFilter === f.value ? `${T.accent.indigo}20` : "transparent",
              color: activeBusinessFilter === f.value ? T.accent.indigo : T.text.muted,
              cursor: "pointer", transition: "all 0.15s ease",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

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

      <GlassCard glow={T.glow.indigo}>
        <SectionHeader icon={Trophy} title="Top Performers" subtitle="Top 10 websites per day — click a day to expand" action={
          <div style={{ display: "flex", gap: 4 }}>
            {performerFilters.map((f) => (
              <button
                key={f.days}
                onClick={() => { setPerformerDays(f.days); setExpandedDay(null) }}
                style={{
                  padding: "4px 10px", fontSize: 11, fontWeight: 600, borderRadius: 6,
                  border: `1px solid ${performerDays === f.days ? T.accent.indigo : T.border.subtle}`,
                  background: performerDays === f.days ? `${T.accent.indigo}20` : "transparent",
                  color: performerDays === f.days ? T.accent.indigo : T.text.muted,
                  cursor: "pointer", transition: "all 0.15s ease",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        } />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {topPerformers.map((day) => {
            const isOpen = expandedDay === day.date
            return (
              <div key={day.date} style={{ borderRadius: 10, background: "rgba(255,255,255,0.02)", border: `1px solid ${isOpen ? T.border.medium : T.border.subtle}`, overflow: "hidden", transition: "border-color 0.15s" }}>
                {/* Day header — always visible, clickable */}
                <div onClick={() => setExpandedDay(isOpen ? null : day.date)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <ChevronDown size={14} color={T.text.muted} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text.secondary, minWidth: 120 }}>{day.displayDate}</span>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <MousePointerClick size={12} color={T.accent.blue} />
                      <span style={{ fontSize: 12, color: T.text.muted }}>Top:</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.text.primary }}>{day.byClicks[0]?.domain}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.accent.blue }}>{formatNum(day.byClicks[0]?.clicks || 0)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Eye size={12} color={T.accent.purple} />
                      <span style={{ fontSize: 12, color: T.text.muted }}>Top:</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.text.primary }}>{day.byImpressions[0]?.domain}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.accent.purple }}>{formatNum(day.byImpressions[0]?.impressions || 0)}</span>
                    </div>
                  </div>
                </div>
                {/* Expanded: top 10 lists */}
                {isOpen && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: "0 14px 14px" }}>
                    {/* Top 10 by Clicks */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <MousePointerClick size={13} color={T.accent.blue} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: T.accent.blue, textTransform: "uppercase", letterSpacing: "0.06em" }}>Top 10 Clicks</span>
                      </div>
                      {day.byClicks.map((entry, rank) => (
                        <div key={entry.domain} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, background: rank === 0 ? `${T.accent.blue}08` : "transparent" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: rank < 3 ? T.accent.blue : T.text.muted, width: 18, textAlign: "right" }}>{rank + 1}.</span>
                          <span style={{ fontSize: 12, fontWeight: rank === 0 ? 600 : 400, color: T.text.primary, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.domain}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: rank === 0 ? T.accent.blue : T.text.secondary, flexShrink: 0 }}>{formatNum(entry.clicks)}</span>
                        </div>
                      ))}
                    </div>
                    {/* Top 10 by Impressions */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <Eye size={13} color={T.accent.purple} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: T.accent.purple, textTransform: "uppercase", letterSpacing: "0.06em" }}>Top 10 Impressions</span>
                      </div>
                      {day.byImpressions.map((entry, rank) => (
                        <div key={entry.domain} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, background: rank === 0 ? `${T.accent.purple}08` : "transparent" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: rank < 3 ? T.accent.purple : T.text.muted, width: 18, textAlign: "right" }}>{rank + 1}.</span>
                          <span style={{ fontSize: 12, fontWeight: rank === 0 ? 600 : 400, color: T.text.primary, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.domain}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: rank === 0 ? T.accent.purple : T.text.secondary, flexShrink: 0 }}>{formatNum(entry.impressions)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
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
  );
}
