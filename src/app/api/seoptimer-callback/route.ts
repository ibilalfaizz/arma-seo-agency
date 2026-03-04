import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { markReportComplete, markReportError } from '@/lib/reportStore'
import { finishAnalysisForReport } from '@/lib/analysisRateLimit'

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

export async function POST(request: NextRequest) {
  try {
    let payload: any = null
    const contentType = request.headers.get('content-type') || ''
    const raw = await request.text()

    if (contentType.includes('application/json')) {
      try {
        payload = JSON.parse(raw)
      } catch {
        payload = null
      }
    }
    if (!payload) {
      try {
        payload = JSON.parse(raw)
      } catch {
        if (contentType.includes('multipart/form-data')) {
          const boundaryMatch = contentType.match(/boundary=(.+)$/)
          const boundary = boundaryMatch ? `--${boundaryMatch[1]}` : null
          if (boundary) {
            const parts = raw.split(boundary)
            const formData: Record<string, string> = {}
            for (const part of parts) {
              const nameMatch = part.match(/name="([^"]+)"/)
              if (!nameMatch) continue
              const name = nameMatch[1]
              const valueMatch = part.split('\r\n\r\n')
              if (valueMatch.length < 2) continue
              const valueRaw = valueMatch.slice(1).join('\r\n\r\n')
              const value = valueRaw.replace(/\r\n$/, '').trim()
              if (value) formData[name] = value
            }
            payload = formData
          } else {
            const params = new URLSearchParams(raw)
            payload = Object.fromEntries(params.entries())
          }
        } else {
          const params = new URLSearchParams(raw)
          payload = Object.fromEntries(params.entries())
        }
      }
    }
    const url = new URL(request.url)
    const reportId = Number(payload?.id || payload?.report_id || url.searchParams.get('id'))

    if (!reportId) {
      console.error('Callback missing report id:', { contentType, raw: raw?.slice(0, 500) })
      return NextResponse.json({ error: 'Missing report id' }, { status: 400 })
    }

    let inputData = payload?.input
    if (typeof inputData === 'string') {
      try {
        inputData = JSON.parse(inputData)
      } catch {
        // ignore
      }
    }

    let outputData = payload?.output
    if (typeof outputData === 'string') {
      try {
        outputData = JSON.parse(outputData)
      } catch (e) {
        markReportError(reportId, 'Failed to parse output JSON')
        finishAnalysisForReport(reportId)
        return NextResponse.json({ error: 'Invalid output JSON' }, { status: 400 })
      }
    }
    if (!isValidOutput(outputData)) {
      console.warn('Callback output not ready:', { reportId })
      return NextResponse.json({ ok: true })
    }

    const responseData = {
      ...outputData,
      url: outputData?.finalUrl || inputData?.url,
      pdfUrl: outputData?.pdf || null,
    }

    markReportComplete(reportId, responseData)
    finishAnalysisForReport(reportId)

    if (process.env.SAVE_API_RESPONSES === 'true') {
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `seo-report-${reportId}-${timestamp}.json`
        const filePath = join(process.cwd(), 'public', 'api-responses', filename)
        await mkdir(join(process.cwd(), 'public', 'api-responses'), { recursive: true })
        await writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8')
      } catch (saveError) {
        // non-fatal
        console.error('Failed to save callback payload:', saveError)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Callback error:', error)
    try {
      const url = new URL(request.url)
      const idParam = url.searchParams.get('id')
      const reportId = idParam ? Number(idParam) : undefined
      if (reportId) {
        finishAnalysisForReport(reportId)
      }
    } catch {
    }
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 })
  }
}
