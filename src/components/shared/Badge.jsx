import { T } from '../../utils/constants'

const STYLES = {
  default: { bg: 'rgba(99,102,241,0.15)', color: T.accent.indigo, border: 'rgba(99,102,241,0.25)' },
  success: { bg: 'rgba(16,185,129,0.12)',  color: T.accent.emerald, border: 'rgba(16,185,129,0.2)' },
  warning: { bg: 'rgba(245,158,11,0.12)',  color: T.accent.amber,   border: 'rgba(245,158,11,0.2)' },
  danger:  { bg: 'rgba(244,63,94,0.12)',   color: T.accent.rose,    border: 'rgba(244,63,94,0.2)' },
  neutral: { bg: 'rgba(148,163,184,0.1)',  color: T.text.secondary, border: 'rgba(148,163,184,0.15)' },
}

export function Badge({ children, variant = 'default', size = 'sm' }) {
  const s = STYLES[variant] ?? STYLES.default
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: size === 'sm' ? '2px 8px' : '4px 12px',
      borderRadius: 6, fontSize: size === 'sm' ? 11 : 12, fontWeight: 600,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      letterSpacing: '0.02em', lineHeight: 1.4,
    }}>
      {children}
    </span>
  )
}
