'use client'

import Image from 'next/image'
import personImage from '@/assets/images/person.png'

export default function StrategistSection() {
  return (
    <div className="container mx-auto px-4 max-w-7xl mb-8">
      <div className="overflow-hidden relative rounded-lg border border-gray-800 bg-primary">
        <div className="grid md:grid-cols-[2fr_1fr] gap-0 items-stretch">
        {/* Left Side - Content (2/3 width) */}
        <div className="bg-primary-light rounded-t-lg md:rounded-l-lg md:rounded-tr-none p-6 md:p-8 relative z-10 flex flex-col justify-center">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight text-white uppercase">
            LET'S BUILD A MARKETING PLAN THAT WORKS ALL YEAR LONG
          </h3>
          <p className="text-gray-300 text-base md:text-lg mb-6 leading-relaxed">
            Book a free strategy call and we'll review your current website, marketing, and local competition. You'll walk away with clear next steps to get more qualified leads and keep your crew busy.
          </p>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <a
              href="#contact"
              className="bg-accent hover:bg-accent-dark text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              Get your free strategy call
            </a>
            
            <div className="flex items-center gap-3 text-white">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-base md:text-lg font-medium">1300-143-153</span>
              <div className="flex items-center gap-1 text-accent">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'rotate(0deg)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span className="text-sm italic font-normal" style={{ fontFamily: 'cursive' }}>Time to grow</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Strategist Photo & Quote (1/3 width) */}
        <div className="relative bg-primary-dark rounded-b-lg md:rounded-r-lg md:rounded-bl-none overflow-hidden">
          {/* Diagonal red stripes background */}
          <div className="absolute inset-0 opacity-100">
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, #BE301E 20px, #BE301E 40px)'
            }}></div>
          </div>
          
          <div className="relative h-full min-h-[400px] md:min-h-[500px]">
            {/* Strategist image */}
            <div className="absolute inset-0">
              <Image
                src={personImage}
                alt="Mark Stevens - Senior Marketing Strategist"
                fill
                className="object-cover object-center"
                priority
              />
            </div>
            
            {/* Quote Box - Overlaid on bottom right */}
            <div className="absolute bottom-6 right-6 bg-primary-dark rounded-lg p-5 max-w-[300px] shadow-2xl">
              <div className="text-white text-5xl font-serif leading-none mb-3" style={{ lineHeight: '0.8' }}>"</div>
              <p className="text-white text-sm italic mb-4 leading-relaxed">
                I'll break down exactly what your business needs - no pressure, no sales tricks
              </p>
              <div className="pt-2">
                <p className="text-white text-sm font-bold">Mark Stevens</p>
                <p className="text-gray-400 text-xs mt-0.5">Senior Marketing Strategist</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
