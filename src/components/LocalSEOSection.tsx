'use client'

interface LocalSEOSectionProps {
  data: any
}

export default function LocalSEOSection({ data }: LocalSEOSectionProps) {
  const gbpCompleteness = data.gbpCompleteness && data.gbpCompleteness !== false ? data.gbpCompleteness : null
  const gbpReviews = data.gbpReviews && data.gbpReviews !== false ? data.gbpReviews : null

  if (!gbpCompleteness && !gbpReviews) return null

  return (
    <div className="bg-primary rounded-lg border border-gray-800 p-8 mb-8">
      <h2 className="text-3xl font-bold text-white mb-8">Local SEO</h2>

      {/* Google Business Profile Completeness */}
      {gbpCompleteness && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <h4 className="text-xl font-bold text-white mb-3">Google Business Profile Completeness</h4>
          <p className="text-gray-300">{gbpCompleteness.shortAnswer}</p>
        </div>
      )}

      {/* Google Reviews */}
      {gbpReviews && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-6">
          <h4 className="text-xl font-bold text-white mb-3">Google Reviews</h4>
          <p className="text-gray-300">{gbpReviews.shortAnswer}</p>
        </div>
      )}
    </div>
  )
}
