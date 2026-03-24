# SEO Command Center — Phase 1: UI Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a fully working React dashboard with all 7 views and mock data — runnable at localhost:5173 and deployable to Netlify with zero backend.

**Architecture:** React 18 + Vite 5, all styling via inline CSS-in-JS (object styles on `style` prop, no Tailwind), hash-based routing so Netlify SPA works without redirects config. All data comes from `mock-data.js` — TanStack Query is wired but resolves synchronously so Phase 2 only needs to swap the `queryFn`.

**Tech Stack:** React 18, Vite 5, Recharts, Lucide React, Zustand, TanStack Query v5, React Router v7 (createHashRouter), date-fns, Vitest + @testing-library/react

---

> **Note:** Phases 2 (Netlify Functions + Google APIs) and 3 (GitHub API agents) are separate plans, to be written after Phase 1 is deployed.

> **Reference files in project root:**
> - `seo-command-center.jsx` — visual reference with all mock data + component markup (copy from conversation if not present)
> - `CLAUDE.md` — architecture reference

---

## File Map

| File | Responsibility |
|---|---|
| `package.json` | Dependencies + scripts |
| `vite.config.js` | Vite config (React plugin, port 5173) |
| `index.html` | Entry point, dark bg, Inter font import |
| `netlify.toml` | Build config (no redirects — hash routing) |
| `src/main.jsx` | ReactDOM root, QueryClientProvider |
| `src/App.jsx` | createHashRouter, all 7 routes |
| `src/utils/constants.js` | T design tokens object, navItems array |
| `src/utils/formatters.js` | formatNum(n), formatDate(str) |
| `src/utils/mock-data.js` | websites[], keywords[], formSubmissions[], aiAgentActions[], competitors[], clicksData[], impressionsData[], formsByDay[], formsBySite[] |
| `src/utils/seo-scoring.js` | calculateHealthScore(checks) |
| `src/store/app-store.js` | Zustand: sidebarCollapsed, searchQuery |
| `src/components/shared/Badge.jsx` | Coloured pill label (variant: default/success/warning/danger/neutral) |
| `src/components/shared/GlassCard.jsx` | Dark glassmorphism card wrapper |
| `src/components/shared/MetricCard.jsx` | Icon + big number + label + change % |
| `src/components/shared/HealthBar.jsx` | Coloured progress bar 0–100 |
| `src/components/shared/StatusDot.jsx` | Glowing coloured dot (healthy/warning/critical) |
| `src/components/shared/SectionHeader.jsx` | Icon + title + subtitle + optional action slot |
| `src/components/shared/TabButton.jsx` | Active/inactive tab pill button |
| `src/components/shared/ChartTooltip.jsx` | Recharts custom tooltip |
| `src/components/shared/PositionChange.jsx` | Arrow + number for keyword position delta |
| `src/components/layout/Sidebar.jsx` | Collapsible left nav with 7 items |
| `src/components/layout/TopBar.jsx` | Search input + date picker + bell + settings + avatar |
| `src/components/layout/PageWrapper.jsx` | Page title + subtitle header above view content |
| `src/components/dashboard/DashboardView.jsx` | 6 metric cards + 2 area charts + agent feed + top 5 keywords |
| `src/components/websites/WebsitesView.jsx` | Sortable table of all 10 websites |
| `src/components/keywords/KeywordsView.jsx` | 4-tab filtered keyword table |
| `src/components/forms/FormsView.jsx` | 4 metric cards + bar + pie charts + submissions table |
| `src/components/agents/AgentsView.jsx` | 6 agent cards + activity log with Approve/Dismiss |
| `src/components/competitors/CompetitorsView.jsx` | 4 competitor cards with overlap bar |
| `src/components/reports/ReportsView.jsx` | 4 scheduled report cards |

---

## Task 1: Project Bootstrap

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `netlify.toml`
- Create: `src/main.jsx`
- Create: `.gitignore`

