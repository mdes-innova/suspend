'use client';
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation";

const HIDDEN_ROUTES = ['/login', '/secret', '/no-navbar'];

// Menu items.
const items = [
  {
    title: "หน้าแรก",
    url: "/",
    icon: Home,
  },
  {
    title: "กล่องข้อความ",
    url: "#",
    icon: Inbox,
  },
  {
    title: "อัพโหลดคำสั่งสาร",
    url: "/court-order",
    icon: Calendar,
  },
  {
    title: "ค้นหา",
    url: "#",
    icon: Search,
  },
  {
    title: "ตั้งค่า",
    url: "#",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname();
  if (HIDDEN_ROUTES.includes(pathname)) {
      return null;
  }
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Suspend</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}