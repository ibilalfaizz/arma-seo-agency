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
    <div id="recommendations-section" className="bg-primary rounded-lg border border-gray-800 p-8 mb-8 scroll-mt-20">
      <h2 className="text-3xl font-bold text-white mb-6">Recommendations</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-4 px-4 text-gray-300 font-semibold">Recommendation</th>
              <th className="text-left py-4 px-4 text-gray-300 font-semibold">Category</th>
              <th className="text-left py-4 px-4 text-gray-300 font-semibold">Priority</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map((rec, index) => (
              <tr key={index} className="border-b border-gray-800 hover:bg-primary-dark transition-colors">
                <td className="py-4 px-4 text-white">{rec.recommendation}</td>
                <td className={`py-4 px-4 font-medium ${getCategoryColor(rec.category)}`}>
                  {rec.category}
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${getPriorityColor(rec.priority)}`}>
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
