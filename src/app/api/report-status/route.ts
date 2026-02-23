import { NextRequest, NextResponse } from 'next/server'
import { getReportStatus } from '@/lib/reportStore'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const idParam = searchParams.get('id')
  const reportId = Number(idParam)

  if (!reportId) {
    return NextResponse.json({ error: 'Missing report id' }, { status: 400 })
  }

  const status = getReportStatus(reportId)
  if (!status) {
    return NextResponse.json({ status: 'pending' }, { status: 202 })
  }

  if (status.status === 'error') {
    return NextResponse.json({ status: 'error', error: status.error || 'Unknown error' }, { status: 500 })
  }

  if (status.status === 'complete') {
    return NextResponse.json({ status: 'complete', data: status.data })
  }

  return NextResponse.json({ status: 'pending' }, { status: 202 })
}
