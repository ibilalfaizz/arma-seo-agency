'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import AuditResultsDisplay from '@/components/AuditResultsDisplay'
import OnPageSEOSection from '@/components/OnPageSEOSection'
import RecommendationsSection from '@/components/RecommendationsSection'
import LinksSection from '@/components/LinksSection'
import PerformanceSection from '@/components/PerformanceSection'
import UsabilitySection from '@/components/UsabilitySection'
import LocalSEOSection from '@/components/LocalSEOSection'

export interface SEOData {
  url?: string
  title?: string
  description?: string
  score?: number
  [key: string]: any
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const url = searchParams.get('url')
  
  const [seoData, setSeoData] = useState<SEOData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if we should use test data (via query parameter)
    // Default to API mode - set ?test=true to use test data (JSON file) instead
    const useTestData = new URLSearchParams(window.location.search).get('test') === 'true'
    
    // Load test data from JSON file
    const loadTestData = async () => {
      try {
        const response = await fetch('/data.json')
        const jsonData = await response.json()
        // Extract the output data structure
        const outputData = jsonData.data?.output || {}
        
        // Map section names to category names for recommendations
        const sectionToCategory: { [key: string]: string } = {
          'seo': 'On-Page SEO',
          'links': 'Links',
          'ui': 'Usability',
          'performance': 'Performance',
          'security': 'Security',
          'social': 'Social',
          'localseo': 'Local SEO',
          'technology': 'Technology',
        }
        
        // Transform recommendations from JSON to match component expectations
        if (outputData.recommendations && Array.isArray(outputData.recommendations)) {
          outputData.recommendations = outputData.recommendations.map((rec: any) => ({
            recommendation: rec.recommendation,
            category: sectionToCategory[rec.section] || rec.section || 'Other',
            priority: rec.priority || 'low'
          }))
        }
        
        setSeoData(outputData as SEOData)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load test data:', err)
        setError('Failed to load test data')
        setLoading(false)
      }
    }

    // Fetch results from API
    const fetchResults = async () => {
      if (!url) {
        setError('No URL provided')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      setSeoData(null)

      try {
        const response = await fetch('/api/check-seo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to check SEO')
        }

        const apiResponse = await response.json()
        
        // The API route already extracts and returns outputData directly
        // So apiResponse IS the outputData (with convenience fields added)
        const apiData = apiResponse
        
        // Map section names to category names for recommendations (if recommendations exist)
        const sectionToCategory: { [key: string]: string } = {
          'seo': 'On-Page SEO',
          'links': 'Links',
          'ui': 'Usability',
          'performance': 'Performance',
          'security': 'Security',
          'social': 'Social',
          'localseo': 'Local SEO',
          'technology': 'Technology',
        }
        
        // Transform recommendations if they exist and are an array
        // Note: recommendations can be `false` in the new structure
        // Only transform labels - use data from API response only
        if (apiData.recommendations && Array.isArray(apiData.recommendations)) {
          apiData.recommendations = apiData.recommendations.map((rec: any) => ({
            recommendation: rec.recommendation,
            category: sectionToCategory[rec.section] || rec.section,
            priority: rec.priority
          }))
        } else if (apiData.recommendations === false) {
          // Set to empty array if recommendations is false
          apiData.recommendations = []
        }
        
        setSeoData(apiData as SEOData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    // Use test data if test parameter is present, otherwise use API
    if (useTestData) {
      loadTestData()
    } else {
      fetchResults()
    }
  }, [url])

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Minimal Header - Standalone Report Design */}
      <header className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Checker
            </button>
            <h1 className="text-lg font-bold text-white">SEO Report</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent mb-6"></div>
            <h2 className="text-3xl font-bold mb-4">Analyzing Your Website</h2>
            <p className="text-gray-400 text-lg">Please wait while we check your SEO performance...</p>
            {url && (
              <p className="text-gray-500 text-sm mt-2">Checking: {url}</p>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && !loading && (
          <div className="mt-8 p-6 bg-accent/20 border border-accent rounded-lg max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <h3 className="text-xl font-bold text-accent">Error</h3>
            </div>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-accent hover:bg-accent-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results Display */}
        {seoData && !loading && (
          <>
            <AuditResultsDisplay data={seoData} />
            {seoData.recommendations && Array.isArray(seoData.recommendations) && seoData.recommendations.length > 0 && (
              <RecommendationsSection recommendations={seoData.recommendations} />
            )}
            <OnPageSEOSection data={seoData} />
            <LinksSection data={seoData} />
            <PerformanceSection data={seoData} />
            <UsabilitySection data={seoData} />
            <LocalSEOSection data={seoData} />
          </>
        )}
      </div>

      {/* Minimal Footer - Standalone Report Design */}
      <footer className="border-t border-gray-700/50 mt-16 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} SEO Checker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent mb-6"></div>
          <p className="text-gray-400 text-lg">Loading...</p>
        </div>
      </main>
    }>
      <ResultsContent />
    </Suspense>
  )
}
