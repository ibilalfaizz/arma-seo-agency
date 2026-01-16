import { NextRequest, NextResponse } from 'next/server'

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
        // Check if output exists (could be in data.data.output or data.output)
        const output = data.data?.output || data.output
        
        if (output) {
          console.log(`Report ${reportId} is ready!`)
          return data
        }
        
        // Check if report has completed_at timestamp
        if (data.data?.completed_at) {
          console.log(`Report ${reportId} completed at:`, data.data.completed_at)
          return data
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

    // Step 1: Create report
    // According to SEOptimer API docs: https://documenter.getpostman.com/view/1513509/RWaC3CbQ
    const createReportResponse = await fetch(`${SEOPTIMER_API_BASE}/v1/report/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ 
        url: url,
        pdf: 0 // Set to 1 if you want PDF generation
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

    // Helper function to convert grade to numeric score
    // API returns numeric grades directly, but we handle both string and numeric
    const gradeToScore = (grade: string | number | undefined): number | undefined => {
      if (grade === undefined || grade === null || grade === '') return undefined
      
      // If it's already a number, return it
      if (typeof grade === 'number') {
        return grade
      }
      
      // If it's a string grade (like "B+"), convert it
      if (typeof grade === 'string') {
        const gradeMap: { [key: string]: number } = {
          'A+': 98, 'A': 95, 'A-': 92,
          'B+': 88, 'B': 85, 'B-': 82,
          'C+': 78, 'C': 75, 'C-': 72,
          'D+': 68, 'D': 65, 'D-': 62,
          'F': 50
        }
        return gradeMap[grade] || 75
      }
      
      return undefined
    }

    // Extract and return only the selected parameters
    // The API response structure is: { success: true, data: { output: {...} } }
    // We return the output data directly, preserving all fields
    const selectedData = {
      ...outputData, // Include all output data first
      url: reportData.data?.input?.url || url,
      reportId: reportId,
      // Extract specific fields for display compatibility
      title: outputData?.title?.data || null,
      description: outputData?.description?.data || null,
      // Grade is already numeric (0-100), no conversion needed
      score: typeof outputData?.scores?.overall?.grade === 'number' 
        ? outputData.scores.overall.grade 
        : gradeToScore(outputData?.scores?.overall?.grade),
    }

    return NextResponse.json(selectedData)
  } catch (error) {
    console.error('Error checking SEO:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

