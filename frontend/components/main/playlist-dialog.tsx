'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/playlist-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { openModal, closeModal } from "../store/features/playlist-diaolog-ui-slice";
import { useEffect } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { NewPlaylistSheet } from "../new-playlist-sheet";
 
const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
)
 
function MyScrollArea() {
  const dispatch = useAppDispatch();
  return (
    <ScrollArea className="h-48 w-full rounded-md ">
      <div className="p-4">
        {tags.map((tag) => (
          <>
            <div key={tag} className="text-sm cursor-pointer" 
            onClick={(e: any) => {
              e.preventDefault();
              dispatch(closeModal([tag]));
            }}>
              {tag}
            </div>
            <Separator className="my-2" />
          </>
        ))}
      </div>
    </ScrollArea>
  )
}

export default function PlaylistDialog() {
    const dispatch = useAppDispatch();
    const uiOpen = useAppSelector(state => state.playlistDialogUi.modalOpen);
    return (
        <Dialog open={uiOpen} 
            onOpenChange={(open) => {
                if (!open) dispatch(closeModal());
            }}
        >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Select a playlist</DialogTitle>
                </DialogHeader>
                <MyScrollArea />
                <DialogFooter>
                    <NewPlaylistSheet>
                        <Button type="submit"><Plus size={10} />Create new</Button>
                    </NewPlaylistSheet>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}