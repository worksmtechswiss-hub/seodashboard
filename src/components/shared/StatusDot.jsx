import { T } from '../../utils/constants'

const COLORS = { healthy: T.accent.emerald, warning: T.accent.amber, critical: T.accent.rose }

export function StatusDot({ status }) {
  const color = COLORS[status] ?? T.accent.emerald
  return (
    <span style={{
      width: 8, height: 8, borderRadius: '50%',
      background: color, boxShadow: `0 0 8px ${color}60`,
      display: 'inline-block',
    }} />
  )
}
