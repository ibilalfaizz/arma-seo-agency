/**
 * Turns user input into a valid http(s) URL for the SEO checker.
 * Accepts: https://..., http://..., www...., example.com, example.com/path, etc.
 */
export function normalizeWebsiteUrl(input: string): string | null {
  const raw = input.trim()
  if (!raw) return null
  if (/\s/.test(raw)) return null

  let candidate = raw
  if (candidate.startsWith('//')) {
    candidate = `https:${candidate}`
  } else if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`
  }

  try {
    const parsed = new URL(candidate)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    if (!parsed.hostname) return null
    return parsed.href
  } catch {
    return null
  }
}
