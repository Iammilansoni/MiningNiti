"use client";

import React from 'react'
import { usePathname, useRouter } from 'next/navigation';
import { IoNotificationsOutline } from 'react-icons/io5';
import UserAvatar from './user-avatar';
import { ThemeModeToggle } from './themeModeToggle';

function ChattingNavbarRoutes() {
    const pathname = usePathname();
    const router = useRouter()

    const switchBack = () => {
        router.push('/browseCourses')
    }

    return (
        <div className='flex ml-auto flex items-center py-auto justify-between'>
          
        </div>

    )
}

export default ChattingNavbarRoutes