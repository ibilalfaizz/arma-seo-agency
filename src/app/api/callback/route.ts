import { NextRequest, NextResponse } from 'next/server'
import { jobStore, JobStatus } from '@/lib/jobStore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Callback received from SEOptimer:', JSON.stringify(body, null, 2))
    
    // Extract report ID from the callback data
    // The structure may vary, but typically it's in data.id or id
    const reportId = body.data?.id || body.id
    
    if (!reportId) {
      console.error('No report ID in callback:', body)
      return NextResponse.json(
        { error: 'No report ID provided' },
        { status: 400 }
      )
    }
    
    // Parse the output data - handle multiple possible structures
    // Could be: body.data.output, body.data.data.output, body.output, or body.data
    let outputData = body.data?.data?.output || body.data?.output || body.output || body.data
    
    // If outputData is false or null, the report might still be processing
    if (outputData === false || outputData === null) {
      console.log(`Report ${reportId} callback received but output is ${outputData}, marking as processing`)
      const jobStatus: JobStatus = {
        id: reportId,
        status: 'processing',
        progress: 50,
        createdAt: Date.now()
      }
      jobStore.set(reportId, jobStatus)
      return NextResponse.json({ success: true, message: 'Callback received, report still processing' })
    }
    
    if (!outputData || (typeof outputData === 'object' && Object.keys(outputData).length === 0)) {
      console.error('No output data in callback:', body)
      // Mark as error
      const jobStatus: JobStatus = {
        id: reportId,
        status: 'error',
        error: 'No output data received',
        createdAt: Date.now()
      }
      jobStore.set(reportId, jobStatus)
      return NextResponse.json(
        { error: 'No output data provided' },
        { status: 400 }
      )
    }
    
    // Parse output if it's a string
    if (typeof outputData === 'string') {
      try {
        outputData = JSON.parse(outputData)
      } catch (e) {
        console.error('Failed to parse output JSON:', e)
        const jobStatus: JobStatus = {
          id: reportId,
          status: 'error',
          error: 'Failed to parse output data',
          createdAt: Date.now()
        }
        jobStore.set(reportId, jobStatus)
        return NextResponse.json(
          { error: 'Failed to parse output data' },
          { status: 400 }
        )
      }
    }
    
    // Prepare response data - same structure as polling response
    const responseData = {
      ...outputData,
      url: outputData.finalUrl || body.data?.data?.input?.url || body.data?.input?.url,
      pdfUrl: outputData.pdf || null,
    }
    
    // Update job status to completed
    const jobStatus: JobStatus = {
      id: reportId,
      status: 'completed',
      progress: 100,
      data: responseData,
      createdAt: Date.now()
    }
    
    jobStore.set(reportId, jobStatus)
    console.log(`Job ${reportId} marked as completed`)
    
    return NextResponse.json({ success: true, message: 'Callback received' })
  } catch (error) {
    console.error('Error processing callback:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

