import { NextRequest, NextResponse } from 'next/server'
import { jobStore } from '@/lib/jobStore'

const SEOPTIMER_API_BASE = 'https://api.seoptimer.com'

// Helper function to get the callback URL
function getCallbackUrl(request: NextRequest): string {
  // Try to get from environment variable first
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback`
  }
  
  // Get from request headers (for Vercel/production)
  const host = request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  
  if (host) {
    return `${protocol}://${host}/api/callback`
  }
  
  // Fallback to localhost for development
  return 'http://localhost:3000/api/callback'
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

    // Get callback URL
    const callbackUrl = getCallbackUrl(request)
    console.log('Using callback URL:', callbackUrl)

    // Step 1: Create report with callback
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
        callback: callbackUrl // Add callback URL
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
    console.log('Report created with ID:', reportId, 'Waiting for callback...')

    // Initialize job status in store
    const jobStatus = {
      id: reportId,
      status: 'pending' as const,
      progress: 0,
      createdAt: Date.now()
    }
    jobStore.set(reportId, jobStatus)

    // Return immediately with job ID for frontend to poll
    return NextResponse.json({
      success: true,
      id: reportId,
      message: 'Report generation started. Use the status endpoint to check progress.'
    })
  } catch (error) {
    console.error('Error checking SEO:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

