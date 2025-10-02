import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { SignIn, useUser } from '@clerk/clerk-react'

const Layout = () => {
  const navigate = useNavigate() // Hook to programmatically navigate between routes
  const [sidebar, setSidebar] = useState(false) // State to toggle sidebar visibility
  const { user } = useUser() // Get current logged-in user from Clerk

  // If user is logged in, show main layout. Otherwise, show SignIn form
  return user ? (
    <div className='flex flex-col items-start justify-start h-screen'>
      
      {/* Top navigation bar */}
      <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200'>
        {/* Logo */}
        <img 
          src={assets.logo} 
          alt="Logo" 
          className="w-32 sm:w-44 h-auto cursor-pointer" 
          onClick={() => navigate('/')} // Navigate home on click
        />

        {/* Mobile menu toggle */}
        {sidebar 
          ? <X onClick={() => setSidebar(false)} className='w-6 h-6 text-gray-600 sm:hidden'/>
          : <Menu onClick={() => setSidebar(true)} className='w-6 h-6 text-gray-600 sm:hidden'/>
        }
      </nav>

      {/* Main content area */}
      <div className='flex-1 w-full flex h-[calc(100vh-64px)]'>
        {/* Sidebar component */}
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />

        {/* Page content */}
        <div className='flex-1 bg-[#F4F7FB]'>
          <Outlet /> {/* Render the routed page here */}
        </div>
      </div>
    </div>
  ) : (
    // Show sign-in page if no user is logged in
    <div className='flex items-center justify-center h-screen'>
      <SignIn />
    </div>
  )
}

export default Layout
