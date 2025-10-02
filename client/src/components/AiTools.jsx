import React from 'react'
import { AiToolsData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'

const AiTools = () => {
  const navigate = useNavigate() // Hook to programmatically navigate between routes
  const { user } = useUser() // Get current logged-in user from Clerk

  return (
    <div className='px-4 sm:px-20 xl:px-32 my-24'>

      {/* Section header */}
      <div className='text-center'>
        <h2 className='text-slate-700 text-[42px] font-semibold'>Your AI Content Toolkit</h2>
        <p className='text-gray-500 max-w-lg mx-auto'>
          All-in-one tools to create, enhance, and optimize your content with advanced AI
        </p>
      </div>

      {/* AI tools cards */}
      <div className='flex flex-wrap mt-10 justify-center'>
        {AiToolsData.map((tool, index) => (
          <div
            key={index} // Key for list rendering
            className='p-8 m-4 max-w-xs rounded-l bg-[#FDFDFE] shadow-lg border-gray-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer'
            onClick={() => user && navigate(tool.path)} // Navigate to tool path if user is logged in
          >
            {/* Tool icon with gradient background */}
            <tool.Icon
              className='w-12 h-12 p-3 text-white rounded-xl'
              style={{ background: `linear-gradient(to bottom, ${tool.bg.from}, ${tool.bg.to})` }}
            />
            {/* Tool title */}
            <h3 className='mt-6 mb-3 text-lg font-semibold'>{tool.title}</h3>
            {/* Tool description */}
            <p className='text-gray-400 text-sm max-w-[95%]'>{tool.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AiTools