- [ ] **Step 1: Scaffold Vite project**

```bash
cd "/Users/lukas/Claude_Projects/SEO Dashboard"
npm create vite@latest . -- --template react
```

When prompted "Current directory is not empty. Remove existing files and continue?" — choose **Ignore files and continue** (preserves `docs/` and `CLAUDE.md`).

- [ ] **Step 2: Install dependencies**

```bash
npm install recharts lucide-react zustand @tanstack/react-query react-router-dom date-fns
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitest/coverage-v8
```

- [ ] **Step 3: Update `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.js'],
  },
})
```

- [ ] **Step 4: Create `src/test-setup.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Update `index.html`** to set dark background and load Inter font

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SEO Command Center</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #06080d; font-family: 'Inter', -apple-system, sans-serif; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      button { font-family: inherit; cursor: pointer; }
      input { font-family: inherit; }
      table { font-variant-numeric: tabular-nums; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

# No [[redirects]] needed — app uses hash routing (createHashRouter)
```

- [ ] **Step 7: Update `package.json` scripts** to add test script

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```

Expected: `VITE v5.x.x  ready in Xms` and `Local: http://localhost:5173/`

- [ ] **Step 9: Commit**

```bash
git init
git add package.json package-lock.json vite.config.js index.html netlify.toml src/test-setup.js .gitignore
git commit -m "feat: bootstrap React + Vite project with test infrastructure"
```

---

## Task 2: Design Tokens, Formatters, Health Score

**Files:**
- Create: `src/utils/constants.js`
- Create: `src/utils/formatters.js`
- Create: `src/utils/seo-scoring.js`
- Create: `src/utils/__tests__/formatters.test.js`
- Create: `src/utils/__tests__/seo-scoring.test.js`

- [ ] **Step 1: Write failing tests for `formatNum`**

```js
// src/utils/__tests__/formatters.test.js
import { describe, it, expect } from 'vitest'
import { formatNum } from '../formatters'

describe('formatNum', () => {
  it('returns raw number as string for values under 1000', () => {
    expect(formatNum(999)).toBe('999')
  })
  it('formats thousands with K suffix', () => {
    expect(formatNum(1500)).toBe('1.5K')
  })
  it('formats millions with M suffix', () => {
    expect(formatNum(2400000)).toBe('2.4M')
  })
  it('handles zero', () => {
    expect(formatNum(0)).toBe('0')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test
```

Expected: FAIL — `formatNum` not found

- [ ] **Step 3: Create `src/utils/formatters.js`**

```js
export const formatNum = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
}
```

- [ ] **Step 4: Run tests — confirm pass**

```bash
npm test
```

Expected: PASS (4 tests)

- [ ] **Step 5: Write failing tests for `calculateHealthScore`**

```js
// src/utils/__tests__/seo-scoring.test.js
import { describe, it, expect } from 'vitest'
import { calculateHealthScore } from '../seo-scoring'

describe('calculateHealthScore', () => {
  it('returns 100 for a perfect site', () => {
    expect(calculateHealthScore({})).toBe(100)
  })
  it('deducts 10 for missing description', () => {
    expect(calculateHealthScore({ missingDescription: true })).toBe(90)
  })
  it('caps category at 0 — meta category cannot go below 0', () => {
    // All meta issues: -10 -8 -7 = -25, category floors at 0
    const score = calculateHealthScore({ missingDescription: true, badTitleLength: true, badDescLength: true })
    expect(score).toBe(75) // meta: 0, others: 25 each
  })
  it('only one pageSpeed deduction applies (low takes precedence)', () => {
    const low = calculateHealthScore({ pageSpeedLow: true })
    const medium = calculateHealthScore({ pageSpeedMedium: true })
    expect(low).toBe(85)   // -15
    expect(medium).toBe(92) // -8 (but not both)
  })
  it('returns 0 for a fully broken site', () => {
    const score = calculateHealthScore({
      missingDescription: true, badTitleLength: true, badDescLength: true,
      pageSpeedLow: true, highCLS: true,
      missingAltTags: true, brokenLinks: true, missingH1: true,
      noSitemap: true, noRobotsTxt: true, notHttps: true,
    })
    expect(score).toBe(0)
  })
})
```

