import React from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import ChattingSidebar from './chatting-sidebar'
import { Menu } from './menu-icon'


function ChattingMobileSidebar() {
    return (
        <Sheet>
            <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
                <Menu />
            </SheetTrigger>
            <SheetContent side="left" className='p-0 bg-white' >
                <ChattingSidebar />
            </SheetContent>
        </Sheet>
    )
}

export default ChattingMobileSidebar