import React from 'react'
import ChattingMobileSidebar from './chatting-mobile-sidebar'
import ChattingNavbarRoutes from './chatting-navbar-routes'

function ChattingNavbar() {
    return (
        <div className='p-4 border-b h-full flex items-center dark:bg-black dark:bg-opacity-80  bg-white shadow-sm'>
            <ChattingMobileSidebar />
            <ChattingNavbarRoutes />
        </div>
    )
}

export default ChattingNavbar