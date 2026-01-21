'use client'

interface LinksSectionProps {
  data: any
}

export default function LinksSection({ data }: LinksSectionProps) {
  const linksScore = data.scores?.links?.grade || 0
  const linksTitle = data.scores?.links?.title || ''
  const linksDescription = data.scores?.links?.description || ''
  const friendlyUrls = data.friendlyUrls && data.friendlyUrls !== false ? data.friendlyUrls : null

  const getGradeColor = (grade: number | string | undefined): string => {
    if (grade === undefined || grade === null || grade === '') return '#6B7280'
    const gradeStr = typeof grade === 'number' ? String(grade) : grade.toString()
    if (typeof grade === 'number') {
      if (grade >= 80) return '#10B981'
      if (grade >= 60) return '#F59E0B'
      return '#EF4444'
    }
    if (gradeStr.startsWith('A')) return '#10B981'
    if (gradeStr.startsWith('B')) return '#F59E0B'
    if (gradeStr.startsWith('C')) return '#F59E0B'
    if (gradeStr.startsWith('D')) return '#EF4444'
    return '#EF4444'
  }

  const formatGrade = (grade: number | string | undefined): string => {
    if (grade === undefined || grade === null || grade === '') return 'N/A'
    if (typeof grade === 'number') {
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

  if (!friendlyUrls) return null

  return (
    <div className="bg-primary rounded-lg border border-gray-800 p-8 mb-8">
      <h2 className="text-3xl font-bold text-white mb-8">Links</h2>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-3">{linksTitle}</h3>
          <p className="text-gray-300 leading-relaxed">{linksDescription}</p>
        </div>
      </div>

      {/* Friendly URLs */}
      {friendlyUrls && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-3">Friendly Links</h4>
              {!friendlyUrls.passed && (
                <>
                  <p className="text-gray-300 mb-2">
                    Some of your link URLs do not appear friendly to humans or search engines.
                  </p>
                  <p className="text-gray-300">
                    We would recommend making URLs as readable as possible by reducing length, file names, code strings and special characters.
                  </p>
                </>
              )}
              {friendlyUrls.passed && (
                <p className="text-gray-300">{friendlyUrls.shortAnswer}</p>
              )}
            </div>
            {friendlyUrls.passed ? (
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
    </div>
  )
}
