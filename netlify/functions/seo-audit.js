import { connectLambda } from '@netlify/blobs'

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

// Analyze HTML content for on-page SEO factors
function analyzeHtml(html, url) {
  const issues = []
  const info = {}

  // Title tag
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  info.title = titleMatch ? titleMatch[1].trim() : null
  if (!info.title) {
    issues.push({ severity: 'critical', category: 'Meta', message: 'Missing title tag', recommendation: 'Add a unique, descriptive <title> tag (50-60 characters).' })
  } else if (info.title.length < 30) {
    issues.push({ severity: 'warning', category: 'Meta', message: `Title tag too short (${info.title.length} chars)`, recommendation: 'Title should be 50-60 characters for optimal display in search results.' })
  } else if (info.title.length > 65) {
    issues.push({ severity: 'warning', category: 'Meta', message: `Title tag too long (${info.title.length} chars)`, recommendation: 'Title may be truncated in search results. Keep it under 60 characters.' })
  }

  // Meta description
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i)
    || html.match(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["']/i)
  info.metaDescription = descMatch ? descMatch[1].trim() : null
  if (!info.metaDescription) {
    issues.push({ severity: 'critical', category: 'Meta', message: 'Missing meta description', recommendation: 'Add a compelling meta description (150-160 characters) to improve CTR.' })
  } else if (info.metaDescription.length < 120) {
    issues.push({ severity: 'warning', category: 'Meta', message: `Meta description too short (${info.metaDescription.length} chars)`, recommendation: 'Meta description should be 150-160 characters.' })
  } else if (info.metaDescription.length > 165) {
    issues.push({ severity: 'warning', category: 'Meta', message: `Meta description too long (${info.metaDescription.length} chars)`, recommendation: 'Meta description may be truncated. Keep under 160 characters.' })
  }

  // Canonical tag
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([\s\S]*?)["']/i)
  info.canonical = canonicalMatch ? canonicalMatch[1].trim() : null
  if (!info.canonical) {
    issues.push({ severity: 'warning', category: 'Technical', message: 'Missing canonical tag', recommendation: 'Add a <link rel="canonical"> tag to prevent duplicate content issues.' })
  }

  // Viewport meta
  const viewportMatch = html.match(/<meta[^>]+name=["']viewport["']/i)
  info.hasViewport = !!viewportMatch
  if (!info.hasViewport) {
    issues.push({ severity: 'critical', category: 'Technical', message: 'Missing viewport meta tag', recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> for mobile responsiveness.' })
  }

  // Headings
  const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || []
  info.h1Count = h1Matches.length
  info.h1Text = h1Matches.map((h) => h.replace(/<[^>]+>/g, '').trim()).filter(Boolean)
  if (info.h1Count === 0) {
    issues.push({ severity: 'critical', category: 'Content', message: 'Missing H1 heading', recommendation: 'Add exactly one H1 tag that describes the main topic of the page.' })
  } else if (info.h1Count > 1) {
    issues.push({ severity: 'warning', category: 'Content', message: `Multiple H1 tags found (${info.h1Count})`, recommendation: 'Use only one H1 tag per page for clear content hierarchy.' })
  }

  const h2Matches = html.match(/<h2[^>]*>/gi) || []
  const h3Matches = html.match(/<h3[^>]*>/gi) || []
  info.h2Count = h2Matches.length
  info.h3Count = h3Matches.length

  // Images
  const imgMatches = html.match(/<img[^>]*>/gi) || []
  info.totalImages = imgMatches.length
  const imagesWithoutAlt = imgMatches.filter((img) => !img.match(/alt=["'][^"']+["']/i))
  info.imagesWithoutAlt = imagesWithoutAlt.length
  if (info.imagesWithoutAlt > 0) {
    issues.push({ severity: 'warning', category: 'Accessibility', message: `${info.imagesWithoutAlt} image(s) missing alt text`, recommendation: 'Add descriptive alt text to all images for accessibility and image search SEO.' })
  }

  // Links
  const linkMatches = html.match(/<a[^>]+href=["']([\s\S]*?)["']/gi) || []
  info.totalLinks = linkMatches.length
  const internalLinks = linkMatches.filter((l) => l.includes(url) || l.match(/href=["']\//))
  const externalLinks = linkMatches.filter((l) => l.match(/href=["']https?:\/\//) && !l.includes(url))
  info.internalLinks = internalLinks.length
  info.externalLinks = externalLinks.length

  // Schema / Structured Data
  const schemaMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || []
  info.hasStructuredData = schemaMatches.length > 0
  info.structuredDataCount = schemaMatches.length
  if (!info.hasStructuredData) {
    issues.push({ severity: 'info', category: 'Technical', message: 'No structured data (JSON-LD) found', recommendation: 'Add Schema.org structured data to help search engines understand your content and enable rich results.' })
  }

  // Open Graph
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["']/i)
  const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["']/i)
  const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["']/i)
  info.hasOpenGraph = !!(ogTitleMatch && ogDescMatch)
  if (!info.hasOpenGraph) {
    issues.push({ severity: 'info', category: 'Social', message: 'Missing Open Graph tags', recommendation: 'Add og:title, og:description, and og:image meta tags for better social media sharing.' })
  }

  // HTTPS check
  info.isHttps = url.startsWith('https')
  if (!info.isHttps) {
    issues.push({ severity: 'critical', category: 'Security', message: 'Site not using HTTPS', recommendation: 'Migrate to HTTPS. Google uses HTTPS as a ranking signal.' })
  }

  // Hreflang
  const hreflangMatches = html.match(/<link[^>]+hreflang/gi) || []
  info.hreflangCount = hreflangMatches.length

  // Content length (rough word count from body)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  if (bodyMatch) {
    const textContent = bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    info.wordCount = textContent.split(' ').filter((w) => w.length > 1).length
    if (info.wordCount < 300) {
      issues.push({ severity: 'warning', category: 'Content', message: `Thin content (${info.wordCount} words)`, recommendation: 'Pages with less than 300 words may not rank well. Add more substantive content.' })
    }
  }

  return { info, issues }
}

// Compute overall SEO score from issues
function computeScore(issues, pagespeed) {
  let score = 100
  for (const issue of issues) {
    if (issue.severity === 'critical') score -= 15
    else if (issue.severity === 'warning') score -= 7
    else score -= 2
  }
  // Blend with PageSpeed SEO score if available
  if (pagespeed?.seoScore != null) {
    score = Math.round(score * 0.6 + pagespeed.seoScore * 0.4)
  }
  return Math.max(0, Math.min(100, score))
}

export const handler = async (event) => {
  connectLambda(event)
  const { type, domain, keyword, url: targetUrl } = JSON.parse(event.body || '{}')

  if (!type) return json(400, { error: 'type is required (site, keyword, optimizer)' })

  try {
    if (type === 'site') {
      if (!domain) return json(400, { error: 'domain is required for site audit' })

      const siteUrl = domain.startsWith('http') ? domain : `https://${domain}`

      // Fetch PageSpeed Insights and HTML in parallel
      const [pagespeedRes, htmlRes] = await Promise.all([
        fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(siteUrl)}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO&strategy=MOBILE`),
        fetch(siteUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEOAuditBot/1.0)' },
          redirect: 'follow',
        }),
      ])

      // Parse PageSpeed
      let pagespeed = null
      if (pagespeedRes.ok) {
        const psData = await pagespeedRes.json()
        const categories = psData.lighthouseResult?.categories || {}
        const audits = psData.lighthouseResult?.audits || {}
        pagespeed = {
          performanceScore: Math.round((categories.performance?.score || 0) * 100),
          accessibilityScore: Math.round((categories.accessibility?.score || 0) * 100),
          bestPracticesScore: Math.round((categories['best-practices']?.score || 0) * 100),
          seoScore: Math.round((categories.seo?.score || 0) * 100),
          fcp: audits['first-contentful-paint']?.displayValue || null,
          lcp: audits['largest-contentful-paint']?.displayValue || null,
          cls: audits['cumulative-layout-shift']?.displayValue || null,
          tbt: audits['total-blocking-time']?.displayValue || null,
          speedIndex: audits['speed-index']?.displayValue || null,
          tti: audits['interactive']?.displayValue || null,
        }
      }

      // Parse HTML for on-page analysis
      let onPage = { info: {}, issues: [] }
      if (htmlRes.ok) {
        const html = await htmlRes.text()
        onPage = analyzeHtml(html, siteUrl)
      } else {
        onPage.issues.push({ severity: 'critical', category: 'Technical', message: `Could not fetch site (HTTP ${htmlRes.status})`, recommendation: 'Ensure the site is accessible and returns a 200 status code.' })
      }

      const overallScore = computeScore(onPage.issues, pagespeed)

      return json(200, {
        type: 'site',
        domain,
        url: siteUrl,
        overallScore,
        pagespeed,
        onPage: onPage.info,
        issues: onPage.issues.sort((a, b) => {
          const order = { critical: 0, warning: 1, info: 2 }
          return (order[a.severity] ?? 3) - (order[b.severity] ?? 3)
        }),
        timestamp: new Date().toISOString(),
      })
    }

    if (type === 'keyword') {
      if (!keyword) return json(400, { error: 'keyword is required for keyword analysis' })

      // For keyword analysis we return structured guidance
      // (Full SERP scraping would require a third-party API — keeping this self-contained)
      return json(200, {
        type: 'keyword',
        keyword,
        analysis: {
          searchIntent: classifyIntent(keyword),
          recommendations: generateKeywordRecommendations(keyword),
          contentGuidelines: generateContentGuidelines(keyword),
        },
        timestamp: new Date().toISOString(),
      })
    }

    if (type === 'optimizer') {
      if (!targetUrl || !keyword) return json(400, { error: 'url and keyword are required for page optimizer' })

      const pageUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`

      // Fetch the page and PageSpeed in parallel
      const [htmlRes, pagespeedRes] = await Promise.all([
        fetch(pageUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEOAuditBot/1.0)' },
          redirect: 'follow',
        }),
        fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(pageUrl)}&category=SEO&strategy=MOBILE`),
      ])

      let pagespeed = null
      if (pagespeedRes.ok) {
        const psData = await pagespeedRes.json()
        const categories = psData.lighthouseResult?.categories || {}
        pagespeed = {
          seoScore: Math.round((categories.seo?.score || 0) * 100),
        }
      }

      const optimizations = []
      if (htmlRes.ok) {
        const html = await htmlRes.text()
        const { info, issues } = analyzeHtml(html, pageUrl)

        // Keyword-specific checks
        const kwLower = keyword.toLowerCase()
        if (info.title && !info.title.toLowerCase().includes(kwLower)) {
          optimizations.push({ severity: 'critical', category: 'Keyword', message: `Target keyword "${keyword}" not found in title tag`, recommendation: `Include "${keyword}" naturally in your title tag for better relevance.` })
        }
        if (info.metaDescription && !info.metaDescription.toLowerCase().includes(kwLower)) {
          optimizations.push({ severity: 'warning', category: 'Keyword', message: `Target keyword not in meta description`, recommendation: `Include "${keyword}" in your meta description to improve CTR.` })
        }
        if (info.h1Text?.length > 0 && !info.h1Text.some((h) => h.toLowerCase().includes(kwLower))) {
          optimizations.push({ severity: 'warning', category: 'Keyword', message: `Target keyword not in H1 heading`, recommendation: `Include "${keyword}" or a close variation in your H1 tag.` })
        }

        // Body content keyword density
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
        if (bodyMatch) {
          const text = bodyMatch[1].replace(/<[^>]+>/g, ' ').toLowerCase()
          const kwCount = (text.match(new RegExp(kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
          if (kwCount === 0) {
            optimizations.push({ severity: 'critical', category: 'Keyword', message: `Target keyword not found in page content`, recommendation: `Add "${keyword}" naturally throughout your content.` })
          } else if (kwCount < 3) {
            optimizations.push({ severity: 'warning', category: 'Keyword', message: `Low keyword usage (${kwCount} mention${kwCount > 1 ? 's' : ''})`, recommendation: `Increase the usage of "${keyword}" in your content while keeping it natural.` })
          }
        }

        // Add general issues too
        optimizations.push(...issues)

        const overallScore = computeScore(optimizations, pagespeed)

        return json(200, {
          type: 'optimizer',
          url: pageUrl,
          keyword,
          overallScore,
          pagespeed,
          onPage: info,
          optimizations: optimizations.sort((a, b) => {
            const order = { critical: 0, warning: 1, info: 2 }
            return (order[a.severity] ?? 3) - (order[b.severity] ?? 3)
          }),
          timestamp: new Date().toISOString(),
        })
      } else {
        return json(200, {
          type: 'optimizer',
          url: pageUrl,
          keyword,
          overallScore: 0,
          optimizations: [{ severity: 'critical', category: 'Technical', message: `Could not fetch page (HTTP ${htmlRes.status})`, recommendation: 'Ensure the page is accessible.' }],
          timestamp: new Date().toISOString(),
        })
      }
    }

    return json(400, { error: `Unknown audit type: ${type}` })
  } catch (err) {
    return json(500, { error: 'Audit failed', detail: err.message })
  }
}

function classifyIntent(keyword) {
  const kw = keyword.toLowerCase()
  if (kw.match(/\b(buy|price|cheap|deal|discount|shop|order|coupon)\b/)) return { type: 'Transactional', description: 'User is looking to make a purchase or take a specific action.' }
  if (kw.match(/\b(how|what|why|when|who|guide|tutorial|learn|example|tips)\b/)) return { type: 'Informational', description: 'User is seeking information or knowledge about a topic.' }
  if (kw.match(/\b(best|top|review|comparison|vs|alternative)\b/)) return { type: 'Commercial Investigation', description: 'User is researching options before making a decision.' }
  if (kw.match(/\b(login|sign in|\.com|\.io|\.ch|website)\b/)) return { type: 'Navigational', description: 'User is looking for a specific website or page.' }
  return { type: 'Informational', description: 'Likely informational intent. User is seeking knowledge.' }
}

function generateKeywordRecommendations(keyword) {
  const kw = keyword.toLowerCase()
  const recs = [
    { title: 'Create comprehensive content', description: `Write an in-depth article or page targeting "${keyword}" — aim for 1500+ words covering the topic thoroughly.` },
    { title: 'Optimize title and meta tags', description: `Include "${keyword}" in your title tag (near the beginning) and meta description.` },
    { title: 'Use semantic variations', description: `Include related terms and synonyms of "${keyword}" throughout your content to cover the topic naturally.` },
    { title: 'Add internal links', description: `Link to this page from other relevant pages on your site using anchor text related to "${keyword}".` },
    { title: 'Include visual content', description: `Add images, infographics, or videos related to "${keyword}" with descriptive alt text.` },
  ]
  if (kw.includes(' ')) {
    recs.push({ title: 'Target long-tail variations', description: `Create additional content for related long-tail queries like "best ${keyword}", "how to ${keyword}", etc.` })
  }
  return recs
}

function generateContentGuidelines(keyword) {
  return {
    suggestedWordCount: '1500-2500 words',
    headingStructure: [
      `H1: Include "${keyword}" naturally`,
      `H2: Cover key subtopics (3-6 sections)`,
      `H3: Break down complex sections`,
    ],
    contentElements: [
      'Introduction with keyword in first 100 words',
      'Table of contents for long articles',
      'FAQ section with common questions',
      'Summary or key takeaways at the end',
      'Internal links to related content',
      'External links to authoritative sources',
    ],
  }
}
