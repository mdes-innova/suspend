'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { number } from "zod";
import { MyPagination, type Paginor } from "./my-pagination";
import { type Isp, User, type Group } from "@/lib/types";
import DocumentList from "./document-list/document-list";
import DragDrop from "./document-list/drag-drop";
import { GroupForm } from "./mail/group-form";
import { Date2Thai, Text2Thai } from "@/lib/utils";
import {useState, useRef, useEffect} from 'react';

export default function GroupView(
  { groupData, isps}: { groupData: Group | null, isps: Isp[] }) {
    const [title, setTitle] = useState(groupData?.name?? 'ไม่มีชื่อ');
    const [onTitleChange, setOnTitleChange] = useState(false);
    const titleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (titleRef?.current) {
        titleRef?.current?.focus();
        titleRef?.current?.select();
      }
    }, [onTitleChange]);
  return (
    <div className="w-full flex flex-col justify-start items-center p-4" id="groupview">
      <div className="flex w-full justify-between">
        <div className="flex flex-col justify-start items-start w-full gap-y-4">
          <div className="flex flex-col">
            {
              !onTitleChange?
              <div className="w-full text-start text-2xl font-bold"
                onDoubleClick={(evt: any) => {
                  evt.preventDefault();
                  setOnTitleChange(true);
                }}
              >{title}</div>:
              <Input defaultValue={title} ref={titleRef} 
                onBlur={(evt: any) => {
                  setTitle(titleRef?.current?.value);
                  setOnTitleChange(false);
                }}
              />
              // <div className="w-full text-start text-2xl font-bold" ref={titleRef}
              //   onDoubleClick={(evt: any) => {
              //     evt.preventDefault();
              //     setOnTitleChange(true);
              //   }}
              // >{title}</div>
            }
            <div className="w-full text-start text-md">{Text2Thai(Date2Thai(groupData.createdAt))}</div>
          </div>
        <GroupForm isps={isps} groupId={groupData?.id}>
          <DocumentList data={groupData?.documents} groupId={groupData?.id}/>
        </GroupForm>
        {/* <DragDrop /> */}
          {/* <div className="mt-auto">
          <Urls />
          </div> */}
        </div>
      </div>
      {/* <DocumentLogs data={logData.data} pagination={
        {
          active: ap,
          count: logData.count
        }
      } /> */}
    </div>
  );
}
