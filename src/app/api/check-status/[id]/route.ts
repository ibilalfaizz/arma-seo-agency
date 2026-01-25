import { NextRequest, NextResponse } from 'next/server'
import { jobStore } from '@/lib/jobStore'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = parseInt(params.id)
    
    if (isNaN(reportId)) {
      return NextResponse.json(
        { error: 'Invalid report ID' },
        { status: 400 }
      )
    }
    
    const jobStatus = jobStore.get(reportId)
    
    if (!jobStatus) {
      // Job not found - might still be pending
      return NextResponse.json({
        id: reportId,
        status: 'pending',
        progress: 0
      })
    }
    
    return NextResponse.json({
      id: jobStatus.id,
      status: jobStatus.status,
      progress: jobStatus.progress || 0,
      data: jobStatus.data,
      error: jobStatus.error
    })
  } catch (error) {
    console.error('Error getting job status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
