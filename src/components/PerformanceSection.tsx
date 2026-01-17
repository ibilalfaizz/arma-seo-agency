'use client'

interface PerformanceSectionProps {
  data: any
}

export default function PerformanceSection({ data }: PerformanceSectionProps) {
  const performanceScore = data.scores?.performance?.grade || 0
  const performanceTitle = data.scores?.performance?.title || ''
  const performanceDescription = data.scores?.performance?.description || ''
  const serverResponseTime = data.serverResponseTime && data.serverResponseTime !== false ? data.serverResponseTime : null
  const optimizedImages = data.optimizedImages && data.optimizedImages !== false ? data.optimizedImages : null

  return (
    <div className="bg-primary rounded-lg border border-gray-800 p-8 mb-8">
      <h2 className="text-3xl font-bold text-white mb-8">Performance Results</h2>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-3">{performanceTitle}</h3>
          <p className="text-gray-300 leading-relaxed">{performanceDescription}</p>
        </div>
      </div>

      {/* Website Load Speed / Server Response Time */}
      {serverResponseTime && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <h4 className="text-xl font-bold text-white mb-4">Website Load Speed</h4>
          <p className="text-gray-300 mb-4">{serverResponseTime.shortAnswer}</p>
          {serverResponseTime.data && (
            <div className="bg-primary rounded-lg p-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Server Response</p>
                  <p className="text-lg font-semibold">{serverResponseTime.data.responseTime}ms</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">All Page Content Loaded</p>
                  <p className="text-lg font-semibold">{serverResponseTime.data.loadTime}ms</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">All Page Scripts Complete</p>
                  <p className="text-lg font-semibold">{serverResponseTime.data.completeTime}ms</p>
                </div>
              </div>
            </div>
          )}
          {serverResponseTime.passed ? (
            <div className="mt-4 flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Optimize Images */}
      {optimizedImages && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <h4 className="text-xl font-bold text-white mb-3">Optimize Images</h4>
          <p className="text-gray-300 mb-4">{optimizedImages.shortAnswer}</p>
          {optimizedImages.passed ? (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
