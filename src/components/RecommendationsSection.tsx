'use client'

interface Recommendation {
  recommendation: string
  category: string
  priority: 'high' | 'medium' | 'low'
}

interface RecommendationsSectionProps {
  recommendations: Recommendation[]
}

export default function RecommendationsSection({ recommendations }: RecommendationsSectionProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-pink-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-black'
      case 'low':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getCategoryColor = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'On-Page SEO': 'text-accent',
      'Links': 'text-green-400',
      'Usability': 'text-yellow-400',
      'Performance': 'text-purple-400',
      'Social': 'text-pink-400',
      'Security': 'text-red-400',
      'Local SEO': 'text-cyan-400',
      'Technology': 'text-gray-400',
      'Other': 'text-gray-400',
    }
    return categoryMap[category] || 'text-gray-400'
  }

  return (
    <div id="recommendations-section" className="bg-primary rounded-lg border border-gray-800 p-4 sm:p-6 md:p-8 mb-2 scroll-mt-20 mt-3 overflow-x-hidden">
      <h2 className="text-[20px] md:text-3xl font-bold text-white mb-4">Recommendations</h2>

      {/* Mobile: card layout (excluded from PDF) */}
      <div className="md:hidden space-y-4" data-pdf-exclude>
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-700 p-4 space-y-3"
          >
            <p className="text-white text-sm leading-snug">{rec.recommendation}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-sm font-medium ${getCategoryColor(rec.category)}`}>
                {rec.category}
              </span>
              <span
                className={`priority-badge inline-flex items-center px-3 py-1 rounded text-xs font-semibold ${getPriorityColor(rec.priority)}`}
              >
                {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table (also used for PDF) */}
      <div className="hidden md:block overflow-x-auto recs-table-wrapper">
        <table className="w-full table-fixed recs-table">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-4 px-4 text-gray-300 font-semibold w-[50%]">Recommendation</th>
              <th className="text-left py-4 px-4 text-gray-300 font-semibold w-[20%] min-w-[100px] whitespace-nowrap">Category</th>
              <th className="priority-cell text-center py-4 px-4 text-gray-300 font-semibold w-[20%] min-w-[120px]">Priority</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map((rec, index) => (
              <tr key={index} className="border-b border-gray-800 hover:bg-primary-dark transition-colors">
                <td className="py-4 px-4 text-white align-top">{rec.recommendation}</td>
                <td className={`py-4 px-4 font-medium whitespace-nowrap ${getCategoryColor(rec.category)}`}>
                  {rec.category}
                </td>
                <td className="priority-cell py-4 px-4 text-center align-top">
                  <span className={`priority-badge flex items-center justify-center px-3 py-1.5 rounded text-xs font-semibold text-center w-full min-w-0 ${getPriorityColor(rec.priority)}`}>
                    {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {recommendations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No recommendations available.</p>
        </div>
      )}
    </div>
  )
}
