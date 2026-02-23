import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { markReportComplete, markReportError } from '@/lib/reportStore'

export async function POST(request: NextRequest) {
  try {
    let payload: any = null
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      payload = await request.json()
    } else {
      const raw = await request.text()
      try {
        payload = JSON.parse(raw)
      } catch {
        const params = new URLSearchParams(raw)
        payload = Object.fromEntries(params.entries())
      }
    }
    const reportId = Number(payload?.id)

    if (!reportId) {
      return NextResponse.json({ error: 'Missing report id' }, { status: 400 })
    }

    let outputData = payload?.output
    if (typeof outputData === 'string') {
      try {
        outputData = JSON.parse(outputData)
      } catch (e) {
        markReportError(reportId, 'Failed to parse output JSON')
        return NextResponse.json({ error: 'Invalid output JSON' }, { status: 400 })
      }
    }

    const responseData = {
      ...outputData,
      url: outputData?.finalUrl || payload?.input?.url,
      pdfUrl: outputData?.pdf || null,
    }

    markReportComplete(reportId, responseData)

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
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 })
  }
}
