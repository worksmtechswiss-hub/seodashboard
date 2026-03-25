const generateTrend = (base, variance, days = 30) =>
  Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    value: Math.max(0, base + Math.floor(Math.random() * variance - variance / 3) + i * (variance / days / 2)),
  }))

export const websites = [
  { id: 1, domain: 'techflow.io', clicks: 24580, impressions: 892400, ctr: 2.75, position: 8.2, trend: 'up', health: 94, forms: 127, status: 'healthy', lang: 'en' },
  { id: 2, domain: 'designhub.ch', clicks: 18920, impressions: 654300, ctr: 2.89, position: 6.4, trend: 'up', health: 88, forms: 89, status: 'healthy', lang: 'de' },
  { id: 3, domain: 'swisscraft.com', clicks: 15340, impressions: 523100, ctr: 2.93, position: 12.1, trend: 'down', health: 72, forms: 56, status: 'warning', lang: 'de' },
  { id: 4, domain: 'alpinedev.co', clicks: 12870, impressions: 445600, ctr: 2.89, position: 9.7, trend: 'up', health: 91, forms: 103, status: 'healthy', lang: 'en' },
  { id: 5, domain: 'codeforge.dev', clicks: 11240, impressions: 398200, ctr: 2.82, position: 11.3, trend: 'down', health: 67, forms: 34, status: 'critical', lang: 'en' },
  { id: 6, domain: 'pixelworks.studio', clicks: 9870, impressions: 312400, ctr: 3.16, position: 5.8, trend: 'up', health: 96, forms: 78, status: 'healthy', lang: 'fr' },
  { id: 7, domain: 'nextera.app', clicks: 8920, impressions: 287600, ctr: 3.1, position: 7.2, trend: 'up', health: 89, forms: 92, status: 'healthy', lang: 'en' },
  { id: 8, domain: 'cloudbase.io', clicks: 7650, impressions: 256800, ctr: 2.98, position: 10.5, trend: 'down', health: 75, forms: 41, status: 'warning', lang: 'en' },
  { id: 9, domain: 'datastream.ch', clicks: 6430, impressions: 198700, ctr: 3.24, position: 8.9, trend: 'up', health: 82, forms: 63, status: 'healthy', lang: 'de' },
  { id: 10, domain: 'webcraft.pro', clicks: 5210, impressions: 176300, ctr: 2.96, position: 13.4, trend: 'down', health: 61, forms: 22, status: 'critical', lang: 'fr' },
]

export const keywords = [
  { keyword: 'web development zürich', position: 3, prevPosition: 5, volume: 1200, clicks: 342, impressions: 8900, difficulty: 42, url: 'techflow.io/services' },
  { keyword: 'react developer schweiz', position: 1, prevPosition: 1, volume: 890, clicks: 567, impressions: 4200, difficulty: 38, url: 'alpinedev.co/react' },
  { keyword: 'SEO agentur bern', position: 7, prevPosition: 12, volume: 2400, clicks: 189, impressions: 12400, difficulty: 65, url: 'swisscraft.com/seo' },
  { keyword: 'website erstellen lassen', position: 4, prevPosition: 3, volume: 3600, clicks: 445, impressions: 15600, difficulty: 72, url: 'designhub.ch/angebot' },
  { keyword: 'cloud hosting switzerland', position: 2, prevPosition: 4, volume: 1800, clicks: 623, impressions: 7800, difficulty: 55, url: 'cloudbase.io/hosting' },
  { keyword: 'UI/UX design agency', position: 6, prevPosition: 8, volume: 2100, clicks: 298, impressions: 9400, difficulty: 48, url: 'pixelworks.studio' },
  { keyword: 'netlify deployment guide', position: 1, prevPosition: 2, volume: 4200, clicks: 1230, impressions: 6700, difficulty: 35, url: 'codeforge.dev/guides' },
  { keyword: 'javascript framework 2026', position: 11, prevPosition: 15, volume: 5600, clicks: 156, impressions: 18200, difficulty: 78, url: 'techflow.io/blog' },
  { keyword: 'datenbank optimierung', position: 5, prevPosition: 5, volume: 780, clicks: 189, impressions: 3400, difficulty: 44, url: 'datastream.ch/db' },
  { keyword: 'responsive web design', position: 8, prevPosition: 6, volume: 6800, clicks: 412, impressions: 22100, difficulty: 82, url: 'webcraft.pro/design' },
]

