import React, { useState } from 'react'
import Image from 'next/image'
import ChattingSidebarRoutes from './chatting-sidebar-routes'

function ChattingSidebar() {
  

    return (
        <div
            className={`fixed border-r top-0 left-0 z-40 w-64 h-screen transition-transform 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 shadow-sm bg-white overflow-y-auto`}
            aria-label="ChattingSidebar"
        >
         
            <div className="h-full px-3 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                <a href='/browseCourses'
                    className="flex cursor-pointer items-center">
                    <img
                        className='mb-1 h-20 w-30 rounded-full'
                        src='/logo.png'
                        alt='p'
                    
                    />
               
                </a>
                <ChattingSidebarRoutes />
            </div>
        </div>
    )
}

export default ChattingSidebar
