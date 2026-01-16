'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import ResultsDisplay from '@/components/ResultsDisplay'
import AuditResultsDisplay from '@/components/AuditResultsDisplay'
import OnPageSEOSection from '@/components/OnPageSEOSection'
import RecommendationsSection from '@/components/RecommendationsSection'
import StrategistSection from '@/components/StrategistSection'
import logoImage from '@/assets/images/logo.png'

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
    // Default to API mode - set ?test=true to use test data instead
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
        
        // Handle the API response structure: { success: true, data: { output: {...} } }
        // Or direct output data if already extracted by the API route
        const apiData = apiResponse.data?.output || apiResponse
        
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
        if (apiData.recommendations && Array.isArray(apiData.recommendations)) {
          apiData.recommendations = apiData.recommendations.map((rec: any) => ({
            recommendation: rec.recommendation,
            category: sectionToCategory[rec.section] || rec.section || 'Other',
            priority: rec.priority || 'low'
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
    <main className="min-h-screen bg-primary-dark">
      {/* Header Section - Matching ARMA Design */}
      <header className="border-b border-gray-800 bg-primary-dark">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="relative h-8 w-32">
                <Image
                  src={logoImage}
                  alt="ARMA Agency"
                  fill
                  className="object-contain object-left cursor-pointer"
                  priority
                  onClick={() => router.push('/')}
                />
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <a href="/" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">HOME</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
                  SERVICES
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
                  RESULTS
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
                  ABOUT
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">CONTACT US</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <a href="tel:1300-143-153" className="hidden md:block text-gray-300 hover:text-white transition-colors text-sm">
                1300-143-153
              </a>
              <a
                href="#contact"
                className="bg-accent hover:bg-accent-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Schedule Intro Call
              </a>
              <button className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
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
          </>
        )}
      </div>

      {/* Strategist Section */}
      {seoData && !loading && <StrategistSection />}

      {/* Footer - ARMA Style */}
      <footer className="border-t border-gray-800 mt-16 bg-primary-dark">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="relative h-8 w-32 mb-4">
                <Image
                  src={logoImage}
                  alt="ARMA Agency"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>1300-143-153</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>info@arma.com</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>600 N Washington Ave Suite C203, Minneapolis, MN 55401</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-gray-300">SERVICES</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Web Design and Development</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Search Engine Optimization</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pay-Per-Click Advertising</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Digital marketing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Branding</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI optimisation</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-gray-300">COMPANY</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Book</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            {/* Website Performance Check */}
            <div>
              <div className="bg-primary rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-bold mb-2">
                  Test your website <span className="text-accent">NOW</span>
                </h3>
                <p className="text-sm text-gray-400 mb-4">Check your website performance</p>
                <a
                  href="/"
                  className="inline-block bg-accent hover:bg-accent-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-gray-400 text-sm">
                © 2026 Arma Agency. All rights reserved.
              </div>
              <div className="flex items-center gap-4">
                {/* Social Media Icons */}
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.302 0-.608.019-.91.054v-.002c-.807.074-1.595.3-2.316.67-.01-.003-.02-.006-.03-.008h-.002c-.31.13-.6.29-.87.48-.01.01-.02.01-.03.02l-.01.01c-.27.19-.52.4-.75.63-.01.01-.01.02-.02.03-.23.23-.44.48-.63.75-.01.01-.01.02-.02.03-.19.27-.35.56-.48.87v.01c-.37.72-.6 1.51-.67 2.32-.04.3-.05.61-.05.91 0 .3.02.61.05.91.07.81.3 1.6.67 2.32.13.31.29.6.48.87.01.01.01.02.02.03.19.27.4.52.63.75.01.01.02.02.03.02.23.23.48.44.75.63.01.01.02.01.03.02.27.19.56.35.87.48h.01c.72.37 1.51.6 2.32.67.3.04.61.05.91.05.3 0 .61-.02.91-.05.81-.07 1.6-.3 2.32-.67.31-.13.6-.29.87-.48.01-.01.02-.01.03-.02.27-.19.52-.4.75-.63.01-.01.02-.01.03-.02.23-.23.44-.48.63-.75.01-.01.01-.02.02-.03.19-.27.35-.56.48-.87.37-.72.6-1.51.67-2.32.04-.3.05-.61.05-.91 0-.3-.02-.61-.05-.91-.07-.81-.3-1.6-.67-2.32-.13-.31-.29-.6-.48-.87-.01-.01-.01-.02-.02-.03-.19-.27-.4-.52-.63-.75-.01-.01-.02-.01-.03-.02-.23-.23-.48-.44-.75-.63-.01-.01-.02-.01-.03-.02-.27-.19-.56-.35-.87-.48-.72-.37-1.51-.6-2.32-.67-.3-.04-.61-.05-.91-.05z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                  </svg>
                </a>
              </div>
              <div className="flex items-center gap-6 mt-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Use</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-primary-dark flex items-center justify-center">
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
