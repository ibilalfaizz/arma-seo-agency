'use client'

import { useState } from 'react'
import { SEOData } from '@/app/results/page'

interface ResultsDisplayProps {
  data: SEOData
}

export default function ResultsDisplay({ data }: ResultsDisplayProps) {
  const [expandedSections, setExpandedSections] = useState({
    seo: false,
    performance: false,
    recommendations: true,
  })

  const toggleSection = (section: 'seo' | 'performance' | 'recommendations') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const formatScore = (score: number | undefined) => {
    if (score === undefined) return 'N/A'
    return Math.round(score)
  }

  const getScoreColor = (score: number | undefined) => {
    if (score === undefined) return 'text-gray-400'
    if (score >= 80) return 'text-green-400'
    if (score >= 50) return 'text-yellow-400'
    return 'text-accent'
  }

  const getGradeColor = (grade: string | number | undefined) => {
    if (grade === undefined || grade === null || grade === '') return 'text-gray-400'
    
    // Handle numeric grades (API returns numbers like 54, 25, 100)
    if (typeof grade === 'number') {
      if (grade >= 80) return 'text-green-400'
      if (grade >= 50) return 'text-yellow-400'
      return 'text-accent'
    }
    
    // Handle string grades (like "A+", "B", etc.)
    if (typeof grade === 'string') {
      if (grade.startsWith('A')) return 'text-green-400'
      if (grade.startsWith('B')) return 'text-yellow-400'
      if (grade.startsWith('C')) return 'text-yellow-500'
      return 'text-accent'
    }
    
    return 'text-gray-400'
  }

  // Helper to format grade for display
  const formatGrade = (grade: string | number | undefined): string => {
    if (grade === undefined || grade === null || grade === '') return 'N/A'
    if (typeof grade === 'number') return grade.toString()
    return grade
  }

  // Extract scores for display
  const scores = (data as any).scores
  const headers = (data as any).headers
  const keywords = (data as any).keywords
  const backlinks = (data as any).backlinks
  const onPageLinks = (data as any).onPageLinks
  const brokenLinks = (data as any).brokenLinks
  const imageAlt = (data as any).imageAlt
  const serverResponseTime = (data as any).serverResponseTime
  const pageSize = (data as any).pageSize
  const recommendations = (data as any).recommendations || []
  const titleCheck = (data as any).titleCheck || (data as any).title
  const descriptionCheck = (data as any).descriptionCheck || (data as any).description
  const mobilePageInsights = (data as any).mobilePageInsights

  // Calculate "better than X%" (simplified - in real app, this would come from API)
  const betterThanPercent = data.score ? Math.min(100, Math.max(0, data.score + 12)) : 76

  // Extract top issues affecting rankings
  const topIssues: Array<{ issue: string; impact: string }> = []
  
  if (titleCheck && !titleCheck.passed) {
    topIssues.push({ issue: titleCheck.shortAnswer || 'Title tag issues', impact: 'High' })
  }
  if (descriptionCheck && !descriptionCheck.passed) {
    topIssues.push({ issue: descriptionCheck.shortAnswer || 'Meta description issues', impact: 'High' })
  }
  if (imageAlt && imageAlt.data && imageAlt.data.noAltCount > 0) {
    topIssues.push({ issue: `${imageAlt.data.noAltCount} images missing alt text`, impact: 'Medium' })
  }
  if (mobilePageInsights && !mobilePageInsights.passed && mobilePageInsights.data?.score) {
    topIssues.push({ issue: `Mobile performance score: ${mobilePageInsights.data.score}/100`, impact: 'High' })
  }
  if (backlinks && backlinks.data && backlinks.data.backlinks < 10) {
    topIssues.push({ issue: 'Low backlink count affecting authority', impact: 'High' })
  }

  return (
    <div className="mt-8 space-y-6 animate-fadeIn">
      {/* Overall SEO Score Card */}
      {data.score !== undefined && (
        <div className="bg-primary-light rounded-lg border border-gray-800 p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Overall SEO Score</h2>
              <p className="text-gray-400 mb-4">Better than {betterThanPercent}% of websites</p>
              
              {/* Industry Average */}
              <div className="mb-4">
                <p className="text-sm text-gray-500">Industry Average 72 - 71</p>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full">
                <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-1000"
                    style={{ width: `${data.score || 0}%` }}
                  />
                </div>
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-800 rounded-full"
                  style={{ left: `calc(${data.score || 0}% - 6px)` }}
                />
                <p className="text-xs text-gray-500 mt-2">Blaking+ one {betterThanPercent}% of websites</p>
              </div>
            </div>
            
            <div className="text-center lg:text-right">
              <div className={`text-6xl font-bold ${getScoreColor(data.score)} mb-2`}>
                {formatScore(data.score)}
                <span className="text-2xl text-gray-500">/100</span>
              </div>
              {scores?.overall?.grade !== undefined && scores?.overall?.grade !== '' && (
                <div className={`text-xl font-semibold ${getGradeColor(scores.overall.grade)}`}>
                  Grade: {formatGrade(scores.overall.grade)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Scores */}
      {scores && (
        <div className="bg-primary rounded-lg border border-gray-800 p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Category Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {scores.seo && (
              <div className="text-center p-6 bg-primary-dark rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                <svg className="w-10 h-10 mx-auto mb-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div className={`text-3xl font-bold ${getGradeColor(scores.seo.grade)} mb-2`}>
                  {formatGrade(scores.seo.grade)}
                </div>
                <div className="text-sm font-semibold text-gray-300 uppercase mb-2">SEO</div>
                <p className="text-xs text-gray-500 leading-relaxed">{scores.seo.title}</p>
              </div>
            )}
            {scores.performance && (
              <div className="text-center p-6 bg-primary-dark rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                <svg className="w-10 h-10 mx-auto mb-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div className={`text-3xl font-bold ${getGradeColor(scores.performance.grade)} mb-2`}>
                  {formatGrade(scores.performance.grade)}
                </div>
                <div className="text-sm font-semibold text-gray-300 uppercase mb-2">Performance</div>
                <p className="text-xs text-gray-500 leading-relaxed">{scores.performance.title}</p>
              </div>
            )}
            {scores.ui && (
              <div className="text-center p-6 bg-primary-dark rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                <svg className="w-10 h-10 mx-auto mb-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div className={`text-3xl font-bold ${getGradeColor(scores.ui.grade)} mb-2`}>
                  {formatGrade(scores.ui.grade)}
                </div>
                <div className="text-sm font-semibold text-gray-300 uppercase mb-2">Usability</div>
                <p className="text-xs text-gray-500 leading-relaxed">{scores.ui.title}</p>
              </div>
            )}
            {scores.links && (
              <div className="text-center p-6 bg-primary-dark rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                <svg className="w-10 h-10 mx-auto mb-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <div className={`text-3xl font-bold ${getGradeColor(scores.links.grade)} mb-2`}>
                  {formatGrade(scores.links.grade)}
                </div>
                <div className="text-sm font-semibold text-gray-300 uppercase mb-2">Links</div>
                <p className="text-xs text-gray-500 leading-relaxed">{scores.links.title}</p>
              </div>
            )}
            {scores.security && scores.security.grade !== '' && (
              <div className="text-center p-6 bg-primary-dark rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                <svg className="w-10 h-10 mx-auto mb-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div className={`text-3xl font-bold ${getGradeColor(scores.security.grade)} mb-2`}>
                  {formatGrade(scores.security.grade)}
                </div>
                <div className="text-sm font-semibold text-gray-300 uppercase mb-2">Security</div>
                <p className="text-xs text-gray-500 leading-relaxed">{scores.security.title || 'Security assessment'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEO Metrics - Collapsible */}
      {(headers || keywords || backlinks || onPageLinks || brokenLinks || imageAlt) && (
        <div className="bg-primary rounded-lg border border-gray-800 shadow-xl">
          <button
            onClick={() => toggleSection('seo')}
            className="w-full flex items-center justify-between p-6 hover:bg-primary-light transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-lg font-semibold">SEO Metrics</span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.seo ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.seo && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {headers?.data && (
                  <div className="p-4 bg-primary-dark rounded-lg border border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase">Headings</h4>
                    <div className="space-y-1 text-gray-200">
                      {headers.data.h1 && <div>H1: {headers.data.h1.length}</div>}
                      {headers.data.h2 && <div>H2: {headers.data.h2.length}</div>}
                      {headers.data.h3 && <div>H3: {headers.data.h3?.length || 0}</div>}
                    </div>
                  </div>
                )}
                {keywords?.data?.keywords && (
                  <div className="p-4 bg-primary-dark rounded-lg border border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase">Keywords</h4>
                    <div className="text-lg text-gray-200 font-semibold mb-2">
                      {keywords.data.keywords.length} keywords found
                    </div>
                  </div>
                )}
                {backlinks?.data && (
                  <div className="p-4 bg-primary-dark rounded-lg border border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase">Backlinks</h4>
                    <div className="text-lg text-gray-200 font-semibold">
                      {backlinks.data.backlinks || 0}
                    </div>
                  </div>
                )}
                {onPageLinks?.data && (
                  <div className="p-4 bg-primary-dark rounded-lg border border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase">On-Page Links</h4>
                    <div className="space-y-1 text-gray-200">
                      <div>Total: {onPageLinks.data.total || 0}</div>
                      <div>Internal: {onPageLinks.data.filesCount || 0}</div>
                      <div>External: {onPageLinks.data.externalCount || 0}</div>
                    </div>
                  </div>
                )}
                {brokenLinks?.data && (
                  <div className="p-4 bg-primary-dark rounded-lg border border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase">Broken Links</h4>
                    <div className="text-lg text-gray-200 font-semibold">
                      {Array.isArray(brokenLinks.data) ? brokenLinks.data.length : 0}
                    </div>
                  </div>
                )}
                {imageAlt?.data && (
                  <div className="p-4 bg-primary-dark rounded-lg border border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase">Images</h4>
                    <div className="space-y-1 text-gray-200">
                      <div>Total: {imageAlt.data.total || 0}</div>
                      <div>With Alt: {imageAlt.data.altCount || 0}</div>
                      <div>Missing Alt: {imageAlt.data.noAltCount || 0}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Performance Metrics - Collapsible */}
      {(serverResponseTime || pageSize) && (
        <div className="bg-primary rounded-lg border border-gray-800 shadow-xl">
          <button
            onClick={() => toggleSection('performance')}
            className="w-full flex items-center justify-between p-6 hover:bg-primary-light transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg font-semibold">Performance Metrics</span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.performance ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.performance && (
            <div className="px-6 pb-6 pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serverResponseTime?.data && (
                  <div className="p-4 bg-primary-dark rounded-lg border border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase">Response Time</h4>
                    <div className="space-y-1 text-gray-200">
                      <div>Response: {serverResponseTime.data.responseTime}ms</div>
                      <div>Load: {serverResponseTime.data.loadTime}ms</div>
                      <div>Complete: {serverResponseTime.data.completeTime}ms</div>
                    </div>
                  </div>
                )}
                {pageSize?.data && (
                  <div className="p-4 bg-primary-dark rounded-lg border border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase">Page Size</h4>
                    <div className="space-y-1 text-gray-200">
                      <div>Total: {(pageSize.data.totalSize / 1024).toFixed(1)} KB</div>
                      <div className="text-xs text-gray-500">
                        HTML: {(pageSize.data.htmlSize / 1024).toFixed(1)} KB | 
                        CSS: {(pageSize.data.cssSize / 1024).toFixed(1)} KB | 
                        JS: {(pageSize.data.jsSize / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Issues Affecting Rankings */}
      {topIssues.length > 0 && (
        <div className="bg-primary rounded-lg border border-gray-800 p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Top Issues Affecting Your Rankings</h2>
          <div className="space-y-3">
            {topIssues.map((issue, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-primary-dark rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                  issue.impact === 'High' ? 'bg-accent' : 'bg-yellow-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-gray-200 font-medium">{issue.issue}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Impact: <span className={`font-semibold ${
                      issue.impact === 'High' ? 'text-accent' : 'text-yellow-500'
                    }`}>{issue.impact}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations - Collapsible */}
      {recommendations.length > 0 && (
        <div className="bg-primary rounded-lg border border-gray-800 shadow-xl">
          <button
            onClick={() => toggleSection('recommendations')}
            className="w-full flex items-center justify-between p-6 hover:bg-primary-light transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-lg font-semibold">Recommendations</span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.recommendations ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.recommendations && (
            <div className="px-6 pb-6 space-y-4">
              {recommendations.map((rec: any, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-primary-dark rounded-lg border border-gray-700"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {rec.priority === 'high' && (
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    )}
                    {rec.priority === 'medium' && (
                      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    {rec.priority === 'low' && (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                          rec.priority === 'high'
                            ? 'bg-accent text-white'
                            : rec.priority === 'medium'
                            ? 'bg-yellow-500 text-black'
                            : 'bg-gray-600 text-white'
                        }`}
                      >
                        {rec.priority} Priority
                      </span>
                    </div>
                    <h4 className="text-gray-200 font-semibold mb-1">{rec.recommendation}</h4>
                    <p className="text-sm text-gray-400 mb-3">The reamend ag our way.</p>
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        rec.priority === 'high'
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                          : rec.priority === 'medium'
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                    >
                      {rec.priority === 'low' ? 'Learn More' : 'Fix Guide >'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

