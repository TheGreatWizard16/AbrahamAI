import React, { useState } from 'react';
import Markdown from 'react-markdown'

const CreationItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false); // State to toggle expanded view

  return (
    // Container for each creation, clickable to expand/collapse
    <div
      onClick={() => setExpanded(!expanded)} 
      className='p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer'
    >
      {/* Header section showing prompt, type, and date */}
      <div className='flex justify-between items-center gap-4'>
        <div>
          {/* Prompt/title of the creation */}
          <h2>{item.prompt}</h2>

          {/* Type and creation date */}
          <p className='text-gray-500'>
            {item.type} - {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Badge showing the type of creation */}
        <button className='bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full'>
          {item.type}
        </button>
      </div>

      {/* Expanded section, visible when clicked */}
      {expanded && (
        <div>
          {item.type === 'image' ? (
            // Display image if type is 'image'
            <div>
              <img src={item.content} alt='image' className='mt-3 w-full max-w-md' />
            </div>
          ) : (
            // Display markdown content if type is not 'image'
            <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-700'>
              <div className='reset-tw'>
                <Markdown>{item.content}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreationItem;
