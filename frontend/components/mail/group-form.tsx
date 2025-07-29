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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ชื่อเรื่อง</FormLabel>
              <FormControl>
                <Input
                  placeholder="ใส่ชื่อเรื่อง"
                  {...field}
                  className="w-[1000px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>คำอธิบาย</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="เพิ่มคำอธิบาย"
                  {...field}
                  className="w-[1000px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-96 flex flex-col justify-between items-start">
            <FormLabel className="inline-flex items-center gap-0.5">
                วันที่<span className="text-red-400">*</span>
            </FormLabel>
            <ThaiDatePicker date={date} setDate={setDate} />
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(0,_400px))] justify-center gap-4 bg-background border border-black px-4 py-4 rounded-sm">
                {
                    selectedUsers.map((ee: any, idxx: number) => {
                        return (
                            <div className="bg-background h-fit py-1 px-4 rounded-md border relative flex justify-center" key={`to-usrs-${idxx}`}>
                                <div className="text-center">{ee?.name}</div>
                                <div className="w-fit min-h-full flex flex-col justify-center absolute top-0 right-4">
                                    <X className="cursor-pointer" size={16} onClick={(e: any) => {
                                        e.preventDefault();
                                        setSelectedUsers(prev => prev.filter((u: string) => u != ee));
                                    }}/>
                                </div>
                            </div>

                        );
                    })
                }
        </div>
            <Dialog open={usersOpen} onOpenChange={(open) => {
                setUsersOpen(open);
            }}>
                <DialogTrigger asChild>
                    <div className="inline-flex items-center cursor-pointer w-full ">
                    <Button type="button" variant="secondary" onClick={(e: any) => {
                        e.preventDefault();
                        setUsersOpen(true);
                    }}>Add</Button>
                    <span className="px-2">เพิ่มชื่อผู้รับ</span>
                      <Button type="button" className="ml-auto" variant="outline" onClick={e => {
                        e.preventDefault();
                        setSelectedUsers(isps);
                      }}>เพิ่มทั้งหมด</Button>
                    </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <ScrollArea className="h-72">
                        <ol className="list-outside pl-6 p-4">
                        {isps?.map((isp: Isp, idx: number) => (
                            <Fragment key={`isp-${idx}`}>
                            <li className="text-sm cursor-pointer" 
                                onClick={(e: any) => {
                                    e.preventDefault();
                                    const selectedUserIds = selectedUsers.length?
                                      selectedUsers?.map(su => su.ispId): [];
                                    
                                    if (!selectedUserIds.includes(isp.ispId))
                                      setSelectedUsers(prev => [...prev, isp]);
                                    setUsersOpen(false);
                                }}
                            >{isp?.name}</li>
                            <Separator className="my-2" />
                            </Fragment>
                        ))}
                        </ol>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        { children }
        <div className="flex justify-center gap-x-4 w-full">
            <Button type="submit" variant='destructive' value='0'>Draft</Button>
            <Button type="submit" value='1'>Submit</Button>
        </div>

      </form>
    </Form>
  )
}