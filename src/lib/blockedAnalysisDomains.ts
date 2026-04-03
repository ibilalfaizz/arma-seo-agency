/**
 * Domains that must not be sent to the SEO analysis API (normalized hostname, no www).
 */
const BLOCKED_ROOT_HOSTNAMES = new Set(['arma-agency.us'])

export const BLOCKED_DOMAIN_ANALYSIS_MESSAGE =
  'This domain is not available for analysis.\nPlease enter a different website.'

function rootHostname(hostname: string): string {
  const h = hostname.trim().toLowerCase()
  if (h.startsWith('www.')) return h.slice(4)
  return h
}

/** Pass a normalized http(s) URL (e.g. from normalizeWebsiteUrl). */
export function isAnalysisBlockedForNormalizedUrl(href: string): boolean {
  try {
    const host = new URL(href).hostname
    return BLOCKED_ROOT_HOSTNAMES.has(rootHostname(host))
  } catch {
    return false
  }
}
