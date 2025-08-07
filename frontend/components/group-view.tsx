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
import { type Isp, User, type Group, type GroupFile } from "@/lib/types";
import DocumentList from "./document-list/document-list";
import DragDrop from "./document-list/drag-drop";
import { GroupForm } from "./mail/group-form";
import { Date2Thai, Text2Thai } from "@/lib/utils";
import {useState, useRef, useEffect} from 'react';
import { RenameGroup } from "./actions/group";
import { useAppDispatch } from "./store/hooks";
import { toggleDataChanged } from "./store/features/group-list-ui-slice";
import { usePathname, redirect } from 'next/navigation';

export default function GroupView(
  { groupData, isps, fileData}: { groupData: Group | null, isps: Isp[], fileData: GroupFile[] }) {
    const [title, setTitle] = useState(groupData?.name?? 'ไม่มีชื่อ');
    const [onTitleChange, setOnTitleChange] = useState(false);
    const titleRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();
    const pathname = usePathname();

    useEffect(() => {
      const pathnameSplits = pathname.split('/');
      const groupId = pathnameSplits[pathnameSplits.length - 1];
      if (groupId === '-1')
        redirect(`/document-groups/${groupData?.id}`);
    }, []);

    useEffect(() => {
      if (titleRef?.current) {
        titleRef?.current?.focus();
        titleRef?.current?.select();
    }}, [onTitleChange]);

    useEffect(() => {
      const updateName = async(name: string) => {
        await RenameGroup({
          groupId: groupData?.id as number,
          name
        });
      };

      updateName(title);
      dispatch(toggleDataChanged());
    }, [title]);

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
                onKeyDown={(evt: React.KeyboardEvent<HTMLInputElement>) => {
                  if (evt.key === "Enter") {
                    setTitle(titleRef?.current?.value);
                    setOnTitleChange(false);
                    evt.currentTarget.blur();
                  }
                }
              }
              />
            }
            <div className="w-full text-start text-md">{Text2Thai(Date2Thai(groupData.createdAt))}</div>
          </div>
        <GroupForm isps={isps} groupId={(groupData as Group).id} fileData={fileData}>
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
