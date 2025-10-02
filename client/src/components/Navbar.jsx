import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'

const Navbar = () => {

    const navigate = useNavigate() // Hook to programmatically navigate between routes
    const { user } = useUser() // Get the currently logged-in user from Clerk
    const { openSignIn } = useClerk() // Function to open the Clerk SignIn modal

    return ( 
        // Navbar container, fixed at top with backdrop blur
        <div className='fixed z-5 w-full backdrop-blur-2xl flex justify-between items-center py-3 px-4 sm:px-20 x1:px-32'>
            
            {/* Logo, navigates home on click */}
            <img 
                src={assets.logo} 
                alt="logo"  
                className='w-32 sm:w-44 cursor-pointer' 
                onClick={() => navigate('/')} 
            />

            {/* If user is logged in, show UserButton. Otherwise, show "Get Started" button */}
            {user ? (
                <UserButton />
            ) : (
                <button 
                    onClick={openSignIn} // Opens the Clerk SignIn modal
                    className='flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-10 py-2.5'
                >
                    Get Started <ArrowRight className='w-4 h-4'/> 
                </button>
            )}
        </div>
    )
}

export default Navbar
