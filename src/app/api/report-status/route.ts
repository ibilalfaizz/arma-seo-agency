import { NextRequest, NextResponse } from 'next/server'
import { getReportStatus, markReportComplete } from '@/lib/reportStore'
import { checkRateLimit, finishAnalysisForReport, getClientIp } from '@/lib/analysisRateLimit'

const SEOPTIMER_API_BASE = 'https://api.seoptimer.com'

const isValidOutput = (output: any) => {
  if (!output || typeof output !== 'object') return false
  const hasAnyKey = Object.keys(output).length > 0
  if (!hasAnyKey) return false
  return Boolean(
    output.scores ||
    output.score ||
    output.recommendations ||
    output.title ||
    output.description ||
    output.finalUrl ||
    output.pdf ||
    output.seo ||
    output.links ||
    output.ui ||
    output.performance
  )
}

const extractOutputData = (reportData: any) => {
  let outputData = reportData?.data?.output || reportData?.output || reportData?.data
  if (!outputData || outputData === false) return null
  if (typeof outputData === 'string') {
    try {
      outputData = JSON.parse(outputData)
    } catch {
      return null
    }
  }
  if (!isValidOutput(outputData)) {
    return null
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

  const ip = getClientIp(request)
  const statusLimitKey = `status:${ip}:${reportId}`
  const statusLimit = checkRateLimit(statusLimitKey, 60, 5 * 60 * 1000)
  if (!statusLimit.allowed) {
    const response = NextResponse.json(
      {
        error: 'Too many status requests. Please slow down.',
        retryAfterMs: statusLimit.retryAfterMs,
      },
      { status: 429 }
    )
    if (statusLimit.retryAfterMs > 0) {
      response.headers.set(
        'Retry-After',
        Math.ceil(statusLimit.retryAfterMs / 1000).toString()
      )
    }
    return response
  }

  const status = getReportStatus(reportId)
  if (status?.status === 'complete') {
    finishAnalysisForReport(reportId)
    return NextResponse.json({ status: 'complete', data: status.data })
  }
  if (status?.status === 'error') {
    finishAnalysisForReport(reportId)
    return NextResponse.json(
      { status: 'error', error: status.error || 'Unknown error' },
      { status: 500 }
    )
  }

  // Always check directly with SEOptimer so we don't rely on in-memory state
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
        finishAnalysisForReport(reportId)
        return NextResponse.json({ status: 'complete', data: outputData })
      }
    }
  } catch {
    // ignore and return pending
  }
  return NextResponse.json({ status: 'pending' }, { status: 202 })

  return NextResponse.json({ status: 'pending' }, { status: 202 })
}
