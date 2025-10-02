import React, { useEffect, useState } from 'react'
import { Gem, Sparkles } from 'lucide-react'
import { Protect, useAuth } from '@clerk/clerk-react';
import CreationItem from '../components/CreationItem';
import axios from 'axios';
import toast from 'react-hot-toast';

// Set Axios base URL from environment variable
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  
  // State to hold all creations
  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)

  const { getToken } = useAuth()

  // Fetch dashboard data from backend
  const getDashboardData = async () => {
    try {
      const { data } = await axios.get('api/user/get-user-creations', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        setCreations(data.creations)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  // Load dashboard data once on component mount
  useEffect(() => {
    getDashboardData()
  }, [])

  return (
    <div className='h-full overflow-y-scroll p-6'>

      {/* Top Cards */}
      <div className='flex justify-start gap-4 flex-wrap'>

        {/* Total Creations Card */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Total Creations</p>
            <h2 className='text-xl font-semibold'>{creations.length}</h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center'>
            <Sparkles className='w-5 text-white' /> {/* Icon representing creations */}
          </div>
        </div>

        {/* Active Plan Card */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Active Plan</p>
            <h2 className='text-xl font-semibold'>
              {/* Protect component displays "Premium" if user has access, otherwise fallback */}
              <Protect plan='premium' fallback='Free'>Premium</Protect>
            </h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C9] to-[#9E53EE] text-white flex justify-center items-center'>
            <Gem className='w-5 text-white' /> {/* Icon representing plan */}
          </div>
        </div>

      </div>

      {/* Loading Spinner or Recent Creations List */}
      {
        loading ? (
          <div className='flex justify-center items-center h-3/4'>
            <div className='animate-spin rounded-full h-11 w-11 border-3 border-purple-500 border-t-transparent'></div>
          </div>
        ) : (
          <div className='space-y-3'>
            <p className='mt-6 mb-4'>Recent Creations</p>
            {creations.map((item) => (
              // Each creation rendered via CreationItem component
              <CreationItem key={item.id} item={item} />
            ))}
          </div>
        )
      }

    </div>
  );
};

export default Dashboard;
