"use client"

import Image from 'next/image';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { closeModal, PLAYLISTUI, toggleModal } from '../store/features/playlist-diaolog-ui-slice';
import { useRef } from 'react';


export function NewPlaylistSheet() {
    const dispatch = useAppDispatch();
    const uiOpen = useAppSelector(state=>state.playlistDialogUi.newOpen);
    const docIds = useAppSelector(state=>state.playlistDialogUi.docIds);
    const rowsSelect = useAppSelector(state=>state.contentListUi.rowSelection);
    const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="grid grid-cols-2 gap-2 flex-1">
        <Sheet open={uiOpen} onOpenChange={(open) => {
          if (open) dispatch(closeModal({ ui: PLAYLISTUI.list }));
          if (!open) dispatch(closeModal({ ui: PLAYLISTUI.new }));
        }}>
          <SheetContent side={'bottom'}>
            <SheetHeader>
              <SheetTitle>Create new playlist</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" ref={inputRef} defaultValue="New playlist" className="col-span-3" />
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button className='w-fit ml-auto' type="submit" onClick={async(e: any) => {
                    e.preventDefault();
                    if (docIds && docIds.length)
                      try {
                        const res = await fetch('api/playlist/', {
                          method: 'POST',
                          credentials: 'include',
                          body: JSON.stringify({
                            name: inputRef.current?.value
                          })
                        });
                        const resJson = await res.json();
                        if (!res.ok) dispatch(closeModal({ui: PLAYLISTUI.new, info: [resJson.error], err: true }));
                        else {
                          try {
                            const addRes = await fetch('api/playlist',
                              {
                                method: 'PATCH',
                                credentials: 'include',
                                body: JSON.stringify({
                                  documentIds: docIds
                                })
                              }
                            );
                            const addResJson = await addRes.json();
                            if (!addRes.ok) dispatch(closeModal({ui: PLAYLISTUI.new, info: [addResJson.error], err: true }));
                            else {
                              const newPlaylist = addResJson.data.name;
                              const docs = addResJson.data.documents.map((doc: any) => doc.name).slice(0, 3);
                              dispatch(closeModal({ui: PLAYLISTUI.new, info: [newPlaylist, ...docs] }));
                            }
                          } catch (error1) {
                            dispatch(closeModal({ui: PLAYLISTUI.new, info: [error1 as string], err: true }));
                          }
                        }
                      } catch (error) {
                        dispatch(closeModal({ui: PLAYLISTUI.new, info: [error as string], err: true }));
                      }
                }}>Save</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
    </div>
  )
}