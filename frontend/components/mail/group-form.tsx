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
import { type Isp, type User } from "@/lib/types"
import { X } from "lucide-react"
import { useAppSelector } from "../store/hooks"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { ScrollArea } from "../ui/scroll-area"
import { Label } from "../ui/label"
import { Separator } from "../ui/separator"
import {ThaiDatePicker} from "../date-picker"
import { getUsers } from "../actions/user"
import { getIsps } from "../actions/isp"
import { postMail } from "../actions/mail"
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
  groupId
}: Readonly<{
  children?: React.ReactNode,
  isps: Isp[],
  groupId?: number
}>) {
    const user = useAppSelector(state => state.userAuth.user);
    const [availableUsers, setAvailableUsers] = useState<string[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<Isp[]>([]);
    const [usersOpen, setUsersOpen] = useState(false);
    const [openSave, setOpenSave] = useState(false);
    const [date, setDate] = useState<Date>();
    const [userRows, setUserRows] = useState(1);
    const toUsersRef = useRef(null);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
        subject: "",
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

  useEffect(() => {
    // const userNames = ispUsers?.map((e: User) => e.username);
    // setAvailableUsers(userNames?.filter((user: string) => !selectedUsers.includes(user)));
  }, [selectedUsers]);
  
    async function onSubmit(values: z.infer<typeof formSchema>, event: any) {
      const action = event.nativeEvent.submitter.value; 
      if (!date) alert("Plese select date.");

      try {
        const allUsers = await getUsers();
        const selectedIspNames = selectedUsers.map((isp: Isp) => isp.name);
        const ispUserIds = allUsers.filter((user: User) =>
          selectedIspNames.includes(user?.isp?.name)).map((user: User) => user.id);
        console.log(values)
        await postMail({
          subject: values.subject,
          description: values?.description?? '',
          date,
          toUserIds: ispUserIds,
          groupId: groupId as number
        });
      } catch (error) {
        
      }
    }

  return (
    <>
      <BookCard ispData={isps}/>
      { children }
      <div className='w-full flex justify-center items-center gap-x-4'>
        <Button variant='outline' onClick={(evt) => {
          evt.preventDefault();
          setOpenSave(true);
        }}>
          บันทึกฉบับร่าง
        </Button>
        <Button>
          ส่ง ISP 
        </Button>
      </div>
      <Dialog open={openSave} onOpenChange={(open) => {
        setOpenSave(open);
      }}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>บันทึกฉบับร่าง</DialogTitle>
            <DialogDescription>
              ตั้งชื่อฉบับบร่าง 
            </DialogDescription>
          </DialogHeader>
            <div className="grid gap-3">
              <Label htmlFor="name-1">ชื่อ</Label>
              <Input id="name-1" name="name" />
            </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">ยกเลิก</Button>
            </DialogClose>
            <Button type="submit">บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
    </>
  );
}