- [ ] **Step 6: Run tests — confirm they fail**

```bash
npm test
```

Expected: FAIL

- [ ] **Step 7: Create `src/utils/seo-scoring.js`**

```js
export function calculateHealthScore(checks = {}) {
  const categories = {
    meta: Math.max(0,
      25
      - (checks.missingDescription ? 10 : 0)
      - (checks.badTitleLength ? 8 : 0)
      - (checks.badDescLength ? 7 : 0)
    ),
    performance: Math.max(0,
      25
      - (checks.pageSpeedLow ? 15 : 0)
      - (checks.pageSpeedMedium ? 8 : 0)
      - (checks.highCLS ? 10 : 0)
    ),
    content: Math.max(0,
      25
      - (checks.missingAltTags ? 10 : 0)
      - (checks.brokenLinks ? 8 : 0)
      - (checks.missingH1 ? 7 : 0)
    ),
    technical: Math.max(0,
      25
      - (checks.noSitemap ? 8 : 0)
      - (checks.noRobotsTxt ? 5 : 0)
      - (checks.notHttps ? 12 : 0)
    ),
  }
  return Object.values(categories).reduce((a, b) => a + b, 0)
}

// Derived status from score
export function healthStatus(score) {
  if (score >= 85) return 'healthy'
  if (score >= 70) return 'warning'
  return 'critical'
}
```

- [ ] **Step 8: Run tests — confirm all pass**

```bash
npm test
```

Expected: PASS (all tests)

- [ ] **Step 9: Create `src/utils/constants.js`**

```js
// Design tokens — exact values from seo-command-center.jsx reference
export const T = {
  bg: { deep: '#06080d', base: '#0a0e1a', elevated: '#111827', card: '#151d2e', hover: '#1a2438' },
  border: { subtle: 'rgba(255,255,255,0.06)', medium: 'rgba(255,255,255,0.1)', accent: 'rgba(99,102,241,0.3)' },
  text: { primary: '#f1f5f9', secondary: '#94a3b8', muted: '#64748b', accent: '#818cf8' },
  accent: { indigo: '#6366f1', blue: '#3b82f6', cyan: '#06b6d4', emerald: '#10b981', amber: '#f59e0b', rose: '#f43f5e', purple: '#a855f7' },
  glow: { indigo: 'rgba(99,102,241,0.15)', blue: 'rgba(59,130,246,0.12)', emerald: 'rgba(16,185,129,0.12)', rose: 'rgba(244,63,94,0.1)' },
  radius: { sm: 8, md: 12, lg: 16, xl: 20 },
}

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/' },
  { id: 'websites', label: 'Websites', path: '/websites' },
  { id: 'keywords', label: 'Keywords', path: '/keywords' },
  { id: 'forms', label: 'Form Leads', path: '/forms' },
  { id: 'agents', label: 'AI Agents', path: '/agents' },
  { id: 'competitors', label: 'Competitors', path: '/competitors' },
  { id: 'reports', label: 'Reports', path: '/reports' },
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
```

- [ ] **Step 10: Commit**

```bash
git add src/utils/
git commit -m "feat: add design tokens, formatters, and health score algorithm with tests"
```

---

## Task 3: Mock Data

**Files:**
- Create: `src/utils/mock-data.js`

- [ ] **Step 1: Confirm `seo-command-center.jsx` is in the project root**

```bash
ls "/Users/lukas/Claude_Projects/SEO Dashboard/seo-command-center.jsx"
```

