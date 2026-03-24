import { Bot, Wrench, TrendingUp, FileText, Eye, Star, Zap, Cpu, Activity, CheckCircle, RefreshCw, Clock } from 'lucide-react'
import { T } from '../../utils/constants'
import { aiAgentActions } from '../../utils/mock-data'
import { GlassCard, MetricCard, SectionHeader, Badge } from '../shared'

export function AgentsView() {
  const agentTypes = [
    { name: "Meta Optimizer", desc: "Auto-updates meta titles & descriptions for better CTR", icon: FileText, status: "active", sites: 34, actions: 156, color: T.accent.blue },
    { name: "Image SEO Agent", desc: "Adds alt text, compresses images, generates WebP", icon: Eye, status: "active", sites: 28, actions: 89, color: T.accent.purple },
    { name: "Link Doctor", desc: "Finds & fixes broken internal/external links", icon: Wrench, status: "active", sites: 42, actions: 234, color: T.accent.emerald },
    { name: "Content Scorer", desc: "Analyzes content quality and suggests improvements", icon: Star, status: "paused", sites: 0, actions: 0, color: T.accent.amber },
    { name: "Speed Optimizer", desc: "Optimizes page load speed via asset compression", icon: Zap, status: "active", sites: 15, actions: 67, color: T.accent.cyan },
    { name: "Schema Markup", desc: "Adds structured data (FAQ, Article, LocalBusiness)", icon: Cpu, status: "paused", sites: 0, actions: 0, color: T.accent.rose },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <MetricCard icon={Bot} label="Active Agents" value="4" color={T.accent.emerald} subtitle="Running across your sites" />
        <MetricCard icon={Wrench} label="Actions Today" value="47" change={23} changeType="up" color={T.accent.blue} subtitle="Auto-optimizations" />
        <MetricCard icon={TrendingUp} label="Estimated Impact" value="+2.4K" color={T.accent.purple} subtitle="Extra monthly clicks" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
        {agentTypes.map((agent, i) => {
          const Icon = agent.icon;
          return (
            <GlassCard key={i} glow={`${agent.color}20`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${agent.color}20, ${agent.color}08)`, border: `1px solid ${agent.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={22} color={agent.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.text.primary }}>{agent.name}</div>
                    <div style={{ fontSize: 12, color: T.text.muted, marginTop: 2 }}>{agent.desc}</div>
                  </div>
                </div>
                <Badge variant={agent.status === "active" ? "success" : "neutral"}>{agent.status}</Badge>
              </div>
              <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
                <div><div style={{ fontSize: 20, fontWeight: 700, color: T.text.primary }}>{agent.sites}</div><div style={{ fontSize: 11, color: T.text.muted }}>Sites connected</div></div>
                <div><div style={{ fontSize: 20, fontWeight: 700, color: T.text.primary }}>{agent.actions}</div><div style={{ fontSize: 11, color: T.text.muted }}>Actions taken</div></div>
              </div>
              <button style={{ width: "100%", padding: "10px 0", borderRadius: 10, background: agent.status === "active" ? "rgba(255,255,255,0.04)" : `${agent.color}15`, border: `1px solid ${agent.status === "active" ? T.border.subtle : `${agent.color}30`}`, color: agent.status === "active" ? T.text.secondary : agent.color, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {agent.status === "active" ? "View Activity" : "Activate Agent"}
              </button>
            </GlassCard>
          );
        })}
      </div>
      <GlassCard style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border.subtle}` }}>
          <SectionHeader icon={Activity} title="Agent Activity Log" subtitle="All automated actions" />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {aiAgentActions.map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 24px", borderBottom: `1px solid ${T.border.subtle}` }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: a.status === "completed" ? `${T.accent.emerald}12` : a.status === "in_progress" ? `${T.accent.blue}12` : `${T.accent.amber}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {a.status === "completed" ? <CheckCircle size={18} color={T.accent.emerald} /> : a.status === "in_progress" ? <RefreshCw size={18} color={T.accent.blue} /> : <Clock size={18} color={T.accent.amber} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text.primary }}>{a.action}</div>
                <div style={{ fontSize: 12, color: T.text.muted, marginTop: 2, display: "flex", gap: 12, alignItems: "center" }}>
                  <span>{a.domain}</span><span style={{ color: T.accent.emerald, fontWeight: 500 }}>{a.impact}</span>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: T.text.muted }}>{a.time}</div>
                {a.status === "pending_approval" && (
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <button style={{ padding: "5px 12px", borderRadius: 6, background: `${T.accent.emerald}15`, border: `1px solid ${T.accent.emerald}30`, color: T.accent.emerald, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Approve</button>
                    <button style={{ padding: "5px 12px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border.subtle}`, color: T.text.muted, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Dismiss</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
