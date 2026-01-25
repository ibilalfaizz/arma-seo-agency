import { NextRequest, NextResponse } from 'next/server'
import { jobStore } from '@/lib/jobStore'

const SEOPTIMER_API_BASE = 'https://api.seoptimer.com'

// Helper function to sleep/delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Fallback polling function - used if callback doesn't work
async function getReportWithPolling(apiKey: string, reportId: number, maxAttempts: number = 30): Promise<any> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      console.log(`[Fallback] Polling attempt ${attempt + 1}/${maxAttempts} for report ${reportId}`)
      
      const response = await fetch(`${SEOPTIMER_API_BASE}/v1/report/get/${reportId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      })

      if (!response.ok) {
        if (response.status === 404 && attempt < maxAttempts - 1) {
          // Report not ready yet, wait and retry
          console.log(`[Fallback] Report ${reportId} not ready yet (404), waiting...`)
          await sleep(3000) // Wait 3 seconds between attempts
          continue
        }
        
        const errorText = await response.text()
        console.error(`[Fallback] API Error (${response.status}):`, errorText)
        throw new Error(`Failed to get report: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      // Check if report is ready
      if (data.success) {
        // Check if report has completed_at timestamp
        if (data.data?.completed_at) {
          console.log(`[Fallback] Report ${reportId} is ready (completed at: ${data.data.completed_at})!`)
          return data
        }
        
        // Check if output exists and is valid
        const output = data.data?.output || data.output
        
        if (output && typeof output === 'object' && Object.keys(output).length > 0) {
          console.log(`[Fallback] Report ${reportId} is ready (output data present)!`)
          return data
        }
        
        // If output exists but is false/null, report is still processing
        if (output === false || output === null) {
          if (attempt < maxAttempts - 1) {
            console.log(`[Fallback] Report ${reportId} still processing (output is ${output}), waiting 3 seconds...`)
            await sleep(3000)
            continue
          }
        }
      }
      
      // If report is still processing, wait and retry
      if (attempt < maxAttempts - 1) {
        console.log(`[Fallback] Report ${reportId} still processing, waiting 3 seconds...`)
        await sleep(3000)
      }
    } catch (error) {
      console.error(`[Fallback] Error on attempt ${attempt + 1}:`, error)
      if (attempt === maxAttempts - 1) {
        throw error
      }
      await sleep(3000)
    }
  }
  
  throw new Error(`Report generation timed out after ${maxAttempts} attempts (${maxAttempts * 3} seconds)`)
}

export async function POST(request: NextRequest) {
  try {
    const { reportId } = await request.json()

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      )
    }

    // Get API key from environment variables
    const apiKey = process.env.SEOPTIMER_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'SEOptimer API key is not configured' },
        { status: 500 }
      )
    }

    console.log(`[Fallback] Starting fallback polling for report ${reportId}`)

    // Poll the API directly
    const reportData = await getReportWithPolling(apiKey, reportId)
    
    // Parse the output data
    let outputData = reportData.data?.output || reportData.output || reportData.data
    
    if (!outputData) {
      console.error('[Fallback] No output data found in response:', reportData)
      return NextResponse.json(
        { error: 'Report data not available. The report may still be processing.' },
        { status: 503 }
      )
    }
    
    if (typeof outputData === 'string') {
      try {
        outputData = JSON.parse(outputData)
      } catch (e) {
        console.error('[Fallback] Failed to parse output JSON:', e)
        return NextResponse.json(
          { error: 'Failed to parse report data' },
          { status: 500 }
        )
      }
    }

    // Prepare response data
    const responseData = {
      ...outputData,
      url: outputData.finalUrl || reportData.data?.input?.url,
      pdfUrl: outputData.pdf || null,
    }

    // Update job status in store
    const jobStatus = {
      id: reportId,
      status: 'completed' as const,
      progress: 100,
      data: responseData,
      createdAt: Date.now()
    }
    jobStore.set(reportId, jobStatus)

    console.log(`[Fallback] Report ${reportId} completed and stored`)

    return NextResponse.json({ success: true, data: responseData })
  } catch (error) {
    console.error('[Fallback] Error in fallback polling:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