Expected: file exists. If it does not exist, retrieve it from the conversation that started this project and write it to that path before continuing. The mock data in Step 2 is copied verbatim from that file.

- [ ] **Step 2: Create `src/utils/mock-data.js`**

Copy all mock arrays verbatim from `seo-command-center.jsx`. The file should export:

```js
// Helper
const generateTrend = (base, variance, days = 30) =>
  Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    value: Math.max(0, base + Math.floor(Math.random() * variance - variance / 3) + i * (variance / days / 2)),
  }))

export const websites = [ /* 10 items — copy from reference */ ]
export const keywords = [ /* 10 items — copy from reference */ ]
export const formSubmissions = [ /* 6 items — copy from reference */ ]
export const aiAgentActions = [ /* 6 items — copy from reference */ ]
export const competitors = [ /* 4 items — copy from reference */ ]
export const clicksData = generateTrend(3200, 800)
export const impressionsData = generateTrend(85000, 15000)
export const formsByDay = [
  { day: 'Mon', count: 12 }, { day: 'Tue', count: 18 }, { day: 'Wed', count: 9 },
  { day: 'Thu', count: 24 }, { day: 'Fri', count: 15 }, { day: 'Sat', count: 6 }, { day: 'Sun', count: 3 },
]
export const formsBySite = websites.slice(0, 6).map(w => ({ name: w.domain.split('.')[0], value: w.forms }))
```

**Reference:** Open `seo-command-center.jsx` in the project root, find the `// ─── Mock Data ───` section, and copy all arrays exactly.

- [ ] **Step 3: Verify exports are correct**

Start the dev server and open the browser console at `http://localhost:5173`:

```js
// Paste into browser console after dev server starts (Task 7)
// For now, just confirm the file has no syntax errors:
```

```bash
node --input-type=module <<'EOF'
import { websites, keywords } from './src/utils/mock-data.js'
console.log(websites.length, keywords.length)
EOF
```

Expected output: `10 10`

- [ ] **Step 3: Commit**

```bash
git add src/utils/mock-data.js
git commit -m "feat: add mock data (websites, keywords, forms, agents, competitors)"
```

---

## Task 4: Zustand Store

**Files:**
- Create: `src/store/app-store.js`

- [ ] **Step 1: Create `src/store/app-store.js`**

```js
import { create } from 'zustand'

export const useAppStore = create((set) => ({
  sidebarCollapsed: false,
  searchQuery: '',
  setSidebarCollapsed: (val) => set({ sidebarCollapsed: val }),
  setSearchQuery: (val) => set({ searchQuery: val }),
}))
```

- [ ] **Step 2: Commit**

```bash
git add src/store/app-store.js
git commit -m "feat: add Zustand store for sidebar and search state"
```

---

## Task 5: Shared Components

**Files:**
- Create: `src/components/shared/Badge.jsx`
- Create: `src/components/shared/GlassCard.jsx`
- Create: `src/components/shared/MetricCard.jsx`
- Create: `src/components/shared/HealthBar.jsx`
- Create: `src/components/shared/StatusDot.jsx`
- Create: `src/components/shared/SectionHeader.jsx`
- Create: `src/components/shared/TabButton.jsx`
- Create: `src/components/shared/ChartTooltip.jsx`
- Create: `src/components/shared/PositionChange.jsx`
- Create: `src/components/shared/index.js`

**Source:** All components are ported 1:1 from `seo-command-center.jsx`. Find the `// ─── Utility Components ───` section.

- [ ] **Step 1: Create `src/components/shared/Badge.jsx`**

