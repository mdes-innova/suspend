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
import { type Group, type Document, type User } from "@/lib/types";
import { useEffect, useState } from "react";
import { useAppSelector } from "./store/hooks";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function CategoryGroup({ category, group, doc }:
    { category: string, group: Group | null, doc?: Document }) {

    const [groupData, setGroupData] = useState<Group | null>(group);
    const user = useAppSelector(state => state.userAuth.user);
    const isOwner = user && groupData && user.id === groupData.user.id;

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
                groupData &&
                <div className="px-2 flex justify-center items-center">
                    {
                        isOwner &&
                        <div className="p-0 px-1 underline cursor-pointer" onClick={(e: any) => {
                            e.preventDefault();
                            if (!isOwner) return;
                            router.push(`/document-groups/${groupData?.id}/`);
                        }}>
                            {groupData?.name}
                        </div>
                    }
                    {
                        !isOwner &&
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="p-0 px-1 cursor-not-allowed text-gray-400">
                                    {groupData?.name}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Belong to {groupData.user.username}</p>
                            </TooltipContent>
                        </Tooltip>
                    }
                    {
                        isOwner &&
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
                                    setGroupData(null);
                                }}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    }
                </div>
            }
        </>
    );
}