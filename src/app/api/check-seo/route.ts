import { NextRequest, NextResponse } from 'next/server'
import { markReportPending } from '@/lib/reportStore'
import {
  checkRateLimit,
  finishAnalysisForReport,
  getClientIp,
  hasActiveAnalysisForIp,
  startAnalysisForIp,
} from '@/lib/analysisRateLimit'

const SEOPTIMER_API_BASE = 'https://api.seoptimer.com'

const getBaseUrl = (request: NextRequest) => {
  const origin = request.headers.get('origin')
  if (origin) return origin
  const host = request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') || 'http'
  return host ? `${proto}://${host}` : ''
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    const ip = getClientIp(request)
    console.log(ip,'ip')

    const existingAnalysis = hasActiveAnalysisForIp(ip)
    if (existingAnalysis.active) {
      return NextResponse.json(
        {
          error:
            'An analysis is already running for your IP. Please wait for it to complete before starting a new one.',
          reportId: existingAnalysis.reportId,
        },
        { status: 429 }
      )
    }

    const startLimitKey = `start:${ip}`
    const startLimit = checkRateLimit(startLimitKey, 5, 60 * 1000)
    if (!startLimit.allowed) {
      const response = NextResponse.json(
        {
          error: 'Too many analyses started from this IP. Please wait and try again.',
          retryAfterMs: startLimit.retryAfterMs,
        },
        { status: 429 }
      )
      if (startLimit.retryAfterMs > 0) {
        response.headers.set(
          'Retry-After',
          Math.ceil(startLimit.retryAfterMs / 1000).toString()
        )
      }
      return response
    }

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Get API key from environment variables
    const apiKey = process.env.SEOPTIMER_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'SEOptimer API key is not configured. Please set SEOPTIMER_API_KEY in your environment variables.' },
        { status: 500 }
      )
    }

    // Step 1: Create report (callback-based to avoid long polling timeouts)
    const baseUrl = getBaseUrl(request)
    const callbackUrl = baseUrl ? `${baseUrl}/api/seoptimer-callback` : undefined

    const createReportResponse = await fetch(`${SEOPTIMER_API_BASE}/v1/report/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ 
        url: url,
        pdf: 1, // Enable PDF generation
        ...(callbackUrl ? { callback: callbackUrl } : {}),
      }),
    })

    if (!createReportResponse.ok) {
      const errorText = await createReportResponse.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || 'Unknown error occurred' }
      }
      
      console.error('SEOptimer Create Report Error:', {
        status: createReportResponse.status,
        statusText: createReportResponse.statusText,
        error: errorData
      })
      
      return NextResponse.json(
        { 
          error: errorData.message || errorData.error || `API returned status ${createReportResponse.status}` 
        },
        { status: createReportResponse.status }
      )
    }

    const createReportText = await createReportResponse.text()
    let createReportData: any = null
    try {
      createReportData = JSON.parse(createReportText)
    } catch {
      createReportData = null
    }

    if (!createReportData?.success || !createReportData?.data?.id) {
      // Retry once without callback in case callback URL is rejected
      if (callbackUrl) {
        const retryResponse = await fetch(`${SEOPTIMER_API_BASE}/v1/report/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({ url, pdf: 1 }),
        })
        const retryText = await retryResponse.text()
        try {
          const retryData = JSON.parse(retryText)
          if (retryData?.success && retryData?.data?.id) {
            createReportData = retryData
          } else {
            console.error('SEOptimer Create Report Error (retry):', retryText)
          }
        } catch {
          console.error('SEOptimer Create Report Error (retry):', retryText)
        }
      }
    }

    if (!createReportData?.success || !createReportData?.data?.id) {
      console.error('SEOptimer Create Report Error (raw):', createReportText)
      return NextResponse.json(
        { error: 'Failed to create report: Invalid response from API' },
        { status: 500 }
      )
    }

    const reportId = createReportData.data.id
    console.log('Report created with ID:', reportId)

    if (!callbackUrl) {
      return NextResponse.json(
        { error: 'Callback URL could not be determined. Please set a valid origin.' },
        { status: 500 }
      )
    }

    markReportPending(reportId, { url })
    startAnalysisForIp(ip, reportId)

    return NextResponse.json({ status: 'pending', reportId })
  } catch (error) {
    console.error('Error checking SEO:', error)
    try {
      const { url } = await request.json()
      const ip = getClientIp(request)
      const existing = hasActiveAnalysisForIp(ip)
      if (existing.active && existing.reportId) {
        finishAnalysisForReport(existing.reportId)
      }
    } catch {
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