export const formSubmissions = [
  { id: 1, name: 'Thomas M.', email: 't.m***@gmail.com', website: 'techflow.io', page: '/contact', date: '2026-03-23 14:22', status: 'new' },
  { id: 2, name: 'Sara K.', email: 's.k***@outlook.com', website: 'designhub.ch', page: '/anfrage', date: '2026-03-23 11:45', status: 'new' },
  { id: 3, name: 'Marco R.', email: 'm.r***@bluewin.ch', website: 'alpinedev.co', page: '/get-started', date: '2026-03-22 18:30', status: 'contacted' },
  { id: 4, name: 'Laura B.', email: 'l.b***@proton.me', website: 'pixelworks.studio', page: '/quote', date: '2026-03-22 09:15', status: 'contacted' },
  { id: 5, name: 'Andreas W.', email: 'a.w***@gmail.com', website: 'swisscraft.com', page: '/kontakt', date: '2026-03-21 16:40', status: 'converted' },
  { id: 6, name: 'Nina P.', email: 'n.p***@yahoo.com', website: 'techflow.io', page: '/demo', date: '2026-03-21 10:20', status: 'new' },
]

export const aiAgentActions = [
  { id: 1, domain: 'codeforge.dev', action: 'Updated meta descriptions on 12 pages', type: 'meta', impact: '+15% CTR expected', status: 'completed', time: '2h ago' },
  { id: 2, domain: 'swisscraft.com', action: 'Added alt text to 34 images', type: 'accessibility', impact: '+8% image search traffic', status: 'completed', time: '4h ago' },
  { id: 3, domain: 'webcraft.pro', action: 'Detected broken internal links (7 found)', type: 'fix', impact: 'Crawl efficiency +12%', status: 'pending_approval', time: '1h ago' },
  { id: 4, domain: 'techflow.io', action: 'Optimized heading hierarchy on /blog', type: 'structure', impact: 'Better featured snippets', status: 'in_progress', time: 'now' },
  { id: 5, domain: 'cloudbase.io', action: 'Suggested new long-tail keywords (23)', type: 'keywords', impact: '+340 monthly impressions', status: 'pending_approval', time: '30m ago' },
  { id: 6, domain: 'designhub.ch', action: 'Compressed 18 images (saved 2.4MB)', type: 'performance', impact: 'Page speed +22pts', status: 'completed', time: '6h ago' },
]

export const competitors = [
  { domain: 'competitor-a.com', overlap: 67, keywords: 1240, avgPosition: 4.2, traffic: 89400, trend: 'up' },
  { domain: 'rival-agency.ch', overlap: 52, keywords: 890, avgPosition: 6.8, traffic: 56200, trend: 'down' },
  { domain: 'toprank-seo.de', overlap: 44, keywords: 2100, avgPosition: 5.1, traffic: 124000, trend: 'up' },
  { domain: 'webmaster-pro.com', overlap: 38, keywords: 1670, avgPosition: 7.3, traffic: 72100, trend: 'stable' },
]

export const clicksData = generateTrend(3200, 800, 365)
export const impressionsData = generateTrend(85000, 15000, 365)

export const formsByDay = [
  { day: 'Mon', count: 12 }, { day: 'Tue', count: 18 }, { day: 'Wed', count: 9 },
  { day: 'Thu', count: 24 }, { day: 'Fri', count: 15 }, { day: 'Sat', count: 6 }, { day: 'Sun', count: 3 },
]

export const formsBySite = websites.slice(0, 6).map(w => ({ name: w.domain.split('.')[0], value: w.forms }))
