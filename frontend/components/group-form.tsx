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
import { useAppDispatch } from "./store/hooks"
import { Dialog, DialogContent, DialogTitle} from "./ui/dialog"
import { ThaiDatePicker } from "./date-picker"
import { BookCard } from "./court-order/book-card"
import { SendMails } from "./actions/mail"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"
import { getGroup, setDocumentDate, setDocumentNo, setDocumentSecret, setDocumentSpeed, setDocumentTitle } from "./actions/group"
import DialogLoading from "./loading/dialog"
import { closeModal, LOADINGUI, openModal } from "./store/features/loading-ui-slice";
import { useRouter } from 'next/navigation';


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
    const dispatch = useAppDispatch();
    const submitRef = useRef(null);
    const [sendText, setSendText] = useState(0);
    const [mgId, setMgId] = useState('');
    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        documentNo: "",
        title: "",
      },
  });
  const router = useRouter();

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
    try {
      if (values.title === '' || values.documentNo === '' || !date || speed === '' || secret === '') {
        alert('Cannot send mails.');
        return;
      }
      dispatch(openModal({ui: LOADINGUI.dialog}));
      await updateField({
        kind: 'title',
        value: values.title
      });
      await updateField({
        kind: 'documentNo',
        value: values.documentNo
      });
      const mailGroupId = (await SendMails(groupId)).data;
      setSendText(1)
      setMgId(mailGroupId);
      
    } catch (error) {
      console.error(error);
      setSendText(2)
    }
    dispatch(closeModal({ui: LOADINGUI.dialog}));
  }

  useEffect(() => {
    if (sendText === 1) setMailStatus(0);
    else if (sendText === 2) setMailStatus(1);
  }, [sendText]);

  useEffect(() => {
    if (mailStatus === 2) setSendText(0);
  }, [mailStatus]);

  return (
    <div className="h-full w-full flex flex-col justify-center items-center px-6 gap-y-4">
      <DialogLoading />
      <Dialog open={mailStatus != 2} onOpenChange={(open) => {
        if (!open) setMailStatus(2);
      }}>
        <DialogContent>
          <DialogTitle>
            {
              ['', 'ส่งเมลล์สำเร็จ', 'ส่งเมลล์ไม่สำเร็จ'][sendText]
            }
          </DialogTitle>
            <Button variant={mailStatus === 0? '': 'destructive'}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.preventDefault();
                if (mailStatus === 0)
                  router.push(`/mail/${mgId}`);
                setMailStatus(2);
              }}
            >
              ตกลง
            </Button>
        </DialogContent>
      </Dialog>
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
                render={({ field }: { field:  ControllerRenderProps<z.infer<typeof FormSchema>, "title">}) => (
                <FormItem>
                    <FormLabel className="inline-flex items-center gap-0.5">
                        เรื่อง<span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                    <Input {...field} onChange={(e) => {
                        field.onChange(e)
                    }}
                      onBlur={async(e: React.FocusEvent<HTMLDivElement>) => {
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
        <Button onClick={async(e: React.MouseEvent<HTMLDivElement>) => {
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