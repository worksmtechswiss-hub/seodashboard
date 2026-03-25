import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, Plus, Download, ChevronDown, Loader2, Tag, X } from 'lucide-react'
import { GlassCard, SectionHeader, HealthBar, StatusDot } from '../shared'
import { T } from '../../utils/constants'
import { formatNum } from '../../utils/formatters'
import { useAppStore, businessTags } from '../../store/app-store'
import { useSiteList } from '../../hooks/useSiteList'
import { useMultiDomainGSC } from '../../hooks/useMultiDomainGSC'

function SortHeader({ field, children, sortBy, sortDir, onSort }) {
  return (
    <th
      onClick={() => onSort(field)}
      style={{
        padding: '12px 14px', fontSize: 11, fontWeight: 600,
        color: sortBy === field ? T.accent.indigo : T.text.muted,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        cursor: 'pointer', textAlign: 'right', userSelect: 'none',
        borderBottom: `1px solid ${T.border.subtle}`,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {children}
        {sortBy === field && (
          <ChevronDown
            size={12}
            style={{
              transform: sortDir === 'asc' ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        )}
      </span>
    </th>
  )
}

const tagColors = {
  Finito: T.accent.emerald,
  Solar: T.accent.amber,
  Umzug: T.accent.blue,
  Different: T.accent.purple,
}

function TagDropdown({ domain }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const websiteTags = useAppStore((s) => s.websiteTags)
  const setWebsiteTag = useAppStore((s) => s.setWebsiteTag)
  const currentTag = websiteTags[domain] || null

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const color = currentTag ? (tagColors[currentTag] || T.accent.indigo) : T.text.muted

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
          border: `1px solid ${currentTag ? `${color}40` : T.border.subtle}`,
          background: currentTag ? `${color}12` : 'transparent',
          color, cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        {currentTag || 'Add tag'}
        <ChevronDown size={10} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 60,
          background: T.bg.card, border: `1px solid ${T.border.medium}`,
          borderRadius: 8, padding: 4, minWidth: 120,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {businessTags.map((tag) => (
            <button key={tag} onClick={(e) => { e.stopPropagation(); setWebsiteTag(domain, tag); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                width: '100%', padding: '6px 10px', borderRadius: 5, fontSize: 12, fontWeight: 500,
                border: 'none', cursor: 'pointer', textAlign: 'left',
                background: currentTag === tag ? `${tagColors[tag] || T.accent.indigo}20` : 'transparent',
                color: tagColors[tag] || T.text.secondary,
              }}
              onMouseEnter={(e) => { if (currentTag !== tag) e.currentTarget.style.background = T.bg.hover }}
              onMouseLeave={(e) => { if (currentTag !== tag) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: tagColors[tag] || T.accent.indigo }} />
              {tag}
            </button>
          ))}
          {currentTag && (
            <>
              <div style={{ height: 1, background: T.border.subtle, margin: '4px 0' }} />
              <button onClick={(e) => { e.stopPropagation(); setWebsiteTag(domain, null); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  width: '100%', padding: '6px 10px', borderRadius: 5, fontSize: 12, fontWeight: 500,
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: 'transparent', color: T.accent.rose,
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = T.bg.hover}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <X size={10} /> Remove tag
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function WebsitesView() {
  const navigate = useNavigate()
  const { searchQuery } = useAppStore()
  const [sortBy, setSortBy] = useState("clicks")
  const [sortDir, setSortDir] = useState("desc")
  const [tagFilter, setTagFilter] = useState(null)

  const dateRange = useAppStore((s) => s.dateRange)
  const websiteTags = useAppStore((s) => s.websiteTags)
  const { sites, domains, isLoading: sitesLoading, isAuthenticated } = useSiteList()
  const { domains: domainResults, isLoading: gscLoading } = useMultiDomainGSC(domains, dateRange)

  // Build website list: merge site info with GSC data
  const websiteList = useMemo(() => {
    if (isAuthenticated) {
      return sites.map((site) => {
        const gsc = domainResults.find((d) => d.domain === site.domain)
        return {
          id: site.id,
          domain: site.domain,
          clicks: gsc?.data?.clicks ?? 0,
          impressions: gsc?.data?.impressions ?? 0,
          ctr: gsc?.data?.ctr ?? 0,
          position: gsc?.data?.position ?? 0,
          forms: 0,
          health: gsc?.data ? Math.min(100, Math.round(100 - (gsc.data.position || 50) * 2)) : 0,
          status: gsc?.isError ? 'critical' : gsc?.isLoading ? 'warning' : 'healthy',
          lang: '',
        }
      })
    }
    // Fallback: mock data (has all fields including forms, health, lang)
    return sites
  }, [sites, domainResults, isAuthenticated])

  const filtered = useMemo(() => {
    let list = websiteList.filter((w) => w.domain.toLowerCase().includes(searchQuery.toLowerCase()))
    if (tagFilter) list = list.filter((w) => websiteTags[w.domain] === tagFilter)
    list.sort((a, b) => sortDir === "desc" ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy])
    return list
  }, [websiteList, searchQuery, sortBy, sortDir, tagFilter, websiteTags])

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === "desc" ? "asc" : "desc")
    else { setSortBy(field); setSortDir("desc") }
  }

  const isLoading = sitesLoading || gscLoading

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Business tag filter */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Tag size={15} color={T.text.muted} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: T.text.muted, marginRight: 4 }}>Business:</span>
        {[{ label: 'All', value: null }, ...businessTags.map((t) => ({ label: t, value: t }))].map((f) => (
          <button key={f.label} onClick={() => setTagFilter(f.value)} style={{
            padding: "6px 14px", fontSize: 12, fontWeight: 600, borderRadius: 8,
            border: `1px solid ${tagFilter === f.value ? T.accent.indigo : T.border.subtle}`,
            background: tagFilter === f.value ? `${T.accent.indigo}20` : "transparent",
            color: tagFilter === f.value ? T.accent.indigo : T.text.muted,
            cursor: "pointer", transition: "all 0.15s ease",
          }}>
            {f.label}
          </button>
        ))}
      </div>

    <GlassCard style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border.subtle}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SectionHeader icon={Globe} title={tagFilter ? `${tagFilter} Websites` : "All Websites"} subtitle={`${filtered.length} websites tracked${isAuthenticated ? ' (GSC)' : ''}`} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isLoading && <Loader2 size={16} color={T.accent.indigo} style={{ animation: 'spin 1s linear infinite' }} />}
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: `${T.accent.indigo}15`, border: `1px solid ${T.accent.indigo}30`, color: T.accent.indigo, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <Plus size={14} />Add Website
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: T.bg.elevated, border: `1px solid ${T.border.subtle}`, color: T.text.secondary, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
            <Download size={14} />Export
          </button>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ padding: "12px 14px 12px 24px", fontSize: 11, fontWeight: 600, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left", borderBottom: `1px solid ${T.border.subtle}` }}>Website</th>
              <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left", borderBottom: `1px solid ${T.border.subtle}` }}>Business</th>
              <SortHeader field="clicks" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort}>Clicks</SortHeader>
              <SortHeader field="impressions" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort}>Impressions</SortHeader>
              <SortHeader field="ctr" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort}>CTR</SortHeader>
              <SortHeader field="position" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort}>Position</SortHeader>
              <SortHeader field="forms" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort}>Leads</SortHeader>
              <SortHeader field="health" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort}>Health</SortHeader>
              <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: T.text.muted, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center", borderBottom: `1px solid ${T.border.subtle}` }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((site) => (
              <tr key={site.id ?? site.domain} style={{ borderBottom: `1px solid ${T.border.subtle}`, cursor: "pointer", transition: "background 0.15s" }}
                onClick={() => navigate(`/websites/${site.domain}`)}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "14px 14px 14px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${T.accent.indigo}20, ${T.accent.blue}10)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Globe size={15} color={T.accent.indigo} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text.primary }}>{site.domain}</div>
                      {site.lang && <div style={{ fontSize: 11, color: T.text.muted, textTransform: "uppercase" }}>{site.lang}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px" }} onClick={(e) => e.stopPropagation()}>
                  <TagDropdown domain={site.domain} />
                </td>
                <td style={{ padding: "14px", textAlign: "right", fontSize: 13, fontWeight: 600, color: T.text.primary }}>{formatNum(site.clicks)}</td>
                <td style={{ padding: "14px", textAlign: "right", fontSize: 13, color: T.text.secondary }}>{formatNum(site.impressions)}</td>
                <td style={{ padding: "14px", textAlign: "right", fontSize: 13, color: T.accent.emerald, fontWeight: 600 }}>{site.ctr}%</td>
                <td style={{ padding: "14px", textAlign: "right", fontSize: 13, color: T.text.primary }}>{site.position}</td>
                <td style={{ padding: "14px", textAlign: "right", fontSize: 13, color: T.accent.amber, fontWeight: 600 }}>{site.forms ?? 0}</td>
                <td style={{ padding: "14px", width: 140 }}><HealthBar value={site.health ?? 0} /></td>
                <td style={{ padding: "14px", textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <StatusDot status={site.status ?? 'healthy'} />
                    <span style={{ fontSize: 12, color: T.text.muted, textTransform: "capitalize" }}>{site.status ?? 'healthy'}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
    </div>
  )
}
