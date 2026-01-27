import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const SEOPTIMER_API_BASE = 'https://api.seoptimer.com'

// Helper function to sleep/delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to get report with polling
async function getReportWithPolling(apiKey: string, reportId: number, maxAttempts: number = 30): Promise<any> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      console.log(`Polling attempt ${attempt + 1}/${maxAttempts} for report ${reportId}`)
      
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
          console.log(`Report ${reportId} not ready yet (404), waiting...`)
          await sleep(3000) // Wait 3 seconds between attempts
          continue
        }
        
        const errorText = await response.text()
        console.error(`API Error (${response.status}):`, errorText)
        throw new Error(`Failed to get report: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`Report ${reportId} response structure:`, JSON.stringify(data, null, 2))
      
      // Check if report is ready - check multiple possible structures
      if (data.success) {
        // Check if report has completed_at timestamp (most reliable indicator)
        if (data.data?.completed_at) {
          console.log(`Report ${reportId} is ready (completed at: ${data.data.completed_at})!`)
          return data
        }
        
        // Check if output exists (could be in data.data.output or data.output)
        // Note: output can be false, null, or undefined when not ready
        // Only consider it ready if it's an actual object with data
        const output = data.data?.output || data.output
        
        if (output && typeof output === 'object' && Object.keys(output).length > 0) {
          console.log(`Report ${reportId} is ready (output data present)!`)
          return data
        }
        
        // If output exists but is false/null, report is still processing
        if (output === false || output === null) {
          if (attempt < maxAttempts - 1) {
            console.log(`Report ${reportId} still processing (output is ${output}), waiting 3 seconds...`)
            await sleep(3000)
            continue
          }
        }
      }
      
      // If report is still processing, wait and retry
      if (attempt < maxAttempts - 1) {
        console.log(`Report ${reportId} still processing, waiting 3 seconds...`)
        await sleep(3000) // Wait 3 seconds between attempts
      }
    } catch (error) {
      console.error(`Error on attempt ${attempt + 1}:`, error)
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
    const { url, saveJson } = await request.json()

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

    // Step 1: Create report
    const createReportResponse = await fetch(`${SEOPTIMER_API_BASE}/v1/report/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ 
        url: url,
        pdf: 1 // Enable PDF generation
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

    // Step 2: Get report results (with polling if needed)
    const reportData = await getReportWithPolling(apiKey, reportId)
    
    // Log the full response structure for debugging
    console.log('SEOptimer Report Response structure:', JSON.stringify(reportData, null, 2))

    // Save to JSON file if requested
    if (saveJson === true || process.env.SAVE_API_RESPONSES === 'true') {
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `seo-report-${reportId}-${timestamp}.json`
        const filePath = join(process.cwd(), 'public', 'api-responses', filename)
        
        // Ensure directory exists
        await mkdir(join(process.cwd(), 'public', 'api-responses'), { recursive: true })
        
        // Save the full reportData
        await writeFile(filePath, JSON.stringify(reportData, null, 2), 'utf-8')
        console.log(`Report saved to: ${filePath}`)
      } catch (saveError) {
        console.error('Failed to save report to file:', saveError)
        // Don't fail the request if file save fails
      }
    }

    // Parse the output JSON if it's a string
    // Try multiple possible locations for output data
    let outputData = reportData.data?.output || reportData.output || reportData.data
    
    if (!outputData) {
      console.error('No output data found in response:', reportData)
      return NextResponse.json(
        { error: 'Report data not available. The report may still be processing.' },
        { status: 503 }
      )
    }
    
    if (typeof outputData === 'string') {
      try {
        outputData = JSON.parse(outputData)
      } catch (e) {
        console.error('Failed to parse output JSON:', e)
        return NextResponse.json(
          { error: 'Failed to parse report data' },
          { status: 500 }
        )
      }
    }

    // Return the outputData from the API response
    // Add convenience fields ONLY if they don't exist, and ONLY from API response data
    // All data comes directly from the SEOptimer API response - no conversions, no hardcoded values
    const responseData = {
      ...outputData,
      // Add url from API response (finalUrl or input.url) - all from API response
      url: outputData.finalUrl || reportData.data?.input?.url,
      // Add pdfUrl from API response (pdf field)
      pdfUrl: outputData.pdf || null,
      // Note: score is available directly as scores.overall.grade from API - no conversion needed
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error checking SEO:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

