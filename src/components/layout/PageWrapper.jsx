import { useLocation } from 'react-router-dom'
import { T, viewTitles } from '../../utils/constants'

export function PageWrapper({ children }) {
  const location = useLocation()
  const id = location.pathname.replace('/', '') || 'dashboard'
  const { title, subtitle } = viewTitles[id] ?? { title: id, subtitle: '' }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text.primary, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          {title}
        </h1>
        <p style={{ fontSize: 14, color: T.text.muted, marginTop: 4 }}>{subtitle}</p>
      </div>
      {children}
    </div>
  )
}
