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
import DatePicker, {ThaiDatePicker} from "../date-picker"
import { getUsers } from "../actions/user"
import { getIsps } from "../actions/isp"
import { postMail, SaveDraft } from "../actions/group-file"
import { BookCard } from "../court-order/book-card"
import { SendMails } from "../actions/mail"

const tempUsers = [
    "user1", 'arnon songmoolnak', 'arnon', 'pok', 'arnonsongmoolnak arnonsongmoolnak'
]

const FormSchema = z.object({
  documentNo: z.string(),
  title: z.string(),
  speed: z.string(),
  secret: z.string(),
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

    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        documentNo: "",
        title: "",
        speed: "",
        secret: ""
      },
  })

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
    <div className="h-full w-full flex flex-col justify-center items-center px-6 gap-y-4">
      <Form {...form}>
        <form className="grid grid-cols-2 gap-4 w-full">
            <FormField
                control={form.control}
                name="documentNo"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="inline-flex items-center gap-0.5">
                        เลขหนังสือ<span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                    <Input {...field} onChange={(e) => {
                        setErrorMessage('')
                        field.onChange(e)
                    }} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <div className="w-full h-full flex flex-col justify-between items-start">
                <FormLabel className="inline-flex items-center gap-0.5">
                    วันที่<span className="text-red-400">*</span>
                </FormLabel>
                <DatePicker />
            </div>
            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="inline-flex items-center gap-0.5">
                        เรื่อง<span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                    <Input {...field} onChange={(e) => {
                        setErrorMessage('')
                        field.onChange(e)
                    }} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="speed"
                render={({ field }) => (
                <FormItem>                    
                    <FormLabel className="inline-flex items-center gap-0.5">
                        ชั้นความเร็ว<span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                    <Input {...field} onChange={(e) => {
                        setErrorMessage('')
                        field.onChange(e)
                    }} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="secret"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="inline-flex items-center gap-0.5">
                        ชั้นความลับ<span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                    <Input {...field} onChange={(e) => {
                        setErrorMessage('')
                        field.onChange(e)
                    }} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </form>
    </Form>
      <BookCard ispData={isps} groupId={groupId} fileData={fileData}/>
      { children }
      <div className='w-full flex justify-center items-center gap-x-4'>
        <Button onClick={async(e: any) => {
          e.preventDefault();
          await SendMails(groupId);
        }}>
          ส่ง ISP 
        </Button>
      </div>
    </div>
  );
}