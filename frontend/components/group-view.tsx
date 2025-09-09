'use client';

import { Input } from "@/components/ui/input";
import { type Isp, type Group } from "@/lib/types";
import DocumentList from "./document-list/document-list";
import { GroupForm } from "./group-form";
import {useState, useRef, useEffect} from 'react';
import { RenameGroup } from "./actions/group";
import { useAppDispatch } from "./store/hooks";
import { toggleDataChanged } from "./store/features/group-list-ui-slice";
import { redirect } from 'next/navigation';
import { isAuthError } from '@/components/exceptions/auth';
import { RedirectToLogin } from "./reload-page";
import { Date2Thai, Text2Thai } from "@/lib/client/utils";
import { Button } from "./ui/button";
import { PencilLine } from "lucide-react";

export default function GroupView(
  { groupData, isps, idParam}:
  { groupData: Group | null, isps: Isp[], idParam: string}) {
    const [title, setTitle] = useState(groupData?.name?? 'ไม่มีชื่อ');
    const [onTitleChange, setOnTitleChange] = useState(false);
    const titleRef = useRef<HTMLInputElement>(null);
    const dispatch = useAppDispatch();

    useEffect(() => {
      if (idParam === '-1')
        redirect(`/document-groups/${groupData?.id}`);
    }, []);

    useEffect(() => {
      if (titleRef?.current) {
        titleRef?.current?.focus();
        titleRef?.current?.select();
    }}, [onTitleChange]);

    useEffect(() => {
      const updateName = async(name: string) => {
        try {
          await RenameGroup({
            groupId: groupData?.id as number,
            name
          });
        } catch (error) {
          if (isAuthError(error))
            RedirectToLogin();
        }
      };

      updateName(title);
      dispatch(toggleDataChanged());
    }, [title]);

  return (
    <div className="w-full flex flex-col justify-start items-center p-4" id="groupview">
      <div className="flex w-full justify-between">
        <div className="flex flex-col justify-start items-start w-full gap-y-4">
          <div className="flex flex-col">
            <div className="flex justify-start gap-x-1">
            {
              !onTitleChange?
              <div className="w-full text-start text-2xl font-bold">{title}</div>:
              <Input defaultValue={title} ref={titleRef} />
            }
            <Button variant={null} className="w-fit h-fit cursor-pointer" asChild
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                setOnTitleChange((prev) => {
                  if (prev && titleRef?.current) setTitle(titleRef?.current?.value);
                  return !prev;
                });
              }}
            >
              <PencilLine size={20}/>
            </Button>
            </div>
            <div className="w-full text-start text-md">{
            groupData && groupData?.createdAt? Text2Thai(Date2Thai(groupData.createdAt)): '-'
            }</div>
          </div>
        <GroupForm isps={isps} groupId={(groupData as Group).id}>
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
