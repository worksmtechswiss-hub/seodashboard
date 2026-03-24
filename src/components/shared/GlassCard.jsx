import { T } from '../../utils/constants'

export function GlassCard({ children, style, onClick, glow }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${T.bg.card} 0%, rgba(15,23,42,0.95) 100%)`,
        border: `1px solid ${T.border.subtle}`,
        borderRadius: T.radius.lg,
        padding: 24,
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
        ...style,
      }}
    >
      {glow && (
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 120, height: 120,
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          borderRadius: '50%', pointerEvents: 'none', filter: 'blur(20px)',
        }} />
      )}
      {children}
    </div>
  )
}
