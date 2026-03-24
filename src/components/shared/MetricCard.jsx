import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { T } from '../../utils/constants'
import { GlassCard } from './GlassCard'

export function MetricCard({ icon: Icon, label, value, change, changeType, subtitle, color = T.accent.indigo, glowColor }) {
  return (
    <GlassCard glow={glowColor || `${color}33`} style={{ flex: 1, minWidth: 200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: `linear-gradient(135deg, ${color}22, ${color}08)`,
          border: `1px solid ${color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
        {change !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: changeType === 'up' ? T.accent.emerald : T.accent.rose }}>
            {changeType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change}%
          </div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: T.text.primary, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 13, color: T.text.muted, marginTop: 4 }}>{label}</div>
      {subtitle && <div style={{ fontSize: 11, color: T.text.muted, marginTop: 2, opacity: 0.7 }}>{subtitle}</div>}
    </GlassCard>
  )
}
