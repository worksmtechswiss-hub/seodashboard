import { T } from '../../utils/constants'
import { formatNum } from '../../utils/formatters'

export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: T.bg.elevated, border: `1px solid ${T.border.medium}`,
      borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <p style={{ fontSize: 11, color: T.text.muted, margin: 0, marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color, margin: 0, marginTop: i > 0 ? 4 : 0 }}>
          {formatNum(p.value)}
        </p>
      ))}
    </div>
  )
}
