import { Send, Clock, Users, CheckCircle, BarChart3, Globe, Mail } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, Legend, Tooltip, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { T } from '../../utils/constants'
import { formSubmissions, formsByDay, formsBySite } from '../../utils/mock-data'
import { GlassCard, MetricCard, SectionHeader, Badge, ChartTooltip } from '../shared'

export function FormsView() {
  const statusVariant = { new: "default", contacted: "warning", converted: "success" }
  const COLORS = [T.accent.indigo, T.accent.blue, T.accent.cyan, T.accent.emerald, T.accent.amber, T.accent.purple]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <MetricCard icon={Send} label="Total Submissions" value="705" change={18.3} changeType="up" color={T.accent.indigo} />
        <MetricCard icon={Clock} label="New (Unread)" value="12" color={T.accent.amber} subtitle="Awaiting response" />
        <MetricCard icon={Users} label="Contacted" value="48" color={T.accent.blue} subtitle="In pipeline" />
        <MetricCard icon={CheckCircle} label="Converted" value="23" change={32} changeType="up" color={T.accent.emerald} subtitle="This month" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <GlassCard>
          <SectionHeader icon={BarChart3} title="Submissions by Day" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={formsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: T.text.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.text.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" fill={T.accent.indigo} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard>
          <SectionHeader icon={Globe} title="Leads by Website" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={formsBySite} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                {formsBySite.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend formatter={(v) => <span style={{ color: T.text.secondary, fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
      <GlassCard style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border.subtle}` }}>
          <SectionHeader icon={Mail} title="Recent Form Submissions" subtitle="Connected via Formspree" action={<Badge variant="default">formspree.io/f/mykkkaed</Badge>} />
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Name", "Email", "Website", "Page", "Date", "Status"].map((h) => (
                <th key={h} style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left", borderBottom: `1px solid ${T.border.subtle}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {formSubmissions.map((sub) => (
              <tr key={sub.id} style={{ borderBottom: `1px solid ${T.border.subtle}` }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "14px", fontSize: 13, fontWeight: 500, color: T.text.primary }}>{sub.name}</td>
                <td style={{ padding: "14px", fontSize: 13, color: T.text.secondary }}>{sub.email}</td>
                <td style={{ padding: "14px", fontSize: 13, color: T.accent.indigo }}>{sub.website}</td>
                <td style={{ padding: "14px", fontSize: 12, color: T.text.muted, fontFamily: "'Fira Code', monospace" }}>{sub.page}</td>
                <td style={{ padding: "14px", fontSize: 12, color: T.text.muted }}>{sub.date}</td>
                <td style={{ padding: "14px" }}><Badge variant={statusVariant[sub.status]}>{sub.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  )
}
