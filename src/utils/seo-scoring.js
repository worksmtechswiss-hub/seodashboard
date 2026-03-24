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

export function healthStatus(score) {
  if (score >= 85) return 'healthy'
  if (score >= 70) return 'warning'
  return 'critical'
}
