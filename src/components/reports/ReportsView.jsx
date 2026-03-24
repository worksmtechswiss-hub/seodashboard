import { FileText } from 'lucide-react'
import { T } from '../../utils/constants'
import { GlassCard, Badge } from '../shared'

export function ReportsView() {
  const reports = [
    { name: "Weekly SEO Summary", schedule: "Every Monday 8:00 AM", lastRun: "Mar 17, 2026", type: "weekly", status: "active" },
    { name: "Monthly Rankings Report", schedule: "1st of every month", lastRun: "Mar 1, 2026", type: "monthly", status: "active" },
    { name: "Form Leads Digest", schedule: "Daily at 6:00 PM", lastRun: "Mar 23, 2026", type: "daily", status: "active" },
    { name: "Competitor Movement Alert", schedule: "When changes detected", lastRun: "Mar 22, 2026", type: "trigger", status: "active" },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {reports.map((r, i) => (
          <GlassCard key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${T.accent.indigo}20, ${T.accent.blue}10)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={20} color={T.accent.indigo} />
              </div>
              <Badge variant="success">{r.status}</Badge>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text.primary, marginBottom: 4 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: T.text.muted, marginBottom: 2 }}>{r.schedule}</div>
            <div style={{ fontSize: 11, color: T.text.muted, opacity: 0.7 }}>Last run: {r.lastRun}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button style={{ flex: 1, padding: "9px 0", borderRadius: 8, background: `${T.accent.indigo}15`, border: `1px solid ${T.accent.indigo}30`, color: T.accent.indigo, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Run Now</button>
              <button style={{ flex: 1, padding: "9px 0", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border.subtle}`, color: T.text.secondary, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Download</button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
