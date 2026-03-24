import { T } from '../../utils/constants'
import { formatNum } from '../../utils/formatters'
import { competitors } from '../../utils/mock-data'
import { GlassCard, Badge } from '../shared'

export function CompetitorsView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {competitors.map((comp, i) => (
          <GlassCard key={i} glow={i === 0 ? T.glow.rose : undefined}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text.primary }}>{comp.domain}</div>
                <div style={{ fontSize: 12, color: T.text.muted, marginTop: 2 }}>{comp.overlap}% keyword overlap</div>
              </div>
              <Badge variant={comp.trend === "up" ? "danger" : comp.trend === "down" ? "success" : "neutral"}>
                {comp.trend === "up" ? "Growing" : comp.trend === "down" ? "Declining" : "Stable"}
              </Badge>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
              <div><div style={{ fontSize: 18, fontWeight: 700, color: T.text.primary }}>{formatNum(comp.keywords)}</div><div style={{ fontSize: 11, color: T.text.muted }}>Keywords</div></div>
              <div><div style={{ fontSize: 18, fontWeight: 700, color: T.text.primary }}>{comp.avgPosition}</div><div style={{ fontSize: 11, color: T.text.muted }}>Avg Pos</div></div>
              <div><div style={{ fontSize: 18, fontWeight: 700, color: T.text.primary }}>{formatNum(comp.traffic)}</div><div style={{ fontSize: 11, color: T.text.muted }}>Est. Traffic</div></div>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ width: `${comp.overlap}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${T.accent.indigo}, ${T.accent.purple})` }} />
            </div>
            <button style={{ width: "100%", padding: "10px 0", borderRadius: 10, marginTop: 16, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border.subtle}`, color: T.text.secondary, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              View Keyword Gap Analysis
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
