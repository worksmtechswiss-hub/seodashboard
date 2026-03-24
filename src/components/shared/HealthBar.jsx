import { T } from '../../utils/constants'

export function HealthBar({ value }) {
  const color = value >= 85 ? T.accent.emerald : value >= 70 ? T.accent.amber : T.accent.rose
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${color}, ${color}cc)`, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 28, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
