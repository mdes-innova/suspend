'use client';
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenu,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { Button } from "./ui/button";
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setUser } from "./store/features/user-auth-slice";
import { logoutUser } from "./actions/user";
import { RootState } from "./store";

export function DropdownMenuUser() {
  const [userOpen, setUserOpen] = useState(false);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.userAuth.user);

  if (!user) return <Button disabled variant="outline" className="w-32 h-10"></Button>;

  return (
    <DropdownMenu open={userOpen} onOpenChange={setUserOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="text-xl">
          {user?.thaiid? `${user?.givenName} ${user?.familyName}`: user?.username?? ''}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
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
  )
}
