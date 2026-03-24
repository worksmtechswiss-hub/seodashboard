// Design tokens — exact values from seo-command-center.jsx reference
export const T = {
  bg: {
    deep: '#06080d',
    base: '#0a0e1a',
    elevated: '#111827',
    card: '#151d2e',
    hover: '#1a2438',
  },
  border: {
    subtle: 'rgba(255,255,255,0.06)',
    medium: 'rgba(255,255,255,0.1)',
    accent: 'rgba(99,102,241,0.3)',
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    muted: '#64748b',
    accent: '#818cf8',
  },
  accent: {
    indigo: '#6366f1',
    blue: '#3b82f6',
    cyan: '#06b6d4',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    purple: '#a855f7',
  },
  glow: {
    indigo: 'rgba(99,102,241,0.15)',
    blue: 'rgba(59,130,246,0.12)',
    emerald: 'rgba(16,185,129,0.12)',
    rose: 'rgba(244,63,94,0.1)',
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 20 },
}

export const navItems = [
  { id: 'dashboard',   label: 'Dashboard',   path: '/' },
  { id: 'websites',    label: 'Websites',    path: '/websites' },
  { id: 'keywords',    label: 'Keywords',    path: '/keywords' },
  { id: 'forms',       label: 'Form Leads',  path: '/forms' },
  { id: 'agents',      label: 'AI Agents',   path: '/agents' },
  { id: 'competitors', label: 'Competitors', path: '/competitors' },
  { id: 'reports',     label: 'Reports',     path: '/reports' },
]

export const viewTitles = {
  dashboard:   { title: 'Dashboard',    subtitle: 'Cumulative overview across all websites' },
  websites:    { title: 'Websites',     subtitle: 'Track and manage all your properties' },
  keywords:    { title: 'Keywords',     subtitle: 'Monitor your search rankings' },
  forms:       { title: 'Form Leads',   subtitle: 'Formspree submissions and analytics' },
  agents:      { title: 'AI Agents',    subtitle: 'Automated SEO optimization' },
  competitors: { title: 'Competitors',  subtitle: 'Track your competition' },
  reports:     { title: 'Reports',      subtitle: 'Automated SEO reports' },
}
