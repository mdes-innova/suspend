'use client';
import { Home, Inbox, Search, Settings, Plus } from "lucide-react"

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
import { useAppSelector } from "./store/hooks";
import Link from 'next/link';
import { RootState } from "./store";

type MenuType = {
  title: string,
  url: string,
  icon: React.FC<React.SVGProps<SVGSVGElement>>
}

// Menu items.
const items = [
  {
    title: "สร้างเอกสาร",
    url: "/document-groups",
    icon: Plus,
  },
  {
    title: "คำสั่งศาล",
    url: "/",
    icon: Home,
  },
  {
    title: "กล่องข้อความ",
    url: "/mail",
    icon: Inbox,
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
  const user = useAppSelector((state: RootState) => state.userAuth.user);

  return (
        user != null || user != undefined?
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Suspend</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.slice(user?.isStaff? 0: 1 ,items.length).map((item: MenuType) => 
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>)
                  }
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>:
        <></>
  )
}