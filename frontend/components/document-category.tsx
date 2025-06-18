'use client';

import { Ban } from "lucide-react";
import { Button } from "./ui/button";
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
import { useRouter } from "next/navigation";
import { type Group, Document } from "@/lib/types";

export default function CategoryGroup({ category, group, doc, setGroup }:
    { category: string, group?: Group, doc?: Document, setGroup: (group: Group | null) => {} }) {
    const router = useRouter();
    const baseColors = {
        uncategorized: 'bg-muted',
        courtorder: 'bg-primary',
        up2sign: 'bg-accent'
    };

    const baseLabels = {
        uncategorized: 'ไม่มีหมวดหมู่',
        courtorder: 'คำสั่งศาล',
        up2sign: 'ดศร. ๑'
    };

    const bgColor = baseColors[category as keyof typeof baseColors]?? 'bg-muted';
    const label = baseLabels[category as keyof typeof baseColors]?? 'ไม่มีหมวดหมู่';
    return (
        <>
            <Button className={`${bgColor} rounded-xl px-2 py-1 hover:${bgColor}`}>
                {label}
            </Button>
            {
                group &&
                <div className="px-2 flex justify-center items-center">
                    <div className=" p-0 px-1 underline cursor-pointer" onClick={(e: any) => {
                        e.preventDefault();
                        router.push(`/document-groups/${group?.id}/`);
                    }}>
                        {group?.name}
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Ban size={16} color="red" className="cursor-pointer"/>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>คุณต้องการนำเอกสารนี้ออกจาก {group?.name} หรือไม่?</AlertDialogTitle>
                            <AlertDialogDescription>
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={async(e: any) => {
                                e.preventDefault();
                                await fetch(`/api/playlist/${group?.id}/`,
                                {
                                    method: 'PATCH',
                                    credentials: 'include',
                                    body: JSON.stringify({
                                    documentIds: [doc?.id],
                                    mode: 'remove' 
                                    })
                                }
                                );
                                setGroup(null);
                            }}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            }
        </>
    );
}