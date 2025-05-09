'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Image from 'next/image';

 
export function DeleteDialog() {
  return (
    <div className="flex-1">
        <AlertDialog>
        <AlertDialogTrigger asChild>
            <div className='w-6 h-6 relative cursor-pointer'>
                <Image
                    src="/images/icons/delete.png"  // relative to the `public/` folder
                    alt="App logo"
                    fill
                    priority  // optional: load immediately
                    />
            </div>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>ต้องการลบเอกสารหรือไม่?</AlertDialogTitle>
            <AlertDialogDescription>
                <p>เนื่องจากการลบเอกสารจะทำให้ข้อมูลถูกลบไปโดยถาวร</p>
                <p>อาจจะไม่สามารถกู้คืนกลับได้</p>
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction>ยืนยัน</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}