import { useState, useRef, useEffect } from 'react'
import { Search, Calendar, ChevronDown, Bell, Settings } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { T } from '../../utils/constants'
import { useAppStore, dateRangeOptions } from '../../store/app-store'
import { checkAuthStatus, redirectToLogin } from '../../utils/auth'

export function TopBar() {
  const { searchQuery, setSearchQuery, dateRange, setDateRange } = useAppStore()
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dateDropdownOpen) return
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDateDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dateDropdownOpen])

  const activeDateLabel = dateRangeOptions.find((o) => o.days === dateRange)?.label || 'Last 30 Days'
  const { data: authenticated = false } = useQuery({
    queryKey: ['auth-status'],
    queryFn: checkAuthStatus,
    staleTime: 60_000,
    retry: false,
  })

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
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDateDropdownOpen((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10,
              background: T.bg.elevated, border: `1px solid ${dateDropdownOpen ? T.accent.indigo : T.border.subtle}`,
              color: T.text.secondary, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
          >
            <Calendar size={14} />
            {activeDateLabel}
            <ChevronDown size={13} style={{ transform: dateDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
          </button>
          {dateDropdownOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              background: T.bg.card, border: `1px solid ${T.border.medium}`,
              borderRadius: 10, padding: 4, minWidth: 170, zIndex: 100,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(16px)',
            }}>
              {dateRangeOptions.map((opt) => (
                <button
                  key={opt.days}
                  onClick={() => { setDateRange(opt.days); setDateDropdownOpen(false) }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '8px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                    border: 'none', cursor: 'pointer',
                    background: dateRange === opt.days ? `${T.accent.indigo}20` : 'transparent',
                    color: dateRange === opt.days ? T.accent.indigo : T.text.secondary,
                    transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={(e) => { if (dateRange !== opt.days) e.target.style.background = T.bg.hover }}
                  onMouseLeave={(e) => { if (dateRange !== opt.days) e.target.style.background = 'transparent' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
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
        {!authenticated && (
          <button
            onClick={redirectToLogin}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10,
              background: `linear-gradient(135deg, ${T.accent.indigo}, ${T.accent.purple})`,
              border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Connect Google
          </button>
        )}
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
