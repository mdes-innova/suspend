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

import { usePathname } from 'next/navigation'

export default function SlideBar() {
    const pathname = usePathname();
    console.log(pathname);
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
            pathname: "/#",
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
        <div className="h-full bg-sidebar border-r-2 border-sidebar-border">
            <Sidebar className="w-72">
                <SidebarContent>
                    <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                        {projects.map((project) => (
                            <SidebarMenuItem key={project.name}>
                            <SidebarMenuButton asChild 
                                className={`${pathname === project.pathname? "bg-gray-300": ""}`}>
                                <a href={`${process.env.NEXT_PUBLIC_FRONTEND}${project.pathname}`}>
                                <span>{project.name}</span>
                                </a>
                            </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

        </div>
        );
    }
