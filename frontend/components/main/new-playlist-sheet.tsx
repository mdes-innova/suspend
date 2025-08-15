"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { closeModal, PLAYLISTUI } from '../store/features/playlist-diaolog-ui-slice';
import { useRef } from 'react';
import { type Document } from "@/lib/types";
import {useRouter} from 'next/navigation';
import { addToGroup, postGroup } from '../actions/group';
import { RootState } from "../store"
import { isAuthError } from '@/components/exceptions/auth';


export function NewPlaylistSheet({main}: {main?: boolean}) {
    const dispatch = useAppDispatch();
    const uiOpen = useAppSelector((state: RootState)=>state.playlistDialogUi.newOpen);
    const docIds = useAppSelector((state: RootState)=>state.playlistDialogUi.docIds);
    const inputNameRef = useRef<HTMLInputElement>(null);
    const router = useRouter();


  return (
    <div className="grid grid-cols-2 gap-2 flex-1">
        <Sheet open={uiOpen} onOpenChange={(open: boolean) => {
          if (open) dispatch(closeModal({ ui: PLAYLISTUI.list }));
          if (!open) dispatch(closeModal({ ui: PLAYLISTUI.new }));
        }}>
          <SheetContent side={'bottom'}>
            <SheetHeader>
              <SheetTitle>Create new playlist</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4 px-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  ชื่อ 
                </Label>
                <Input id="name" ref={inputNameRef} defaultValue="New playlist" className="col-span-3" />
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button className='w-fit ml-auto' type="submit" onClick={async(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  if (docIds && docIds.length && inputNameRef?.current) {
                    try {
                      const newGroup = await postGroup(inputNameRef.current.value);
                      const newDocsGroup = await addToGroup({
                        groupId: newGroup.id,
                        docIds,
                        mode: 'append'
                      });
                      const newPlaylist = newDocsGroup.name;
                      const docs = newDocsGroup.documents.map((doc: Document) => doc.orderNo).slice(0, 3);
                      dispatch(closeModal({ui: PLAYLISTUI.new, info: [newPlaylist, ...docs] }));
                    } catch (error) {
                      dispatch(closeModal({ui: PLAYLISTUI.new, info: [error as string], err: true }));
                      if (isAuthError(error))
                        if (window)
                          window.location.reload();
                    }
                  } else {
                    try {
                      if (inputNameRef?.current) {
                        const newGroup = await postGroup(inputNameRef.current.value);
                        dispatch(closeModal({ui: PLAYLISTUI.new, info: [newGroup.name] }));
                        if (main) router.push(`/document-groups/${newGroup.id}`);
                      } else {
                        throw new Error('Empty name');
                      }
                    } catch (error) {
                      dispatch(closeModal({ui: PLAYLISTUI.new, info: [error as string], err: true }));
                      if (isAuthError(error))
                        if (window)
                          window.location.reload();
                    }
                  }
                }}>Save</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
    </div>
  )
}