import { T } from '../../utils/constants'

export function SectionHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${T.accent.indigo}20, ${T.accent.purple}10)`,
          border: `1px solid ${T.accent.indigo}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={T.accent.indigo} />
        </div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text.primary, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 12, color: T.text.muted, margin: 0, marginTop: 2 }}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
