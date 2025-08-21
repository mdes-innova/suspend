'use client';

import { ArrowUpDown, Plus, CircleX } from "lucide-react";
import {
  DragEndEvent
} from '@dnd-kit/core';
import { Card } from "../ui/card";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import DragDrop from "./drag-drop";
import DraggableItem from "./drag";
import React from "react";
import DroppableArea from "./drop";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setDragging } from "../store/features/document-list-ui-slice";
import { Date2Thai, Text2Thai } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/playlist-dialog";
import ContentDialog from "../content-dialog";
import { DialogFooter } from "../ui/dialog";
import { setRowSelection} 
  from "../store/features/dialog-list-ui-slice";
import {closeModal, LOADINGUI, openModal} from '../store/features/loading-ui-slice';
import { getContent, getDocumentList } from "../actions/document";
import { Group, type Document } from "@/lib/types";
import { addToGroup, getGroup } from "../actions/group";
import { toggleDataChanged } from "../store/features/group-list-ui-slice";
import { RootState } from "../store";
import { isAuthError } from '@/components/exceptions/auth';
import { RedirectToLogin } from "../reload-page";
import { setDocuments } from "../store/features/group-ui-slice";

export default function DocumentList({ data, groupId }: { data: Document[] | undefined, groupId: number | undefined}) {
    const [edit, setEdit] = useState(false);
    const [docData, setDocData] = useState(data && data.length? [...data]: []);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const documentListRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const documentListEditId = 'document-list-edit';
    const editAreaId = 'edit-area';
    const dispatch = useAppDispatch();
    const [openContent, setOpenContent] = useState(false);
    const [contentData, setContentData] = useState<Document[] | null>(null);

    const isDragging = useAppSelector((state: RootState) => state.documentListUi.isDragging);
    const draggingId = useAppSelector((state: RootState) => state.documentListUi.dragId);
    const dataChanged = useAppSelector((state: RootState) => state.documentListUi.dataChanged);
    const docIds = useAppSelector((state: RootState) => state.dialogListUi.docIds)
    const [columns, setColumns] = useState<Document[]>([]);

    useEffect(() => {
        setColumns(docData);
    }, [docData]);

    useEffect(() => {
        const updateData = async() => {
            try {
                const docIds = columns.map((e: Document) => e.id);
                await addToGroup({
                    docIds,
                    groupId: groupId as number
                });
                const updateDocuments = await getDocumentList(docIds);
                dispatch(setDocuments(updateDocuments));
            } catch (error) {
                if (isAuthError(error))    
                    RedirectToLogin();
            }
        }

        updateData();
        dispatch(toggleDataChanged());
    }, [columns]);

    useEffect(() => {
        if (contentData) {
            setOpenContent(true)
        }
    }, [contentData]);

    useEffect(() => {
        const getData = async() => {
            try {
                const data: Group = await getGroup(groupId as number);
                const newDocuments = data.documents;
                const newDocumentIds = newDocuments.map((doc: Document) => doc.id);
                setColumns((prev: Document[]) => prev.filter((doc: Document) => 
                    newDocumentIds.includes(doc.id)
                ));
            } catch (error) {
                if (isAuthError(error))
                    RedirectToLogin();
            }
        }

        getData();
    }, [dataChanged]);



    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = parseInt((active.id as string).split('-')[1]);
        const overId = parseInt((over.id as string).split('-')[1]);
           

        if (activeId === overId || activeId === overId - 1) { 
            dispatch(setDragging({
                dragId: "",
                isDragging: false,
                yPos: 0
            }));
            return;
        }

        if (overId === docData.length)
        {
            setDocData(prev => prev.map((_, idx: number) => {
                if (idx < activeId)
                    return docData[idx];
                else if (idx < docData.length - 1)
                    return docData[idx + 1]
                else
                    return docData[activeId]
            }
            ));
        } else if (overId === 0){
            const activeDoc = docData[activeId];
            const removedDocs = Array.from({ length: docData.length - 1 }).map((_, idx: number) => {
                if (idx < activeId) return docData[idx];
                else return docData[idx + 1];
            });
            setDocData(prev => prev.map((_, idx: number) => {
                if (idx < overId) return removedDocs[idx];
                else if (idx === overId) return activeDoc;
                else return removedDocs[idx - 1];
            }));
        } else {
            const activeDoc = docData[activeId];
            const removedDocs = Array.from({ length: docData.length - 1 }).map((_, idx: number) => {
                if (idx < activeId) return docData[idx];
                else return docData[idx + 1];
            });
            if (overId > activeId)
                setDocData(prev => prev.map((_, idx: number) => {
                    if (idx < overId - 1) return removedDocs[idx];
                    else if (idx === overId - 1) return activeDoc;
                    else return removedDocs[idx - 1];
                }));
            else 
                setDocData(prev => prev.map((_, idx: number) => {
                    if (idx < overId) return removedDocs[idx];
                    else if (idx === overId) return activeDoc;
                    else return removedDocs[idx - 1];
                }));
        }
        dispatch(setDragging({
            dragId: "",
            isDragging: false,
            yPos: 0
        }));

        // const fromColumn = Object.keys(columns).find((col) =>
        //     columns[col].includes(active.id)
        //     );
        //     const toColumn = over.id;

        //     if (!fromColumn || fromColumn === toColumn) return;

        //     setColumns((prev) => ({
        //         ...prev,
        //         [fromColumn]: prev[fromColumn].filter((id) => id !== active.id),
        //         [toColumn]: [...prev[toColumn], active.id],
        // }));
    };

    useEffect(() => {
        const allowedElements = [document.getElementById(documentListEditId), 
            ...document.querySelectorAll(`#${editAreaId} *`),
            ...document.querySelectorAll('#document-list-header *')
        ];
        const allElements = document.querySelectorAll('#groupview *');

        if (allowedElements.length === 0) return;

        if (edit) {
            allElements.forEach((el) => {
                const htmlEl = el as HTMLElement;
                htmlEl.classList.remove(
                    "pointer-events-auto",
                    "select-auto",
                    "text-foreground"
                );
                htmlEl.classList.add(
                    "pointer-events-none",
                    "select-none",
                    "text-gray-100"
                );
            });
            allowedElements.forEach((el) => {
                const htmlEl = el as HTMLElement;
                htmlEl.classList.remove(
                    "pointer-events-none",
                    "select-none",
                    "text-gray-100"
                );
                htmlEl.classList.add(
                    "pointer-events-auto",
                    "select-auto",
                    "text-foreground"
                );
            });
        } else {
            allElements.forEach((el) => {
                const htmlEl = el as HTMLElement;
                htmlEl.classList.add(
                    "pointer-events-auto",
                    "select-auto",
                    "text-foreground"
                );
                htmlEl.classList.remove(
                    "pointer-events-none",
                    "select-none",
                    "text-gray-100"
                );
            });
        }

        return () => {
            allElements.forEach((el) => {
                const htmlEl = el as HTMLElement;
                htmlEl.classList.add(
                    "pointer-events-auto",
                    "select-auto",
                    "text-foreground"
                );
                htmlEl.classList.remove(
                    "pointer-events-none",
                    "select-none",
                    "text-gray-100"
                );
            });
        };

    }, [edit]);

    useEffect(() => {
        const el = scrollAreaRef.current;
        if (!el) return;

        const el2 = documentListRef.current;
        if (!el2) return;

        const maxScrollTop = Math.round(1.2*el2.offsetHeight);

        const onScroll = () => {
            if (el.scrollTop > maxScrollTop) {
            el.scrollTop = maxScrollTop;
            }
        };

        el.addEventListener('scroll', onScroll);
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    return (
        
        <div className="flex flex-col justify-start gap-y-2 px-2 w-full ">
            <div className="flex gap-x-1 justify-end items-center w-full">
                <Button onClick={async(evt) => {
                    evt.preventDefault();
                    dispatch(openModal({ui: LOADINGUI.dialog}));
                    try {
                        setContentData(null);
                        dispatch(setRowSelection({}));
                        const cData = await getContent();
                        setContentData(cData);
                    } catch (error) {
                        console.error(error);
                        setContentData([]);
                        if (isAuthError(error)) {
                            RedirectToLogin();
                        }
                    }

                }}>
                    <Plus /> <span>เพิ่มคำสั่งศาล</span>
                </Button>
                <Dialog open={contentData === null? false: openContent} onOpenChange={(open: boolean) => {
                    if (!open) {
                        setContentData(null);
                        dispatch(closeModal({ui: LOADINGUI.dialog}));
                    } else {
                        dispatch(closeModal({ui: LOADINGUI.dialog}));
                    }
                    setOpenContent(open);
                }}>
                    <DialogContent className="max-w-[1000px] min-w-[1000px]
                        max-lg:min-w-[700px] max-lg:max-w-[700px]
                        max-md:min-w-[400px] max-md:max-w-[400px]
                        overflow-auto">
                        <DialogHeader>
                            <DialogTitle>เพิ่มคำสั่งศาล</DialogTitle>
                        </DialogHeader>
                            <ContentDialog data={contentData?? []}/>
                    <DialogFooter>
                        <div className="flex gap-x-2">
                            <Button onClick={async(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.preventDefault();
                                try {
                                    await addToGroup({
                                        groupId: groupId as number,
                                        docIds: docIds?? [],
                                        mode: 'append'
                                    });
                                    const docs = docIds && docIds.length > 0? await getDocumentList(docIds): [];
                                    setDocData([...columns, ...docs]);
                                } catch (error) {
                                    console.error(error);
                                    if (isAuthError(error))
                                       RedirectToLogin(); 
                                }
                                setOpenContent(false);
                                dispatch(closeModal({ui: LOADINGUI.dialog}));
                            }}>เพิ่ม</Button>
                            <Button variant='destructive' onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.preventDefault();
                                setOpenContent(false);
                                dispatch(closeModal({ui: LOADINGUI.dialog}));
                            }}>ยกเลิก</Button>
                        </div>
                    </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Button className={`${edit? 'bg-accent': ''}`} variant='outline' 
                    id={documentListEditId} onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    setEdit((prev: boolean) => !prev);
                }}>Edit</Button>
            </div>
            <Card className="flex flex-row w-full px-8 border-0 shadow-none py-0 max-md:text-sm"  id='document-list-header'>
                <div className="flex-[2] cursor-pointer">ลำดับที่</div>
                <div className="flex-[6] cursor-pointer">ค้นหาคำสั่งศาล<span className="inline-block"><ArrowUpDown size={12} /></span></div>
                <div className="flex-[6] cursor-pointer">วันที่<span className="inline-block"><ArrowUpDown size={12} /></span></div>
                <div className="flex-[6] cursor-pointer">หมายเลขคดีดำ<span className="inline-block"><ArrowUpDown size={12} /></span></div>
                <div className="flex-[6] cursor-pointer">หมายเลขคดีแดง<span className="inline-block"><ArrowUpDown size={12} /></span></div>
                <div className="flex-[1]"></div>
            </Card>
            <div className="h-fit w-full overflow-hidden">
                <div className={`h-full rounded-md overflow-y-clip overflow-x-hidden w-full flex flex-col gap-y-4 
                ${edit? 'bg-gray-200 border-2': ''}`}
                    ref={scrollAreaRef} id={editAreaId}
                >
                    <DragDrop onDragEnd={handleDragEnd} disabled={edit? false: true}>
                        <div className="flex flex-col px-6 w-full h-fit" ref={documentListRef}>
                            {columns.map((e: Document, idx: number) => (
                            <div key={`drag-drop-${idx}`}>
                                <DroppableArea key={`drop-${idx}`} id={`drop-${idx}`} >
                                    <div className="w-full h-6"></div>
                                </DroppableArea>
                                    <DraggableItem key={`drag-${idx}`} id={`drag-${idx}`} 
                                        className={`${edit? 'cursor-move': ''} 
                                        ${(draggingId === `drag-${idx}` && isDragging)? 'opacity-70': 'opacity-100'}`}>
                                        <Card key={`group-${idx}`}
                                            className="flex flex-row px-4 hover:shadow-md w-full"
                                            onClick={(evt: React.MouseEvent<HTMLDivElement>) => {
                                                if (edit) return;
                                                evt.preventDefault();
                                                router.push(`/document-view/${e.id}/`);
                                            }}
                                            >
                                            <div className="flex-[2]">{idx + 1}</div>
                                            <div className="flex-[6]">{e.orderNo}</div>
                                            <div className="flex-[6]">{e?.orderDate != undefined? Text2Thai(Date2Thai(e?.orderDate)): '-'}</div>
                                            <div className="flex-[6]">{e?.orderblackNo?? '-'}</div>
                                            <div className="flex-[6]">{e?.orderredNo?? '-'}</div>
                                            <div className="flex-[1]">
                                                <CircleX className="cursor-pointer"
                                                onClick={async(evt: React.MouseEvent<SVGSVGElement>) => {
                                                    evt.stopPropagation();
                                                    try {
                                                        await addToGroup({
                                                            groupId: groupId as number,
                                                            docIds: [e.id],
                                                            mode: 'remove'
                                                        });
                                                        setDocData(
                                                            columns.filter((ee) => ee.id != e.id)
                                                        );
                                                    } catch (error) {
                                                        console.error(error);
                                                        if (isAuthError(error))
                                                           RedirectToLogin(); 
                                                    }
                                                }}/>
                                            </div>
                                        </Card>
                                    </DraggableItem>
                                </div>
                                ))}
                                <DroppableArea key={`drop-${columns.length}`} id={`drop-${columns.length}`} >
                                        <div className="w-full h-6"></div>
                                </DroppableArea>
                        </div>
                    </DragDrop>
                </div>
            </div>
        </div>
    );
}
