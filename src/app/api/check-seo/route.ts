import { NextRequest, NextResponse } from 'next/server'
import { markReportPending } from '@/lib/reportStore'

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

    const createReportData = await createReportResponse.json()
    
    if (!createReportData.success || !createReportData.data || !createReportData.data.id) {
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

    // Mark pending so the status endpoint can respond immediately
    markReportPending(reportId, { url })

    // Return pending status; client will poll our status endpoint
    return NextResponse.json({ status: 'pending', reportId })
  } catch (error) {
    console.error('Error checking SEO:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