```jsx
import { T } from '../../utils/constants'

const STYLES = {
  default: { bg: 'rgba(99,102,241,0.15)', color: T.accent.indigo, border: 'rgba(99,102,241,0.25)' },
  success: { bg: 'rgba(16,185,129,0.12)',  color: T.accent.emerald, border: 'rgba(16,185,129,0.2)' },
  warning: { bg: 'rgba(245,158,11,0.12)',  color: T.accent.amber,   border: 'rgba(245,158,11,0.2)' },
  danger:  { bg: 'rgba(244,63,94,0.12)',   color: T.accent.rose,    border: 'rgba(244,63,94,0.2)' },
  neutral: { bg: 'rgba(148,163,184,0.1)',  color: T.text.secondary, border: 'rgba(148,163,184,0.15)' },
}

export function Badge({ children, variant = 'default', size = 'sm' }) {
  const s = STYLES[variant] ?? STYLES.default
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: size === 'sm' ? '2px 8px' : '4px 12px',
      borderRadius: 6, fontSize: size === 'sm' ? 11 : 12, fontWeight: 600,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      letterSpacing: '0.02em', lineHeight: 1.4,
    }}>
      {children}
    </span>
  )
}
```

- [ ] **Step 2: Create `src/components/shared/GlassCard.jsx`**

```jsx
import { T } from '../../utils/constants'

export function GlassCard({ children, style, onClick, glow }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${T.bg.card} 0%, rgba(15,23,42,0.95) 100%)`,
        border: `1px solid ${T.border.subtle}`,
        borderRadius: T.radius.lg,
        padding: 24,
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
        ...style,
      }}
    >
      {glow && (
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 120, height: 120,
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          borderRadius: '50%', pointerEvents: 'none', filter: 'blur(20px)',
        }} />
      )}
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/shared/MetricCard.jsx`**

```jsx
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { T } from '../../utils/constants'
import { GlassCard } from './GlassCard'

