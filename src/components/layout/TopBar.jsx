import { Search, Calendar, ChevronDown, Bell, Settings } from 'lucide-react'
import { T } from '../../utils/constants'
import { useAppStore } from '../../store/app-store'

export function TopBar() {
  const { searchQuery, setSearchQuery } = useAppStore()

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 32px',
      background: `${T.bg.base}ee`,
      borderBottom: `1px solid ${T.border.subtle}`,
      backdropFilter: 'blur(16px)',
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: T.bg.elevated, border: `1px solid ${T.border.subtle}`,
        borderRadius: 12, padding: '0 16px', width: 380,
      }}>
        <Search size={16} color={T.text.muted} />
        <input
          placeholder="Search websites, keywords, pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: T.text.primary, fontSize: 13, padding: '10px 0', width: '100%',
            fontFamily: 'inherit',
          }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 10,
          background: T.bg.elevated, border: `1px solid ${T.border.subtle}`,
          color: T.text.secondary, fontSize: 12, fontWeight: 500, cursor: 'pointer',
        }}>
          <Calendar size={14} />
          Last 30 days
          <ChevronDown size={13} />
        </button>
        <button style={{
          width: 38, height: 38, borderRadius: 10,
          background: T.bg.elevated, border: `1px solid ${T.border.subtle}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative',
        }}>
          <Bell size={16} color={T.text.secondary} />
          <div style={{
            position: 'absolute', top: 6, right: 6, width: 7, height: 7,
            borderRadius: '50%', background: T.accent.rose,
            boxShadow: `0 0 6px ${T.accent.rose}`,
          }} />
        </button>
        <button style={{
          width: 38, height: 38, borderRadius: 10,
          background: T.bg.elevated, border: `1px solid ${T.border.subtle}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <Settings size={16} color={T.text.secondary} />
        </button>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `linear-gradient(135deg, ${T.accent.indigo}, ${T.accent.purple})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff',
        }}>
          SM
        </div>
      </div>
    </div>
  )
}
