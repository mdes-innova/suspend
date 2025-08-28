'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import {  Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppSelector } from "./store/hooks";
import { useState } from "react";
import { useAppDispatch } from "./store/hooks";
import { openModal, PLAYLISTUI, setDocIds} from "./store/features/playlist-diaolog-ui-slice";
import { useRouter } from "next/navigation";
import { RootState } from "./store";
import { isAuthError } from "./exceptions/auth";
import { downloadPdf, downloadUrls, getDocument } from "./actions/document";
import { RedirectToLogin } from "./reload-page";
import { type Document } from "@/lib/types";

type User = {
    isp: boolean
}

export default function ActionDropdown({ children, docId, active }:
    { children?: React.ReactNode, docId?: number, active?: boolean}) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const user = useAppSelector((state: RootState) => state.userAuth.user);
    const [open, setOpen] = useState(false);

    const downloadFiles = async(kind: string) => {
        if (typeof docId != 'number') throw new Error('Document id not a number.');
        const documentData: Document = await getDocument(docId);
        if (!documentData) throw new Error('Document not found.');

        const downloadDocumentPdf = async() => {
            const blob = await downloadPdf(docId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${documentData?.orderFilename?? 'คำสั่งศาล.pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        }

        const downloadDocumentXlsx = async() => {
            const blob = await downloadUrls(docId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const orderFilename = documentData?.orderFilename;
            const orderFilenames = orderFilename?.split('.');
            link.setAttribute("download", `${documentData?.orderFilename?
                'urls_' + orderFilenames?.slice(0, orderFilenames.length - 1).join('.') +
                    '.xlsx':'urls_คำสั่งศาล.xlsx'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        }

        switch (kind) {
            case 'pdf':
                await downloadDocumentPdf(); 
                break;
            case 'xlsx':
                await downloadDocumentXlsx();
                break;
        
            default:
                downloadDocumentPdf();
                downloadDocumentXlsx();
                break;
        }
    }

    return (
        <DropdownMenu open={open} onOpenChange={() => {
            setOpen((prev: boolean) => !prev);
        }}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    {children}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                 onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    router.push(`/document-view/${docId}/`);
                }}>
                    ดูคำสั่งศาล
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {
                    !((user as User | null)?.isp) &&
                    <DropdownMenuItem 
                        className={`${active === false? 
                            "text-gray-400 bg-inherit hover:bg-inherit focus:bg-inherit" +
                                " hover:cursor-not-allowed hover:text-gray-400 focus:text-gray-400" : ''}`}
                        onClick={(e: React.MouseEvent<HTMLElement>) => {
                        e.preventDefault();
                        if (active == false) return;
                        setOpen(false);
                        if (docId)
                            dispatch(setDocIds([docId]));
                        dispatch(openModal({ ui: PLAYLISTUI.list }));
                    }}>
                        <Plus className="h-4 w-4" />
                        <span>เพิ่มลงในฉบับร่าง</span>
                    </DropdownMenuItem>
                }
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="text-lg">ดาวน์โหลด</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem
                        onClick={async(e: React.MouseEvent<HTMLDivElement>) => {
                            e.preventDefault();
                            try {
                                await downloadFiles('pdf');
                            } catch (error) {
                                console.error(error);
                                if (isAuthError(error))
                                    RedirectToLogin();
                            }
                            setOpen(false);
                        }}
                        >pdf</DropdownMenuItem>
                        <DropdownMenuItem
                        onClick={async(e: React.MouseEvent<HTMLDivElement>) => {
                            e.preventDefault();
                            try {
                                await downloadFiles('xlsx');
                            } catch (error) {
                                console.error(error);
                                if (isAuthError(error))
                                    RedirectToLogin();
                            }
                            setOpen(false);
                        }}
                        >urls (.xlsx)</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                        onClick={async(e: React.MouseEvent<HTMLDivElement>) => {
                            e.preventDefault();
                            try {
                                await downloadFiles('both');
                            } catch (error) {
                                console.error(error);
                                if (isAuthError(error))
                                    RedirectToLogin();
                            }
                            setOpen(false);
                        }}
                        >ทั้งหมด</DropdownMenuItem>
                    </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem>รายงานปัญหา</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function ActionDropdownAll({ children, docId, active, documentIdsSelection }:
    { children?: React.ReactNode, docId?: number, active?: boolean,
        documentIdsSelection: number[]
    }) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const user = useAppSelector((state: RootState) => state.userAuth.user);
    const [open, setOpen] = useState(false);

    const downloadFiles = async(kind: string) => {
        if (typeof docId != 'number') throw new Error('Document id not a number.');
        const documentData: Document = await getDocument(docId);
        if (!documentData) throw new Error('Document not found.');

        const downloadDocumentPdf = async() => {
            const blob = await downloadPdf(docId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${documentData?.orderFilename?? 'คำสั่งศาล.pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        }

        const downloadDocumentXlsx = async() => {
            const blob = await downloadUrls(docId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const orderFilename = documentData?.orderFilename;
            const orderFilenames = orderFilename?.split('.');
            link.setAttribute("download", `${documentData?.orderFilename?
                'urls_' + orderFilenames?.slice(0, orderFilenames.length - 1).join('.') +
                    '.xlsx':'urls_คำสั่งศาล.xlsx'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        }

        switch (kind) {
            case 'pdf':
                await downloadDocumentPdf(); 
                break;
            case 'xlsx':
                await downloadDocumentXlsx();
                break;
        
            default:
                downloadDocumentPdf();
                downloadDocumentXlsx();
                break;
        }
    }

    return (
        <DropdownMenu open={open} onOpenChange={() => {
            setOpen((prev: boolean) => !prev);
        }}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    {children}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {
                    !((user as User | null)?.isp) &&
                    <DropdownMenuItem 
                        className={`${active === false? 
                            "text-gray-400 bg-inherit hover:bg-inherit focus:bg-inherit" +
                                " hover:cursor-not-allowed hover:text-gray-400 focus:text-gray-400" : ''}`}
                        onClick={(e: React.MouseEvent<HTMLElement>) => {
                        e.preventDefault();
                        if (active == false) return;
                        setOpen(false);
                        if (docId)
                            dispatch(setDocIds([docId]));
                        dispatch(openModal({ ui: PLAYLISTUI.list }));
                    }}>
                        <Plus className="h-4 w-4" />
                        <span>เพิ่มลงในฉบับร่าง</span>
                    </DropdownMenuItem>
                }
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="text-lg">ดาวน์โหลด</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem
                        onClick={async(e: React.MouseEvent<HTMLDivElement>) => {
                            e.preventDefault();
                            try {
                                await downloadFiles('pdf');
                            } catch (error) {
                                console.error(error);
                                if (isAuthError(error))
                                    RedirectToLogin();
                            }
                            setOpen(false);
                        }}
                        >pdf</DropdownMenuItem>
                        <DropdownMenuItem
                        onClick={async(e: React.MouseEvent<HTMLDivElement>) => {
                            e.preventDefault();
                            try {
                                await downloadFiles('xlsx');
                            } catch (error) {
                                console.error(error);
                                if (isAuthError(error))
                                    RedirectToLogin();
                            }
                            setOpen(false);
                        }}
                        >urls (.xlsx)</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                        onClick={async(e: React.MouseEvent<HTMLDivElement>) => {
                            e.preventDefault();
                            try {
                                await downloadFiles('both');
                            } catch (error) {
                                console.error(error);
                                if (isAuthError(error))
                                    RedirectToLogin();
                            }
                            setOpen(false);
                        }}
                        >ทั้งหมด</DropdownMenuItem>
                    </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    disabled={documentIdsSelection.length === 0}
                >ล้างรายการที่เลือก</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}