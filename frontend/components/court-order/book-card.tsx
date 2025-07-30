'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ISPS } from "@/lib/constants";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { useRef, useState,  ChangeEvent, useEffect } from "react";
import { type Isp } from "@/lib/types";
import { downloadPdf, uploadFile } from "../actions/file";

type TableDataType = {
  fileId: number,
  filename: string,
  isp: string,
}

export function BookCard({ispData, data}: {ispData: Isp[], data?: TableDataType}) {
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const [ispSelected, setIspSelected] = useState('');
  const [selectedIsps, setSelectedIsps] = useState<string[]>([]);
  const [tableData, setTableData] = useState(data?? []);
  const [openNew, setOpenNew] = useState<number | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  // const handleFileChange = async (e: ChangeEvent<HTMLInputElement>, idx: number) => {
  //   const files = e.target.files;
  //   const file = (files && files.length > 0)? files[0]: null ;
  //   if (!file) return;

  //   if (file.type !== "application/pdf") {
  //       alert("Please select a PDF file.");
  //       return;
  //   }

  //   const formData = new FormData();
  //   formData.append("file", file);

  //   try {
  //     const data = await uploadFile({
  //       formData,
  //       kind: 'pdf'
  //     });
  //     setTableData((prev: TableDataType[]) => {
  //       const updated = [...prev];
  //       updated.push({
  //         fileId: data.id,
  //         filename: data.name,
  //         isp: currentSelectedRef.current.value
  //       });
  //       return updated;
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     alert(error);
  //   }
  // }

  useEffect(() => {
    if (openNew === null || openNew === -1) {
      setFilename(null);
      setIspSelected('');
      const ispList = tableData?.map((e: TableDataType) => e.isp);
      setSelectedIsps(ispList?? []);
    } else {
      const currentIsp = (tableData as TableDataType[])[openNew].isp;
      const currentFile = (tableData as TableDataType[])[openNew].filename;
      // const currentIsp = `${ispData[currentIspIndex].ispId}`
      setIspSelected(currentIsp);
      setSelectedIsps((prev: string[]) => {
        const updated = [...prev];
        return updated.filter((isp: string) => isp != currentIsp);
      });
      setFilename(currentFile);
    }
  }, [openNew])

  useEffect(() => {
    const ispList = tableData?.map((e: TableDataType) => e.isp);
    setSelectedIsps(ispList?? []);
  }, [tableData]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>เอกสารหนังสือ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col w-full items-start justify-center gap-4">
          <EditDialog filename={filename} ispData={ispData} ispSelected={ispSelected} openNew={openNew} 
            selectedIsps={selectedIsps} setFilename={setFilename} setIspSelected={setIspSelected} 
            setOpenNew={setOpenNew} setSelectedIsps={setSelectedIsps} setTableData={setTableData} 
            tableData={tableData} uploadRef={uploadRef}/>
      
          <Button className="w-fit" onClick={(e: any) => {
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
                  <TableData tableData={tableData} ispData={ispData} setTableData={setTableData} setOpenNew={setOpenNew} 
                    setIspSelected={setIspSelected} setSelectedIsps={setSelectedIsps}
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

function TableData({tableData, setTableData, ispData, setOpenNew, setIspSelected, setSelectedIsps}:
  {tableData: any[], setTableData: React.Dispatch<React.SetStateAction<TableDataType[]>>,
    ispData: Isp[], setOpenNew: React.Dispatch<React.SetStateAction<number | null>>, 
    setIspSelected: React.Dispatch<React.SetStateAction<string>>,
    setSelectedIsps: React.Dispatch<React.SetStateAction<string[]>>,
  }) {
  return (
    <>
      {
        tableData.map((e: any, idx: number) => {
          const isp = (ispData.filter((isp: Isp) => isp.ispId === parseInt(e.isp)))[0]
          return <TableRow key={`table-cell-${idx}`}>
            <TableCell className='w-[20px]'>{idx + 1}</TableCell>
            <TableCell className='max-w-[400px]'>
              <div className='w-full h-full flex'>
              <ArrowDownToLine size={16} className='cursor-pointer' onClick={async(evt: any) => {
                evt.preventDefault();
                const fileName = (e as TableDataType).filename;
                const fileId = (e as TableDataType).fileId;
                try {
                  const blob = await downloadPdf(fileId);
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", `${fileName}`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                 console.error(error) 
                }
                // const x = await downloadPdf(fileId);
                // if (!response.ok) throw new Error("Download failed");
              }}/>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className='w-full truncate'>
                    {e.filename}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{e.filename}</p>
                </TooltipContent>
              </Tooltip>

              </div>
            </TableCell>
            <TableCell className='w-[200px]'>{isp.name}</TableCell>
            <TableCell className='text-right  flex justify-end w-full px-0'>
              <div className="flex gap-x-1">
                <FilePenLine size={24} className='cursor-pointer' onClick={(evt: any) => {
                  evt.preventDefault();
                  setOpenNew(idx);
                }}/>
                <CircleX className='hover:text-red-400' size={24} onClick={(e: any) => {
                  e.preventDefault();
                  setTableData((prev: TableDataType[]) => 
                    prev.filter((_, tableIdx) => tableIdx !== idx)
                  );
                }}/>
              </div>
            </TableCell>
          </TableRow>
        })
      }
    </>
  );
}

function EditDialog({idx, openNew, setOpenNew, ispSelected, setIspSelected,
  ispData, selectedIsps, filename, setFilename, uploadRef, tableData, setTableData}:
  {
    idx?: number,
    openNew: number | null,
    setOpenNew: React.Dispatch<React.SetStateAction<number | null>>,
    ispSelected: string,
    setIspSelected: React.Dispatch<React.SetStateAction<string>>,
    ispData: Isp[],
    selectedIsps: string[],
    setSelectedIsps: React.Dispatch<React.SetStateAction<string[]>>,
    filename: string,
    setFilename: React.Dispatch<React.SetStateAction<string>>,
    uploadRef: React.RefObject<HTMLInputElement>,
    tableData: TableDataType[],
    setTableData: React.Dispatch<React.SetStateAction<TableDataType[]>>
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
                      value={ispSelected}
                      onValueChange={(value: string) => {
                        // console.log(ispSelected)
                        setIspSelected(value);
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
                              const isSelected = selectedIsps.includes(`${e.ispId}`);
                              return (<SelectItem disabled={isSelected? true: false}
                              className={isSelected? 'flex items-center justify-start': ''}
                               key={`isp-${idx}`} value={`${e.ispId}`}>
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
                    {/* <Label htmlFor="name-1">เลือก ISP</Label>
                    <Input id="name-1" name="name" defaultValue="Pedro Duarte" /> */}
                  </div>
                  <div className="grid gap-3">
                    {/* <Label htmlFor="username-1">อับโหลดเอกสาร</Label> */}
                    {
                      !filename?
                      <>
                        <Button variant='outline' onClick={(e: any) => {
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
                              <p className='truncate w-full text-accent p-0 underline cursor-default' onClick={(e: any) => {
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
                    <Button type="submit" onClick={async(e: any) => {
                      e.preventDefault();
                      if (!filename || !ispSelected) return;
                      const files = uploadRef?.current?.files;
                      if (!files || !(files.length)) return;

                      const formData = new FormData();
                      formData.append("file", files[0]);
                      const data = await uploadFile({formData, kind: 'pdf'});
                      setTableData((prev: TableDataType[]) => {
                        const updated = [...prev];
                        updated.push({
                          fileId: data.id,
                          filename: data.name,
                          isp: ispSelected
                        });
                        return updated;
                      });
                      setOpenNew(null);

                    }}>เพิ่ม</Button>
                  }
                  {
                    openNew != null && openNew > -1 &&
                    <Button type="submit" onClick={async(e: any) => {
                      e.preventDefault();
                      if (!filename || !ispSelected) return;
                      const files = uploadRef?.current?.files;
                      if (!files || !(files.length)) {
                        setTableData((prev: TableDataType[]) => {
                          const updated = [...prev];
                          updated[openNew] = {
                            fileId: updated[openNew].fileId,
                            filename: updated[openNew].filename,
                            isp: ispSelected
                          };
                          return updated;
                        });
                      } else {
                        const formData = new FormData();
                        formData.append("file", files[0]);
                        const data = await uploadFile({formData, kind: 'pdf'});
                        setTableData((prev: TableDataType[]) => {
                          const updated = [...prev];
                          updated[openNew] = {
                            fileId: data.id,
                            filename: data.name,
                            isp: ispSelected
                          };
                          return updated;
                        });
                      }
                      setOpenNew(null);
                    }}>แก้ไข</Button>
                  }
                </DialogFooter>
              </DialogContent>
            </form>
          </Dialog>
 );
}