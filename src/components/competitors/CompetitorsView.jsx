import { useState, useMemo } from 'react'
import { Plus, X, Link2, Trash2, Tag } from 'lucide-react'
import { T } from '../../utils/constants'
import { formatNum } from '../../utils/formatters'
import { competitors as mockCompetitors } from '../../utils/mock-data'
import { GlassCard, Badge, SectionHeader } from '../shared'
import { useAppStore, businessTags } from '../../store/app-store'

function parseDomain(input) {
  let val = input.trim()
  // Strip protocol and path
  val = val.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')
  return val || null
}

export function CompetitorsView() {
  const [competitors, setCompetitors] = useState([...mockCompetitors])
  const [showAddForm, setShowAddForm] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [addError, setAddError] = useState('')
  const [tagFilter, setTagFilter] = useState(null)
  const websiteTags = useAppStore((s) => s.websiteTags)

  const handleAdd = () => {
    const domain = parseDomain(inputValue)
    if (!domain) {
      setAddError('Please enter a valid domain or URL')
      return
    }
    if (competitors.some((c) => c.domain === domain)) {
      setAddError('This competitor is already in the list')
      return
    }
    setCompetitors((prev) => [...prev, {
      domain,
      overlap: Math.floor(Math.random() * 40 + 10),
      keywords: Math.floor(Math.random() * 1500 + 200),
      avgPosition: parseFloat((Math.random() * 10 + 3).toFixed(1)),
      traffic: Math.floor(Math.random() * 80000 + 5000),
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)],
    }])
    setInputValue('')
    setAddError('')
    setShowAddForm(false)
  }

  const handleRemove = (domain) => {
    setCompetitors((prev) => prev.filter((c) => c.domain !== domain))
  }

  const filtered = useMemo(() => {
    if (!tagFilter) return competitors
    return competitors.filter((c) => websiteTags[c.domain] === tagFilter)
  }, [competitors, tagFilter, websiteTags])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Business tag filter */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
        <button onClick={() => setShowAddForm((v) => !v)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '10px 18px', borderRadius: 10,
          background: `${T.accent.indigo}15`, border: `1px solid ${T.accent.indigo}30`,
          color: T.accent.indigo, fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <Plus size={16} /> Add Competitor
        </button>
      </div>

      {showAddForm && (
        <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Link2 size={16} color={T.accent.indigo} />
              <span style={{ fontSize: 14, fontWeight: 600, color: T.text.primary }}>Add a Competitor</span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <input
                  value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); setAddError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="Paste a URL or enter a domain (e.g. competitor.com)"
                  autoFocus
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    background: T.bg.elevated, border: `1px solid ${addError ? T.accent.rose : T.border.subtle}`,
                    color: T.text.primary, fontSize: 14, fontFamily: 'inherit', outline: 'none',
                  }}
                />
                {addError && <div style={{ fontSize: 12, color: T.accent.rose, marginTop: 6 }}>{addError}</div>}
              </div>
              <button onClick={handleAdd} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '12px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: `linear-gradient(135deg, ${T.accent.indigo}, ${T.accent.purple})`,
                color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>
                <Plus size={15} /> Add
              </button>
              <button onClick={() => { setShowAddForm(false); setInputValue(''); setAddError('') }} style={{
                width: 42, height: 42, borderRadius: 10, border: `1px solid ${T.border.subtle}`,
                background: T.bg.elevated, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}>
                <X size={16} color={T.text.muted} />
              </button>
            </div>
        </GlassCard>
      )}

      {/* Competitors Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {filtered.map((comp, i) => (
          <GlassCard key={comp.domain} glow={i === 0 ? T.glow.rose : undefined}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text.primary }}>{comp.domain}</div>
                <div style={{ fontSize: 12, color: T.text.muted, marginTop: 2 }}>{comp.overlap}% keyword overlap</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Badge variant={comp.trend === "up" ? "danger" : comp.trend === "down" ? "success" : "neutral"}>
                  {comp.trend === "up" ? "Growing" : comp.trend === "down" ? "Declining" : "Stable"}
                </Badge>
                <button onClick={() => handleRemove(comp.domain)} title="Remove competitor" style={{
                  width: 28, height: 28, borderRadius: 6, border: `1px solid ${T.border.subtle}`,
                  background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = `${T.accent.rose}15`}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <Trash2 size={13} color={T.accent.rose} />
                  </button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
              <div><div style={{ fontSize: 18, fontWeight: 700, color: T.text.primary }}>{formatNum(comp.keywords)}</div><div style={{ fontSize: 11, color: T.text.muted }}>Keywords</div></div>
              <div><div style={{ fontSize: 18, fontWeight: 700, color: T.text.primary }}>{comp.avgPosition}</div><div style={{ fontSize: 11, color: T.text.muted }}>Avg Pos</div></div>
              <div><div style={{ fontSize: 18, fontWeight: 700, color: T.text.primary }}>{formatNum(comp.traffic)}</div><div style={{ fontSize: 11, color: T.text.muted }}>Est. Traffic</div></div>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ width: `${comp.overlap}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${T.accent.indigo}, ${T.accent.purple})` }} />
            </div>
            <button style={{ width: "100%", padding: "10px 0", borderRadius: 10, marginTop: 16, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border.subtle}`, color: T.text.secondary, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              View Keyword Gap Analysis
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
