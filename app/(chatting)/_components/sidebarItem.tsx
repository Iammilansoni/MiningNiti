'use client';

import React from 'react'
import { useRouter, usePathname } from 'next/navigation';

interface SidebarItemProps {
    label: string,
    icon: any,
    href: string,
}

function SidebarItem({ href, icon, label }: SidebarItemProps) {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (pathname === "/browseCourses" && href === 'browseCourses') || pathname === href || pathname?.startsWith(`${href}`);

    const onClick = () => {
        router.push(href);
    }

    return (
        <button
            onClick={onClick}
            type='button'
            /**
             * {`ml-auto opacity-0 rounded-l-md border-2 border-blue-500 h-8 transition-all ${isActive && `opacity-100 `}`}
             */
            className={`flex items-center w-full rounded-md text-gray-900 dark:text-white transition-all hover:bg-gray-100 dark:hover:bg-gray-700 group ${isActive && `text-blue-500 bg-blue-200/20 hover:bg-blue-200/20 hover:text-blue-500`}`}
        >
            <div className='pl-2  flex py-2 item-center gap-x-2'>
                <div className={`text-slate-500 ${isActive && `text-blue-500 `}`}>{icon}</div>
                <span className="flex-1 ml-3 whitespace-nowrap">{label} </span>
            </div>

            <div className={`ml-auto opacity-0 rounded-l-md border-2 border-blue-500 h-8 transition-all ${isActive && `opacity-100 `}`} />
        </button>
    )
}

export default SidebarItem