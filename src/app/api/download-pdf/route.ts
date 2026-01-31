import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pdfUrl = searchParams.get('url')

    if (!pdfUrl) {
      return NextResponse.json({ error: 'PDF URL is required' }, { status: 400 })
    }

    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(pdfUrl)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // Only allow http/https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 })
    }

    const response = await fetch(pdfUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Checker/1.0)',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch PDF: ${response.status}` },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type') || 'application/pdf'
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'attachment; filename="SEO-Report.pdf"',
      },
    })
  } catch (error) {
    console.error('PDF download error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to download PDF' },
      { status: 500 }
    )
  }
}
