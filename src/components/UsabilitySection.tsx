'use client'

import Image from 'next/image'

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

  return (
    <div className="bg-primary rounded-lg border border-gray-800 p-8 mb-8">
      <h2 className="text-3xl font-bold text-white mb-8">Usability</h2>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 justify-items-center">
            {/* Mobile Screenshot */}
            {deviceRendering.data.mobile && (
              <div className="flex flex-col items-center">
                <div className="bg-black rounded-[2.5rem] p-2 shadow-2xl relative" style={{ width: '240px' }}>
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-10"></div>
                  {/* Screen */}
                  <div className="relative overflow-hidden rounded-[2rem] bg-black" style={{ aspectRatio: '9/19.5', width: '100%', marginTop: '6px' }}>
                    <Image
                      src={deviceRendering.data.mobile}
                      alt="Mobile rendering"
                      fill
                      className="object-cover"
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
                <div className="bg-black rounded-xl p-3 shadow-2xl relative" style={{ width: '520px', maxWidth: '100%' }}>
                  {/* Screen */}
                  <div className="relative overflow-hidden rounded-lg bg-black" style={{ aspectRatio: '4/3', width: '100%' }}>
                    <Image
                      src={deviceRendering.data.tablet}
                      alt="Tablet rendering"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  {/* Home Button */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full border-2 border-gray-600 bg-black z-10"></div>
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
          <h4 className="text-xl font-bold text-white mb-3">Google&apos;s Core Web Vitals</h4>
          <p className="text-gray-300">{coreWebVitals.shortAnswer}</p>
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
          <p className="text-gray-300 mb-2">{mobilePageInsights.shortAnswer}</p>
          {mobilePageInsights.data.score !== undefined && (
            <div className="mt-4">
              <p className="text-gray-400 text-sm mb-4">Score: <span className="text-white font-semibold">{mobilePageInsights.data.score}/100</span></p>
              
              {mobilePageInsights.data.labdata && mobilePageInsights.data.labdata.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-300 font-semibold">LAB DATA</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-semibold">VALUE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mobilePageInsights.data.labdata.map((item: any, index: number) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-3 px-4 text-white">{item.name}</td>
                          <td className="py-3 px-4 text-white">{item.value} {item.name.includes('Time') || item.name.includes('Index') ? 's' : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
