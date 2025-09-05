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
import { Date2Thai, IsAboutMidnight, Text2Thai, Time2Thai } from "@/lib/client/utils";
import { Button } from "./ui/button";
import { PencilLine } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "./ui/playlist-dialog";
import { Label } from "./ui/label";

function TimeTick({ date, setDatetimeOpen }:
  { date?: string, setDatetimeOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [ts, setTs] = useState<number | null>(null);

  useEffect(() => {
    if (!date) { setTs(null); return; }

    if (!IsAboutMidnight(date)) setDatetimeOpen(false);

    const d = new Date(date);
    if (isNaN(d.getTime())) { setTs(null); return; }
    setTs(d.getTime());

    const id = setInterval(() => {
      setTs((prev) => (prev == null ? prev : prev + 1000));
    }, 1000);

    return () => clearInterval(id);

  }, [date]);

  if (ts == null) return null;
  return (
    <Label className="font-bold text-center text-2xl text-red-600 flex justify-center">
      {Time2Thai(new Date(ts).toISOString())}
    </Label>
  );
}

export default function GroupView(
  { groupData, isps, idParam, datetime}:
  { groupData: Group | null, isps: Isp[], idParam: string, datetime?: string }) {
    const [title, setTitle] = useState(groupData?.name?? 'ไม่มีชื่อ');
    const [onTitleChange, setOnTitleChange] = useState(false);
    const titleRef = useRef<HTMLInputElement>(null);
    const dispatch = useAppDispatch();
    const [datetimeOpen, setDatetimeOpen] = useState(false);

    useEffect(() => {
    }, []);

    useEffect(() => {
      if (idParam === '-1')
        redirect(`/document-groups/${groupData?.id}`);
      else {
        try {
          if (!datetime) {
            setDatetimeOpen(false);
            return;
          }
          const isAboutMidnight = IsAboutMidnight(datetime);
          if (isAboutMidnight)
              setDatetimeOpen(true);
          else
            setDatetimeOpen(false);
        } catch {
          setDatetimeOpen(false);
        }
      }
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
      <Dialog open={datetimeOpen} onOpenChange={setDatetimeOpen}>
        <DialogContent>
          <DialogTitle>ช่วงเวลาเที่ยงคื่น</DialogTitle>
          <DialogDescription>
            เนื่องจากเวลาที่คุณเลือกอยู่ในช่วงเวลาเที่ยงคืน ซึ่งเป็นช่วงเวลาที่ระบบจะทำการให้ผู้ใช้งานออกจากระบบ
            หากคุณต้องการให้ระบบทำงานอย่างต่อเนื่อง กรุณาเลือกเวลาอื่นที่ไม่ใช่ช่วงเวลาดังกล่าว
          </DialogDescription>
          <DialogTitle className="w-full">
            <TimeTick date={datetime} setDatetimeOpen={setDatetimeOpen} />
          </DialogTitle>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">ปิด</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
