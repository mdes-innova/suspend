'use client';

import { Home, Inbox, Search, Settings, Plus, ChevronUp, Network } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAppDispatch, useAppSelector } from "./store/hooks";
import Link from 'next/link';
import { RootState } from "./store";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { logoutUser } from "./actions/user";
import { setUser } from "./store/features/user-auth-slice";
import { ThemToggle } from "./theme-toggle";

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
    url: "/mail-group",
    icon: Inbox,
  },
  {
    title: "ISP",
    url: "/isps",
    icon: Network,
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
  const dispatch = useAppDispatch();

  return (
        user != null || user != undefined?
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              {/* <SidebarGroupLabel>Suspend</SidebarGroupLabel> */}
              <ThemToggle />
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.slice(user?.isStaff? 0: 1 ,items.length).map((item: MenuType) => 
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link href={item.url} onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                            e.preventDefault();
                            if (window)
                              window.location.href = item.url
                          }}>
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
          <SidebarFooter className="min-md:hidden">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton>
                      {user.username} 
                      <ChevronUp className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className="w-[--radix-popper-anchor-width]"
                  >
                    <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                        e.preventDefault();
                          if (window)
                            window.location.href = '/profile-view';
                      }}>
                        โปรไฟล์ 
                      </DropdownMenuItem>
                      {
                        user?.isStaff &&
                        <DropdownMenuItem onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                          e.preventDefault();
                          if (window)
                            window.location.href = '/register';
                        }}>
                          เพิ่มผู้ใช้งาน 
                        </DropdownMenuItem>
                      }
                      <DropdownMenuItem>
                        ตั้งค่า 
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={async (e: React.MouseEvent<HTMLDivElement>)=>{
                      e.preventDefault();
                      try {
                        await logoutUser();
                          dispatch(setUser(null));
                          window.location.href = `/login`;
                      } catch (err) {
                        console.error('Logout error:', err);
                      }
                    }}>
                      ลงชื่อออก
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>:
         <Sidebar>
        </Sidebar>
  )
}