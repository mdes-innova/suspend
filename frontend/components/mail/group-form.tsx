"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {z } from "zod"

import { Button } from "@/components/ui/button"
import { Textarea } from "../ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Fragment, useEffect, useRef, useState } from "react"
import { GroupFile, type Isp, type User } from "@/lib/types"
import { X } from "lucide-react"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { ScrollArea } from "../ui/scroll-area"
import { Label } from "../ui/label"
import { Separator } from "../ui/separator"
import {ThaiDatePicker} from "../date-picker"
import { getUsers } from "../actions/user"
import { getIsps } from "../actions/isp"
import { postMail, SaveDraft } from "../actions/group-file"
import { BookCard } from "../court-order/book-card"

const tempUsers = [
    "user1", 'arnon songmoolnak', 'arnon', 'pok', 'arnonsongmoolnak arnonsongmoolnak'
]

const formSchema = z.object({
  subject: z.string().min(1, {
    message: "กรุณาใส่ชื่อเรื่อง",
  }),
  description: z.string().optional(), // or .min(1) if you want it required
})

export function GroupForm({
  children,
  isps,
  groupId,
  fileData
}: Readonly<{
  children?: React.ReactNode,
  isps: Isp[],
  groupId: number,
  fileData: GroupFile[]
}>) {
    const [selectedUsers, setSelectedUsers] = useState<Isp[]>([]);
    const [date, setDate] = useState<Date>();
    const dispatch = useAppDispatch();
    const documents = useAppSelector(state => state.groupUi.documents);
    const groupFiles = useAppSelector(state => state.groupUi.groupFiles);

  useEffect(() => {
    const setSelectedUsersData = async() => {
      try {
        const ispsUsers = await getIsps();
        setSelectedUsers(ispsUsers);
      } catch (error) {
        setSelectedUsers([]);
      }
    }

    setSelectedUsersData();
  }, []);


  return (
    <>
      <BookCard ispData={isps} groupId={groupId} fileData={fileData}/>
      { children }
      <div className='w-full flex justify-center items-center gap-x-4'>
        <Button variant='outline' onClick={async(evt: any) => {
          evt.preventDefault();

        }}>
          บันทึกฉบับร่าง
        </Button>
        <Button>
          ส่ง ISP 
        </Button>
      </div>
    </>
  );
}