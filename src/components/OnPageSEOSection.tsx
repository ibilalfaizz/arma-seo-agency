'use client'

interface OnPageSEOSectionProps {
  data: any
}

export default function OnPageSEOSection({ data }: OnPageSEOSectionProps) {
      const seoScore = data.scores?.seo?.grade || 0
      const seoTitle = data.scores?.seo?.title || ''
      const seoDescription = data.scores?.seo?.description || ''
      // Handle false values - these fields can be false instead of objects
      const titleTag = data.title && data.title !== false ? data.title : null
      const metaDescription = data.description && data.description !== false ? data.description : null
      const hasHreflang = data.hasHreflang !== false ? data.hasHreflang : false
      const langCheck = data.langCheck !== false ? data.langCheck : false
      const langAttribute = data.langAttribute
      const hasH1Header = data.hasH1Header !== false ? data.hasH1Header : false
      const headers = data.headers && data.headers !== false ? data.headers : null
      const contentLength = data.contentLength && data.contentLength !== false ? data.contentLength : null
      const imageAlt = data.imageAlt && data.imageAlt !== false ? data.imageAlt : null
      const keywords = data.keywords && data.keywords !== false ? data.keywords : null
      const googleSearchPreview = data.googleSearchPreview
      const finalUrl = data.finalUrl || data.url || ''

  // Helper functions
  // Display numeric scores directly from API - no conversion
  const formatGrade = (grade: number | string | undefined): string => {
    if (grade === undefined || grade === null || grade === '') return 'N/A'
    // Display numeric score directly from API
    if (typeof grade === 'number') {
      return grade.toString()
    }
    return grade.toString()
  }

  const getGradeColor = (grade: number | string | undefined): string => {
    if (grade === undefined || grade === null || grade === '') return '#6B7280'
    // Use numeric score directly to determine color
    const score = typeof grade === 'number' ? grade : 0
    if (score >= 80) return '#10B981' // green
    if (score >= 60) return '#F59E0B' // yellow
    return '#EF4444' // red
  }

  const getGradeTextColor = (grade: number | string | undefined): string => {
    const color = getGradeColor(grade)
    if (color === '#10B981') return 'text-green-400'
    if (color === '#F59E0B') return 'text-yellow-400'
    return 'text-red-400'
  }

  // Calculate circular progress
  const score = typeof seoScore === 'number' ? seoScore : 0
  const circumference = 2 * Math.PI * 90
  const offset = circumference - (score / 100) * circumference
  const gradeColor = getGradeColor(seoScore)

  return (
    <div className="bg-primary rounded-lg border border-gray-800 p-8 mb-8">
      <h2 className="text-3xl font-bold text-white mb-8">On-Page SEO Results</h2>
      
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
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-3xl font-bold ${getGradeTextColor(seoScore)}`}>
              {formatGrade(seoScore)}
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-3">{seoTitle}</h3>
          <p className="text-gray-300 leading-relaxed">{seoDescription}</p>
        </div>
      </div>

      {/* Title Tag Section */}
      {titleTag && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-3">Title Tag</h4>
              <p className="text-gray-300 mb-4">
                {titleTag.shortAnswer === 'Title Tag Text Too Short' 
                  ? "You have a Title Tag, but ideally it should be between 50 and 60 characters in length (including spaces)."
                  : titleTag.shortAnswer || "Title Tag information"}
              </p>
              <div className="bg-primary rounded-lg p-4 mb-3">
                <p className="text-white font-medium mb-2">Current Title Tag:</p>
                <p className="text-gray-300">{titleTag.data || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">Length: <span className="text-white font-semibold">{titleTag.value || '0'}</span></span>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                Title Tags are very important for search engines to correctly understand and categorize your content.
              </p>
            </div>
            {!titleTag.passed && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Meta Description Section */}
      {metaDescription && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-3">Meta Description Tag</h4>
              <p className="text-gray-300 mb-4">
                {metaDescription.shortAnswer === 'Meta Description Too Long'
                  ? "Your page has a Meta Description Tag however, your Meta Description should ideally be between 120 and 160 characters (including spaces)."
                  : metaDescription.shortAnswer || "Meta Description information"}
              </p>
              <div className="bg-primary rounded-lg p-4 mb-3">
                <p className="text-white font-medium mb-2">Current Meta Description:</p>
                <p className="text-gray-300">{metaDescription.data || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">Length: <span className="text-white font-semibold">{metaDescription.value || '0'}</span></span>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                A Meta Description is important for search engines to understand the content of your page, and is often shown as the description text blurb in search results.
              </p>
            </div>
            {!metaDescription.passed && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Headers Section */}
      {data.headers && data.headers.data && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-3">Header Tags</h4>
              <p className="text-gray-300 mb-4">{data.headers.shortAnswer || "Header tags information"}</p>
              <div className="bg-primary rounded-lg p-4 mb-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {data.headers.data.h1 && data.headers.data.h1.length > 0 && (
                    <div>
                      <p className="text-white font-medium mb-2">H1 ({data.headers.data.h1.length}):</p>
                      <p className="text-gray-300 text-sm">{data.headers.data.h1.join(', ')}</p>
                    </div>
                  )}
                  {data.headers.data.h2 && data.headers.data.h2.length > 0 && (
                    <div>
                      <p className="text-white font-medium mb-2">H2 ({data.headers.data.h2.length}):</p>
                      <p className="text-gray-300 text-sm">{data.headers.data.h2.join(', ')}</p>
                    </div>
                  )}
                  {data.headers.data.h3 && data.headers.data.h3.length > 0 && (
                    <div>
                      <p className="text-white font-medium mb-2">H3 ({data.headers.data.h3.length}):</p>
                      <p className="text-gray-300 text-sm">{data.headers.data.h3.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {data.headers.passed && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Length Section */}
      {data.contentLength && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-3">Content Length</h4>
              <p className="text-gray-300 mb-4">{data.contentLength.shortAnswer || "Content length information"}</p>
              {data.contentLength.recommendation && (
                <p className="text-gray-400 text-sm mt-2">
                  Recommendation: {data.contentLength.recommendation}
                </p>
              )}
            </div>
            {!data.contentLength.passed && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Alt Tags Section */}
      {data.imageAlt && data.imageAlt.data && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-3">Image Alt Attributes</h4>
              <p className="text-gray-300 mb-4">{data.imageAlt.shortAnswer || "Image alt attributes information"}</p>
              <div className="bg-primary rounded-lg p-4 mb-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Total Images</p>
                    <p className="text-white font-semibold text-lg">{data.imageAlt.data.total || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">With Alt</p>
                    <p className="text-green-400 font-semibold text-lg">{data.imageAlt.data.altCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Missing Alt</p>
                    <p className="text-red-400 font-semibold text-lg">{data.imageAlt.data.noAltCount || 0}</p>
                  </div>
                </div>
              </div>
              {data.imageAlt.recommendation && (
                <p className="text-gray-400 text-sm mt-2">
                  Recommendation: {data.imageAlt.recommendation}
                </p>
              )}
            </div>
            {!data.imageAlt.passed && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SERP Snippet Preview */}
      {titleTag && metaDescription && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-xl font-bold text-white">SERP Snippet Preview</h4>
                <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center">
                  <span className="text-gray-300 text-xs">i</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                This illustrates how your page may appear in Search Results. Note, this is intended as a guide and Search Engines are more frequently generating this content dynamically.
              </p>
            </div>
          </div>
          
          {/* SERP Preview Box */}
          <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-gray-300"></div>
              <span className="text-gray-600 text-sm font-medium">
                {titleTag.data 
                  ? (titleTag.data.includes(' - ') 
                      ? titleTag.data.split(' - ').pop() || titleTag.data.split(' - ')[0]
                      : titleTag.data.split(' ')[0])
                  : finalUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').split('.')[0]}
              </span>
              <span className="text-gray-400 text-xs">▼</span>
            </div>
            <div className="text-green-700 text-sm mb-1">
              {finalUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </div>
            <div className="text-accent text-lg font-semibold mb-1 hover:underline cursor-pointer">
              {titleTag.data || 'Page Title'}
            </div>
            <div className="text-gray-700 text-sm leading-relaxed">
              {metaDescription.data ? (metaDescription.data.length > 160 ? metaDescription.data.substring(0, 160) + '...' : metaDescription.data) : 'Meta description...'}
            </div>
          </div>
        </div>
      )}

      {/* Hreflang Usage */}
      {hasHreflang !== undefined && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-xl font-bold text-white">Hreflang Usage</h4>
                <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center">
                  <span className="text-gray-300 text-xs">i</span>
                </div>
              </div>
              <p className="text-gray-300">
                {hasHreflang 
                  ? "Your page is making use of Hreflang attributes."
                  : "Your page is not making use of Hreflang attributes."}
              </p>
            </div>
            {hasHreflang ? (
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
        </div>
      )}

      {/* Language */}
      {langCheck !== undefined && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-2">Language</h4>
              <p className="text-gray-300 mb-2">
                {langCheck 
                  ? "Your page is using the Lang Attribute."
                  : "Your page is not using the Lang Attribute."}
              </p>
              {langCheck && (
                <p className="text-gray-400 text-sm">Declared: en-US</p>
              )}
            </div>
            {langCheck ? (
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
        </div>
      )}

      {/* H1 Header Tag Usage */}
      {hasH1Header !== undefined && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-2">H1 Header Tag Usage</h4>
              <p className="text-gray-300 mb-3">
                {hasH1Header 
                  ? "Your page has a H1 Tag."
                  : "Your page does not have a H1 Tag."}
              </p>
              {headers?.data?.h1 && headers.data.h1.length > 0 && (
                <button className="text-gray-400 hover:text-white text-sm transition-colors">
                  Show Details
                </button>
              )}
            </div>
            {hasH1Header ? (
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
        </div>
      )}

      {/* H2-H6 Header Tag Usage */}
      {headers && headers.data && (headers.data.h2 || headers.data.h3 || headers.data.h4 || headers.data.h5 || headers.data.h6) && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-2">H2-H6 Header Tag Usage</h4>
              <p className="text-gray-300 mb-3">
                {headers.passed 
                  ? "Your page is using H2-H6 Header Tags."
                  : "Your page could improve H2-H6 Header Tag usage."}
              </p>
              <button className="text-gray-400 hover:text-white text-sm transition-colors">
                Show Details
              </button>
            </div>
            {headers.passed ? (
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
        </div>
      )}

      {/* Keyword Consistency */}
      {keywords && keywords !== false && keywords.data && keywords.data.keywords && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-3">Keyword Consistency</h4>
              <p className="text-gray-300 mb-2">
                {keywords.shortAnswer || "Your page's main keywords distribution across important HTML Tags."}
              </p>
              {keywords.passed === false && (
                <p className="text-gray-400 text-sm">
                  Your page content should be focused around particular keywords you would like to rank for. Ideally these keywords should also be distributed across tags such as the title, meta and header tags.
                </p>
              )}
            </div>
            {keywords.passed === false && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Keywords Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">KEYWORD</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">TITLE</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">META DESCRIPTION TAG</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">HEADINGS TAGS</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">PAGE FREQUENCY</th>
                </tr>
              </thead>
              <tbody>
                {keywords.data.keywords.map((keyword: any, index: number) => {
                  const maxFrequency = Math.max(...keywords.data.keywords.map((k: any) => k.count || 0))
                  const frequencyPercentage = keyword.count ? (keyword.count / maxFrequency) * 100 : 0
                  
                  return (
                    <tr key={index} className="border-b border-gray-800 hover:bg-primary transition-colors">
                      <td className="py-3 px-4 text-white font-medium">{keyword.word}</td>
                      <td className="py-3 px-4">
                        {keyword.title ? (
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {keyword.description ? (
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {keyword.headers ? (
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm">{keyword.count || 0}</span>
                          <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="bg-accent h-2 rounded-full transition-all duration-500"
                              style={{ width: `${frequencyPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Phrases Section (if available) */}
          {keywords.data.phrases && Array.isArray(keywords.data.phrases) && keywords.data.phrases.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h5 className="text-lg font-bold text-white mb-4">Phrases</h5>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">PHRASE</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">TITLE</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">META DESCRIPTION TAG</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">HEADINGS TAGS</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">PAGE FREQUENCY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keywords.data.phrases.filter((p: any) => p && typeof p === 'object' && p.word).slice(0, 10).map((phrase: any, index: number) => {
                      const validPhrases = keywords.data.phrases.filter((p: any) => p && typeof p === 'object' && p.count)
                      const maxPhraseFreq = validPhrases.length > 0 ? Math.max(...validPhrases.map((p: any) => p.count || 0)) : 1
                      const phraseFreqPercentage = phrase.count ? (phrase.count / maxPhraseFreq) * 100 : 0
                      
                      return (
                        <tr key={index} className="border-b border-gray-800 hover:bg-primary transition-colors">
                          <td className="py-3 px-4 text-white font-medium">{phrase.word}</td>
                          <td className="py-3 px-4">
                            {phrase.title ? (
                              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {phrase.description ? (
                              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {phrase.headers ? (
                              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm">{phrase.count || 0}</span>
                              <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[100px]">
                                <div 
                                  className="bg-accent h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${phraseFreqPercentage}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
