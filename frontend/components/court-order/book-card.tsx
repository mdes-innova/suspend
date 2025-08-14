'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusCircleIcon, Check, CircleX, FilePenLine, ArrowDownToLine} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { useRef, useState,  ChangeEvent, useEffect } from "react";
import { GroupFile, type Isp } from "@/lib/types";
import { downloadFile, Edit, GetFilesFromGroup, RemoveFile, uploadFile } from "../actions/group-file";
import { AuthError } from "../exceptions/auth";

export function BookCard({ispData, fileData, groupId}:
  {ispData: Isp[], fileData: GroupFile[], groupId: number}) {
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const [ispSelected, setIspSelected] = useState<Isp | null>(null);
  const [selectedIsps, setSelectedIsps] = useState<Isp[]>([]);
  const [tableData, setTableData] = useState<GroupFile[]>(fileData);
  const [openNew, setOpenNew] = useState<number | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  useEffect(() => {
    if (openNew === null || openNew === -1) {
      setFilename(null);
      setIspSelected(null);
      const ispList = tableData
        ?.map((e: GroupFile) => e.isp)
        .filter((isp: Isp | undefined): isp is Isp => isp !== undefined);

      if (ispList && ispList.length > 0) {
        setSelectedIsps(ispList);
      }
    } else {
      const currentRow = tableData?.[openNew];
      if (!currentRow) return;
      const currentIsp = currentRow.isp;
      const currentFile = currentRow.originalFilename;
      setIspSelected(currentIsp?? null);
      if (currentIsp)
        setSelectedIsps((prev: Isp[]) => {
          return prev.filter((isp) => isp.id !== currentIsp.id);
        });
      setFilename(currentFile?? "");
    }
  }, [openNew])

  useEffect(() => {
  const ispList = tableData
    ?.map((e: GroupFile) => e.isp)
    .filter((isp: Isp | undefined): isp is Isp => isp !== undefined);

  setSelectedIsps(ispList ?? []);
}, [tableData]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>เอกสารหนังสือ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col w-full items-start justify-center gap-4">
          <EditDialog groupId={groupId} filename={filename??""} ispData={ispData} ispSelected={ispSelected} openNew={openNew} 
            selectedIsps={selectedIsps} setFilename={setFilename} setIspSelected={setIspSelected} 
            setOpenNew={setOpenNew} setSelectedIsps={setSelectedIsps} setTableData={setTableData} 
            tableData={tableData} uploadRef={uploadRef}/>
      
          <Button className="w-fit" onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            setOpenNew(-1);
          }}>
                <PlusCircleIcon size={32}/><span>เพิ่ม ISP</span>
          </Button>
          <Table className='overflow-y-hidden'>
            <TableHeader>
              <TableRow className="hover:bg-background">
                <TableHead className="w-[20px]">#</TableHead>
                <TableHead className="w-[400px]">ชื่อเอกสาร</TableHead>
                <TableHead className='w-[200px]'>ISP</TableHead>
                <TableHead className="w-[50px] text-right">แก้ไข</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {tableData.length > 0 ? (
                  <TableData tableData={tableData} setTableData={setTableData} setOpenNew={setOpenNew} 
                     groupId={groupId}
                  />
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                      No data to display
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
      </CardContent>
    </Card>
  )
}

function TableData({groupId, tableData, setTableData, setOpenNew}:
  {
    tableData: GroupFile[], setTableData: React.Dispatch<React.SetStateAction<GroupFile[]>>,
    setOpenNew: React.Dispatch<React.SetStateAction<number | null>>, groupId: number,
  }) {
  return (
    <>
      {
        tableData.map((e: GroupFile, idx: number) => {
          return <TableRow key={`table-cell-${idx}`}>
            <TableCell className='w-[20px]'>{idx + 1}</TableCell>
            <TableCell className='max-w-[400px]'>
              <div className='w-full h-full flex'>
              <ArrowDownToLine size={16} className='cursor-pointer'
              onClick={async(evt: React.MouseEvent<SVGSVGElement>) => {
                evt.preventDefault();
                const fileName = e.originalFilename;
                const fileId = e.id;
                try {
                  const blob = await downloadFile(fileId as number);
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", `${fileName}`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                 console.error(error);
                 if (error instanceof AuthError)
                  if (window)
                    window.location.reload();
                }
              }}/>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className='w-full truncate'>
                    {e.originalFilename}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{e.originalFilename}</p>
                </TooltipContent>
              </Tooltip>

              </div>
            </TableCell>
            <TableCell className='w-[200px]'>{e?.isp?.name?? '-'}</TableCell>
            <TableCell className='text-right  flex justify-end w-full px-0'>
              <div className="flex gap-x-1">
                <FilePenLine size={24} className='cursor-pointer'
                onClick={(evt: React.MouseEvent<SVGSVGElement>) => {
                  evt.preventDefault();
                  setOpenNew(idx);
                }}/>
                <CircleX className='hover:text-red-400' size={24}
                onClick={async(evt: React.MouseEvent<SVGSVGElement>) => {
                  evt.preventDefault();
                  try {
                    await RemoveFile(e.id as number);
                    const newData = await GetFilesFromGroup(groupId);
                    setTableData(newData);
                  } catch (error) {
                    if (error instanceof AuthError)
                      if (window)
                        window.location.reload();
                  }
                }}
                />
              </div>
            </TableCell>
          </TableRow>
        })
      }
    </>
  );
}

