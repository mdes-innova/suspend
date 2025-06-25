'use client';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton
} from "./ui/sidebar"
type MenuType = {
    pathname: string,
    name: string
}

import React from 'react';

import { usePathname } from 'next/navigation'
import Link from 'next/link';
import { useAppSelector } from "./store/hooks";

function SlideBar() {
    const pathname = usePathname();
    const user = useAppSelector(state => state.userAuth.user);
    const main = [
        {
            pathname: "/",
            name: "เมนูตรวจสอบหลักฐาน"
        },
        {
            pathname: "/document-groups",
            name: "สร้างเอกสาร"
        },
        {
            pathname: "/mail",
            name: "กล่องข้อความ"
        },
        {
            pathname: "/#",
            name: "ตั้งค่าระบบ"
        },
        {
            pathname: "/#",
            name: "ค้นหาเอกสาร"
        },
        {
            pathname: "/#",
            name: "ข้อมูลพื้นฐาน"
        },
        {
            pathname: "/#",
            name: "ค้นหาข้อมูล"
        },
        {
            pathname: "/court-order",
            name: "อัพโหลดคำสั่งสาร"
        },
        {
            pathname: "/#",
            name: "สถานะการดำเนินการของ ISP"
        },
        {
            pathname: "/#",
            name: "ค้นหา URL"
        },
        {
            pathname: "/#",
            name: "รายงานผลการดำเนินงานการระงับ"
        },
    ]

    const profiles = [
        {
            pathname: "/profile-view",
            name: "โปรไฟล์"
        },
        {
            pathname: "/profile-view/document-builder",
            name: "สร้างเอกสาร"
        },
    ]

    let menus = main;
    if ((pathname.split('/')).includes('profile-view')) menus = profiles;
    if (user && user.isp) {
        menus.splice(1, 1);
    }
    
    return (
        <div className="h-full w-54 bg-sidebar border-r-2 border-sidebar-border flex flex-col justify-start items-start">
            <div className="w-full">
            {menus.map((menu: any, idx: number) => {
                if (menu.pathname === '/mail' || menu.pathname === '/mail/draft' || menu.pathname === '/mail/sent')
                    return (
                        <div key={`sidebar-div-${idx}`}>
                            <div
                                key={`sidebar-div-${idx}-0`}
                                className="w-full flex px-2 py-1 border-b cursor-pointer bg-gray-300">
                                <Link className="w-full" href={`${process.env.NEXT_PUBLIC_FRONTEND}${menu.pathname}`}>
                                    <span>{menu.name}</span>
                                </Link>
                            </div>
                            {
                                user && !user.isp &&
                                <div
                                    key={`sidebar-div-${idx}-1`}
                                    className={`w-full flex px-2 py-1 border-b cursor-pointer ${pathname === '/mail'? "bg-gray-200 font-bold": "hover:bg-gray-200"}`}>
                                    <Link className="w-full" href={`${process.env.NEXT_PUBLIC_FRONTEND}${menu.pathname}`}>
                                        <span className="pl-4">&#10146; ทั้งหมด</span>
                                    </Link>
                                </div>
                            }
                            {
                                user && !user.isp &&
                                <div
                                    key={`sidebar-div-${idx}-2`}
                                    className={`w-full flex px-2 py-1 border-b cursor-pointer ${pathname === '/mail/draft'? "bg-gray-100 font-bold": "hover:bg-gray-200"}`}>
                                    <Link className="w-full" href={`${process.env.NEXT_PUBLIC_FRONTEND}${menu.pathname}`}>
                                        <span className="pl-4">&#10146; ฉบับร่าง</span>
                                    </Link>
                                </div>
                            }
                            {
                                user && !user.isp &&
                                <div
                                    key={`sidebar-div-${idx}-3`}
                                    className={`w-full flex px-2 py-1 border-b cursor-pointer ${pathname === '/mail/sent'? "bg-gray-300 font-bold": "hover:bg-gray-200"}`}>
                                    <Link className="w-full" href={`${process.env.NEXT_PUBLIC_FRONTEND}${menu.pathname}`}>
                                        <span className="pl-4">&#10146; ส่งแล้ว</span>
                                    </Link>
                                </div>
                            }
                        </div>
                    );
                else
                    return (
                        <div
                            key={`sidebar-div-${idx}`}
                            className={`w-full flex px-2 py-1 border-b cursor-pointer ${pathname === menu.pathname? "bg-gray-300": "hover:bg-gray-200"}`}>
                            <Link className="w-full" href={`${process.env.NEXT_PUBLIC_FRONTEND}${menu.pathname}`}>
                            <span>{menu.name}</span>
                            </Link>
                        </div>
                    );
            })}
            </div>
        </div>
        );
    }

export default React.memo(SlideBar);