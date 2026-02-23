import { NextRequest, NextResponse } from 'next/server'
import { getReportStatus, markReportComplete } from '@/lib/reportStore'

const SEOPTIMER_API_BASE = 'https://api.seoptimer.com'

const extractOutputData = (reportData: any) => {
  let outputData = reportData?.data?.output || reportData?.output || reportData?.data
  if (!outputData) return null
  if (typeof outputData === 'string') {
    try {
      outputData = JSON.parse(outputData)
    } catch {
      return null
    }
  }
  const responseData = {
    ...outputData,
    url: outputData?.finalUrl || reportData?.data?.input?.url,
    pdfUrl: outputData?.pdf || null,
  }
  return responseData
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const idParam = searchParams.get('id')
  const reportId = Number(idParam)

  if (!reportId) {
    return NextResponse.json({ error: 'Missing report id' }, { status: 400 })
  }

  const status = getReportStatus(reportId)
  if (!status) {
    // Fallback: check directly with SEOptimer (covers callback not reachable in local dev)
    const apiKey = process.env.SEOPTIMER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ status: 'pending' }, { status: 202 })
    }
    try {
      const response = await fetch(`${SEOPTIMER_API_BASE}/v1/report/get/${reportId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const outputData = extractOutputData(data)
        if (outputData) {
          markReportComplete(reportId, outputData)
          return NextResponse.json({ status: 'complete', data: outputData })
        }
      }
    } catch {
      // ignore and return pending
    }
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
