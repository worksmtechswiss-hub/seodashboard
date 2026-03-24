# SEO Command Center — Design Spec
_Date: 2026-03-23_

## Context

Lukas manages 100+ websites (all built with Claude Code, hosted on GitHub, deployed via Netlify). He needs a single dashboard to monitor SEO performance across all properties, track form leads, and run automated SEO fixes via AI agents.

Two reference files exist in the project root and **must be copied to the repo before Phase 1 work begins**:
- `seo-command-center.jsx` — complete reference UI with all mock data, design tokens, and component markup
- `CLAUDE.md` — full architecture context (Google API setup, data models, agent descriptions, env vars)

---

## Build Strategy

**UI First → Backend → Agents** (3 independent phases)

All phases share the same repo. Phase 1 is fully usable with mock data. Phases 2 and 3 progressively replace mock data with real API responses. Each phase can be built and deployed independently.

---

## Phase 1 — React Frontend (UI Shell)

### Project Bootstrap

```bash
npm create vite@latest seo-dashboard -- --template react
cd seo-dashboard
npm install recharts lucide-react zustand @tanstack/react-query react-router-dom date-fns
```

No Tailwind. All styling is **inline CSS-in-JS** (object styles on `style` prop), exactly as in `seo-command-center.jsx`. This is intentional — the reference uses this pattern throughout.

### Tech Stack
- React 18 + Vite 5
- Recharts (charts)
- Lucide React (icons)
- Zustand (global state: `activeView`, `searchQuery`, `sidebarCollapsed`)
- TanStack Query v5 (Phase 1: configured but using static mock resolvers, not fetch calls)
- React Router v7 (hash-based: `/#/dashboard`, `/#/websites`, etc. — no server routing needed for Netlify SPA)
- date-fns (date formatting)

### Route Table

| Route | View |
|---|---|
| `/#/` or `/#/dashboard` | DashboardView |
| `/#/websites` | WebsitesView |
| `/#/keywords` | KeywordsView |
| `/#/forms` | FormsView |
| `/#/agents` | AgentsView |
| `/#/competitors` | CompetitorsView |
| `/#/reports` | ReportsView |

Hash routing (`createHashRouter`) avoids the need for `[[redirects]]` in `netlify.toml` for client-side routing.

### Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── TopBar.jsx
│   │   └── PageWrapper.jsx
│   ├── shared/
│   │   ├── Badge.jsx
│   │   ├── GlassCard.jsx
│   │   ├── MetricCard.jsx
│   │   ├── HealthBar.jsx
│   │   ├── StatusDot.jsx
│   │   ├── SectionHeader.jsx
│   │   ├── TabButton.jsx
│   │   └── ChartTooltip.jsx
│   ├── dashboard/       # DashboardView.jsx
│   ├── websites/        # WebsitesView.jsx
│   ├── keywords/        # KeywordsView.jsx
│   ├── forms/           # FormsView.jsx
│   ├── agents/          # AgentsView.jsx
│   ├── competitors/     # CompetitorsView.jsx
│   └── reports/         # ReportsView.jsx
├── hooks/
│   ├── useSearchConsole.js    # Phase 2: wraps TanStack Query + Netlify Function calls
│   ├── useAnalytics.js        # Phase 2
│   └── useFormspree.js        # Phase 2
├── utils/
│   ├── formatters.js    # formatNum, formatDate (from reference JSX)
│   ├── constants.js     # Design tokens (T object), navItems array
│   ├── mock-data.js     # All mock arrays from reference JSX (websites, keywords, etc.)
│   └── seo-scoring.js   # Health score algorithm
├── store/
│   └── app-store.js     # Zustand store
├── App.jsx
└── main.jsx
```

### Phase 1 Data Strategy
- All views import directly from `mock-data.js` — no TanStack Query fetch calls in Phase 1
- TanStack Query is installed and `QueryClientProvider` wraps the app, but Phase 1 queries use `queryFn: () => Promise.resolve(mockData)` so Phase 2 only needs to swap the `queryFn`
- No loading states in Phase 1 (mock resolves synchronously)

### Key Data Shapes (ground truth is `seo-command-center.jsx`)

```js
// Website object
{
  id: number, domain: string, clicks: number, impressions: number,
  ctr: number, position: number, trend: "up" | "down",
  health: number,        // 0–100, used by HealthBar
  forms: number,         // total form submissions count
  status: "healthy" | "warning" | "critical",
  lang: "en" | "de" | "fr"
}

// Keyword object
{
  keyword: string, position: number, prevPosition: number,
  volume: number, clicks: number, impressions: number,
  difficulty: number,    // 0–100
  url: string
}

