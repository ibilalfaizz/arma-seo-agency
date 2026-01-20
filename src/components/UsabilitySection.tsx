'use client'

import Image from 'next/image'
import GaugeChart from 'react-gauge-chart'

interface UsabilitySectionProps {
  data: any
}

export default function UsabilitySection({ data }: UsabilitySectionProps) {
  const uiScore = data.scores?.ui?.grade || 0
  const uiTitle = data.scores?.ui?.title || ''
  const uiDescription = data.scores?.ui?.description || ''
  const deviceRendering = data.deviceRendering && data.deviceRendering !== false ? data.deviceRendering : null
  const coreWebVitals = data.coreWebVitals && data.coreWebVitals !== false ? data.coreWebVitals : null
  const mobilePageInsights = data.mobilePageInsights && data.mobilePageInsights !== false ? data.mobilePageInsights : null
  const mobileViewport = data.mobileViewport && data.mobileViewport !== false ? data.mobileViewport : null
  const legibleFonts = data.legibleFonts && data.legibleFonts !== false ? data.legibleFonts : null
  const tapTargetSizing = data.tapTargetSizing && data.tapTargetSizing !== false ? data.tapTargetSizing : null

  // Helper functions for grade display
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
  const score = typeof uiScore === 'number' ? uiScore : 0
  const circumference = 2 * Math.PI * 90
  const offset = circumference - (score / 100) * circumference
  const gradeColor = getGradeColor(uiScore)

  return (
    <div className="bg-primary rounded-lg border border-gray-800 p-8 mb-8">
      <h2 className="text-3xl font-bold text-white mb-8">Usability</h2>
      
      {/* Header Section with Grade */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
        {/* Circular Gauge */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#374151"
              strokeWidth="12"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={gradeColor}
              strokeWidth="12"
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
                {formatGrade(uiScore)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Title and Description */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-3">{uiTitle}</h3>
          <p className="text-gray-300 leading-relaxed">{uiDescription}</p>
        </div>
      </div>

      {/* Device Rendering */}
      {deviceRendering && deviceRendering.data && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <h4 className="text-xl font-bold text-white mb-3">Device Rendering</h4>
          <p className="text-gray-300 mb-6">{deviceRendering.shortAnswer}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
            {/* Mobile Screenshot */}
            {deviceRendering.data.mobile && (
              <div className="flex flex-col items-center">
                <div className="bg-gray-800 border-2 border-gray-600 rounded-[2.5rem] p-2 shadow-2xl relative w-[240px]">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gray-800 border-l-2 border-r-2 border-t-2 border-gray-600 rounded-b-2xl z-10"></div>
                  {/* Screen */}
                  <div className="relative overflow-hidden rounded-[2rem] bg-black mt-1.5 border-2 border-gray-700" style={{ aspectRatio: '9/19.5', width: '100%' }}>
                    <Image
                      src={deviceRendering.data.mobile}
                      alt="Mobile rendering"
                      fill
                      className="object-cover object-top"
                      unoptimized
                    />
                  </div>
                </div>
                <p className="text-white text-sm mt-4 font-medium">Mobile</p>
              </div>
            )}
            {/* Tablet Screenshot */}
            {deviceRendering.data.tablet && (
              <div className="flex flex-col items-center">
                <div className="bg-gray-800 border-2 border-gray-600 rounded-xl p-3 shadow-2xl relative" style={{ width: '520px', maxWidth: '100%' }}>
                  {/* Screen */}
                  <div className="relative overflow-hidden rounded-lg bg-black border-2 border-gray-700" style={{ aspectRatio: '4/3', width: '100%', minHeight: '390px' }}>
                    <Image
                      src={deviceRendering.data.tablet}
                      alt="Tablet rendering"
                      fill
                      className="object-cover object-top"
                      unoptimized
                    />
                  </div>
                  {/* Home Button */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full border-2 border-gray-500 bg-gray-800 z-10"></div>
                </div>
                <p className="text-white text-sm mt-4 font-medium">Tablet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Google's Core Web Vitals */}
      {coreWebVitals && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-3">Google&apos;s Core Web Vitals</h4>
              <p className="text-gray-300">{coreWebVitals.shortAnswer}</p>
            </div>
            {coreWebVitals.passed && (
              <div className="ml-4 flex-shrink-0">
                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Core Web Vitals Gauges */}
          {coreWebVitals.data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              {/* Largest Contentful Paint (LCP) */}
              {coreWebVitals.data['largest-contentful-paint'] !== null && coreWebVitals.data['largest-contentful-paint'] !== undefined && (
                <div>
                  <h5 className="text-lg font-semibold text-white mb-4">Largest Contentful Paint (LCP)</h5>
                  <div className="relative">
                    {/* Gauge Chart - No Needle */}
                    {(() => {
                      const lcp = coreWebVitals.data['largest-contentful-paint']
                      
                      return (
                        <>
                          <div className="relative" style={{ height: '200px' }}>
                            <GaugeChart
                              id="lcp-gauge"
                              nrOfLevels={30}
                              percent={0}
                              colors={['#10B981', '#F59E0B', '#EF4444']}
                              arcWidth={0.3}
                              needleColor="transparent"
                              needleBaseColor="transparent"
                              textColor="#fff"
                              formatTextValue={() => ''}
                              animate={false}
                              arcsLength={[0.417, 0.25, 0.333]} // Green (0-2.5s), Yellow (2.5-4s), Red (4s+)
                              hideText={true}
                            />
                          </div>
                          {/* Threshold labels */}
                          <div className="flex justify-between px-4 mt-2">
                            <span className="text-white text-sm">2.5</span>
                            <span className="text-white text-sm">4</span>
                          </div>
                          {/* Value Display */}
                          <div className="text-center mt-4">
                            <div className="text-3xl font-bold text-white">
                              {lcp.toFixed(1)}s
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
              )}

              {/* Cumulative Layout Shift (CLS) */}
              {coreWebVitals.data['cumulative-layout-shift'] !== null && coreWebVitals.data['cumulative-layout-shift'] !== undefined && (
                <div>
                  <h5 className="text-lg font-semibold text-white mb-4">Cumulative Layout Shift (CLS)</h5>
                  <div className="relative">
                    {/* Gauge Chart - No Needle */}
                    {(() => {
                      const cls = coreWebVitals.data['cumulative-layout-shift']
                      
                      return (
                        <>
                          <div className="relative" style={{ height: '200px' }}>
                            <GaugeChart
                              id="cls-gauge"
                              nrOfLevels={30}
                              percent={0}
                              colors={['#10B981', '#F59E0B', '#EF4444']}
                              arcWidth={0.3}
                              needleColor="transparent"
                              needleBaseColor="transparent"
                              textColor="#fff"
                              formatTextValue={() => ''}
                              animate={false}
                              arcsLength={[0.2, 0.3, 0.5]} // Green (0-0.1), Yellow (0.1-0.25), Red (0.25+)
                              hideText={true}
                            />
                          </div>
                          {/* Threshold labels */}
                          <div className="flex justify-between px-4 mt-2">
                            <span className="text-white text-sm">0.1</span>
                            <span className="text-white text-sm">0.25</span>
                          </div>
                          {/* Value Display */}
                          <div className="text-center mt-4">
                            <div className="text-3xl font-bold text-white">
                              {cls.toFixed(2)}
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Use of Mobile Viewports */}
      {mobileViewport && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-3">Use of Mobile Viewports</h4>
              <p className="text-gray-300">{mobileViewport.shortAnswer}</p>
            </div>
            {mobileViewport.passed ? (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Google's PageSpeed Insights - Mobile */}
      {mobilePageInsights && mobilePageInsights.data && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <h4 className="text-xl font-bold text-white mb-3">Google&apos;s PageSpeed Insights - Mobile</h4>
          <p className="text-gray-300 mb-4">{mobilePageInsights.shortAnswer}</p>
          
          {/* Additional descriptive text */}
          <p className="text-gray-400 text-sm mb-4">
            Note that this evaluation is being performed from US servers and the results may differ slightly from an evaluation carried out from Google&apos;s PageSpeed Web Interface as that reporting localizes to the region in which you are running the report.
          </p>
          <p className="text-gray-300 text-sm mb-6">
            Google has indicated that the performance of a webpage is becoming more important from a user and subsequently ranking perspective.
          </p>

          {mobilePageInsights.data.score !== undefined && (
            <div className="mt-6">
              {/* Circular Score Gauge */}
              <div className="flex justify-center mb-8">
                <div className="relative w-48 h-48">
                  <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
                    {/* Background circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="20"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke={mobilePageInsights.data.score >= 90 ? '#10B981' : mobilePageInsights.data.score >= 50 ? '#F59E0B' : '#EF4444'}
                      strokeWidth="20"
                      strokeDasharray={2 * Math.PI * 90}
                      strokeDashoffset={2 * Math.PI * 90 * (1 - mobilePageInsights.data.score / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  {/* Score Text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${
                        mobilePageInsights.data.score >= 90 ? 'text-green-400' : 
                        mobilePageInsights.data.score >= 50 ? 'text-yellow-400' : 
                        'text-red-400'
                      }`}>
                        {mobilePageInsights.data.score}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lab Data Section */}
              {mobilePageInsights.data.labdata && mobilePageInsights.data.labdata.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-lg font-semibold text-white mb-4">LAB DATA</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-300 font-semibold">LAB DATA</th>
                          <th className="text-left py-3 px-4 text-gray-300 font-semibold">VALUE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mobilePageInsights.data.labdata.map((item: any, index: number) => {
                          // Determine color based on metric and value
                          let valueColor = 'text-white'
                          const value = item.value
                          const name = item.name
                          
                          if (name === 'First Contentful Paint') {
                            valueColor = value <= 1.8 ? 'text-green-400' : value <= 3.0 ? 'text-yellow-400' : 'text-red-400'
                          } else if (name === 'Speed Index') {
                            valueColor = value <= 3.4 ? 'text-green-400' : value <= 5.8 ? 'text-yellow-400' : 'text-red-400'
                          } else if (name === 'Largest Contentful Paint') {
                            valueColor = value <= 2.5 ? 'text-green-400' : value <= 4.0 ? 'text-yellow-400' : 'text-red-400'
                          } else if (name === 'Time to Interactive') {
                            valueColor = value <= 3.8 ? 'text-green-400' : value <= 7.3 ? 'text-yellow-400' : 'text-red-400'
                          } else if (name === 'Total Blocking Time') {
                            valueColor = value <= 200 ? 'text-green-400' : value <= 600 ? 'text-yellow-400' : 'text-red-400'
                          } else if (name === 'Cumulative Layout Shift') {
                            valueColor = value <= 0.1 ? 'text-green-400' : value <= 0.25 ? 'text-yellow-400' : 'text-red-400'
                          }
                          
                          return (
                            <tr key={index} className="border-b border-gray-800">
                              <td className="py-3 px-4 text-white">{item.name}</td>
                              <td className={`py-3 px-4 ${valueColor} font-semibold`}>
                                {item.value} {item.name.includes('Time') || item.name.includes('Index') || item.name.includes('Paint') ? 's' : ''}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Opportunities Section */}
              {mobilePageInsights.data.opportunities && mobilePageInsights.data.opportunities.length > 0 && (
                <div>
                  <h5 className="text-lg font-semibold text-white mb-4">OPPORTUNITIES</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-300 font-semibold">OPPORTUNITIES</th>
                          <th className="text-left py-3 px-4 text-gray-300 font-semibold">ESTIMATED SAVINGS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mobilePageInsights.data.opportunities.map((item: any, index: number) => (
                          <tr key={index} className="border-b border-gray-800">
                            <td className="py-3 px-4 text-white">{item.name}</td>
                            <td className="py-3 px-4 text-red-400 font-semibold">
                              {item.value}s
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Legible Font Sizes */}
      {legibleFonts && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-3">Legible Font Sizes</h4>
              <p className="text-gray-300">{legibleFonts.shortAnswer}</p>
            </div>
            {legibleFonts.passed ? (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Tap Target Sizing */}
      {tapTargetSizing && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-3">Tap Target Sizing</h4>
              <p className="text-gray-300">{tapTargetSizing.shortAnswer}</p>
            </div>
            {tapTargetSizing.passed ? (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