export function MetricCard({ icon: Icon, label, value, change, changeType, subtitle, color = T.accent.indigo, glowColor }) {
  return (
    <GlassCard glow={glowColor || `${color}33`} style={{ flex: 1, minWidth: 200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: `linear-gradient(135deg, ${color}22, ${color}08)`,
          border: `1px solid ${color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
        {change !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: changeType === 'up' ? T.accent.emerald : T.accent.rose }}>
            {changeType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change}%
          </div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: T.text.primary, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 13, color: T.text.muted, marginTop: 4 }}>{label}</div>
      {subtitle && <div style={{ fontSize: 11, color: T.text.muted, marginTop: 2, opacity: 0.7 }}>{subtitle}</div>}
    </GlassCard>
  )
}
```

- [ ] **Step 4: Create `src/components/shared/HealthBar.jsx`**

```jsx
import { T } from '../../utils/constants'

export function HealthBar({ value }) {
  const color = value >= 85 ? T.accent.emerald : value >= 70 ? T.accent.amber : T.accent.rose
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${color}, ${color}cc)`, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 28, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/components/shared/StatusDot.jsx`**

```jsx
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
```

- [ ] **Step 6: Create `src/components/shared/SectionHeader.jsx`**

```jsx
import { T } from '../../utils/constants'

export function SectionHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${T.accent.indigo}20, ${T.accent.purple}10)`,
          border: `1px solid ${T.accent.indigo}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={T.accent.indigo} />
        </div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text.primary, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 12, color: T.text.muted, margin: 0, marginTop: 2 }}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
```

- [ ] **Step 7: Create `src/components/shared/TabButton.jsx`**

```jsx
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
```

- [ ] **Step 8: Create `src/components/shared/ChartTooltip.jsx`**

```jsx
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
```

- [ ] **Step 9: Create `src/components/shared/PositionChange.jsx`**

```jsx
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { T } from '../../utils/constants'

export function PositionChange({ current, previous }) {
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
```

- [ ] **Step 10: Create `src/components/shared/index.js`** barrel export

```js
export { Badge } from './Badge'
export { GlassCard } from './GlassCard'
export { MetricCard } from './MetricCard'
export { HealthBar } from './HealthBar'
export { StatusDot } from './StatusDot'
export { SectionHeader } from './SectionHeader'
export { TabButton } from './TabButton'
export { ChartTooltip } from './ChartTooltip'
export { PositionChange } from './PositionChange'
```

- [ ] **Step 11: Commit**

```bash
git add src/components/shared/
git commit -m "feat: add all shared UI components (Badge, GlassCard, MetricCard, etc.)"
```

---

## Task 6: Layout Components

**Files:**
- Create: `src/components/layout/Sidebar.jsx`
- Create: `src/components/layout/TopBar.jsx`
- Create: `src/components/layout/PageWrapper.jsx`

- [ ] **Step 1: Create `src/components/layout/Sidebar.jsx`**

Port verbatim from the `Sidebar` component in `seo-command-center.jsx`. Key changes:
- Replace `activeView` prop + `setActiveView` with React Router `<NavLink>` or `useNavigate`
- Use `useAppStore` for `sidebarCollapsed` / `setSidebarCollapsed`
- Use `useLocation` to determine active nav item (match `item.path` against current pathname)

```jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { LayoutDashboard, Globe, Target, Mail, Bot, Trophy, FileText } from 'lucide-react'
import { T, navItems } from '../../utils/constants'
import { useAppStore } from '../../store/app-store'
import { Badge } from '../shared'

const ICONS = { dashboard: LayoutDashboard, websites: Globe, keywords: Target, forms: Mail, agents: Bot, competitors: Trophy, reports: FileText }

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore()
  const location = useLocation()
  const navigate = useNavigate()
  const collapsed = sidebarCollapsed

  // ... rest of component ported from reference, replacing activeView checks with location.pathname
}
```

Full implementation reference: `Sidebar` component in `seo-command-center.jsx`.

- [ ] **Step 2: Create `src/components/layout/TopBar.jsx`**

Port verbatim from `TopBar` in `seo-command-center.jsx`. Use `useAppStore` for `searchQuery` / `setSearchQuery`.

- [ ] **Step 3: Create `src/components/layout/PageWrapper.jsx`**

```jsx
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
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/
git commit -m "feat: add layout components (Sidebar, TopBar, PageWrapper)"
```

---

## Task 7: App Shell + Router

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Update `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, gcTime: 300_000, retry: false },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)
```

- [ ] **Step 2: Update `src/App.jsx`** with hash router and all 7 routes

```jsx
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
```

- [ ] **Step 3: Create stub view files** so the app compiles before views are built

For each view, create a minimal stub:

```jsx
// src/components/dashboard/DashboardView.jsx
export function DashboardView() { return <div style={{ color: '#f1f5f9' }}>Dashboard — coming soon</div> }
```

Repeat for: `WebsitesView`, `KeywordsView`, `FormsView`, `AgentsView`, `CompetitorsView`, `ReportsView`.

- [ ] **Step 4: Run dev server and verify all routes load**

```bash
npm run dev
```

Open http://localhost:5173 — expect the app shell (sidebar + topbar + stub content) to render. Navigate to `/#/websites`, `/#/keywords`, etc. — each should show a stub without errors.

- [ ] **Step 5: Commit**

```bash
git add src/main.jsx src/App.jsx src/components/dashboard/ src/components/websites/ src/components/keywords/ src/components/forms/ src/components/agents/ src/components/competitors/ src/components/reports/
git commit -m "feat: wire up hash router with app shell and stub views"
```

---

## Task 8: Dashboard View

**Files:**
- Modify: `src/components/dashboard/DashboardView.jsx`

Port verbatim from `DashboardView` in `seo-command-center.jsx`. Replace all inline imports with named imports from `../../utils/`.

- [ ] **Step 1: Implement `DashboardView.jsx`**

