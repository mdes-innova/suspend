'use client';
import { Calendar, Home, Inbox, Search, Settings, Plus, MoreHorizontal } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useAppSelector } from "./store/hooks";
import Link from 'next/link';

const HIDDEN_ROUTES = ['login', 'secret', 'no-navbar', 'confirm'];

// Menu items.
const items = [
  {
    title: "สร้างเอกสาร",
    url: "/document-groups",
    icon: Plus,
  },
  {
    title: "หน้าแรก",
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
  const pathname = usePathname();
  const pathId = (pathname.split('/'))[1];
  const user = useAppSelector(state => state.userAuth.user);

  if (HIDDEN_ROUTES.includes(pathname)) {
      return null;
  }
  if (HIDDEN_ROUTES.map(elem => pathId.includes(elem)).some(Boolean) ||
    pathname.includes('mail/confirm')) {
      let dom = undefined;
      if (document)
        dom = document.getElementById('app-bar-trigger');
      if (dom) dom.remove();
    return (
        <></>
      );
  }

  return (
        user != null || user != undefined?
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Suspend</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.slice(user?.isStaff? 0: 1 ,items.length).map((item, idx: number) => 
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