// Form submission object
{
  id: number, name: string, email: string, website: string,
  page: string, date: string,
  status: "new" | "contacted" | "converted"
}
```

Note: Phase 2 will extend the Website object with `gscPropertyUrl`, `ga4PropertyId`, `githubRepo`, `netlifyId`, `formspreeEndpoint`, `lastChecked`. Phase 1 only needs the fields above.

### Design System
Exact tokens from `seo-command-center.jsx` — no deviations:
- Background: `#06080d` → `#0a0e1a` → `#111827` → `#151d2e`
- Accent: indigo `#6366f1`, blue `#3b82f6`, emerald `#10b981`, amber `#f59e0b`, rose `#f43f5e`, cyan `#06b6d4`, purple `#a855f7`
- Font: Inter (Google Fonts)
- All shared components ported 1:1 from reference: `GlassCard`, `MetricCard`, `Badge`, `HealthBar`, `StatusDot`, `SectionHeader`, `TabButton`, `ChartTooltipContent`

### Views (7 total)
1. **Dashboard** — 6 metric cards + clicks/impressions trend charts + AI agent activity feed + top keywords list
2. **Websites** — sortable table (clicks, impressions, CTR, position, leads, health, status) + Add Website button
3. **Keywords** — tabbed table: All / Top 3 (pos ≤ 3) / Opportunities (pos 5–20) / Needs Work (pos > 20)
4. **Form Leads** — 4 metric cards + bar chart (by day) + pie chart (by site) + submissions table
5. **AI Agents** — 6 agent cards (active/paused) + activity log with Approve/Dismiss buttons
6. **Competitors** — 4 competitor cards with keyword overlap bar + "View Gap Analysis" button (mock)
7. **Reports** — 4 scheduled report cards with Run Now / Download buttons (mock)

---

## Phase 2 — Netlify Functions Backend

### Authentication
- Google OAuth 2.0 flow:
  1. Frontend calls `/.netlify/functions/google-auth?action=login` → returns redirect URL
  2. User redirected to Google consent screen
  3. Google redirects to `/.netlify/functions/google-auth?code=...&state=...` (no sub-path — query params only)
  4. Function exchanges code for `access_token` + `refresh_token` → stores in Netlify Blobs under key `auth/tokens`
  5. Returns session cookie (httpOnly, secure) to frontend
- `GOOGLE_REDIRECT_URI` = `https://YOUR-SITE.netlify.app/.netlify/functions/google-auth` (no `/callback` suffix)
- Single Google account covers all 100+ GSC properties

### Netlify Functions

| Function | Trigger | Purpose |
|---|---|---|
| `google-auth.js` | GET with `?action=login` or `?code=` | OAuth login + callback handler |
| `search-console.js` | POST from frontend | Proxy GSC API with caching |
| `analytics.js` | POST from frontend | Proxy GA4 API with caching |
| `formspree-webhook.js` | POST from Formspree | Receive webhook, store submission |
| `github-agent.js` | POST from frontend | Route to correct agent, execute, return PR URL |
| `scheduled-report.js` | Netlify cron | Generate weekly report, store to Blobs |

### Netlify Blobs Key Structure

```
auth/tokens                           → { access_token, refresh_token, expiry }
cache/gsc/{domain}/{YYYY-MM-DD}       → { data, cachedAt }   TTL: check (cachedAt + 3600s) > now
cache/ga4/{propertyId}/{YYYY-MM-DD}   → { data, cachedAt }   TTL: check (cachedAt + 14400s) > now
forms/submissions/{formId}/{id}       → submission object
reports/{YYYY-MM-DD}-weekly.json      → report output
```

**TTL implementation** (Netlify Blobs has no native expiry):
```js
const cached = await store.get(key, { type: 'json' });
if (cached && Date.now() - cached.cachedAt < TTL_MS) return cached.data;
// else fetch fresh, store with cachedAt: Date.now()
```

### Formspree Per-Site Handling
Each website has its own `formspreeEndpoint` (e.g., `"mykkkaed"`). The webhook receiver uses `event.body.formId` (sent by Formspree in the webhook payload) to store submissions under the correct site key. The Forms view fetches all submissions and groups by `formId` matching each website's `formspreeEndpoint`. Each site's Formspree form must have the webhook URL configured in the Formspree dashboard.

### Caching Strategy (GSC: 1,200 req/min quota for 100+ sites)
- Cache GSC responses for **1 hour**, GA4 for **4 hours** (manual TTL via `cachedAt` timestamp in blob)
- TanStack Query `staleTime: 60_000`, `gcTime: 300_000` (v5 pattern — no `staleWhileRevalidate` option)
- Per-site "Refresh" button calls `/.netlify/functions/search-console?invalidate=1&domain=...` to bust cache for one property

---

## Phase 3 — GitHub API SEO Agents

### Function Design: `github-agent.js`

POST body: `{ agentType: "meta" | "images" | "links" | "content" | "speed" | "schema", domain: string }`

The function:
1. Looks up the site's `githubRepo` from the websites store
2. Calls the appropriate agent module (separate file per agent in `netlify/functions/agents/`)
3. Returns `{ prUrl, prNumber, changesCount }` or `{ error }`

**Timeout handling:** All agent runs always use the background path — `github-agent.js` receives the request, creates a job entry in Netlify Blobs, then invokes `github-agent-background.js` asynchronously and immediately returns `{ jobId }`. The frontend polls `/.netlify/functions/agent-status?jobId=...` every 5 seconds until status is `completed` or `failed`. Job status is stored in Netlify Blobs under `agents/jobs/{jobId}`. There is no synchronous direct-execution path.

