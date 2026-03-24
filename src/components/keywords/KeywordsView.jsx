import { useState } from 'react'
import { Layers, Trophy, Sparkles, AlertTriangle } from 'lucide-react'
import { T } from '../../utils/constants'
import { formatNum } from '../../utils/formatters'
import { keywords } from '../../utils/mock-data'
import { GlassCard, TabButton, PositionChange } from '../shared'

export function KeywordsView() {
  const [tab, setTab] = useState("all");
  const filtered = tab === "all" ? keywords
    : tab === "top3" ? keywords.filter(k => k.position <= 3)
    : tab === "opportunity" ? keywords.filter(k => k.position > 5 && k.position <= 20)
    : keywords.filter(k => k.position > 20);

  const difficultyColor = (d) => d <= 40 ? T.accent.emerald : d <= 60 ? T.accent.amber : T.accent.rose;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GlassCard glow={T.glow.blue} style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <TabButton active={tab === "all"} onClick={() => setTab("all")} icon={Layers}>All Keywords ({keywords.length})</TabButton>
          <TabButton active={tab === "top3"} onClick={() => setTab("top3")} icon={Trophy}>Top 3</TabButton>
          <TabButton active={tab === "opportunity"} onClick={() => setTab("opportunity")} icon={Sparkles}>Opportunities</TabButton>
          <TabButton active={tab === "low"} onClick={() => setTab("low")} icon={AlertTriangle}>Needs Work</TabButton>
        </div>
      </GlassCard>
      <GlassCard style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Keyword","Position","Change","Volume","Clicks","Impressions","Difficulty","URL"].map((h, i) => (
                <th key={h} style={{ padding: i === 0 ? "14px 14px 14px 24px" : "14px", fontSize: 11, fontWeight: 600, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: i === 0 ? "left" : i >= 3 ? "right" : "center", borderBottom: `1px solid ${T.border.subtle}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((kw, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${T.border.subtle}` }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "14px 14px 14px 24px", fontSize: 13, fontWeight: 500, color: T.text.primary }}>{kw.keyword}</td>
                <td style={{ padding: "14px", textAlign: "center" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: kw.position <= 3 ? `${T.accent.emerald}15` : kw.position <= 10 ? `${T.accent.blue}15` : `${T.accent.amber}15`, fontSize: 13, fontWeight: 700, color: kw.position <= 3 ? T.accent.emerald : kw.position <= 10 ? T.accent.blue : T.accent.amber }}>{kw.position}</span>
                </td>
                <td style={{ padding: "14px", textAlign: "center" }}><PositionChange current={kw.position} previous={kw.prevPosition} /></td>
                <td style={{ padding: "14px", textAlign: "right", fontSize: 13, color: T.text.secondary }}>{formatNum(kw.volume)}</td>
                <td style={{ padding: "14px", textAlign: "right", fontSize: 13, fontWeight: 600, color: T.text.primary }}>{formatNum(kw.clicks)}</td>
                <td style={{ padding: "14px", textAlign: "right", fontSize: 13, color: T.text.secondary }}>{formatNum(kw.impressions)}</td>
                <td style={{ padding: "14px", textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <div style={{ width: 40, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{ width: `${kw.difficulty}%`, height: "100%", borderRadius: 3, background: difficultyColor(kw.difficulty) }} />
                    </div>
                    <span style={{ fontSize: 11, color: difficultyColor(kw.difficulty), fontWeight: 600, minWidth: 20 }}>{kw.difficulty}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 24px 14px 14px", fontSize: 12, color: T.accent.indigo, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{kw.url}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
