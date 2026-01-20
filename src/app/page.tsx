'use client'

import Image from 'next/image'
import CheckerForm from '@/components/CheckerForm'
import shapeSvg from '@/assets/images/shape.svg'

export default function Home() {
  const handleCheck = (url: string) => {
    // Navigate to results page with URL as query parameter
    window.location.href = `/results?url=${encodeURIComponent(url)}`
  }

  return (
    <main className="min-h-screen ">
      {/* Minimal Header */}
      <header className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-center">
            <h1 className="text-xl font-bold text-white">SEO Checker</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero Section - Standalone Design */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
            <span className="inline-block relative">
              FREE SEO
              <Image
                src={shapeSvg}
                alt=""
                className="absolute -bottom-1 left-0 -z-10"
                width={220}
                height={28}
                style={{ maxWidth: 'none' }}
              />
            </span>
            {' '}AUDIT
          </h1>
          <p className="text-gray-300 text-xl md:text-2xl max-w-3xl mx-auto mb-4 font-light">
            Get Instant Insights Into Your Website&apos;s SEO Performance
          </p>
          <p className="text-gray-400 text-base max-w-2xl mx-auto mb-12">
            Analyze key metrics and discover opportunities to improve your search engine visibility. No credit card required.
          </p>
          
          {/* Features - Simplified */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-12">
            <div className="flex items-center gap-2 text-gray-300">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-medium">Fast Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm font-medium">100% Secure</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium">Comprehensive Report</span>
            </div>
          </div>
        </div>

        {/* Checker Form */}
        <CheckerForm onCheck={handleCheck} loading={false} />
      </div>

      {/* Minimal Footer */}
      <footer className="border-t border-gray-700/50 mt-16 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} SEO Checker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
