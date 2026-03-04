import type { NextRequest } from 'next/server'

type RateLimitEntry = {
  timestamps: number[]
}

type AnalysisLockEntry = {
  reportId: number
  createdAt: number
}

const WINDOW_CLEANUP_INTERVAL_MS = 5 * 60 * 1000
const DEFAULT_ANALYSIS_TTL_MS = 10 * 60 * 1000

const rateLimitStore = new Map<string, RateLimitEntry>()
const ipAnalysisLocks = new Map<string, AnalysisLockEntry>()
const reportToIp = new Map<number, string>()

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  retryAfterMs: number
}

export const getClientIp = (request: NextRequest): string => {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor) {
    const parts = xForwardedFor.split(',').map(part => part.trim())
    if (parts[0]) return parts[0]
  }

  const xRealIp = request.headers.get('x-real-ip')
  if (xRealIp) return xRealIp

  // @ts-expect-error - NextRequest may have ip depending on runtime
  if (request.ip) return request.ip as string

  return 'unknown'
}

export const checkRateLimit = (
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult => {
  const now = Date.now()
  const entry = rateLimitStore.get(key) ?? { timestamps: [] }

  const windowStart = now - windowMs
  const withinWindow = entry.timestamps.filter(ts => ts > windowStart)

  if (withinWindow.length >= limit) {
    const oldest = withinWindow[0]
    const retryAfterMs = Math.max(0, windowMs - (now - oldest))
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs,
    }
  }

  withinWindow.push(now)
  rateLimitStore.set(key, { timestamps: withinWindow })

  return {
    allowed: true,
    remaining: Math.max(0, limit - withinWindow.length),
    retryAfterMs: 0,
  }
}

export const hasActiveAnalysisForIp = (
  ip: string,
  ttlMs: number = DEFAULT_ANALYSIS_TTL_MS
): { active: boolean; reportId?: number } => {
  const entry = ipAnalysisLocks.get(ip)
  if (!entry) {
    return { active: false }
  }

  const now = Date.now()
  if (now - entry.createdAt > ttlMs) {
    ipAnalysisLocks.delete(ip)
    reportToIp.delete(entry.reportId)
    return { active: false }
  }

  return { active: true, reportId: entry.reportId }
}

export const startAnalysisForIp = (ip: string, reportId: number) => {
  const now = Date.now()
  ipAnalysisLocks.set(ip, { reportId, createdAt: now })
  reportToIp.set(reportId, ip)
}

export const finishAnalysisForReport = (reportId: number) => {
  const ip = reportToIp.get(reportId)
  if (ip) {
    reportToIp.delete(reportId)
    ipAnalysisLocks.delete(ip)
  }
}

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    const cutoff = now - DEFAULT_ANALYSIS_TTL_MS

    ipAnalysisLocks.forEach((entry, ip) => {
      if (entry.createdAt < cutoff) {
        ipAnalysisLocks.delete(ip)
        reportToIp.delete(entry.reportId)
      }
    })

    const windowCutoff = now - WINDOW_CLEANUP_INTERVAL_MS
    rateLimitStore.forEach((entry, key) => {
      const filtered = entry.timestamps.filter(ts => ts > windowCutoff)
      if (filtered.length === 0) {
        rateLimitStore.delete(key)
      } else {
        rateLimitStore.set(key, { timestamps: filtered })
      }
    })
  }, WINDOW_CLEANUP_INTERVAL_MS)
}

