"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {z } from "zod"

import { Button } from "@/components/ui/button"
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
import { Group, GroupFile, type Isp, type User } from "@/lib/types"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { ScrollArea } from "../ui/scroll-area"
import { Label } from "../ui/label"
import { Separator } from "../ui/separator"
import DatePicker, {ThaiDatePicker} from "../date-picker"
import { getIsps } from "../actions/isp"
import { BookCard } from "../court-order/book-card"
import { SendMails } from "../actions/mail"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select"
import { getGroup, setDocumentDate, setDocumentNo, setDocumentSecret, setDocumentSpeed, setDocumentTitle } from "../actions/group"

const tempUsers = [
    "user1", 'arnon songmoolnak', 'arnon', 'pok', 'arnonsongmoolnak arnonsongmoolnak'
]

const FormSchema = z.object({
  documentNo: z.string(),
  title: z.string()
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
    const [speed, setSpeed] = useState('');
    const [secret, setSecret] = useState('');
    const [date, setDate] = useState<Date>();
    const submitRef = useRef(null);
    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        documentNo: "",
        title: "",
      },
  });

  useEffect(() => {
    const getData = async() => {
      try{
        const group: Group = await getGroup(groupId);
        if (group.speed) setSpeed(`${group.speed}`);
        if (group.secret) setSecret(`${group.secret}`);
        if (group.documentDate) setDate(new Date(group.documentDate));
        form.reset({
            documentNo: group.documentNo || '',
            title: group.title || '',
          });
      } catch {
      }
    }

    getData();
  }, []);

  useEffect(() => {
    const updateDocumentDate = async() => {
      await updateField({
        kind: 'documentDate',
        value: date
      });
    }

    if (date) updateDocumentDate();
  }, [date]);

  useEffect(() => {
    const updateSecret = async() => {
      await updateField({
        kind: 'secret',
        value: secret
      });
    }
    if (secret != '') updateSecret();
    else {

    }

  }, [secret]);


  useEffect(() => {
    const updateSpeed = async() => {
      await updateField({
        kind: 'speed',
        value: speed
      });
    }
    if (speed != '') updateSpeed();
  }, [speed]);

  const updateField = async({kind, value}: {kind: string, value: string}) => {
    switch (kind) {
      case 'documentNo':
        await setDocumentNo({
          groupId,
          documentNo: value
        }) 
        break;

      case 'documentDate':
        await setDocumentDate({
          groupId,
          documentDate: value
        }) 
        break;

      case 'title':
        await setDocumentTitle({
          groupId,
          title: value
        }) 
        break;

      case 'speed':
        await setDocumentSpeed({
          groupId,
          speed: parseInt(value)
        }) 
        break;

      case 'secret':
        await setDocumentSecret({
          groupId,
          secret: parseInt(value)
        }) 
        break;
    
      default:
        await setDocumentNo({
          groupId,
          documentNo: value
        }) 

        break;
    }
  }

  const onSubmit = async (values: z.infer<typeof FormSchema>) => { 
    if (values.title === '' || values.documentNo === '' || !date || speed === '' || secret === '')
      alert('Cannot send mails.');
    await updateField({
      kind: 'title',
      value: values.title
    });
    await updateField({
      kind: 'documentNo',
      value: values.documentNo
    });

    await SendMails(groupId);
  }



  return (
    <div className="h-full w-full flex flex-col justify-center items-center px-6 gap-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 w-full">
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
                        field.onChange(e)
                    }} 
                      onBlur={async(e: any) => {
                        const documentNo = e.target.value;
                        await updateField({
                          kind: 'documentNo',
                          value: documentNo
                        })
                      }}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <div className="w-full h-full flex flex-col justify-between items-start">
                <FormLabel className="inline-flex items-center gap-0.5">
                    วันที่<span className="text-red-400">*</span>
                </FormLabel>
                <ThaiDatePicker date={date} setDate={setDate}/>
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
                        field.onChange(e)
                    }}
                      onBlur={async(e: any) => {
                        const title = e.target.value;
                        await updateField({
                          kind: 'title',
                          value: title 
                        })
                      }}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <div className="flex flex-col">
              <br />
                <Select
                  name="speed"
                  required
                  value={speed}
                  onValueChange={(value: string) => {
                    setSpeed(value);
                  }}
                >
                <SelectTrigger className="w-full" >
                  <SelectValue placeholder="เลือก ชั้นความเร็ว" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                    <SelectLabel>ชั้นความเร็ว</SelectLabel>
                    <>
                      {['ปกติ', 'ด่วน', 'ด่วนมาก', 'ด่วนที่สุด'].map((speed: string, idx: number) => (<SelectItem  
                          key={`speed-${idx}`} value={`${idx}`}> {speed}
                          </SelectItem>)
                      )}
                    </>
                    </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col">
              <br />
                <Select
                  name="secret"
                  required
                  value={secret}
                  onValueChange={(value: string) => {
                    setSecret(value);
                  }}
                >
                <SelectTrigger className="w-full" >
                  <SelectValue placeholder="เลือก ชั้นความลับ" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                    <SelectLabel>ชั้นความลับ</SelectLabel>
                    <>
                      {['ปกติ', 'ลับ', 'ลับมาก', 'ลับที่สุด'].map((secret: string, idx: number) => (<SelectItem  
                          key={`speed-${idx}`} value={`${idx}`}> {secret}
                          </SelectItem>)
                      )}
                    </>
                    </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="hidden" ref={submitRef}>Submit</Button>
        </form>
    </Form>
      <BookCard ispData={isps} groupId={groupId} fileData={fileData}/>
      { children }
      <div className='w-full flex justify-center items-center gap-x-4'>
        <Button onClick={async(e: any) => {
          e.preventDefault();
          if (submitRef?.current){
            submitRef?.current?.click();
          }
        }}>
          ส่ง ISP 
        </Button>
      </div>
    </div>
  );
}