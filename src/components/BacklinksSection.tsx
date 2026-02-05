'use client'

import React from 'react'

interface BacklinksSectionProps {
  data: any
}

function formatCount(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return num.toString()
}

function getStrengthColor(value: number): string {
  if (value >= 80) return '#10B981'
  if (value >= 60) return '#F59E0B'
  return '#EF4444'
}

export default function BacklinksSection({ data }: BacklinksSectionProps) {
  const backlinks = data.backlinks && data.backlinks !== false ? data.backlinks : null
  const backlinksList = data.backlinksList && data.backlinksList !== false ? data.backlinksList : null

  const blData = backlinks?.data
  const list = backlinksList?.data?.list

  const hasBacklinksSummary = backlinks && blData
  const hasTopBacklinks = list && Array.isArray(list) && list.length > 0

  if (!hasBacklinksSummary && !hasTopBacklinks) return null

  const domainStrength = blData?.domain_strength != null ? Number(blData.domain_strength) : null
  const pageStrength = blData?.page_strength != null ? Number(blData.page_strength) : null
  const totalBacklinks = blData?.backlinks != null ? Number(blData.backlinks) : null
  const referringDomains = blData?.referring_domains != null ? Number(blData.referring_domains) : null

  return (
    <div className="bg-primary rounded-lg border border-gray-800 p-8 mb-8 ">
      <h2 className="text-3xl font-bold text-white mb-6">Backlinks Summary and Top backlinks</h2>

      {/* Backlink Summary */}
      {hasBacklinksSummary && (
        <>
          <h3 className="text-xl font-bold text-white mb-4">Backlink Summary</h3>
          <p className="text-gray-300 mb-6">{backlinks.shortAnswer}</p>

          {/* All four metrics in one row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {domainStrength != null && (
              <div className="flex flex-col items-center bg-primary-dark rounded-lg border border-gray-700 py-4 px-3">
                <div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center border-2 flex-shrink-0"
                  style={{
                    borderColor: getStrengthColor(domainStrength),
                    backgroundColor: 'rgba(17, 24, 39, 0.5)',
                  }}
                >
                  <span className="prog-text text-xl font-bold text-white">{domainStrength}</span>
                </div>
                <p className="text-gray-400 text-sm font-medium mt-2">Domain Strength</p>
              </div>
            )}
            {pageStrength != null && (
              <div className="flex flex-col items-center bg-primary-dark rounded-lg border border-gray-700 py-4 px-3">
                <div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center border-2 flex-shrink-0"
                  style={{
                    borderColor: getStrengthColor(pageStrength),
                    backgroundColor: 'rgba(17, 24, 39, 0.5)',
                  }}
                >
                  <span className="prog-text text-xl font-bold text-white">{pageStrength}</span>
                </div>
                <p className="text-gray-400 text-sm font-medium mt-2">Page Strength</p>
              </div>
            )}
            {totalBacklinks != null && (
              <div className="bg-primary-dark rounded-lg border border-gray-700 py-4 px-3 flex flex-col items-center text-center">
                <svg
                  className="w-8 h-8 text-accent mb-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <p className="text-xl font-bold text-white">{formatCount(totalBacklinks)}</p>
                <p className="text-gray-400 text-sm mt-0.5">Total Backlinks</p>
              </div>
            )}
            {referringDomains != null && (
              <div className="bg-primary-dark rounded-lg border border-gray-700 py-4 px-3 flex flex-col items-center text-center">
                <svg
                  className="w-8 h-8 text-accent mb-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                <p className="text-xl font-bold text-white">{formatCount(referringDomains)}</p>
                <p className="text-gray-400 text-sm mt-0.5">Referring Domains</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Top Backlinks list */}
      {hasTopBacklinks && (
        <div className="mt-8 pt-8 border-t border-gray-700 pdf-avoid-break">
          <h3 className="text-xl font-bold text-white mb-2">Top backlinks</h3>
          {backlinksList.shortAnswer && (
            <p className="text-gray-300 text-sm mb-4">{backlinksList.shortAnswer}</p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Source</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Anchor text</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Domain strength</th>
                </tr>
              </thead>
              <tbody>
                {list
                  .filter((item: any) => item && (item.url || item.title))
                  .map((item: any, index: number) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-primary-dark transition-colors">
                      <td className="py-3 px-4">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline break-all"
                        >
                          {item.title || item.url || '—'}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-white">{item.anchor_text ?? '—'}</td>
                      <td className="py-3 px-4 text-gray-300">
                        {item.domain_strength != null ? item.domain_strength : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
