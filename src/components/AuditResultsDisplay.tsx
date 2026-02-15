'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'

interface SEOData {
  url?: string
  title?: string
  description?: string
  score?: number
  [key: string]: any
}

interface AuditResultsDisplayProps {
  data: SEOData
}

export default function AuditResultsDisplay({ data }: AuditResultsDisplayProps) {
  const [pdfDownloading, setPdfDownloading] = useState(false)
  
  // Extract data
  const scores = (data as any).scores || {}
  const recommendations = (data as any).recommendations || []
  const url = data.url || ''
  const desktopScreenshot = (data as any).screenshot
  const mobileScreenshot = (data as any).deviceRendering.data?.mobile
  // Helper functions - display scores exactly as they come from API (numeric only)
  const formatGrade = (grade: string | number | undefined): string => {
    if (grade === undefined || grade === null || grade === '') return 'N/A'
    // Display numeric score directly from API
    if (typeof grade === 'number') {
      return grade.toString()
    }
    return grade.toString()
  }

  const getGradeColor = (grade: string | number | undefined): string => {
    if (grade === undefined || grade === null || grade === '') return '#6B7280'
    
    // Use numeric score directly to determine color
    const score = typeof grade === 'number' ? grade : 0
    
    if (score >= 80) return '#10B981' // green
    if (score >= 60) return '#F59E0B' // yellow
    return '#EF4444' // red
  }

  // Get score directly from API - no conversion, display as-is
  const getScoreFromGrade = useCallback((grade: string | number | undefined): number => {
    // API returns numeric grades (0-100), use them directly
    if (typeof grade === 'number') return grade
    // If it's a string, return 0 (shouldn't happen with current API)
    return 0
  }, [])

  const getStatusMessage = (score: number): string => {
    if (score >= 80) return 'Your page is performing well'
    if (score >= 60) return 'Your page could be better'
    return 'Your page needs improvement'
  }

  // Get overall grade directly from API - no conversion, display as-is
  const overallGrade = scores.overall?.grade ?? 0
  const overallScore = typeof overallGrade === 'number' ? overallGrade : 0

  // Category label mapping
  const categoryLabelMap: { [key: string]: string } = {
    'seo': 'On-Page SEO',
    'links': 'Links',
    'ui': 'Usability',
    'performance': 'Performance',
    'social': 'Social',
    'security': 'Security',
    'localseo': 'Local SEO',
    'technology': 'Technology',
  }

  // Dynamically extract categories from scores object
  const categories = Object.keys(scores)
    .filter(key => key !== 'overall' && scores[key] && scores[key].grade !== undefined && scores[key].grade !== null && scores[key].grade !== '')
    .map(key => ({
      key,
      label: categoryLabelMap[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      grade: scores[key].grade
    }))

  // Radar chart dimensions
  const radarSize = 200
  const centerX = radarSize / 2
  const centerY = radarSize / 2
  const radius = Math.min(radarSize, radarSize) / 2 - 60
  const angleStep = categories.length > 0 ? (Math.PI * 2) / categories.length : 0

  const getRadarPoint = (index: number, normalizedR: number) => {
    const angle = (index * angleStep) - Math.PI / 2
    const r = radius * normalizedR
    return {
      x: centerX + Math.cos(angle) * r,
      y: centerY + Math.sin(angle) * r,
    }
  }

  const getLabelPoint = (index: number) => {
    const angle = (index * angleStep) - Math.PI / 2
    const labelRadius = radius + 25
    const x = centerX + Math.cos(angle) * labelRadius
    let y = centerY + Math.sin(angle) * labelRadius
    // Pull top/bottom labels slightly closer to the chart
    if (Math.abs(Math.cos(angle)) < 0.2) {
      y += angle < 0 ? 8 : -8
    }
    return { x, y, angle }
  }

  const dataPolygonPoints = categories.length > 0
    ? categories
        .map((cat, i) => {
          const score = getScoreFromGrade(cat.grade)
          const p = getRadarPoint(i, score / 100)
          return `${p.x},${p.y}`
        })
        .join(' ')
    : ''

  // Calculate circular progress
  const circumference = 2 * Math.PI * 90
  const offset = circumference - (overallScore / 100) * circumference

  const handlePdfDownload = async () => {
    if (pdfDownloading) return
    setPdfDownloading(true)
    try {
      await document.fonts.ready
      const html2pdf = (await import('html2pdf.js')).default
      const element = document.getElementById('report-content-for-pdf')
      if (!element) throw new Error('Report content not found')
      const clone = element.cloneNode(true) as HTMLElement
      clone.querySelectorAll('[data-pdf-exclude]').forEach((el) => el.remove())

      const pdfStyle = document.createElement('style')
pdfStyle.innerHTML = `
  .pdf-export {
    overflow: hidden !important;
    scrollbar-width: none !important;
  }
  .pdf-export::-webkit-scrollbar,
  .pdf-export *::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }

  .pdf-export button {
    display: block;
    padding-bottom: 2px !important;
    line-height: 1.2 !important;
  }

  .pdf-export .priority-badge,
  .pdf-export .prog-text {
    display: block;
    padding-bottom: 18px;
  }
    .mti-6 {
    margin-top: 8rem !important;
    }
     .pbi-6 {
    margin-top: 8rem !important;
    }

  /* Flat PDF styling: remove boxes, borders, heavy padding */
  .pdf-export .bg-primary,
  .pdf-export .bg-primary-dark,
  .pdf-export .bg-gray-900,
  .pdf-export .bg-gray-800,
  .pdf-export .bg-slate-300 {
    background: transparent !important;
  }
  .pdf-export .border,
  .pdf-export .border-2,
  .pdf-export .border-gray-800,
  .pdf-export .border-gray-700,
  .pdf-export .border-gray-700\\/50,
  .pdf-export .border-slate-400,
  .pdf-export .border-slate-500 {
    border: 0 !important;
  }
  .pdf-export [class*="rounded"],
  .pdf-export [class*="shadow"] {
    border-radius: 0 !important;
    box-shadow: none !important;
  }
  .pdf-export .pdf-device-frame {
    background: #d1d5db !important;
    border: 1px solid #9ca3af !important;
    border-radius: 0.75rem !important;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35) !important;
    padding: 8px !important;
    box-sizing: border-box !important;
  }
  .pdf-export .pdf-device-frame.rounded-\\[3rem\\] {
    border-radius: 1.5rem !important;
  }
  .pdf-export .pdf-device-screen {
    overflow: hidden !important;
    border-radius: 0.6rem !important;
    background: #111827 !important;
  }
  .pdf-export .p-8 { padding: 12px !important; }
  .pdf-export .p-6 { padding: 10px !important; }
  .pdf-export .p-4 { padding: 8px !important; }
  .pdf-export .px-4 { padding-left: 8px !important; padding-right: 8px !important; }
  .pdf-export .px-6 { padding-left: 10px !important; padding-right: 10px !important; }
  .pdf-export .py-8 { padding-top: 12px !important; padding-bottom: 12px !important; }
  .pdf-export .mb-8 { margin-bottom: 12px !important; }
  .pdf-export .mb-6 { margin-bottom: 10px !important; }
  .pdf-export .mt-6 { margin-top: 10px !important; }

  .pdf-export svg[data-radar-chart] {
    width: 80px !important;
    height: 80px !important;
    max-width: 80px !important;
    max-height: 80px !important;
  }
  .pdf-export [data-radar-chart-area] {
    min-height: 80px !important;
  }
      .pdf-export [data-radar-chart-area] {
    width: 80px !important;
    height: 80px !important;
    min-height: 0 !important;
    padding: 0 !important;
  }
  .pdf-export .report-top-grid {
    grid-template-columns: 2fr 3fr !important;
  }
  .pdf-export .website-preview-frame {
    width: 20rem !important;
    height: 16rem !important;
  }
  .pdf-export .website-preview-mobile {
    bottom: -36px !important;
    right: -54px !important;
  }
  .pdf-export svg[data-radar-chart] text {
    font-size: 9px !important;
  }
  .pdf-export .radar-chart-area {
    margin-top: 2rem !important;
  }
 
  .pdf-export .hide-on-pdf {
    display: none !important;
  }
  .pdf-export .perf-card {
    padding: 0 !important;
  }
  .pdf-export .perf-cards-row {
    gap: 0.5rem !important;
  }
`
clone.prepend(pdfStyle)


      // Force radar SVG size in PDF export (html2canvas ignores some CSS)
      // clone.querySelectorAll('svg[data-radar-chart]').forEach((svg) => {
      //   svg.setAttribute('width', '80')
      //   svg.setAttribute('height', '80')
      //   ;(svg as HTMLElement).style.width = '80px'
      //   ;(svg as HTMLElement).style.height = '80px'
      // })

      // Website Preview: load desktop/mobile screenshots via proxy so they render in PDF
      const websitePreviewContainers = clone.querySelectorAll('[data-website-preview-img][data-pdf-src]')
      await Promise.all(
        Array.from(websitePreviewContainers).map(async (container) => {
          const url = container.getAttribute('data-pdf-src')
          const img = container.querySelector('img')
          if (!url || !img) return
          try {
            const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`
            const res = await fetch(proxyUrl)
            if (!res.ok) return
            const blob = await res.blob()
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(blob)
            })
            img.src = dataUrl
          } catch {
            // Keep original src if proxy fails
          }
        })
      )

      // Convert radar chart SVG to image so it renders correctly in PDF
      const origRadarSvg = element.querySelector('svg[data-radar-chart]')
      const cloneRadarSvg = clone.querySelector('svg[data-radar-chart]')
      if (origRadarSvg && cloneRadarSvg) {
        try {
          const svgData = new XMLSerializer().serializeToString(origRadarSvg)
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(svgBlob)
          })
          const img = document.createElement('img')
          img.src = dataUrl
          img.alt = 'Performance radar chart'
          img.style.width = '100%'
          img.style.maxWidth = '180px'
          img.style.height = 'auto'
          // cloneRadarSvg.parentNode?.replaceChild(img, cloneRadarSvg)
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/bdf1e8ee-0229-4634-b6d3-39ed0ebc0748',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditResultsDisplay.tsx:afterRadarReplace',message:'Radar replaced with img',data:{replaced:true,dataUrlLen:dataUrl?.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
          // #endregion
        } catch (e) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/bdf1e8ee-0229-4634-b6d3-39ed0ebc0748',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditResultsDisplay.tsx:radarReplaceCatch',message:'Radar replace failed',data:{err:String(e)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
          // #endregion
          // Keep SVG if conversion fails
        }
      }

      // Replace canvases with images so canvas content appears in PDF
      const originalCanvases = element.querySelectorAll('canvas')
      const cloneCanvases = clone.querySelectorAll('canvas')
      originalCanvases.forEach((origCanvas, i) => {
        const cloneCanvas = cloneCanvases[i]
        if (!cloneCanvas || !(origCanvas instanceof HTMLCanvasElement)) return
        const img = document.createElement('img')
        img.src = origCanvas.toDataURL('image/png')
        img.alt = ''
        img.style.width = '180px'
        img.style.height = 'auto'
        img.style.maxWidth = '100%'
        cloneCanvas.parentNode?.replaceChild(img, cloneCanvas)
      })

      // Device Rendering: load screenshots via our proxy (avoids CORS) and set as data URLs
      const deviceContainers = clone.querySelectorAll('[data-device-img][data-pdf-src]')
      await Promise.all(
        Array.from(deviceContainers).map(async (container) => {
          const url = container.getAttribute('data-pdf-src')
          const img = container.querySelector('img')
          if (!url || !img) return
          try {
            const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`
            const res = await fetch(proxyUrl)
            if (!res.ok) return
            const blob = await res.blob()
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(blob)
            })
            img.src = dataUrl
          } catch {
            // Keep original src if proxy fails
          }
        })
      )

      // Convert other images (e.g. desktop preview) to data URLs so they render in PDF
      const originalImgs = element.querySelectorAll('img')
      const cloneImgs = clone.querySelectorAll('img')
      await Promise.all(
        Array.from(cloneImgs).map(async (cloneImg, i) => {
          if (cloneImg.closest('[data-device-img]') || cloneImg.closest('[data-website-preview-img]')) return // already handled above
          const origImg = originalImgs[i] as HTMLImageElement | undefined
          if (!origImg?.src) return
          const src = origImg.currentSrc || origImg.src
          if (!src || src.startsWith('data:')) return
          try {
            const res = await fetch(src, { mode: 'cors' })
            const blob = await res.blob()
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(blob)
            })
            cloneImg.src = dataUrl
          } catch {
            // Try proxy for same-origin relative URLs
            try {
              const proxyUrl = src.startsWith('http') ? `/api/image-proxy?url=${encodeURIComponent(src)}` : null
              if (!proxyUrl) return
              const res = await fetch(proxyUrl)
              if (!res.ok) return
              const blob = await res.blob()
              const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(blob)
              })
              cloneImg.src = dataUrl
            } catch {
              // Keep original src
            }
          }
        })
      )

    
      const radarArea = clone.querySelector('[data-radar-chart-area]')
      const imgsInRadarArea = radarArea?.querySelectorAll('img')?.length ?? 0
      const websitePreviewContainersFinal = clone.querySelectorAll('[data-website-preview-img]').length
      const allImgs = clone.querySelectorAll('img')
      const imgSources = Array.from(allImgs).slice(0, 8).map((i) => ({ src: (i.getAttribute('src') || '').substring(0, 50), alt: i.alt, inRadar: !!i.closest('[data-radar-chart-area]'), inWebsitePreview: !!i.closest('[data-website-preview-img]') }))
      fetch('http://127.0.0.1:7242/ingest/bdf1e8ee-0229-4634-b6d3-39ed0ebc0748',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuditResultsDisplay.tsx:beforeHtml2pdf',message:'Clone state before html2pdf',data:{imgsInRadarArea,websitePreviewContainersFinal,totalImgs:allImgs.length,imgSources},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3,H4,H5'})}).catch(()=>{});
      // #endregion

      // Force darker background and no white margin; mark clone for PDF-specific CSS
      clone.classList.add('pdf-export')
      clone.style.backgroundColor = '#0d0d0d'
      clone.style.setProperty('-webkit-print-color-adjust', 'exact')
      clone.style.setProperty('print-color-adjust', 'exact')
      clone.style.color = '#ffffff'
      clone.style.padding = '12px 12px 8px'
      clone.style.minHeight = '100vh'
      // (dark filler removed — background is handled via jsPDF page stream)

      const opts: Record<string, unknown> = {
        margin: 0,
        filename: 'SEO-Report.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        pagebreak: {
          before: '.pdf-new-page',
          avoid: ['.pdf-avoid-break'],
        },
        html2canvas: {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#0d0d0d',
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }

      let canvasWidth = 0
      let canvasHeight = 0
      let canvasRef: HTMLCanvasElement | null = null

      await html2pdf()
      .set(opts)
      .from(clone)
      .toPdf()
      .get('pdf')
      .then((pdf: any) => {
        

          pdf.save('SEO-Report.pdf')
        })
    
    } catch (err) {
      console.error('PDF download error:', err)
    } finally {
      setPdfDownloading(false)
    }
  }

  return (
    <div className=" pdf-avoid-break report-root  rounded-lg">
      <div className="container mx-auto  max-w-7xl">
        {/* Header with Explanatory Text */}
        <div className="bg-primary p-8 rounded-lg">
        <div className="mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Website Report for <span className="text-accent">{url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
          </h1>
          <p className="text-gray-300 text-base leading-relaxed max-w-4xl mb-2">
            This report grades your website on the strength of a range of important factors such as on-page SEO optimization, off-page backlinks, social, performance, security and more. The overall grade is on a A+ to F- scale, with most major industry leading websites in the A range. Improving a website&apos;s grade is recommended to ensure a better website experience for your users and improved ranking and visibility by search engines.
          </p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Audit Results for <span className="text-accent">{url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
            </h2>
            <button
              type="button"
              data-pdf-exclude
              onClick={handlePdfDownload}
              disabled={pdfDownloading}
              className="bg-accent hover:bg-accent-dark disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              {pdfDownloading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF Report
                </>
              )}
            </button>
          </div>
        </div>
       
        {/* Main Content Grid - Score card (40%) + Website Preview (60%) */}
        <div className="grid lg:grid-cols-2 gap-6 mb-2 report-top-grid">
          {/* Left - Score card with circular gauge and recommendations */}
          <div className="flex items-center h-full">
            <div className="rounded-lg p-8 text-center w-full">
              {/* Circular Progress */}
              <div className="relative w-36 h-36 mx-auto mb-4">
                <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="#374151" strokeWidth="12" />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke={getGradeColor(overallGrade)}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span
                    className={`prog-text text-4xl font-bold tabular-nums ${getGradeColor(overallGrade) === '#10B981' ? 'text-green-400' : getGradeColor(overallGrade) === '#F59E0B' ? 'text-yellow-400' : 'text-red-400'}`}
                    style={{ lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '0.05em' }}
                  >
                    {formatGrade(overallGrade)}
                  </span>
                </div>
              </div>
              <p className="text-gray-300 text-base mb-4">
                {getStatusMessage(overallScore)}
              </p>
              <button
                onClick={() => {
                  const recommendationsSection = document.getElementById('recommendations-section')
                  if (recommendationsSection) {
                    recommendationsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }}
             

                className="pdf-report-button bg-accent text-white font-semibold px-4 rounded-lg w-full text-center d-block" style={{height:'48px',lineHeight:'48px'}}
              >
            <span className='prog-text' style={{display:'inline-block'}}>   Recommendations: {recommendations.length}</span>  
              </button>
            </div>
          </div>

          {/* Right - Website Preview */}
          <div>
            <div className=" rounded-lg  p-6 h-full flex flex-col justify-center items-center">
              <h2 className="text-xl font-bold text-white mb-4 hide-on-pdf">Website Preview</h2>
              <div className="relative website-preview-frame" style={{width:'28rem',height:'23rem'}}>
                {desktopScreenshot ? (
                  <div className=" rounded-lg p-4 mb-4 shadow-lg overflow-hidden" data-website-preview-img data-pdf-src={desktopScreenshot} style={{width:'100%',height:'100%'}}>
                    <div className="bg-slate-300 border-2 border-slate-400 rounded-xl p-2 shadow-2xl relative pdf-device-frame" style={{width:'100%',height:'100%',boxShadow:'0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'}}>
                      <div className="relative w-full rounded overflow-hidden bg-gray-100 pdf-device-screen" style={{width:'100%',height:'100%'}}>
                        <Image
                          src={desktopScreenshot}
                          alt="Website desktop preview"
                          fill
                          className="object-contain object-top"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-4 mb-4 shadow-lg">
                    <div className="bg-gray-100 rounded p-4 min-h-[300px] flex items-center justify-center text-gray-400">
                      Screenshot not available
                    </div>
                  </div>
                )}
                {mobileScreenshot ? (
                  <div className="absolute bottom-0 right-0 w-32 rounded-lg p-2 shadow-xl overflow-hidden website-preview-mobile" data-website-preview-img data-pdf-src={mobileScreenshot}>
                    <div className="bg-slate-300 border-2 border-slate-400 rounded-[2rem] p-2 shadow-2xl relative w-full pdf-device-frame" style={{boxShadow:'0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'}}>
                      <div className="relative w-full aspect-[9/16] rounded-[1.6rem] overflow-hidden bg-gray-100 pdf-device-screen">
                        <Image
                          src={mobileScreenshot}
                          alt="Website mobile preview"
                          fill
                          className="object-contain object-top"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute bottom-0 right-0 w-32 bg-white rounded-lg p-2 shadow-xl border-2 border-gray-300">
                    <div className="bg-gray-100 rounded p-2 min-h-[200px] flex items-center justify-center text-gray-400 text-xs">
                      No preview
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
        {/* Performance Overview: category scores + radar chart in one line */}
        <div className="mb-2 bg-primary p-8 rounded-lg mt-2">
          <h2 className="text-xl font-bold text-white mb-4">Performance Overview</h2>
          <div className="flex flex-col lg:flex-row items-start gap-4">
            {/* Left - 4 category score cards in a single row on large screens */}
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:basis-[80%] lg:justify-start perf-cards-row">
              {categories.map((category) => {
                const score = getScoreFromGrade(category.grade)
                const gradeStr = formatGrade(category.grade)
                const color = getGradeColor(category.grade)
                const catCircumference = 2 * Math.PI * 40
                const catOffset = catCircumference - (score / 100) * catCircumference

                return (
                  <div key={category.key} className=" rounded-lg border border-gray-800 p-3 w-[120px] flex flex-col items-center justify-center perf-card">
                    <div className="relative w-20 h-20 mb-3">
                      <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#374151" strokeWidth="6" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={color}
                          strokeWidth="6"
                          strokeDasharray={catCircumference}
                          strokeDashoffset={catOffset}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className={`prog-text text-xl font-bold tabular-nums ${
                            color === '#10B981' ? 'text-green-400' :
                            color === '#F59E0B' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}
                          style={{ lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '0.05em' }}
                        >
                          {gradeStr}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xs font-semibold text-gray-300 text-center">{category.label}</h3>
                  </div>
                )
              })}
               <div className="ms-9 rounded-lg  p-2 flex items-center justify-center min-h-[130px] w-full lg:basis-[35%] radar-chart-area" data-radar-chart-area>
              <svg data-radar-chart viewBox={`0 0 ${radarSize} ${radarSize}`} className="max-w-[200px] max-h-[200px]" xmlns="http://www.w3.org/2000/svg">
                {[1, 2, 3, 4, 5].map((i) => (
                  <circle
                    key={i}
                    cx={centerX}
                    cy={centerY}
                    r={(radius * i) / 5}
                    fill="none"
                    stroke="#374151"
                    strokeWidth="1"
                  />
                ))}
                {categories.map((_, index) => {
                  const p = getRadarPoint(index, 1)
                  return (
                    <line
                      key={index}
                      x1={centerX}
                      y1={centerY}
                      x2={p.x}
                      y2={p.y}
                      stroke="#4B5563"
                      strokeWidth="1"
                    />
                  )
                })}
                {dataPolygonPoints && (
                  <polygon
                    points={dataPolygonPoints}
                    fill="rgba(59, 130, 246, 0.3)"
                    stroke="#3B82F6"
                    strokeWidth="2"
                  />
                )}
                {categories.map((cat, index) => {
                  const { x, y } = getLabelPoint(index)
                  return (
                    <text
                      key={index}
                      x={x}
                      y={y}
                      fill="#E5E7EB"
                      fontSize="13"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="font-sans"
                    >
                      {cat.label}
                    </text>
                  )
                })}
              </svg>
            </div>
            </div>

            {/* Right - radar chart */}
           
          </div>
        </div>
      </div>
    </div>
  )
}
