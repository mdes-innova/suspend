'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import {  Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppSelector } from "./store/hooks";
import { useState } from "react";
import { useAppDispatch } from "./store/hooks";
import { openModal, PLAYLISTUI, setDocIds} from "./store/features/playlist-diaolog-ui-slice";
import { useRouter } from "next/navigation";
import { RootState } from "./store";

type User = {
    isp: boolean
}

export default function ActionDropdown({ children, docId, active }:
    { children?: React.ReactNode, docId?: number, active?: boolean}) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const user = useAppSelector((state: RootState) => state.userAuth.user);
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={() => {
            setOpen((prev: boolean) => !prev);
        }}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    {children}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                 onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    router.push(`/document-view/${docId}/`);
                }}>
                    ดูคำสั่งศาล
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {
                    !((user as User | null)?.isp) &&
                    <DropdownMenuItem 
                        className={`${active === false? 
                            "text-gray-400 bg-inherit hover:bg-inherit focus:bg-inherit" +
                                " hover:cursor-not-allowed hover:text-gray-400 focus:text-gray-400" : ''}`}
                        onClick={(e: React.MouseEvent<HTMLElement>) => {
                        e.preventDefault();
                        if (active == false) return;
                        setOpen(false);
                        if (docId)
                            dispatch(setDocIds([docId]));
                        dispatch(openModal({ ui: PLAYLISTUI.list }));
                    }}>
                        <Plus className="h-4 w-4" />
                        <span>เพิ่มลงในฉบับร่าง</span>
                    </DropdownMenuItem>
                }
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="text-lg">ดาวน์โหลด</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem>pdf</DropdownMenuItem>
                        <DropdownMenuItem>urls (.xlsx)</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>ทั้งหมด</DropdownMenuItem>
                    </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem>รายงานปัญหา</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}