import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { LayoutDashboard, Globe, Target, Mail, Bot, Trophy, FileText } from 'lucide-react'
import { T, navItems } from '../../utils/constants'
import { useAppStore } from '../../store/app-store'
import { Badge } from '../shared'

const ICONS = {
  dashboard: LayoutDashboard,
  websites: Globe,
  keywords: Target,
  forms: Mail,
  agents: Bot,
  competitors: Trophy,
  reports: FileText,
}

export function Sidebar() {
  const { sidebarCollapsed: collapsed, setSidebarCollapsed: setCollapsed } = useAppStore()
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div style={{
      width: collapsed ? 68 : 240, minHeight: '100vh',
      background: `linear-gradient(180deg, ${T.bg.base} 0%, ${T.bg.deep} 100%)`,
      borderRight: `1px solid ${T.border.subtle}`,
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1)',
      position: 'fixed', left: 0, top: 0, zIndex: 50,
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 14px' : '20px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: `1px solid ${T.border.subtle}`,
        minHeight: 68,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `linear-gradient(135deg, ${T.accent.indigo}, ${T.accent.purple})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 16px ${T.accent.indigo}40`,
          flexShrink: 0,
        }}>
          <Zap size={20} color="#fff" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.text.primary, letterSpacing: '-0.02em', lineHeight: 1.2 }}>SEO Command</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.accent.indigo, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Center</div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <div style={{ padding: '12px 10px', flex: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path
          const Icon = ICONS[item.id]
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: collapsed ? '12px 14px' : '11px 14px',
                marginBottom: 2, borderRadius: 10, border: 'none',
                background: active
                  ? `linear-gradient(135deg, ${T.accent.indigo}18, ${T.accent.purple}08)`
                  : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              {active && (
                <div style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 20, borderRadius: 2,
                  background: `linear-gradient(180deg, ${T.accent.indigo}, ${T.accent.purple})`,
                }} />
              )}
              <Icon size={19} color={active ? T.accent.indigo : T.text.muted} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span style={{
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  color: active ? T.text.primary : T.text.muted,
                  whiteSpace: 'nowrap',
                }}>
                  {item.label}
                </span>
              )}
              {!collapsed && item.id === 'agents' && (
                <Badge variant="success" size="sm">3</Badge>
              )}
            </button>
          )
        })}
      </div>

      {/* Collapse toggle */}
      <div style={{ padding: '12px 10px', borderTop: `1px solid ${T.border.subtle}` }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 10, width: '100%', padding: '10px 14px', borderRadius: 10,
            background: 'transparent', border: 'none', cursor: 'pointer',
          }}
        >
          {collapsed ? <ChevronRight size={18} color={T.text.muted} /> : <ChevronLeft size={18} color={T.text.muted} />}
          {!collapsed && <span style={{ fontSize: 12, color: T.text.muted }}>Collapse</span>}
        </button>
      </div>
    </div>
  )
}
