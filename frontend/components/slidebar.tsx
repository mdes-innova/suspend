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

import React from 'react';

import { usePathname } from 'next/navigation'
import Link from 'next/link';

function SlideBar() {
    const pathname = usePathname();
    const projects = [
        {
            pathname: "/",
            name: "เมนูตรวจสอบหลักฐาน"
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
    return (
        <div className="h-full w-54 bg-sidebar border-r-2 border-sidebar-border flex flex-col justify-start items-start">
            <div>
            {projects.map((project: any, idx: number) => (
                <div
                    key={`sidebar-div-${idx}`}
                    className={`px-2 py-1 cursor-pointer ${pathname === project.pathname? "bg-gray-300": "hover:bg-gray-200"}`}>
                    <Link href={`${process.env.NEXT_PUBLIC_FRONTEND}${project.pathname}`}>
                    <span>{project.name}</span>
                    </Link>
                </div>
            ))}
            </div>
        </div>
        );
    }

export default React.memo(SlideBar);