### Agent Files

```
netlify/functions/
├── github-agent.js              # Dispatcher + job creation
├── github-agent-background.js   # Long-running agent executor
├── agent-status.js              # Poll job status
└── agents/
    ├── meta-optimizer.js
    ├── image-seo.js
    ├── link-doctor.js
    ├── content-scorer.js
    ├── speed-optimizer.js
    └── schema-markup.js
```

### GitHub API Calls Per Agent Run

```
GET  /repos/{owner}/{repo}/git/ref/heads/main              → get base SHA
POST /repos/{owner}/{repo}/git/refs                        → create branch
PUT  /repos/{owner}/{repo}/contents/{path}  (×N files)     → update files
POST /repos/{owner}/{repo}/pulls                           → create PR
```

### PR Approval + Merge Flow

1. Agent creates PR → stores `{ prNumber, repo }` in Netlify Blobs under `agents/prs/{domain}`
2. Agents view fetches pending PRs from blobs → shows "Approve" button
3. User clicks Approve → frontend calls `/.netlify/functions/github-agent?action=merge`
4. Function calls: `PUT /repos/{owner}/{repo}/pulls/{prNumber}/merge` with `{ merge_method: "squash" }`
5. Netlify detects push → auto-deploys the site

**Required:** `GITHUB_TOKEN` must have `repo` scope. PRs are created into `main`; if branch protection exists, the token must be added as a bypass user in the repo settings.

### Agent Safety Rules
- Always create PRs — never direct push to `main`
- One PR per agent per domain run
- PR body lists every change with before/after snippets
- User can Dismiss (closes PR without merging) or Approve (squash merge)

---

## Health Score Algorithm

Score starts at 100. Deductions are **additive and capped at 0 per category** (a category cannot go below 0).

```js
function calculateHealthScore(checks) {
  const categories = {
    meta:        Math.max(0, 25 - (checks.missingDescription ? 10 : 0) - (checks.badTitleLength ? 8 : 0) - (checks.badDescLength ? 7 : 0)),
    performance: Math.max(0, 25 - (checks.pageSpeedLow ? 15 : 0) - (checks.pageSpeedMedium ? 8 : 0) - (checks.highCLS ? 10 : 0)),
    content:     Math.max(0, 25 - (checks.missingAltTags ? 10 : 0) - (checks.brokenLinks ? 8 : 0) - (checks.missingH1 ? 7 : 0)),
    technical:   Math.max(0, 25 - (checks.noSitemap ? 8 : 0) - (checks.noRobotsTxt ? 5 : 0) - (checks.notHttps ? 12 : 0)),
  };
  return Object.values(categories).reduce((a, b) => a + b, 0);
}
// pageSpeedLow: score < 50. pageSpeedMedium: score 50–79. Only one applies.
```

---

## Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

# No [[redirects]] needed — app uses hash routing (createHashRouter)

[functions."scheduled-report"]
  schedule = "0 8 * * 1"  # Every Monday 8 AM UTC (= 9 AM CET / 10 AM CEST)
```

---

## Environment Variables

```env
# Google APIs
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://YOUR-SITE.netlify.app/.netlify/functions/google-auth

# Formspree
FORMSPREE_API_KEY=

# GitHub (for AI Agents) — repo scope required
GITHUB_TOKEN=ghp_...
```

Note: `VITE_APP_URL` removed — not needed. OAuth redirect URI is server-side only.

---

## Competitors View — Data Source

**Phase 1:** Mock data only (4 hardcoded competitors from reference JSX).
**Phase 2+:** Manual input — user adds competitor domains via the dashboard. Keyword overlap is calculated by comparing your GSC keywords against a manually-maintained competitor keyword list. No third-party API required.

---

## Scheduled Reports — Output

`scheduled-report.js` generates a JSON summary and stores it under `reports/{YYYY-MM-DD}-weekly.json` in Netlify Blobs. The Reports view's "Download" button fetches this blob and triggers a JSON download. "Run Now" calls the function on demand. Future enhancement: email delivery via Resend/SendGrid (not in scope for Phase 3).

---

## File Naming Conventions
- Components: PascalCase (`MetricCard.jsx`)
- Hooks: `use` prefix (`useSearchConsole.js`)
- Services/utils: kebab-case (`search-console.js`, `seo-scoring.js`)

---

## Verification Plan

**Phase 1:**
- `npm run dev` → dashboard loads at `localhost:5173`
- All 7 nav routes render with mock data
- Sidebar collapses/expands, search filters websites table, sort toggles work
- Charts render with Recharts

**Phase 2:**
- Google OAuth redirects correctly (no `/callback` sub-path error)
- GSC data loads for at least one property
- Second load within 1 hour hits cache (no new GSC API call in Netlify logs)
- Formspree webhook test submission appears in Forms view

**Phase 3:**
- Agent triggered for a test repo → PR created on GitHub with correct branch name
- Job status polling returns "completed" with PR URL
- Approve → PR merged on GitHub → Netlify redeploys the target site
