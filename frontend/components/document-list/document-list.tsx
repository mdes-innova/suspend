'use client';

import { ArrowUpDown, Plus, CircleX } from "lucide-react";
import { Card } from "../ui/card";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import DragDrop from "./drag-drop";
import DraggableItem from "./drag";
import React from "react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Separator } from "@radix-ui/react-dropdown-menu";
import DroppableArea from "./drop";
import { DragEndEvent } from "@dnd-kit/core";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setDragging } from "../store/features/document-list-ui-slice";
import { Date2Thai, Text2Thai } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/playlist-dialog";
import ContentDialog from "../content-dialog";
import { DialogClose, DialogFooter } from "../ui/dialog";
import {
  RowSelectionState,
} from '@tanstack/react-table';
import { setDocIds, setRowSelection} 
  from "../store/features/dialog-list-ui-slice";
import {closeModal, LOADINGUI, openModal} from '../store/features/loading-ui-slice';
import { getContent, getDocumentList } from "../actions/document";
import { Group, type Document } from "@/lib/types";
import { addToGroup, getGroup } from "../actions/group";
import { toggleDataChanged } from "../store/features/group-list-ui-slice";

export default function DocumentList({ data, groupId }: { data: DocumentType[] | undefined, groupId: number | undefined}) {
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

    const isDragging = useAppSelector(state => state.documentListUi.isDragging);
    const draggingId = useAppSelector(state => state.documentListUi.dragId);
    const dataChanged = useAppDispatch(state => state.documentListUi.dataChanged);
    const docIds = useAppSelector(state => state.dialogListUi.docIds)
    const [columns, setColumns] = useState([]);
    
    useEffect(() => {
        setColumns(docData);
    }, [docData]);

    useEffect(() => {
        const updateData = async() => {
            await addToGroup({
                docIds: columns.map((e: Document) => e.id),
                groupId: groupId as number
            });
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
                
            }
        }

        getData();
    }, [dataChanged]);



    const handleDragEnd = (event: any) => {
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
                        setContentData([]);
                    }

                }}>
                    <Plus /> <span>เพิ่มคำสั่งศาล</span>
                </Button>
                <Dialog open={contentData === null? false: openContent} onOpenChange={(open) => {
                    if (!open) {
                        setContentData(null);
                        dispatch(closeModal({ui: LOADINGUI.dialog}));
                    } else {
                        dispatch(closeModal({ui: LOADINGUI.dialog}));
                    }
                    setOpenContent(open);
                }}>
                    <DialogContent className="max-w-none min-w-[800px]">
                        <DialogHeader>
                            <DialogTitle>เพิ่มคำสั่งศาล</DialogTitle>
                        </DialogHeader>
                            <ContentDialog data={contentData}/>
                    <DialogFooter>
                        <div className="flex gap-x-2">
                            <Button onClick={async(e: any) => {
                                e.preventDefault();
                                try {
                                    const addedGroup = await addToGroup({
                                        groupId,
                                        docIds,
                                        mode: 'append'
                                    });
                                    const docs = await getDocumentList(docIds);
                                    setDocData([...columns, ...docs]);
                                } catch (error) {
                                    console.error(error);
                                }
                                setOpenContent(false);
                                dispatch(closeModal({ui: LOADINGUI.dialog}));
                            }}>เพิ่ม</Button>
                            <Button variant='destructive' onClick={(e) => {
                                e.preventDefault();
                                setOpenContent(false);
                                dispatch(closeModal({ui: LOADINGUI.dialog}));
                            }}>ยกเลิก</Button>
                        </div>
                    </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Button className={`${edit? 'bg-accent': ''}`} variant='outline' 
                    id={documentListEditId} onClick={(e: any) => {
                    e.preventDefault();
                    setEdit(prev => !prev);
                }}>Edit</Button>
            </div>
            <Card className="flex flex-row w-full px-8 border-0 shadow-none py-0"  id='document-list-header'>
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
                            {columns.map((e: any, idx: number) => (
                            <div key={`drag-drop-${idx}`}>
                                <DroppableArea key={`drop-${idx}`} id={`drop-${idx}`} >
                                    <div className="w-full h-6"></div>
                                </DroppableArea>
                                    <DraggableItem key={`drag-${idx}`} id={`drag-${idx}`} 
                                        className={`${edit? 'cursor-move': ''} 
                                        ${(draggingId === `drag-${idx}` && isDragging)? 'opacity-70': 'opacity-100'}`}>
                                        <Card key={`group-${idx}`}
                                            className="flex flex-row px-4 hover:shadow-md w-full"
                                            onClick={(evt: any) => {
                                                if (edit) return;
                                                evt.preventDefault();
                                                router.push(`/document-view/${e.id}/`);
                                            }}
                                            >
                                            <div className="flex-[2]">{idx + 1}</div>
                                            <div className="flex-[6]">{e.orderNo}</div>
                                            <div className="flex-[6]">{Text2Thai(Date2Thai(e?.orderDate))}</div>
                                            <div className="flex-[6]">{e?.orderblackNo?? '-'}</div>
                                            <div className="flex-[6]">{e?.orderredNo?? '-'}</div>
                                            <div className="flex-[1]">
                                                <CircleX className="cursor-pointer" onClick={async(evt: any) => {
                                                    evt.stopPropagation();
                                                    await addToGroup({
                                                        groupId,
                                                        docIds: [e.id],
                                                        mode: 'remove'
                                                    });
                                                    setDocData(
                                                        columns.filter((ee) => ee.id != e.id)
                                                    );
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

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
)