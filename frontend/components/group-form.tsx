"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, ControllerRenderProps } from "react-hook-form"
import {z } from "zod"
import { Button } from "@/components/ui/button"
import { PlusCircleIcon, Trash2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {closeModal, LOADINGUI, openModal} from './store/features/loading-ui-slice';
import { ALERTUI, openModal as openAlertModal } from './store/features/alert-ui-slice';
import { Input } from "@/components/ui/input"
import { useEffect, useRef, useState } from "react"
import { type Group, type Mail, type Isp, type Section } from "@/lib/types"
import { ThaiDatePicker } from "./date-picker"
import { BookCard } from "./court-order/book-card"
import { createMailGroup, sendMail } from "./actions/mail"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"
import { getGroup, updateDocumentDate, updateDocumentNo, updateDocumentSecret,
  updateDocumentSpeed, updateDocumentTitle, updateBody, 
  updateSection,
  saveGroup} from "./actions/group"
import { Card } from "./ui/card";
import { isAuthError } from '@/components/exceptions/auth';
import { RedirectToLogin } from "./reload-page"
import { Textarea } from "./ui/textarea"
import { useAppDispatch } from "./store/hooks"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "./ui/playlist-dialog"
import { createSection, getSections, removeSection } from "./actions/section"
import { Label } from "./ui/label"
import { getUsersFromIspList } from "./actions/user"
import { usePathname } from 'next/navigation';


const FormSchema = z.object({
  documentNo: z.string(),
  title: z.string(),
})

export function GroupForm({
  children,
  isps,
  groupId,
}: Readonly<{
  children?: React.ReactNode,
  isps: Isp[],
  groupId: number,
}>) {
    const [speed, setSpeed] = useState('');
    const [secret, setSecret] = useState('');
    const [sections, setSections] = useState<Section[]>([]);
    const [date, setDate] = useState<Date>();
    const [mailStatus, setMailStatus] = useState(2);
    const submitRef = useRef<HTMLButtonElement>(null);
    const [textareaValue, setTextareaValue] = useState("");
    const [sectionErrorMsg, setSectionErrorMsg] = useState("");
    const [prevSectionName, setPrevSectionName] = useState<string>('');
    const [sectionName, setSectionName] = useState("");
    const [sectionDeleteOpen, setSectionDeleteOpen] = useState(false);
    const newSectionNameRef = useRef<HTMLInputElement>(null);
    const [mgId, setMgId] = useState('');
    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        documentNo: "",
        title: "",
      },
  });
  const [progresMails, setProgressMails] = useState<number[]>([]);
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  useEffect(() => {
    const getData = async() => {
      try{
        const group: Group = await getGroup(groupId);
        if (group.speed != null || group.speed != undefined) setSpeed(`${group.speed}`);
        if (group.secret != null || group.secret != undefined) setSecret(`${group.secret}`);
        if (group.section != null || group.section != undefined) setSectionName(`${group.section.name}`);
        if (group.documentDate) setDate(new Date(group.documentDate));
        form.reset({
            documentNo: group.documentNo || '',
            title: group.title || '',
          });
        
        const sectionData = await getSections();
        setSections(sectionData??[]);
      } catch (error) {
        if (isAuthError(error))
          RedirectToLogin();
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
          if (isAuthError(error))
            RedirectToLogin();
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
        if (isAuthError(error))
          RedirectToLogin();
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
        if (isAuthError(error))
          RedirectToLogin();
      }
    }
    if (speed != '') updateSpeed();
  }, [speed]);

  useEffect(() => {
    const updateSection = async() => {
      const section = (sections as Section[]).find((e) => e.name === sectionName);
      if (!section) return;
      try {
        await updateField({
          kind: 'section',
          value: `${section.id}`
        });
      } catch (error) {
        if (isAuthError(error))
          RedirectToLogin();
      }
    }

    if (sectionName != `${sections.length}`) setPrevSectionName(sectionName);

    if (sectionName != '') updateSection();
  }, [sectionName]);

  const updateField = async({kind, value}: {kind: string, value: string}) => {
    try {
      switch (kind) {
        case 'documentNo':
          await updateDocumentNo({
            groupId,
            documentNo: value
          }) 
          break;

        case 'documentDate':
          await updateDocumentDate({
            groupId,
            documentDate: value
          }) 
          break;

        case 'title':
          await updateDocumentTitle({
            groupId,
            title: value
          }) 
          break;

        case 'body':
          await updateBody({
            groupId,
            body: value
          }) 
          break;

        case 'speed':
          await updateDocumentSpeed({
            groupId,
            speed: parseInt(value)
          }) 
          break;

        case 'secret':
          await updateDocumentSecret({

            groupId,
            secret: parseInt(value)
          }) 
          break;

        case 'section':
          await updateSection({
            groupId,
            sectionId: parseInt(value)
          }) 
          break;
      
        default:
          await updateDocumentNo({
            groupId,
            documentNo: value
          }) 

          break;
      }
    } catch (error) {
      if (isAuthError(error))
        RedirectToLogin();
    }
  }

  const onSubmit = async (values: z.infer<typeof FormSchema>) => { 
    try {
      if (sectionName === '' ) {
          alert('Cannot send mails.');
          return;
      }
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

      await updateField({
        kind: 'body',
        value: textareaValue
      });
      const mailGroup = await createMailGroup({
        groupId
      });
      dispatch(closeModal({ui: LOADINGUI.dialog}));
      setMgId(mailGroup?.id);

      const group: Group = await getGroup(groupId);

      const groupFiles = group?.groupFiles?.filter((e) => !e.allIsp)?? [];
      if (groupFiles.length) {
        const ispIds = [...new Set(groupFiles.map((e) => e.isp?.id)
          .filter((e) => typeof e === 'number'))];
        const receivers = await getUsersFromIspList(ispIds);
        if (!receivers || !receivers.length) throw new Error("Receivers not found.");
        setProgressMails(Array.from({length: receivers.length}).map(() => -1));

        for (let receiverIdx=0; receiverIdx<receivers.length; receiverIdx++) {
          if (mailStatus != 2) break;
          try {
            if (typeof mailGroup.id === 'string' && typeof receivers[receiverIdx].id === 'number') {
                const ispMail: Mail = await sendMail({
                  mailGroupId: mailGroup.id,
                  receiverId: receivers[receiverIdx].id
                });

              if (ispMail.status != 'successful')
                throw new Error("Fail to send a mail.");

              setProgressMails((prev: number[]) => {
                const updated = [...prev];
                updated[receiverIdx] = 0;
                return updated;
              });
            } else {
              throw new Error("Invalid receiver or mail group.");
            }
          } catch (error0) {
            setProgressMails((prev: number[]) => {
              const updated = [...prev];
              updated[receiverIdx] = 1;
              return updated;
            });
            if (isAuthError(error0)) {
              RedirectToLogin();
            }
          }
        }
      }
      dispatch(closeModal({ui: LOADINGUI.dialog}));
    } catch (error) {
      setMailStatus(2);
      setMgId('');
      setProgressMails([]);
      if (isAuthError(error))
        RedirectToLogin();
    }
  }

  // useEffect(() => {
  //   if (mailStatus != 2 && mgId != '') {
      // router.push(`/mail-group/${mgId}`);
  //     setMailStatus(2);
  //     setMgId('');
  //   } 
  // }, [mailStatus, mgId]);

  return (
    <div className="h-full w-full flex flex-col justify-center items-center px-6 gap-y-4">
      {progresMails.length > 0 && mgId != '' && mailStatus == 2 &&
      <Card className="fixed left-1/2 top-1/2 -translate-x-1/2 min-w-54 
        -translate-y-1/2 z-50 p-10 flex flex-col gap-y-6 justify-center">
        <div className={`w-[560px] max-md:w-[320px]
          h-full grid grid-cols-12 max-md:grid-cols-6 justify-center items-center gap-x-2 gap-y-4`}>
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
              if(window)
                window.location.href = `/mail-group/${mgId}`;
              setProgressMails([]);
            }}
          >
            ตกลง
          </Button>:
          <Button variant="destructive"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              setMailStatus(1);
              if(window)
                window.location.href = pathname;
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
                    <Input {...field}
                      onKeyDown={async(e: React.KeyboardEvent<HTMLInputElement>) => {
                        const documentNo = e.currentTarget.value;
                        if (e.key === "Enter") {
                          e.preventDefault();
                          try {
                            await updateField({
                              kind: 'body',
                              value: documentNo
                            }); 
                          } catch (error) {
                            if (isAuthError(error))
                              RedirectToLogin();
                          }
                          e.currentTarget.blur();
                        }
                      }}
                      onBlur={async(e: React.FocusEvent<HTMLInputElement>) => {
                        const documentNo = e.target.value;
                        try {
                          await updateField({
                            kind: 'documentNo',
                            value: documentNo
                          });
                        } catch (error) {
                          if (isAuthError(error))
                            RedirectToLogin(); 
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
                  <Input {...field}
                    onKeyDown={async(e: React.KeyboardEvent<HTMLInputElement>) => {
                      const title = e.currentTarget.value;
                      if (e.key === "Enter") {
                        e.preventDefault();
                        try {
                          await updateField({
                            kind: 'title',
                            value: title 
                          }); 
                        } catch (error) {
                          if (isAuthError(error))
                            RedirectToLogin();
                        }
                        e.currentTarget.blur();
                      }
                    }}
                    onBlur={async(e: React.FocusEvent<HTMLInputElement>) => {
                      const title = e.target.value;
                      try {
                        await updateField({
                          kind: 'title',
                          value: title 
                        });
                      } catch (error) {
                        if (isAuthError(error))  
                          RedirectToLogin();
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
                          key={`secret-${idx}`} value={`${idx}`}> {secret}
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
                  มาตรา<span className="text-red-400">*</span>
              </FormLabel>
              <div className="mt-2 flex gap-x-4">
                <Select
                  name="section"
                  required
                  value={sectionName}
                  onValueChange={(value: string) => {
                    if (value != '' && sectionName != `$${sections.length}`)
                      setSectionName(value);
                  }}
                >
                <SelectTrigger className="w-full" >
                  <SelectValue placeholder="เลือก มาตรา" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                    <SelectLabel>มาตรา</SelectLabel>
                    <>
                      {Array.from({length: sections.length + 1}).map((_, idx) => {
                        if (idx != sections.length)
                          return <SelectItem  
                            key={`section-${idx}`} value={`${sections[idx]?.name}`}> {sections[idx]?.name}
                            </SelectItem>
                          else
                            return <SelectItem className="bg-muted"
                              key={`section-${idx}`} value={`${idx}`}>
                                <PlusCircleIcon />
                              </SelectItem>
                        })
                      }
                    </>
                    </SelectGroup>
                </SelectContent>
              </Select>
              <Dialog open={sectionName === `${sections.length}`} onOpenChange={(open) => {
                if (!open) setSectionName(prevSectionName);
                setSectionErrorMsg('');
              }}>
                <DialogContent>
                  <DialogTitle>สร้างมาตราใหม่</DialogTitle>
                  <DialogDescription>ใส่ชื่อมาตราที่ท่านต้องการเพิ่มในระบบ</DialogDescription>
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="new-section-name">ชื่อมาตรา</Label>
                      <Input id="new-section-name" name="new-section-name"
                        ref={newSectionNameRef} placeholder="ใส่ชื่อมาตรา..."
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          e.preventDefault();
                          setSectionErrorMsg('');
                        }}
                        />
                    </div>
                    <div className="text-destructive block h-8">{sectionErrorMsg}</div>
                  </div>
                  <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">ยกเลิก</Button>
                  </DialogClose>
                  <Button
                    onClick={async(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      try {
                        const newSectionName = newSectionNameRef?.current?.value;
                        if (!newSectionName || newSectionName === '') {
                          setSectionErrorMsg("กรุณาใส่ชื่อมาตราให้ถูกต้อง");
                          return;
                        }
                       else if ((sections as Section[]).map((e) => e.name).includes(newSectionName)) {
                          setSectionErrorMsg("ชื่อมาตราซ้ำ");
                          return;
                       }

                       const newSection: Section = await createSection({
                        name: newSectionName
                       });
                       setSectionName(newSection.name);

                       const newSections = await getSections();
                       setSections(newSections??[]);

                      } catch (error) {
                        setSectionErrorMsg("ไม่สามารถสร้างมาตราใหม่ได้");
                        if (isAuthError(error))
                          RedirectToLogin();
                      }
                    }}
                  >ตกลง</Button>
                </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={sectionDeleteOpen} onOpenChange={(open) => {
                setSectionDeleteOpen(open);
                setSectionErrorMsg('');
              }}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>
                    ลบมาตรา
                  </DialogTitle>
                  <DialogDescription>
                    ท่านต้องการลบมาตรา &quot;{sectionName}&quot; หรือไม่?
                  </DialogDescription>
                  <div className="text-destructive block h-8">{sectionErrorMsg}</div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">ยกเลิก</Button>
                    </DialogClose>
                    <Button variant="destructive"
                      onClick={async(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        const currentSectionName = sectionName;
                        try {
                          const rmvSection = (sections as Section[]).find((e) => e.name === currentSectionName);
                          if (!rmvSection) {
                            setSectionErrorMsg(`ไม่สามารถลบ "${currentSectionName}" ได้`);
                            return;
                          }
                          await removeSection(rmvSection.id);
                          setSectionDeleteOpen(false);
                          const sectionData = await getSections();
                          setSectionName('');
                          setSections(sectionData?? []);
                        } catch (error) {
                          setSectionErrorMsg(`ไม่สามารถลบ "${currentSectionName}" ได้`);
                          if (isAuthError(error)) 
                            RedirectToLogin();
                        }
                      }}
                    >ยืนยัน</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              </div>
            </div>
            <Button type="submit" className="hidden" ref={submitRef}>Submit</Button>
        </form>
    </Form>
      <BookCard ispData={isps} groupId={groupId} sectionName={sectionName}/>
      { (sectionName === '' || sectionName === 'ปกติ')? children: <></> }
      {(sectionName != '' && sectionName != 'ปกติ') && <Textarea className='h-64' placeholder="กรอกข้อความเพื่อส่งเมล..."
        value={textareaValue}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTextareaValue(e.target.value)}
        onKeyDown={async(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if (e.key === "Tab") {
            // Handle tab insertion
            e.preventDefault();
            const { selectionStart, selectionEnd } = e.currentTarget;
            const newValue =
              textareaValue.substring(0, selectionStart) +
              "\t" +
              textareaValue.substring(selectionEnd);
            setTextareaValue(newValue);
            setTimeout(() => {
              e.currentTarget.selectionStart = e.currentTarget.selectionEnd = selectionStart + 1;
            }, 0);
          } 
          else if (e.key === "Enter" && !e.shiftKey) {
            // Enter without Shift → blur
            e.preventDefault();
            try {
              await updateField({
                kind: 'body',
                value: textareaValue
              });
            } catch (error) {
              if (isAuthError(error))
                RedirectToLogin();
            }
            e.currentTarget.blur();
          } 
          else if (e.key === "Enter" && e.shiftKey) {
            // Shift + Enter → newline
            e.preventDefault();
            const { selectionStart, selectionEnd } = e.currentTarget;
            const newValue =
              textareaValue.substring(0, selectionStart) +
              "\n" +
              textareaValue.substring(selectionEnd);
            setTextareaValue(newValue);
            setTimeout(() => {
              e.currentTarget.selectionStart = e.currentTarget.selectionEnd = selectionStart + 1;
            }, 0);
          }
        }}
      />}
      <div className='w-full flex justify-center items-center gap-x-4'>
        <Button variant="secondary"
          onClick={async(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            try {
              
              const saveDocumentNo = form.watch('documentNo')?? '';
              const saveDate = date ? date?.toISOString() : null;
              const saveTitle = form.watch('title')?? '';
              const saveSpeed = typeof speed === 'string' && speed != ''? parseInt(speed): null;
              const saveSecret = typeof secret === 'string' && secret != ''? parseInt(secret): null;
              const saveSectionId = typeof sectionName === 'string' && sectionName != ''? 
                (sections as Section[]).find((e) => typeof e?.name === 'string' && e?.name === sectionName)?.id?? null: null;
              const saveBody = textareaValue;

              await saveGroup({
                groupId,
                documentNo: saveDocumentNo,
                title: saveTitle,
                documentDate: saveDate,
                speed: saveSpeed,
                secret: saveSecret,
                body: saveBody,
                sectionId: saveSectionId
              })
           
                dispatch(openAlertModal(ALERTUI.successful_groupsave));
            } catch (error) {
              console.log(error)
              if (isAuthError(error)) RedirectToLogin();
              else {
                dispatch(openAlertModal(ALERTUI.fail_groupsave));
              }
            }
          }}
        >บันทึก</Button>
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