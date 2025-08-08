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
import { usePathname } from "next/navigation";
import { useAppSelector } from "./store/hooks";
import Link from 'next/link';
import { useEffect } from 'react';
import { RootState } from "./store";

const HIDDEN_ROUTES = ['login', 'secret', 'no-navbar', 'confirm'];

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
  const pathname = usePathname();
  const pathId = pathname.split('/')[1];
  const user = useAppSelector((state: RootState) => state.userAuth.user);

  // Check hidden routes
  const isHidden =
    HIDDEN_ROUTES.includes(pathname) ||
    HIDDEN_ROUTES.map(elem => pathId.includes(elem)).some(Boolean) ||
    pathname.includes('mail/confirm');

    useEffect(() => {
    if (!isHidden) return;

    if (typeof document !== 'undefined') {
      const dom = document.getElementById('app-bar-trigger');
      if (dom) dom.remove();
    }
  }, [isHidden]);

  if (isHidden) return null;

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