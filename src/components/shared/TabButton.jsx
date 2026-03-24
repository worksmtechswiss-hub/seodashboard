import { T } from '../../utils/constants'

export function TabButton({ active, children, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 16px', borderRadius: 10,
        background: active ? `linear-gradient(135deg, ${T.accent.indigo}20, ${T.accent.purple}10)` : 'transparent',
        border: active ? `1px solid ${T.accent.indigo}30` : '1px solid transparent',
        color: active ? T.text.accent : T.text.muted,
        fontSize: 13, fontWeight: active ? 600 : 500,
        cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap',
      }}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  )
}
