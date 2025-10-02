import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/clerk-react';
import { dummyPublishedCreationData } from '../assets/assets';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';

// Set base URL for axios from environment variable
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  // State to store fetched creations
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state while fetching creations

  // Get current user and auth token functions from Clerk
  const { user } = useUser();
  const { getToken } = useAuth();

  // Fetch published creations from backend
  const fetchCreations = async () => {
    try {
      const token = await getToken(); // Get auth token
      const { data } = await axios.get('/api/user/get-published-creations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // If backend returns creations, update state. Otherwise, use dummy data
      if (data?.success && data?.creations?.length) {
        setCreations(data.creations);
      } else {
        toast('No creations found, showing dummy data.');
        setCreations(dummyPublishedCreationData);
      }
    } catch (error) {
      console.error(error);
      toast('Failed to fetch creations, showing dummy data.');
      setCreations(dummyPublishedCreationData);
    } finally {
      setLoading(false); // Stop loading once fetch attempt is done
    }
  };

  // Toggle like for a creation (backend + frontend)
  const imageLikeToggle = async (id) => {
    try {
      const { data } = await axios.post(
        '/api/user/toggle-like-creation',
        { id },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (data.success) {
        toast.success(data.message); // Show success message
        await fetchCreations(); // Refresh creations to update like count
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message); // Show error if backend fails
    }
  };

  // Fetch creations once user is loaded
  useEffect(() => {
    if (user) fetchCreations();
  }, [user]);

  // Show spinner while loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
    </div>
    );
  }

  // Show message if no creations available
  if (!creations.length) return <div className="p-6">No creations available.</div>;

  return (
    <div className="flex-1 h-full flex flex-col gap-4 p-6">
      {/* Section title */}
      <h2 className="text-xl font-semibold">Creations</h2>

      {/* Container for all creations */}
      <div className="bg-white h-full w-full rounded-xl overflow-y-scroll">
        {creations.map((creation, index) => (
          <div
            key={creation._id || index} // Prefer unique _id for key
            className="relative group inline-block pl-3 pt-3 w-full sm:max-w-1/2 lg:max-w-1/3"
          >
            {/* Image for the creation */}
            <img
              src={creation.content}
              alt={creation.prompt || ""}
              className="w-full h-full object-cover rounded-lg"
            />

            {/* Overlay showing prompt and likes on hover */}
            <div
              className="absolute bottom-0 top-0 right-0 left-3 flex gap-2 items-end 
              justify-end group-hover:justify-between p-3 group-hover:bg-gradient-to-b 
              from-transparent to-black/80 text-white rounded-lg"
            >
              {/* Prompt text, hidden until hover */}
              <p className="text-sm hidden group-hover:block">{creation.prompt}</p>

              {/* Likes section with Heart icon */}
              <div className="flex gap-1 items-center">
                {/* Display number of likes */}
                <p>{creation.likes?.length || 0}</p>

                {/* Heart icon for liking/unliking */}
                <Heart
                  onClick={() => imageLikeToggle(creation.id)} // Call like toggle function
                  className={`min-w-5 h-5 hover:scale-110 cursor-pointer ${
                    creation.likes?.includes(user?.id)
                      ? "fill-red-500 text-red-600" // Red if user liked
                      : "text-white" // White if not liked
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
