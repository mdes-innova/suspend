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
import { useAppDispatch } from './store/hooks';
import { closeModal } from './store/features/playlist-diaolog-ui-slice';


export function NewPlaylistSheet({ children }: { children: any}) {
    const dispatch = useAppDispatch();
  return (
    <div className="grid grid-cols-2 gap-2 flex-1">
        <Sheet onOpenChange={(open) => {
            if (!open) dispatch(closeModal());
        }}>
          <SheetTrigger asChild>
            {children} 
          </SheetTrigger>
          <SheetContent side={'bottom'}>
            <SheetHeader>
              <SheetTitle>Create new playlist</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" value="Pedro Duarte" className="col-span-3" />
              </div>
             
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button className='w-fit ml-auto' type="submit" onClick={(e: any) => {
                    e.preventDefault();
                    dispatch(closeModal("XXXXXXXXXX"));
                }}>Save</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
    </div>
  )
}