function EditDialog({groupId, openNew, setOpenNew, ispSelected, setIspSelected,
  ispData, selectedIsps, filename, setFilename, uploadRef, tableData, setTableData}:
  {
    groupId: number,
    openNew: number | null,
    setOpenNew: React.Dispatch<React.SetStateAction<number | null>>,
    ispSelected: Isp | null,
    setIspSelected: React.Dispatch<React.SetStateAction<Isp | null>>,
    ispData: Isp[],
    selectedIsps: Isp[],
    setSelectedIsps: React.Dispatch<React.SetStateAction<Isp[]>>,
    filename: string,
    setFilename: React.Dispatch<React.SetStateAction<string | null>>,
    uploadRef: React.RefObject<HTMLInputElement | null>,
    tableData: GroupFile[],
    setTableData: React.Dispatch<React.SetStateAction<GroupFile[]>>
  }) {
 return (
   <Dialog open={openNew != null? true: false} onOpenChange={(open: boolean) => {
      if (!open) setOpenNew(null);
          }}>
            <form>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>เพิ่มรายชื่อ ISP</DialogTitle>
                  <DialogDescription>
                    เพิ่มรายชื่อ ISP ที่จะได้รับคำสั่งสารและแนบเอกสารเพิ่มเติมให้แต่ละราย ISP 
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-3">
                     <Select
                      name="isp-user"
                      required
                      value={ispSelected != null? `${ispSelected.id}`: ''}
                      onValueChange={(value: string) => {
                        setIspSelected(ispData.find((e: Isp) => e.id === parseInt(value)) ?? null);
                      }}
                    >
                      <SelectTrigger className="w-full" >
                        <SelectValue placeholder="เลือก ISP" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectGroup>
                          <SelectLabel>ISP</SelectLabel>
                          <>
                            {ispData.map((e: Isp, idx: number) => {
                              const isSelected = selectedIsps.map((ee: Isp) => `${ee.id}`).includes(`${e.id}`);
                              return (<SelectItem disabled={isSelected? true: false}
                              className={isSelected? 'flex items-center justify-start': ''}
                               key={`isp-${idx}`} value={`${e.id}`}>
                              <span>{e.name}</span>
                              {isSelected && (
                                  <Check className="h-4 w-4 text-green-500" />
                                )}
                                </SelectItem>);
                            })}
                          </>
                          </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-3">
                    {
                      !filename?
                      <>
                        <Button variant='outline' onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.preventDefault();
                          if (uploadRef.current) uploadRef.current.click();
                        }}>อัพโหลดเอกสาร</Button>
                        <Input
                          ref={uploadRef}
                          id="isp-pdf-upload"
                          type="file"
                          accept="application/pdf"
                          onChange={ async (e: ChangeEvent<HTMLInputElement>) => {
                            if (e?.target?.files && e?.target?.files.length > 0) {
                              setFilename(e.target.files[0].name);
                            }
                          }}
                          className="hidden"
                        />
                      </>:
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                              <p className='truncate w-full text-accent p-0 underline cursor-default'
                              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                                e.preventDefault();
                                if (uploadRef.current) uploadRef.current.click();
                              }}>{filename}</p>
                          </TooltipTrigger>
                            <TooltipContent>
                              <p>{filename}</p>
                            </TooltipContent>
                        </Tooltip>
                        <Input
                          ref={uploadRef}
                          id="isp-pdf-upload"
                          type="file"
                          accept="application/pdf"
                          onChange={ async (e: ChangeEvent<HTMLInputElement>) => {
                            if (e?.target?.files && e?.target?.files.length > 0) {
                              setFilename(e.target.files[0].name);
                            }
                          }}
                          className="hidden"
                        />
                      </>
                    }
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">ยกเลิก</Button>
                  </DialogClose>
                  {
                    openNew === -1 &&
                    <Button type="submit" onClick={async(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      if (!filename || !ispSelected) return;
                      const files = uploadRef?.current?.files;
                      if (!files || !(files.length)) return;
                      
                      try {
                        const formData = new FormData();
                        formData.append("file", files[0]);
                        formData.append("isp", `${ispSelected.id}`);
                        formData.append("group", `${groupId}`);
                        await uploadFile({
                          formData
                        });
                        const newData = await GetFilesFromGroup(groupId);
                        setTableData(newData);
                        setOpenNew(null);
                      } catch (error) {
                        if (error instanceof AuthError)  
                          if (window)
                            window.location.reload();
                      }
                    }}>เพิ่ม</Button>
                  }
                  {
                    openNew != null && openNew > -1 &&
                    <Button type="submit" onClick={async(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      if (!filename || !ispSelected) return;
                      try {
                        const files = uploadRef?.current?.files;
                        if (!files || !(files.length)) {
                          if (ispSelected != tableData[openNew].isp) {
                            await Edit({
                              fid: tableData[openNew].id as number,
                              isp: `${ispSelected.id}`
                            });
                          }
                        } else {
                          await Edit({
                            fid: tableData[openNew].id as number,
                            isp: ispSelected.id != tableData[openNew]?.isp?.id? `${ispSelected.id}`: undefined,
                            file: files[0]
                          });
                        }
                        const newData = await GetFilesFromGroup(groupId);
                        setTableData(newData);
                        setOpenNew(null);
                      } catch (error) {
                        if (error instanceof AuthError)
                          if (window)
                            window.location.reload();
                      }
                    }}>แก้ไข</Button>
                  }
                </DialogFooter>
              </DialogContent>
            </form>
          </Dialog>
 );
}