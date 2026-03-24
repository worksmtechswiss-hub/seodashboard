import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { T } from '../../utils/constants'

export function PositionChange({ current, previous }) {
  if (previous == null || current == null) return <span style={{ color: T.text.muted, fontSize: 12 }}>—</span>
  const diff = previous - current
  if (diff === 0) return <span style={{ color: T.text.muted, fontSize: 12 }}>—</span>
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      fontSize: 12, fontWeight: 600,
      color: diff > 0 ? T.accent.emerald : T.accent.rose,
    }}>
      {diff > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {Math.abs(diff)}
    </span>
  )
}
