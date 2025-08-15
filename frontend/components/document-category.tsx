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
import { type Group, type Document } from "@/lib/types";
import { useEffect, useState } from "react";
import { useAppSelector } from "./store/hooks";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { getGroupFromDocument, removeDocumentFromGroup } from "./actions/group";
import { toggleData } from "./store/features/content-list-ui-slice";
import { useAppDispatch } from "./store/hooks";
import { toggleDataChanged as toggleDataChangedDocumentList} from "./store/features/document-list-ui-slice";
import { toggleDataChanged as toggleDataChangedGroupList } from "./store/features/group-list-ui-slice";
import { RootState } from "./store";
import { isAuthError } from '@/components/exceptions/auth';

export default function CategoryGroup({ doc, group }:
    { doc: Document, group: Group }) {
    
    const dispatch = useAppDispatch();

    const bgColors = [
        '#F87171', // red-400
        '#FB923C', // orange-400
        '#FBBF24', // yellow-400
        '#34D399', // green-400
        '#60A5FA', // blue-400
        '#818CF8', // indigo-400
        '#A78BFA', // violet-400
        '#F472B6', // pink-400
        '#4ADE80', // emerald-400
        '#FACC15', // amber-400
        '#2DD4BF', // teal-400
        '#38BDF8', // sky-400
        '#C084FC', // purple-400
        '#F97316', // orange-500
        '#84CC16', // lime-500
        '#E879F9', // fuchsia-400
        '#A3E635', // lime-400
        '#FCD34D', // yellow-300
        '#67E8F9', // cyan-300
        '#FDBA74', // orange-300
    ];
    const [groupData, setGroupData] = useState<Group | null>(null);
    const user = useAppSelector((state: RootState) => state.userAuth.user);
    const isOwner = user && groupData && user.id === groupData.user.id;

    const router = useRouter();

    const label = doc.kindName?? 'ไม่มีหมวดหมู่';

    useEffect(() => {
        const getGroupData = async() => {
            try {
                const fetchGroup = await getGroupFromDocument(doc.id);
                setGroupData(Object.keys(fetchGroup).length === 0? null: fetchGroup);
            } catch (error) {
                if (isAuthError(error)) {
                    if (window)
                        window?.location?.reload();
                }
                else
                    setGroupData(null);
            }
        }

        getGroupData();
    }, []);

    useEffect(() => {
        dispatch(toggleData());
        dispatch(toggleDataChangedDocumentList());
        dispatch(toggleDataChangedGroupList());
    }, [groupData]);

    return (
        <>
            <Button className={`${bgColors[doc?.kindId?? 0]} rounded-xl px-2 py-1 hover:${bgColors[doc?.kindId?? 0]}`}>
                {label}
            </Button>
            {
                groupData &&
                <div className="px-2 flex justify-center items-center">
                    {
                        isOwner &&
                        <div className="p-0 px-1 underline cursor-pointer"
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                            e.preventDefault();
                            if (!isOwner) return;
                            router.push(`/document-groups/${groupData?.id}/`);
                        }}>
                            {groupData.name}
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
                                <p>Belong to {groupData?.user?.username}</p>
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
                                <AlertDialogAction onClick={async(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.preventDefault();
                                    try {
                                        await removeDocumentFromGroup({
                                            docIds: [doc.id],
                                            groupId: group.id
                                        });
                                        setGroupData(null);
                                    } catch (error) {
                                        if (isAuthError(error))
                                            if (window)
                                                window.location.reload();
                                       console.error(error);
                                    }
                                   
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