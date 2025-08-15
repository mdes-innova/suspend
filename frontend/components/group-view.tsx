'use client';

import { Input } from "@/components/ui/input";
import { type Isp, type Group, type GroupFile } from "@/lib/types";
import DocumentList from "./document-list/document-list";
import { GroupForm } from "./group-form";
import { Date2Thai, Text2Thai } from "@/lib/utils";
import {useState, useRef, useEffect} from 'react';
import { RenameGroup } from "./actions/group";
import { useAppDispatch } from "./store/hooks";
import { toggleDataChanged } from "./store/features/group-list-ui-slice";
import { usePathname, redirect } from 'next/navigation';
import { isAuthError } from '@/components/exceptions/auth';

export default function GroupView(
  { groupData, isps, fileData}: { groupData: Group | null, isps: Isp[], fileData: GroupFile[] }) {
    const [title, setTitle] = useState(groupData?.name?? 'ไม่มีชื่อ');
    const [onTitleChange, setOnTitleChange] = useState(false);
    const titleRef = useRef<HTMLInputElement>(null);
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
        try {
          await RenameGroup({
            groupId: groupData?.id as number,
            name
          });
        } catch (error) {
          if (isAuthError(error))
            if (window)
              window.location.reload();
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
            {
              !onTitleChange?
              <div className="w-full text-start text-2xl font-bold"
                onDoubleClick={(evt: React.MouseEvent<HTMLDivElement>) => {
                  evt.preventDefault();
                  setOnTitleChange(true);
                }}
              >{title}</div>:
              <Input defaultValue={title} ref={titleRef} 
                onBlur={() => {
                  if (titleRef?.current)
                    setTitle(titleRef?.current?.value);
                  setOnTitleChange(false);
                }}
                onKeyDown={(evt: React.KeyboardEvent<HTMLInputElement>) => {
                  if (evt.key === "Enter") {
                    if (titleRef?.current)
                    setTitle(titleRef?.current?.value);
                    setOnTitleChange(false);
                    evt.currentTarget.blur();
                  }
                }
              }
              />
            }
            <div className="w-full text-start text-md">{
            groupData && groupData?.createdAt? Text2Thai(Date2Thai(groupData.createdAt)): '-'
            }</div>
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
