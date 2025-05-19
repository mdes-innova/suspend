'use client';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import PlaylistDialog from "./playlist-dialog";
import { useAppSelector } from "../store/hooks";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { openModal } from "../store/features/playlist-diaolog-ui-slice";

export default function ActionDropdown({ children }: { children: any}) {
    const dispatch = useAppDispatch();
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={(open) => {
            setOpen(prev => !prev);
        }}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    {children}
                {/* <MoreHorizontal /> */}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                    View
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e: any) => {
                        e.preventDefault();
                        setOpen(false);
                        dispatch(openModal());
                    }}>
                        <Plus className="h-4 w-4" />
                        <span>Add to Playlist</span>
                    </DropdownMenuItem>
                <DropdownMenuItem>Report issue</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}