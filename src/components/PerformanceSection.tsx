'use client'

import GaugeChart from 'react-gauge-chart'

interface PerformanceSectionProps {
  data: any
}

export default function PerformanceSection({ data }: PerformanceSectionProps) {
  const performanceScore = data.scores?.performance?.grade || 0
  const performanceTitle = data.scores?.performance?.title || ''
  const performanceDescription = data.scores?.performance?.description || ''
  const serverResponseTime = data.serverResponseTime && data.serverResponseTime !== false ? data.serverResponseTime : null
  const optimizedImages = data.optimizedImages && data.optimizedImages !== false ? data.optimizedImages : null

  // Helper functions
  const formatGrade = (grade: number | string | undefined): string => {
    if (grade === undefined || grade === null || grade === '') return 'N/A'
    if (typeof grade === 'number') {
      return grade.toString()
    }
    return grade.toString()
  }

  const getGradeColor = (grade: number | string | undefined): string => {
    if (grade === undefined || grade === null || grade === '') return '#6B7280'
    const score = typeof grade === 'number' ? grade : 0
    if (score >= 80) return '#10B981' // green
    if (score >= 60) return '#F59E0B' // yellow
    return '#EF4444' // red
  }

  // Calculate circular progress
  const score = typeof performanceScore === 'number' ? performanceScore : 0
  const circumference = 2 * Math.PI * 90
  const offset = circumference - (score / 100) * circumference
  const gradeColor = getGradeColor(performanceScore)

  return (
    <>
      {/* Zero-height break trigger so the full section starts on the new page (no border/content on prev page) */}
      <div className="pdf-new-page mt-5" style={{ height: 0, padding: 0, border: 'none', overflow: 'hidden', minHeight: 0 }} aria-hidden="true" />
      <div className="bg-primary rounded-lg border border-gray-800 p-8 mb-8 pdf-avoid-break">
        <h2 className="text-3xl font-bold text-white mb-8">Performance Results</h2>
      
      {/* Header Section with Score Gauge */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
        {/* Circular Gauge */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#374151"
              strokeWidth="10"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={gradeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          {/* Grade Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                gradeColor === '#10B981' ? 'text-green-400' : 
                gradeColor === '#F59E0B' ? 'text-yellow-400' : 
                'text-red-400'
              }`}>
                {formatGrade(performanceScore)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Title and Description */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-3">{performanceTitle}</h3>
          <p className="text-gray-300 leading-relaxed">{performanceDescription}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 my-8"></div>

      {/* Website Load Speed / Server Response Time */}
      {serverResponseTime && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 md:p-8 mb-6 overflow-visible">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-3">Website Load Speed</h4>
              <p className="text-gray-300">{serverResponseTime.shortAnswer}</p>
            </div>
            {serverResponseTime.passed && (
              <div className="ml-4 flex-shrink-0">
                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Performance Gauges - compact, labels have padding to avoid overflow */}
          {serverResponseTime.data && (
            <div className="website-load-speed-gauges grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-6 overflow-visible px-1">
              {/* Server Response */}
              <div className="flex flex-col items-center overflow-visible min-w-0">
                <h5 className="text-xs font-semibold text-white mb-0.5 min-h-[1.5rem] flex items-center justify-center text-center w-full">Server Response</h5>
                <div className="relative w-full">
                  {(() => {
                    const responseTime = serverResponseTime.data.responseTime / 1000 // Convert ms to seconds
                    const normalizedValue = Math.min(responseTime / 1.0, 1) // 0-1s range
                    
                    return (
                      <>
                        <div className="website-load-speed-gauge relative overflow-visible mx-auto" style={{ height: '78px', maxWidth: '140px' }}>
                          <GaugeChart
                            id="server-response-gauge"
                            nrOfLevels={30}
                            percent={normalizedValue}
                            colors={['#10B981', '#EF4444']}
                            arcWidth={0.1}
                            needleColor="grey"
                            needleBaseColor="red"
                            textColor="#fff"
                            formatTextValue={() => ''}
                            animate={false}
                            arcsLength={[0.5, 0.5]} // Green (0-0.5s), Red (0.5-1s)
                            hideText={true}
                          />
                        </div>
                        {/* Threshold labels - extra padding so 0 and scale values don't clip */}
                        <div className="flex justify-between items-center mt-0.5 px-2 min-w-[4rem]">
                          <span className="text-white text-[10px] leading-none flex-shrink-0">0</span>
                          <span className="text-white text-[10px] leading-none flex-shrink-0">0.5</span>
                        </div>
                        <div className="text-center mt-0.5">
                          <span className="text-base font-bold text-white">{responseTime.toFixed(1)}s</span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* All Page Content Loaded */}
              <div className="flex flex-col items-center overflow-visible min-w-0">
                <h5 className="text-xs font-semibold text-white mb-0.5 min-h-[1.5rem] flex items-center justify-center text-center w-full">All Page Content Loaded</h5>
                <div className="relative w-full">
                  {(() => {
                    const loadTime = serverResponseTime.data.loadTime / 1000 // Convert ms to seconds
                    const normalizedValue = Math.min(loadTime / 15.0, 1) // 0-15s range
                    
                    return (
                      <>
                        <div className="website-load-speed-gauge relative overflow-visible mx-auto" style={{ height: '78px', maxWidth: '140px' }}>
                          <GaugeChart
                            id="load-time-gauge"
                            nrOfLevels={30}
                            percent={normalizedValue}
                            colors={['#10B981', '#F59E0B', '#EF4444']}
                            arcWidth={0.1}
                            needleColor="grey"
                            needleBaseColor="red"
                            textColor="#fff"
                            formatTextValue={() => ''}
                            animate={false}
                            arcsLength={[0.33, 0.33, 0.34]} // Green (0-5s), Yellow (5-10s), Red (10s+)
                            hideText={true}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-0.5 px-2 min-w-[4rem]">
                          <span className="text-white text-[10px] leading-none flex-shrink-0">5</span>
                          <span className="text-white text-[10px] leading-none flex-shrink-0">10</span>
                        </div>
                        <div className="text-center mt-0.5">
                          <span className="text-base font-bold text-white">{loadTime.toFixed(1)}s</span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* All Page Scripts Complete */}
              <div className="flex flex-col items-center overflow-visible min-w-0">
                <h5 className="text-xs font-semibold text-white mb-0.5 min-h-[1.5rem] flex items-center justify-center text-center w-full">All Page Scripts Complete</h5>
                <div className="relative w-full">
                  {(() => {
                    const completeTime = serverResponseTime.data.completeTime / 1000 // Convert ms to seconds
                    const normalizedValue = Math.min(completeTime / 20.0, 1) // 0-20s range
                    
                    return (
                      <>
                        <div className="website-load-speed-gauge relative overflow-visible mx-auto" style={{ height: '78px', maxWidth: '140px' }}>
                          <GaugeChart
                            id="complete-time-gauge"
                            nrOfLevels={30}
                            percent={normalizedValue}
                            colors={['#10B981', '#F59E0B', '#EF4444']}
                            arcWidth={0.1}
                            needleColor="grey"
                            needleBaseColor="red"
                            textColor="#fff"
                            formatTextValue={() => ''}
                            animate={false}
                            arcsLength={[0.5, 0.25, 0.25]} // Green (0-10s), Yellow (10-15s), Red (15s+)
                            hideText={true}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-0.5 px-2 min-w-[4rem]">
                          <span className="text-white text-[10px] leading-none flex-shrink-0">10</span>
                          <span className="text-white text-[10px] leading-none flex-shrink-0">15</span>
                        </div>
                        <div className="text-center mt-0.5">
                          <span className="text-base font-bold text-white">{completeTime.toFixed(1)}s</span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Optimize Images */}
      {optimizedImages && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-3">Optimize Images</h4>
              <p className="text-gray-300">{optimizedImages.shortAnswer}</p>
            </div>
            {optimizedImages.passed && (
              <div className="ml-4 flex-shrink-0">
                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  )
}