Key sections to build (in order):
1. Import from `mock-data.js`: `websites`, `keywords`, `clicksData`, `impressionsData`, `aiAgentActions`
2. Compute aggregates: `totalClicks`, `totalImpressions`, `avgCTR`, `avgPosition`, `totalForms`, `healthyCount`
3. 6 MetricCards in a CSS grid (`gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))"`)
4. 2 AreaCharts side-by-side (Recharts `AreaChart` with gradient fill — copy `<defs>` block from reference)
5. Agent activity feed (4 most recent `aiAgentActions`)
6. Top 5 keywords list

Full source is in `seo-command-center.jsx` → `DashboardView` function.

- [ ] **Step 2: Visual verify in browser**

Navigate to `http://localhost:5173/#/` — expect:
- 6 metric cards across top row
- 2 area charts side by side
- Agent activity feed (4 items with coloured status icons)
- Top 5 keywords list with position numbers and change arrows

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/DashboardView.jsx
git commit -m "feat: implement Dashboard view with metrics, charts, agent feed, and keywords"
```

---

## Task 9: Websites View

**Files:**
- Modify: `src/components/websites/WebsitesView.jsx`

Port verbatim from `WebsitesView` in `seo-command-center.jsx`.

- [ ] **Step 1: Implement `WebsitesView.jsx`**

Key features:
- `useState` for `sortBy` (default: `'clicks'`) and `sortDir` (default: `'desc'`)
- `useMemo` for filtered + sorted list (filter by `searchQuery` from `useAppStore`)
- Sortable column headers with chevron indicator
- Table rows with `Globe` icon, `HealthBar`, `StatusDot`
- "Add Website" button (no-op for Phase 1)
- "Export" button (no-op for Phase 1)

- [ ] **Step 2: Visual verify**

Navigate to `/#/websites` — expect sortable table of 10 websites. Click column headers to sort. Type in the top search bar to filter by domain name.

- [ ] **Step 3: Commit**

```bash
git add src/components/websites/WebsitesView.jsx
git commit -m "feat: implement Websites view with sortable table and search filtering"
```

---

## Task 10: Keywords View

**Files:**
- Modify: `src/components/keywords/KeywordsView.jsx`

Port verbatim from `KeywordsView` in `seo-command-center.jsx`.

- [ ] **Step 1: Implement `KeywordsView.jsx`**

Key features:
- `useState` for `tab` (default: `'all'`)
- Tab filter logic:
  - `all` → all keywords
  - `top3` → `position <= 3`
  - `opportunity` → `position > 5 && position <= 20`
  - `low` → `position > 20`
- Difficulty bar (mini coloured progress bar + number)
- `PositionChange` component for position delta

- [ ] **Step 2: Visual verify**

Navigate to `/#/keywords`. Click through all 4 tabs to confirm correct filtering. Check that position numbers are colour-coded (green ≤ 3, blue ≤ 10, amber > 10).

- [ ] **Step 3: Commit**

```bash
git add src/components/keywords/KeywordsView.jsx
git commit -m "feat: implement Keywords view with 4-tab filtering and difficulty bars"
```

---

## Task 11: Forms View

**Files:**
- Modify: `src/components/forms/FormsView.jsx`

Port verbatim from `FormsView` in `seo-command-center.jsx`.

- [ ] **Step 1: Implement `FormsView.jsx`**

Key sections:
1. 4 MetricCards (Total Submissions, New, Contacted, Converted) — hardcoded from mock for Phase 1
2. Bar chart (submissions by day) — uses `formsByDay` from `mock-data.js`
3. Pie chart (leads by site) — uses `formsBySite` from `mock-data.js`, 6 COLORS array
4. Submissions table with `Badge` status indicators

- [ ] **Step 2: Visual verify**

Navigate to `/#/forms`. Confirm 4 metric cards, bar chart, pie chart with legend, and submissions table render correctly.

- [ ] **Step 3: Commit**

```bash
git add src/components/forms/FormsView.jsx
git commit -m "feat: implement Forms view with charts and submissions table"
```

---

## Task 12: AI Agents View

**Files:**
- Modify: `src/components/agents/AgentsView.jsx`

