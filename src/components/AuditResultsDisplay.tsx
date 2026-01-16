'use client'

import { useEffect, useRef } from 'react'
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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Extract data
  const scores = (data as any).scores || {}
  const recommendations = (data as any).recommendations || []
  const url = data.url || ''
  const desktopScreenshot = (data as any).screenshot
  const mobileScreenshot = (data as any).deviceRendering.data?.mobile
  const reportDate = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  }) + ' UTC'

  // Helper functions
  const parseGradeToScore = (grade: string): number => {
    const gradeMap: { [key: string]: number } = {
      'A+': 98, 'A': 95, 'A-': 92,
      'B+': 88, 'B': 85, 'B-': 82,
      'C+': 78, 'C': 75, 'C-': 72,
      'D+': 68, 'D': 65, 'D-': 62,
      'F': 50
    }
    return gradeMap[grade] || 75
  }

  const formatGrade = (grade: string | number | undefined): string => {
    if (grade === undefined || grade === null || grade === '') return 'N/A'
    if (typeof grade === 'number') {
      // Convert numeric score to letter grade
      if (grade >= 98) return 'A+'
      if (grade >= 95) return 'A'
      if (grade >= 92) return 'A-'
      if (grade >= 88) return 'B+'
      if (grade >= 85) return 'B'
      if (grade >= 82) return 'B-'
      if (grade >= 78) return 'C+'
      if (grade >= 75) return 'C'
      if (grade >= 72) return 'C-'
      if (grade >= 68) return 'D+'
      if (grade >= 65) return 'D'
      if (grade >= 62) return 'D-'
      return 'F'
    }
    return grade.toString()
  }

  const getGradeColor = (grade: string | number | undefined): string => {
    if (grade === undefined || grade === null || grade === '') return '#6B7280'
    
    const gradeStr = typeof grade === 'number' ? formatGrade(grade) : grade.toString()
    
    if (gradeStr.startsWith('A')) return '#10B981' // green
    if (gradeStr.startsWith('B')) return '#F59E0B' // yellow
    if (gradeStr.startsWith('C')) return '#F59E0B' // yellow
    if (gradeStr.startsWith('D')) return '#EF4444' // red
    return '#EF4444' // red for F
  }

  const getScoreFromGrade = (grade: string | number | undefined): number => {
    if (typeof grade === 'number') return grade
    if (typeof grade === 'string') return parseGradeToScore(grade)
    return 0
  }

  const getStatusMessage = (score: number): string => {
    if (score >= 80) return 'Your page is performing well'
    if (score >= 60) return 'Your page could be better'
    return 'Your page needs improvement'
  }

  // Get overall grade
  const overallGrade = scores.overall?.grade || data.score || 'N/A'
  const overallScore = typeof overallGrade === 'number' ? overallGrade : 
    (typeof overallGrade === 'string' ? parseGradeToScore(overallGrade) : 0)

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

  // Draw radar chart
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 20

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw grid circles
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, (radius * i) / 5, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw axes
    const angleStep = (Math.PI * 2) / categories.length
    ctx.strokeStyle = '#4B5563'
    ctx.lineWidth = 1
    categories.forEach((_, index) => {
      const angle = (index * angleStep) - Math.PI / 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()
    })

    // Draw data polygon
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'
    ctx.strokeStyle = '#3B82F6'
    ctx.lineWidth = 2
    ctx.beginPath()
    categories.forEach((cat, index) => {
      const score = getScoreFromGrade(cat.grade)
      const normalizedScore = score / 100
      const angle = (index * angleStep) - Math.PI / 2
      const r = radius * normalizedScore
      const x = centerX + Math.cos(angle) * r
      const y = centerY + Math.sin(angle) * r
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Draw labels
    ctx.fillStyle = '#E5E7EB'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    categories.forEach((cat, index) => {
      const angle = (index * angleStep) - Math.PI / 2
      const labelRadius = radius + 15
      const x = centerX + Math.cos(angle) * labelRadius
      const y = centerY + Math.sin(angle) * labelRadius
      ctx.fillText(cat.label, x, y)
    })
  }, [categories])

  // Calculate circular progress
  const circumference = 2 * Math.PI * 90
  const offset = circumference - (overallScore / 100) * circumference

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Audit Results for {url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </h1>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Overall Score */}
          <div className="lg:col-span-1">
            <div className="bg-primary rounded-lg border border-gray-800 p-8 text-center">
              {/* Circular Progress */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="12"
                  />
                  {/* Progress circle */}
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
                {/* Grade Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className={`text-5xl font-bold ${getGradeColor(overallGrade) === '#10B981' ? 'text-green-400' : getGradeColor(overallGrade) === '#F59E0B' ? 'text-yellow-400' : 'text-red-400'}`}>
                      {formatGrade(overallGrade)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <p className="text-gray-300 text-lg mb-6">
                {getStatusMessage(overallScore)}
              </p>

              {/* Recommendations Button */}
              <button className="bg-accent hover:bg-accent-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors w-full">
                Recommendations: {recommendations.length}
              </button>
            </div>
          </div>

          {/* Right Column - Website Preview */}
          <div className="lg:col-span-2">
            <div className="bg-primary rounded-lg border border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Website Preview</h2>
              <div className="relative">
                {/* Desktop Preview */}
                {desktopScreenshot ? (
                  <div className="bg-white rounded-lg p-4 mb-4 shadow-lg overflow-hidden">
                    <div className="relative w-full aspect-video rounded overflow-hidden bg-gray-100">
                      <Image
                        src={desktopScreenshot}
                        alt="Website desktop preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-4 mb-4 shadow-lg">
                    <div className="bg-gray-100 rounded p-4 min-h-[300px] flex items-center justify-center text-gray-400">
                      Screenshot not available
                    </div>
                  </div>
                )}

                {/* Mobile Preview */}
                {mobileScreenshot ? (
                  <div className="absolute bottom-0 right-0 w-32 bg-white rounded-lg p-2 shadow-xl border-2 border-gray-300 overflow-hidden">
                    <div className="relative w-full aspect-[9/16] rounded overflow-hidden bg-gray-100">
                      <Image
                        src={mobileScreenshot}
                        alt="Website mobile preview"
                        fill
                        className="object-contain"
                      />
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

        {/* Category Scores and Radar Chart */}
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6 mb-8">
          {/* Category Scores */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            {categories.map((category) => {
              const score = getScoreFromGrade(category.grade)
              const gradeStr = formatGrade(category.grade)
              const color = getGradeColor(category.grade)
              const catCircumference = 2 * Math.PI * 40
              const catOffset = catCircumference - (score / 100) * catCircumference

              return (
                <div key={category.key} className="bg-primary rounded-lg border border-gray-800 p-6 text-center">
                  {/* Circular Gauge */}
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#374151"
                        strokeWidth="6"
                      />
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
                      <span className={`text-xl font-bold ${
                        color === '#10B981' ? 'text-green-400' : 
                        color === '#F59E0B' ? 'text-yellow-400' : 
                        'text-red-400'
                      }`}>
                        {gradeStr}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-300">{category.label}</h3>
                </div>
              )
            })}
          </div>

          {/* Radar Chart */}
          <div className="bg-primary rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Performance Overview</h2>
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Report Date */}
        <div className="text-center text-gray-500 text-sm">
          Report Generated: {reportDate}
        </div>
      </div>
    </div>
  )
}
