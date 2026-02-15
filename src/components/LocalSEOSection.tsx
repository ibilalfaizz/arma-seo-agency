'use client'

interface LocalSEOSectionProps {
  data: any
}

export default function LocalSEOSection({ data }: LocalSEOSectionProps) {
  const gbpCompleteness = data.gbpCompleteness && data.gbpCompleteness !== false ? data.gbpCompleteness : null
  const gbpReviews = data.gbpReviews && data.gbpReviews !== false ? data.gbpReviews : null

  if (!gbpCompleteness && !gbpReviews) return null

  // Calculate total reviews for percentage calculation
  const getTotalReviews = () => {
    if (!gbpReviews?.data) return 0
    return (gbpReviews.data.reviewScore1Count || 0) +
           (gbpReviews.data.reviewScore2Count || 0) +
           (gbpReviews.data.reviewScore3Count || 0) +
           (gbpReviews.data.reviewScore4Count || 0) +
           (gbpReviews.data.reviewScore5Count || 0)
  }

  const totalReviews = getTotalReviews()

  return (
    <div className=" bg-primary rounded-lg border border-gray-800 p-8 mb-2  pdf-report-last " style={{height:'100vh'}}>
      <h2 className="text-3xl font-bold text-white mb-2">Local SEO</h2>

      {/* Google Business Profile Completeness + Google Reviews */}
      {(gbpCompleteness || gbpReviews) && (
        <div className="bg-primary-dark rounded-lg border border-gray-700 p-6 mb-2">
          <h4 className="text-xl font-bold text-white mb-4">Google Business Profile</h4>
          <div className="space-y-6">
            {gbpCompleteness && (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h5 className="text-lg font-semibold text-white mb-2">Completeness</h5>
                  <p className="text-gray-300">{gbpCompleteness.shortAnswer}</p>
                  {gbpCompleteness.data && (
                    <div className="mt-4 space-y-3">
                      {gbpCompleteness.data.gbpSite && (
                        <div className="flex">
                          <span className="text-gray-400 font-medium w-24 flex-shrink-0">Address:</span>
                          <span className="text-white">{gbpCompleteness.data.gbpSite}</span>
                        </div>
                      )}
                      {gbpCompleteness.data.gbpPhone && (
                        <div className="flex">
                          <span className="text-gray-400 font-medium w-24 flex-shrink-0">Phone:</span>
                          <span className="text-white">{gbpCompleteness.data.gbpPhone}</span>
                        </div>
                      )}
                      {gbpCompleteness.data.gbpUrl && (
                        <div className="flex">
                          <span className="text-gray-400 font-medium w-24 flex-shrink-0">Site:</span>
                          <a href={gbpCompleteness.data.gbpUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-light">
                            {gbpCompleteness.data.gbpUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {gbpCompleteness.passed && (
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            )}
            {gbpReviews && (
              <div className={gbpCompleteness ? 'pt-6 border-t border-gray-700' : ''}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h5 className="text-lg font-semibold text-white mb-2">Reviews</h5>
                    <p className="text-gray-300">{gbpReviews.shortAnswer}</p>
                  </div>
                  {gbpReviews.passed && (
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Rating Display */}
                {gbpReviews.data && (
                  <div className="mt-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-bold text-white">{gbpReviews.data.reviewScore}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-6 h-6 ${star <= Math.round(gbpReviews.data.reviewScore) ? 'text-yellow-400' : 'text-gray-600'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-gray-400">{gbpReviews.data.numberReviews || totalReviews} reviews</span>
                    </div>

                    {/* Rating Distribution */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-gray-300 mb-3">RATING</div>
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = gbpReviews.data[`reviewScore${rating}Count`] || 0
                        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                        
                        return (
                          <div key={rating} className="flex items-center gap-3">
                            <span className="text-gray-400 text-sm w-8">{rating}</span>
                            <div className="flex-1 bg-gray-700 rounded-full h-4 relative overflow-hidden">
                              <div
                                className="bg-accent h-full rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-gray-400 text-sm w-12 text-right">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* <div style={{height: '3rem'}}></div> */}
    </div>
  )
}
