"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { closeModal, PLAYLISTUI } from '../store/features/playlist-diaolog-ui-slice';
import { useRef, useEffect, useState } from 'react';
import { type Document } from "@/lib/types";
import {useRouter} from 'next/navigation';
import { addToGroup, postGroup } from '../actions/group';
import { RootState } from "../store"
import { isAuthError } from '@/components/exceptions/auth';
import { RedirectToLogin } from "../reload-page"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/playlist-dialog"


export function NewPlaylistSheet({main}: {main?: boolean}) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const uiOpen = useAppSelector((state: RootState)=>state.playlistDialogUi.newOpen);
  const uiDailogOpen = useAppSelector((state: RootState)=>state.playlistDialogUi.listOpen);
  const docIds = useAppSelector((state: RootState)=>state.playlistDialogUi.docIds);
  const inputNameRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (main || (docIds && docIds?.length > 0)) {
      if (uiOpen && !uiDailogOpen) setOpen(true);
      else setOpen(false);
    } else {
      setOpen(false);
    }
  }, [uiOpen, uiDailogOpen]);

  if (!main && (!docIds || docIds?.length < 1)) return <></>;

  return (
    <div className="grid grid-cols-2 gap-2 flex-1">
        <Dialog open={open} onOpenChange={open => {
          if (!open)
            dispatch(closeModal({ ui: PLAYLISTUI.new }));
          setOpen(open);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle >สร้างฉบับบร่างใหม่</DialogTitle>
            </DialogHeader>
            <DialogDescription></DialogDescription>
            <div className="grid gap-4 py-4 px-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  ชื่อ 
                </Label>
                <Input id="name" ref={inputNameRef} defaultValue="ฉบับร่างใหม่" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">ยกเลิก</Button>
              </DialogClose>
              <Button type="submit" onClick={async(e: React.MouseEvent<HTMLButtonElement>) => {
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
                    const docs = newDocsGroup.documents.map((doc: Document) => doc.orderNo);
                    dispatch(closeModal({ui: PLAYLISTUI.new, info: [newPlaylist, ...docs] }));
                  } catch (error) {
                    dispatch(closeModal({ui: PLAYLISTUI.new, info: [error as string], err: true }));
                    if (isAuthError(error))
                      RedirectToLogin();
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
                      RedirectToLogin();
                  }
                }
              }}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}