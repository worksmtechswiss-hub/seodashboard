import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom'
import { T } from './utils/constants'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'
import { PageWrapper } from './components/layout/PageWrapper'
import { DashboardView } from './components/dashboard/DashboardView'
import { WebsitesView } from './components/websites/WebsitesView'
import { KeywordsView } from './components/keywords/KeywordsView'
import { FormsView } from './components/forms/FormsView'
import { AgentsView } from './components/agents/AgentsView'
import { CompetitorsView } from './components/competitors/CompetitorsView'
import { ReportsView } from './components/reports/ReportsView'
import { useAppStore } from './store/app-store'

function Layout() {
  const { sidebarCollapsed } = useAppStore()
  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, sans-serif",
      background: `linear-gradient(180deg, ${T.bg.deep} 0%, ${T.bg.base} 50%, ${T.bg.deep} 100%)`,
      color: T.text.primary, minHeight: '100vh', display: 'flex',
    }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: sidebarCollapsed ? 68 : 240, transition: 'margin-left 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
        <TopBar />
        <PageWrapper>
          <Outlet />
        </PageWrapper>
      </div>
    </div>
  )
}

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <DashboardView /> },
      { path: 'websites', element: <WebsitesView /> },
      { path: 'keywords', element: <KeywordsView /> },
      { path: 'forms', element: <FormsView /> },
      { path: 'agents', element: <AgentsView /> },
      { path: 'competitors', element: <CompetitorsView /> },
      { path: 'reports', element: <ReportsView /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
