'use client';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import PlaylistDialog from "./playlist-dialog";
import { useAppSelector } from "../store/hooks";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { openModal, PLAYLISTUI, setDocIds} from "../store/features/playlist-diaolog-ui-slice";

type User = {
    isp: boolean
}

export default function ActionDropdown({ children, docId }: { children: any, docId?: number}) {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.userAuth.user);
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={(open) => {
            setOpen(prev => !prev);
        }}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    {children}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                    View
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {
                    !((user as User | null)?.isp) &&
                    <DropdownMenuItem onClick={(e: any) => {
                        e.preventDefault();
                        setOpen(false);
                        if (docId)
                            dispatch(setDocIds([docId]));
                        dispatch(openModal({ ui: PLAYLISTUI.list }));
                    }}>
                        <Plus className="h-4 w-4" />
                        <span>Add to Playlist</span>
                    </DropdownMenuItem>
                }
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="text-lg">Downloads</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem>pdf</DropdownMenuItem>
                        <DropdownMenuItem>urls (.xlsx)</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>All</DropdownMenuItem>
                    </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem>Report issue</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}