import { MousePointerClick, Eye, TrendingUp, Target, Send, Shield, Bot, CheckCircle, RefreshCw, Clock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { T } from '../../utils/constants'
import { formatNum } from '../../utils/formatters'
import { websites, keywords, clicksData, impressionsData, aiAgentActions } from '../../utils/mock-data'
import { GlassCard, MetricCard, SectionHeader, Badge, ChartTooltip, PositionChange } from '../shared'

export function DashboardView() {
  const totalClicks = websites.reduce((s, w) => s + w.clicks, 0);
  const totalImpressions = websites.reduce((s, w) => s + w.impressions, 0);
  const avgCTR = (websites.reduce((s, w) => s + w.ctr, 0) / websites.length).toFixed(2);
  const avgPosition = (websites.reduce((s, w) => s + w.position, 0) / websites.length).toFixed(1);
  const totalForms = websites.reduce((s, w) => s + w.forms, 0);
  const healthyCount = websites.filter((w) => w.status === "healthy").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <MetricCard icon={MousePointerClick} label="Total Clicks" value={formatNum(totalClicks)} change={12.4} changeType="up" color={T.accent.blue} subtitle="Across all websites" />
        <MetricCard icon={Eye} label="Total Impressions" value={formatNum(totalImpressions)} change={8.7} changeType="up" color={T.accent.purple} subtitle="Last 30 days" />
        <MetricCard icon={TrendingUp} label="Avg. CTR" value={`${avgCTR}%`} change={5.2} changeType="up" color={T.accent.emerald} subtitle="Click-through rate" />
        <MetricCard icon={Target} label="Avg. Position" value={avgPosition} change={3.1} changeType="up" color={T.accent.cyan} subtitle="Google Search" />
        <MetricCard icon={Send} label="Form Leads" value={totalForms} change={18.3} changeType="up" color={T.accent.amber} subtitle="Via Formspree" />
        <MetricCard icon={Shield} label="Sites Healthy" value={`${healthyCount}/${websites.length}`} color={T.accent.emerald} subtitle="SEO health score >85" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <GlassCard>
          <SectionHeader icon={MousePointerClick} title="Clicks Trend" subtitle="Cumulative daily clicks" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={clicksData}>
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
            <AreaChart data={impressionsData}>
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
                  {kw.position}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.text.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{kw.keyword}</div>
                  <div style={{ fontSize: 11, color: T.text.muted }}>{formatNum(kw.volume)} vol/mo</div>
                </div>
                <PositionChange current={kw.position} previous={kw.prevPosition} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
