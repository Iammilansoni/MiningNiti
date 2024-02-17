import React from 'react'
import { BsPersonVideo2 } from 'react-icons/bs';
import { AiFillSetting, AiOutlineTransaction } from 'react-icons/ai'
import { BiBroadcast } from 'react-icons/bi';
import { BsPatchQuestion } from 'react-icons/bs';
import { TbBrandGoogleAnalytics } from 'react-icons/tb';
import { HiUserGroup } from 'react-icons/hi';
import { useParams } from 'next/navigation';
import { VscFeedback } from "react-icons/vsc";
import { FaHandsHelping } from "react-icons/fa";
import SidebarItem from './sidebarItem';

function ChattingSideBarRoutes() {
    let ChattingId  = '123456';

    const routes = [
        {
            icon: <TbBrandGoogleAnalytics size={22} />,
            label: 'Chatting',
            href: `/Chatting`,
        }
    ]

    return (
        <ul className="space-y-2 font-medium">
            {routes.map((route, index) => {
                return (
                    <SidebarItem
                        key={index}
                        href={route.href}
                        icon={route.icon}
                        label={route.label}
                    />
                )
            })}
        </ul>
    )
}

export default ChattingSideBarRoutes