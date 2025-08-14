"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, ControllerRenderProps } from "react-hook-form"
import {z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useEffect, useRef, useState } from "react"
import { Group, GroupFile, type Isp } from "@/lib/types"
import { ThaiDatePicker } from "./date-picker"
import { BookCard } from "./court-order/book-card"
import { createMailGroup, sendIspMail } from "./actions/mail"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"
import { getGroup, setDocumentDate, setDocumentNo, setDocumentSecret, setDocumentSpeed, setDocumentTitle } from "./actions/group"
import { useRouter } from 'next/navigation';
import { GetFilesFromGroup } from "./actions/group-file"
import { Card } from "./ui/card"
import { AuthError } from "./exceptions/auth"


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
    const [mailStatus, setMailStatus] = useState(2);
    const submitRef = useRef<HTMLButtonElement>(null);
    const [mgId, setMgId] = useState('');
    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        documentNo: "",
        title: "",
      },
  });
  const router = useRouter();
  const [progresMails, setProgressMails] = useState<number[]>([]);

  useEffect(() => {
    const getData = async() => {
      try{
        const group: Group = await getGroup(groupId);
        if (group.speed != null || group.speed != undefined) setSpeed(`${group.speed}`);
        if (group.secret != null || group.secret != undefined) setSecret(`${group.secret}`);
        if (group.documentDate) setDate(new Date(group.documentDate));
        form.reset({
            documentNo: group.documentNo || '',
            title: group.title || '',
          });
      } catch (error) {
        if (error instanceof AuthError)
          if (window)
            window.location.reload();
      }
    }

    getData();
  }, []);

  useEffect(() => {
    const updateDocumentDate = async() => {
      if (date != undefined) {
        try {
          await updateField({
            kind: 'documentDate',
            value: date.toString()
          });
        } catch (error) {
          if (error instanceof AuthError)
            if (window)
              window.location.reload();
        }
      }
    }

    if (date) updateDocumentDate();
  }, [date]);

  useEffect(() => {
    const updateSecret = async() => {
      try {
        await updateField({
          kind: 'secret',
          value: secret
        });
      } catch (error) {
        if (error instanceof AuthError)
          if(window)
            window.location.reload();
      }
    }
    if (secret != '') updateSecret();

  }, [secret]);


  useEffect(() => {
    const updateSpeed = async() => {
      try {
        await updateField({
          kind: 'speed',
          value: speed
        });
      } catch (error) {
        if (error instanceof AuthError)
          if (window)
            window.location.reload();
      }
    }
    if (speed != '') updateSpeed();
  }, [speed]);

  const updateField = async({kind, value}: {kind: string, value: string}) => {
    try {
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
    } catch (error) {
      if (error instanceof AuthError)
        if (window)
          window.location.reload();
    }
  }

  const onSubmit = async (values: z.infer<typeof FormSchema>) => { 
    try {
      if (values.title === '' || values.documentNo === '' || !date || speed === '' || secret === '') {
        alert('Cannot send mails.');
        return;
      }
      await updateField({
        kind: 'title',
        value: values.title
      });
      await updateField({
        kind: 'documentNo',
        value: values.documentNo
      });

      const mailGroup = await createMailGroup({
        groupId
      });
      setMgId(mailGroup?.id);

      const groupFiles: GroupFile[] = await GetFilesFromGroup(groupId);
      if (groupFiles && groupFiles.length)
        setProgressMails(groupFiles.map(() => -1));
      for (let i=0; i<groupFiles.length; i++) {
        if (typeof mailGroup?.id === "string" && typeof groupFiles?.at(i)?.id === "number") {
          if (mailStatus != 2) break;
          try {
            await sendIspMail({
              mailGroupId: mailGroup.id,
              groupFileId: groupFiles[i].id as number
            });
           setProgressMails((prev: number[]) => {
            const updated = [...prev];
            updated[i] = 0;
            return updated;
           });
          } catch {
           setProgressMails((prev: number[]) => {
            const updated = [...prev];
            updated[i] = 1;
            return updated;
           });
          }
        }
      }
    } catch (error) {
      if (error instanceof AuthError)
        if (window)
          window.location.reload();
    }
  }

  useEffect(() => {
    if (mailStatus != 2 && mgId != '') {
      router.push(`/mail/${mgId}`);
      setMailStatus(2);
      setMgId('');
    }
  }, [mailStatus, mgId]);

  return (
    <div className="h-full w-full flex flex-col justify-center items-center px-6 gap-y-4">
      {progresMails.length > 0 && mgId != '' && mailStatus == 2 &&
      <Card className="fixed left-1/2 top-1/2 -translate-x-1/2 min-w-54 
        -translate-y-1/2 z-50 p-10 flex flex-col gap-y-6 justify-center">
        <div className="flex justify-center gap-x-1">
        {
          progresMails.map((pmail: number, idx: number) => {
            const bg = ['bg-muted', 'bg-green-400', 'bg-red-400'][pmail + 1];
            return (
                <div key={`mail-progress-${idx}`} className={`rounded-md w-8 h-2 ${bg}`}></div>
            );
          }
        )
        }
        </div>
        {
          progresMails[progresMails.length - 1] != -1?
          <Button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              setMailStatus(0);
              setProgressMails([]);
            }}
          >
            ตกลง
          </Button>:
          <Button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              setMailStatus(1);
              setProgressMails([]);
            }}
          >
            ยกเลิก
          </Button>
        }
      </Card>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 w-full">
            <FormField
                control={form.control}
                name="documentNo"
                render={({ field }: { field:  ControllerRenderProps<z.infer<typeof FormSchema>, "documentNo">}) => (
                <FormItem>
                    <FormLabel className="inline-flex items-center gap-0.5">
                        เลขหนังสือ<span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                    <Input {...field} onChange={(e: React.ChangeEvent<HTMLDivElement>) => {
                        field.onChange(e)
                    }} 
                      onBlur={async(e: React.FocusEvent<HTMLInputElement>) => {
                        const documentNo = e.target.value;
                        try {
                          await updateField({
                            kind: 'documentNo',
                            value: documentNo
                          });
                        } catch (error) {
                          if (error instanceof AuthError)
                            if (window)
                              window.location.reload();
                        }
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
                render={({ field }: { field:  ControllerRenderProps<z.infer<typeof FormSchema>, "title">}) => (
                <FormItem>
                    <FormLabel className="inline-flex items-center gap-0.5">
                        เรื่อง<span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                    <Input {...field} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        field.onChange(e)
                    }}
                      onBlur={async(e: React.FocusEvent<HTMLInputElement>) => {
                        const title = e.target.value;
                        try {
                          await updateField({
                            kind: 'title',
                            value: title 
                          });
                        } catch (error) {
                          if (error instanceof AuthError)  
                            if (window)
                              window.location.reload();
                        }
                      }}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <div className="flex flex-col">
              <FormLabel className="inline-flex items-center gap-0.5">
                  ชั้นความเร็ว<span className="text-red-400">*</span>
              </FormLabel>
              <div className="mt-2">
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
            </div>
            <div className="flex flex-col">
              <FormLabel className="inline-flex items-center gap-0.5">
                  ชั้นความลับ<span className="text-red-400">*</span>
              </FormLabel>
              <div className="mt-2">
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
            </div>
            <Button type="submit" className="hidden" ref={submitRef}>Submit</Button>
        </form>
    </Form>
      <BookCard ispData={isps} groupId={groupId} fileData={fileData}/>
      { children }
      <div className='w-full flex justify-center items-center gap-x-4'>
        <Button onClick={async(e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          if (submitRef.current) {
            submitRef.current.click();
          }
        }}>
          ส่ง ISP 
        </Button>
      </div>
    </div>
  );
}