Port verbatim from `AgentsView` in `seo-command-center.jsx`.

- [ ] **Step 1: Implement `AgentsView.jsx`**

Key sections:
1. 3 MetricCards (Active Agents, Actions Today, Estimated Impact)
2. 6 agent cards in CSS grid — each with `active`/`paused` badge, stats, and button
3. Activity log table — each row shows status icon, action text, impact, timestamp, and Approve/Dismiss buttons for `pending_approval` items

Approve/Dismiss buttons: no-op click handlers for Phase 1 (console.log is fine).

- [ ] **Step 2: Visual verify**

Navigate to `/#/agents`. Confirm 6 agent cards render with correct colours and status badges. Confirm activity log shows Approve/Dismiss buttons for pending items.

- [ ] **Step 3: Commit**

```bash
git add src/components/agents/AgentsView.jsx
git commit -m "feat: implement AI Agents view with agent cards and activity log"
```

---

## Task 13: Competitors View

**Files:**
- Modify: `src/components/competitors/CompetitorsView.jsx`

Port verbatim from `CompetitorsView` in `seo-command-center.jsx`.

- [ ] **Step 1: Implement `CompetitorsView.jsx`**

Key features:
- 4 competitor cards in CSS grid
- Keyword overlap progress bar
- "Growing"/"Declining"/"Stable" badge (danger/success/neutral variant)
- "View Keyword Gap Analysis" button (no-op Phase 1)

- [ ] **Step 2: Visual verify**

Navigate to `/#/competitors`. Confirm 4 cards with correct badge variants.

- [ ] **Step 3: Commit**

```bash
git add src/components/competitors/CompetitorsView.jsx
git commit -m "feat: implement Competitors view with overlap cards"
```

---

## Task 14: Reports View

**Files:**
- Modify: `src/components/reports/ReportsView.jsx`

Port verbatim from `ReportsView` in `seo-command-center.jsx`.

- [ ] **Step 1: Implement `ReportsView.jsx`**

Key features:
- 4 report cards — each with name, schedule, last run date, and Run Now / Download buttons (no-op Phase 1)

- [ ] **Step 2: Visual verify**

Navigate to `/#/reports`. Confirm 4 cards render.

- [ ] **Step 3: Commit**

```bash
git add src/components/reports/ReportsView.jsx
git commit -m "feat: implement Reports view with scheduled report cards"
```

---

## Task 15: Final Verification + Build

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: All utility tests pass (formatters + seo-scoring).

- [ ] **Step 2: Verify all 7 routes in the browser**

```bash
npm run dev
```

Navigate to each route and confirm no console errors:
- `/#/` → Dashboard (6 metric cards, 2 charts, agent feed, keywords)
- `/#/websites` → Websites table (10 rows, sortable, search works)
- `/#/keywords` → Keywords (4 tabs filter correctly)
- `/#/forms` → Forms (charts + table)
- `/#/agents` → Agents (6 cards + activity log)
- `/#/competitors` → Competitors (4 cards)
- `/#/reports` → Reports (4 cards)

Also verify:
- Sidebar collapses and expands (chevron button)
- Search bar in TopBar filters the Websites table

- [ ] **Step 3: Production build**

```bash
npm run build
```

Expected: `dist/` created, no build errors.

- [ ] **Step 4: Preview production build**

```bash
npm run preview
```

Open http://localhost:4173 — confirm hash routing works in preview mode.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete Phase 1 UI shell — all 7 views with mock data"
```

---

## Next Steps

After Phase 1 is running on Netlify:

- **Phase 2 Plan:** Netlify Functions backend (Google OAuth, GSC/GA4 APIs, Formspree webhooks, caching)
- **Phase 3 Plan:** GitHub API SEO agents (Meta Optimizer, Image SEO, Link Doctor, Content Scorer, Speed Optimizer, Schema Markup)

Both plans will be written separately before implementation begins.
