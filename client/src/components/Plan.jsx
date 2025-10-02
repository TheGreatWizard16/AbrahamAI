import React from 'react'
import { PricingTable } from '@clerk/clerk-react'

const Plan = () => {
  return (
    // Main container for the plan section, centered with max width
    <div className='max-w-2xl mx-auto z-20 my-30'>

        {/* Section header */}
        <div className='text-center'>
            <h2 className='text-slate-700 text-[42px] font-semibold'>Choose Your Plan</h2>
            <p className='text-gray-500 max-w-lg mx-auto'>
                Get started free and upgrade anytime. Flexible plans built to grow with your content.
            </p>
        </div>

        {/* Pricing table provided by Clerk */}
        <div className='mt-14 max-sm:mx-8'>
            <PricingTable /> 
        </div>
    </div>
  )
}

export default Plan
