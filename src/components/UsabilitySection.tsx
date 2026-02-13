'use client'

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
  const chartStyle = {
   
    width: 150,
  }
  return (
    <div className="bg-primary rounded-lg border border-gray-800 p-8 mb-2 pdf-new-page">
      <h2 className="text-3xl font-bold text-white mb-2">Usability</h2>
      
      {/* Header Section with Grade */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-2">
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
              <div className={`prog-text text-3xl font-bold ${
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

      {/* Device Rendering – new page in PDF */}
      {deviceRendering && deviceRendering.data && (
        <>
          <div  style={{ height: 0, margin: 0, padding: 0, border: 'none', overflow: 'hidden', minHeight: 0 }} aria-hidden="true" />
          <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-2 mt-4">
            <h4 className="text-xl font-bold text-white mb-3">Device Rendering</h4>
          <p className="text-gray-300 mb-2">{deviceRendering.shortAnswer}</p>
          <div className="flex flex-wrap justify-center items-start gap-4 md:gap-6">
            {/* Mobile Screenshot - data-pdf-src used by PDF export to load image via proxy */}
            {deviceRendering.data.mobile && (
              <div className="flex flex-col items-center" data-device-img="mobile" data-pdf-src={deviceRendering.data.mobile}>
                <div className="bg-slate-300 border-2 border-slate-400 rounded-[3rem] p-3 shadow-2xl relative w-[200px]">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-5 bg-slate-300 rounded-b-xl z-10"></div>
                  {/* Screen */}
                  <div className="overflow-hidden rounded-[2.2rem] bg-gray-900 mt-2 w-full flex flex-col" style={{ aspectRatio: '9/19.5', minHeight: '340px' }}>
                    {/* Status bar gap */}
                    <div className="h-6 flex-shrink-0 bg-gray-900"></div>
                    {/* Screenshot */}
                    <div className="flex-1 overflow-hidden">
                      <img
                        src={deviceRendering.data.mobile}
                        alt="Mobile rendering"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-white text-sm mt-4 font-medium">Mobile</p>
              </div>
            )}
            {/* Tablet Screenshot - data-pdf-src used by PDF export to load image via proxy */}
            {deviceRendering.data.tablet && (
              <div className="flex flex-col items-center" data-device-img="tablet" data-pdf-src={deviceRendering.data.tablet}>
                <div className="bg-slate-300 border-2 border-slate-400 rounded-xl p-2 shadow-2xl relative" style={{ width: '320px', maxWidth: '100%' }}>
                  {/* Screen - native img so external screenshots always load */}
                  <div className="relative overflow-hidden rounded-lg bg-gray-900 border-2 border-slate-500 w-full" style={{ aspectRatio: '4/3', minHeight: '380px' }}>
                    <img
                      src={deviceRendering.data.tablet}
                      alt="Tablet rendering"
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                  </div>
                  {/* Home Button */}
                </div>
                <p className="text-white text-sm mt-4 font-medium">Tablet</p>
              </div>
            )}
          </div>
          </div>
        </>
      )}

      {/* Google's Core Web Vitals */}
      {coreWebVitals && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-2 mt-2">
          <div className="flex items-start justify-between mb-2">
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
                <div className="flex flex-col items-center">
                  <h5 className="text-lg font-semibold text-white mb-4 w-full text-center">Largest Contentful Paint (LCP)</h5>
                  <div className="relative  flex flex-col items-center" style={{width:"60%"}}>
                    {/* Gauge Chart - No Needle */}
                    {(() => {
                      const lcp = coreWebVitals.data['largest-contentful-paint']
                      // LCP thresholds (in seconds) - Core Web Vitals standards
                      const lcpGoodThreshold = 2.5
                      const lcpNeedsImprovementThreshold = 4.0
                      const lcpMaxValue = 6.0
                      
                      // Normalize LCP to 0-1 range
                      const normalizedLCP = Math.min(lcp / lcpMaxValue, 1)
                      
                      return (
                        <>
                          <div className="relative" style={{ height: '35px' }}>
                            <GaugeChart
                            style={chartStyle}
                              id="lcp-gauge"
                              nrOfLevels={30}
                              percent={normalizedLCP}
                              colors={['#10B981', '#F59E0B', '#EF4444']}
                              arcWidth={0.1}
                              needleColor="grey"
                              needleBaseColor="red"
                              textColor="#fff"
                              formatTextValue={() => ''}
                              animate={false}
                              arcsLength={[0.417, 0.25, 0.333]} // Green (0-2.5s), Yellow (2.5-4s), Red (4s+)
                              hideText={true}
                            />
                          </div>
                          {/* Threshold labels */}
                          <div className="flex justify-between w-full px-4 mt-2">
                            <span className="text-white text-sm">{lcpGoodThreshold}</span>
                            <span className="text-white text-sm">{lcpNeedsImprovementThreshold}</span>
                          </div>
                          {/* Value Display - centered under gauge */}
                          <div className="w-full flex justify-center">
                            <div className="text-l font-bold text-white">
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
                <div className="flex flex-col items-center">
                  <h5 className="text-lg font-semibold text-white mb-4 w-full text-center">Cumulative Layout Shift (CLS)</h5>
                  <div className="relative flex flex-col items-center" style={{width:"60%"}}>
                    {/* Gauge Chart - No Needle */}
                    {(() => {
                      const cls = coreWebVitals.data['cumulative-layout-shift']
                      // CLS thresholds - Core Web Vitals standards
                      const clsGoodThreshold = 0.1
                      const clsNeedsImprovementThreshold = 0.25
                      const clsMaxValue = 0.5
                      
                      // Normalize CLS to 0-1 range
                      const normalizedCLS = Math.min(cls / clsMaxValue, 1)
                      
                      return (
                        <>
                          <div className="relative" style={{ height: '35px' }}>
                            <GaugeChart
                              style={chartStyle}
                              id="cls-gauge"
                              nrOfLevels={30}
                              percent={normalizedCLS}
                              colors={['#10B981', '#F59E0B', '#EF4444']}
                              arcWidth={0.1}
                              needleColor="grey"
                              needleBaseColor="red"
                              textColor="#fff"
                              formatTextValue={() => ''}
                              animate={false}
                              arcsLength={[0.2, 0.3, 0.5]} // Green (0-0.1), Yellow (0.1-0.25), Red (0.25+)
                              hideText={true}
                            />
                          </div>
                          {/* Threshold labels */}
                          <div className="flex justify-between w-full px-4 mt-2">
                            <span className="text-white text-sm">{clsGoodThreshold}</span>
                            <span className="text-white text-sm">{clsNeedsImprovementThreshold}</span>
                          </div>
                          {/* Value Display - centered under gauge */}
                          <div className="w-full flex justify-center">
                            <div className="text-l font-bold text-white">
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
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-2 mt-4 ">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-3">Use of Mobile Viewports</h4>
              <p className="text-gray-300">{mobileViewport.shortAnswer}</p>
            </div>
            {mobileViewport.passed ? (
              <div className="flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
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
        <div className=" bg-primary-dark rounded-lg border border-gray-700 p-6 mb-2 pdf-new-page">
          <h4 className="text-xl font-bold text-white mb-3">Google&apos;s PageSpeed Insights - Mobile</h4>
          <p className="text-gray-300 mb-4">{mobilePageInsights.shortAnswer}</p>
          
          {/* Additional descriptive text */}
          <p className="text-gray-400 text-sm mb-4">
            Note that this evaluation is being performed from US servers and the results may differ slightly from an evaluation carried out from Google&apos;s PageSpeed Web Interface as that reporting localizes to the region in which you are running the report.
          </p>
          <p className="text-gray-300 text-sm mb-2">
            Google has indicated that the performance of a webpage is becoming more important from a user and subsequently ranking perspective.
          </p>

          {mobilePageInsights.data.score !== undefined && (
            <div className="mt-6">
              {/* Circular Score Gauge */}
              <div className="flex justify-center mb-2">
                <div className="relative w-20 h-20">
                  <svg className="transform -rotate-90 w-30 h-30" viewBox="0 0 200 200">
                    {/* Background circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="10"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke={mobilePageInsights.data.score >= 90 ? '#10B981' : mobilePageInsights.data.score >= 50 ? '#F59E0B' : '#EF4444'}
                      strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 90}
                      strokeDashoffset={2 * Math.PI * 90 * (1 - mobilePageInsights.data.score / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  {/* Score Text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`prog-text text-xl font-bold ${
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lab Data Section */}
                {mobilePageInsights.data.labdata && mobilePageInsights.data.labdata.length > 0 && (
                  <div className="mb-2 mt-2">
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
                  <div className='mb-2 mt-2'>
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
            </div>
          )}
        </div>
      )}

      {/* Legible Font Sizes + Tap Target Sizing */}
      {(legibleFonts || tapTargetSizing) && (
        <div className=" bg-primary-dark rounded-lg border border-gray-700 p-6 mb-2">
          <h4 className="text-xl font-bold text-white mb-4">Legible Font Sizes &amp; Tap Target Sizing</h4>
          <div className="space-y-4">
            {legibleFonts && (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h5 className="text-lg font-semibold text-white mb-2">Legible Font Sizes</h5>
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
            )}
            {tapTargetSizing && (
              <div className={`flex items-start justify-between gap-4 ${legibleFonts ? 'pt-4 border-t border-gray-700' : ''}`}>
                <div className="flex-1">
                  <h5 className="text-lg font-semibold text-white mb-2">Tap Target Sizing</h5>
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
            )}
          </div>
        </div>
      )}
    </div>
  )
}
