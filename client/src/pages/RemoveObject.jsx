import { useAuth } from '@clerk/clerk-react';
import { Scissors, Eraser, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios';
import toast from 'react-hot-toast';

// Set Axios base URL from environment variable
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {

  // State to store the uploaded image file
  const [input, setInput] = useState(null)
  
  // State to store the name of the object to remove
  const [object, setObject] = useState('')

  // Loading state for request
  const [loading, setLoading] = useState(false)
  
  // URL of processed image from backend
  const [content, setContent] = useState('')

  const { getToken } = useAuth()
      
  // Handle form submission
  const onSubmitHandler = async (e) => {
    e.preventDefault()

    if (!input) return toast.error("Please upload an image first")

    if(object.split(' ').length > 1){
      return toast.error('Please enter only one object name')
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('image', input)
      formData.append('object', object)

      // Send POST request to backend with image file and object name
      const { data } = await axios.post(
        '/api/ai/remove-image-object',
        formData,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            // 'Content-Type' is automatically set to multipart/form-data
          }
        }
      )

      if (data.success) {
        setContent(data.content)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      // Show specific backend error if available
      toast.error(error.response?.data?.message || error.message)
    }
    setLoading(false)
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      
      {/* Left column: object removal form */}
      <form 
        onSubmit={onSubmitHandler} 
        className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'
      >
        
        {/* Form header */}
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Object Removal</h1>
        </div>

        {/* Image upload input */}
        <p className='mt-6 text-sm font-medium'>Upload Image</p>
        <input 
          onChange={(e) => setInput(e.target.files[0])}
          type="file"
          accept='image/*'
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600'
          required
        />

        {/* Object name input */}
        <p className='mt-6 text-sm font-medium'>Describe object name to remove</p>
        <textarea 
          onChange={(e) => setObject(e.target.value)}
          value={object}
          rows={4}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
          placeholder='e.g., watch or spoon. Only a single object name'
          required
        />

        {/* Remove object button */}
        <button 
          disabled={loading}
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417DF6]
            to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'
        >
          {loading ? (
            <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
          ) : (
            <Eraser className='w-5' />
          )}
          Remove Object
        </button>
      </form>

      {/* Right column: display processed image */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96'>
        
        {/* Header */}
        <div className='flex items-center gap-3'>
          <Scissors className='w-5 h-5 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Processed Image</h1>
        </div>

        {/* Placeholder or resulting image */}
        {!content ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Scissors className='w-9 h-9' />
              <p>Upload an image and click "Remove Object" to get started</p>
            </div>
          </div>
        ) : (
          <img src={content} alt="Processed result"  className='mt-3 w-full h-full object-contain'/>
        )}
        
      </div>
    </div>
  )
}

export default RemoveObject
