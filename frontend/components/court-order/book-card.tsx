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
import { type GroupFile, type Isp } from "@/lib/types";
import { downloadFile, Edit, GetFilesFromGroup, RemoveFile, uploadFile } from "../actions/group-file";
import { isAuthError } from '@/components/exceptions/auth';
import { redirectToLogin } from "../reload-page";

type TableType = {
  isp: Isp,
  groupFiles: GroupFile[]
}

async function getTableData (groupId: number, ispData: Isp[]){
  try {
    const data: GroupFile[] = await GetFilesFromGroup(groupId);
    const ispIds = [...new Set(data.map((e) => e.isp?.id))];
    const modData = ispIds.map((ispId) => {
      const isp = ispData.find((e) => e.id === ispId);
      if (!isp) return [];
      return (
        {
          isp,
          groupFiles: data.filter((ee) => ee.isp?.id === ispId)
        }
      );
    });
    return modData;
  } catch (error) {
    if (isAuthError(error)) redirectToLogin();
  }
}

export function BookCard({ispData, fileData, groupId}:
  {ispData: Isp[], fileData: GroupFile[], groupId: number}) {
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const [ispSelected, setIspSelected] = useState<Isp | null>(null);
  const [selectedIsps, setSelectedIsps] = useState<Isp[]>([]);
  const [tableData, setTableData] = useState<TableType[]>([]);
  const [openNew, setOpenNew] = useState<number | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [filename, setFilename] = useState<string | null>(null);


  useEffect(() => {
    const getData = async() => {
      const data = await getTableData(groupId, ispData);
      setTableData(data);
    }

    getData();
  }, []);

  useEffect(() => {
    if (openNew === null || openNew === -1) {
      setFilename(null);
      setIspSelected(null);
      const ispList = tableData
        ?.map((e: TableType) => e?.isp)
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
      setNewFiles([]);
    }

    setNewFiles([]);
  }, [openNew])

  useEffect(() => {
    const ispList = tableData
      ?.map((e: TableType) => e.isp)
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
            tableData={tableData} uploadRef={uploadRef}
            newFiles={newFiles} setNewFiles={setNewFiles}
            />
      
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
                     groupId={groupId} ispData={ispData}
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

function TableData({groupId, tableData, setTableData, setOpenNew, ispData}:
  {
    tableData: TableType[], setTableData: React.Dispatch<React.SetStateAction<TableType[]>>,
    setOpenNew: React.Dispatch<React.SetStateAction<number | null>>, groupId: number,
    ispData: Isp[]
  }) {
  return (
    <>
      {
        tableData.map((e: TableType, idx: number) => {
          return <TableRow key={`table-cell-${idx}`}>
            <TableCell className='w-[20px]'>
              {idx + 1}
              </TableCell>
            <TableCell className='max-w-[400px] flex flex-col items-start'>
              {
                e.groupFiles.map((ee, idx2) => 
                  <div className='w-full h-full flex' key={`isp-file-${idx}-${idx2}`}>
                    <ArrowDownToLine size={16} className='cursor-pointer'
                    onClick={async(evt: React.MouseEvent<SVGSVGElement>) => {
                      evt.preventDefault();
                      const fileName = ee.originalFilename;
                      const fileId = ee.id;
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
                      if (isAuthError(error))
                        redirectToLogin(); 
                      }
                    }}/>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className='w-full truncate'>
                          {ee.originalFilename}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{ee.originalFilename}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )
              }
            </TableCell>
            <TableCell className='w-[200px]'>{e?.isp?.name?? '-'}</TableCell>
            <TableCell className='w-[200px]'>
              <div className="flex gap-x-1 justify-end">
                <FilePenLine size={24} className='cursor-pointer'
                onClick={(evt: React.MouseEvent<SVGSVGElement>) => {
                  evt.preventDefault();
                  setOpenNew(idx);
                }}/>
                <CircleX className='hover:text-red-400' size={24}
                onClick={async(evt: React.MouseEvent<SVGSVGElement>) => {
                  evt.preventDefault();
                  try {
                    const gfs = tableData[idx].groupFiles;
                    for (const gf of gfs) {
                      await RemoveFile(gf.id as number);
                    }
                    const newData = await getTableData(groupId, ispData);
                    setTableData(newData);
                  } catch (error) {
                    if (isAuthError(error))
                      redirectToLogin(); 
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
  ispData, selectedIsps, filename, setFilename, uploadRef, tableData, setTableData,
  newFiles, setNewFiles
}:
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
    tableData: TableType[],
    setTableData: React.Dispatch<React.SetStateAction<TableType[]>>,
    newFiles: File[],
    setNewFiles: React.Dispatch<React.SetStateAction<File[]>>
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
                      openNew === -1?
                      <></>
                      :
                      tableData[openNew as number]?.groupFiles?.map((gf, gfIdx) => {
                        return (
                          <div className="w-96 flex justify-between" key={`gf-${gfIdx}`}>
                            <Tooltip>
                            <TooltipTrigger asChild>
                              <p className='truncate w-full text-accent p-0 underline cursor-default'
                                onClick={async(e: React.MouseEvent<HTMLDivElement>) => {
                                  e.preventDefault();
                                  try {
                                    const blob = await downloadFile(gf.id as number);
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.setAttribute("download", `${gf.originalFilename}`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    window.URL.revokeObjectURL(url);
                                  } catch (error) {
                                    if (isAuthError(error))
                                      redirectToLogin();
                                    
                                  }
                              }}>{gf.originalFilename}</p>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{gf.originalFilename}</p>
                              </TooltipContent>
                            </Tooltip>
                            <CircleX className='hover:text-red-400' size={24}
                              onClick={(evt: React.MouseEvent<SVGSVGElement>) => {
                              evt.preventDefault();
                              setTableData((prev: TableType[]) => {
                                const idx = typeof openNew === "number" ? openNew : -1;
                                if (idx < 0 || idx >= prev.length) return prev;
                                
                                const row = prev[idx];
                                if (!row) return prev;
                                const filtered = row.groupFiles.filter(e => e.id !== gf.id);
                                if (filtered.length === row.groupFiles.length) return prev;

                                const updated = [...prev];
                                updated[idx] = { ...row, groupFiles: filtered };
                                return updated;
                              });
                            }}
                            />
                          </div>
                        );
                      })
                    }
                    {newFiles.map((nf, nfIdx) => {
                      return (
                        <div className="w-96 flex justify-between" key={`gf-${nfIdx}`}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p
                                className="truncate w-full text-accent p-0 underline cursor-default"
                                onClick={(e: React.MouseEvent<HTMLParagraphElement>) => {
                                  e.preventDefault();
                                  const url = window.URL.createObjectURL(nf);
                                  const link = document.createElement("a");
                                  link.href = url;
                                  link.setAttribute("download", nf.name);
                                  document.body.appendChild(link);
                                  link.click();
                                  link.remove();
                                  window.URL.revokeObjectURL(url);
                                }}
                              >
                                {nf.name}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{nf.name}</p>
                            </TooltipContent>
                          </Tooltip>

                          <CircleX
                            className="hover:text-red-400"
                            size={24}
                            onClick={(evt: React.MouseEvent<SVGSVGElement>) => {
                              evt.preventDefault();
                              setNewFiles((prev: File[]) => prev.filter((_, nnfIdx) => nnfIdx !== nfIdx));
                            }}
                          />
                        </div>
                      );
                    })} 
                    <Button variant='outline' onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      if (uploadRef.current) uploadRef.current.click();
                    }}>อัพโหลดเอกสาร</Button>
                    <Input
                      ref={uploadRef}
                      id="isp-pdf-upload"
                      type="file"
                      accept="application/pdf"
                      multiple
                      onChange={ async (e: ChangeEvent<HTMLInputElement>) => {
                        if (e?.target?.files && e?.target?.files.length > 0) {
                          setNewFiles((prev: File[]) => {
                            const updated = [...prev, ...e?.target?.files];
                            return updated;
                          });
                        }
                      }}
                      className="hidden"
                    />
                        {/* <Tooltip>
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
                        /> */}

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
                      try {
                        for (const nf of newFiles) {
                          const formData = new FormData();
                          formData.append("file", nf);
                          if (!ispSelected)
                            return;
                          formData.append("isp", `${ispSelected?.id}`);
                          formData.append("group", `${groupId}`);
                          await uploadFile({
                            formData
                          });
                        }
                        const newData = await getTableData(groupId, ispData);
                        setTableData(newData);
                        setOpenNew(null);
                      } catch (error) {
                        if (isAuthError(error))  
                          redirectToLogin(); 
                      }
                    }}>เพิ่ม</Button>
                  }
                  {
                    openNew != null && openNew > -1 &&
                    <Button type="submit" onClick={async(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      try {
                        const idx = typeof openNew === 'number'? openNew: -1;
                        if (idx < 0 || idx >= tableData.length) return;

                        const row = tableData[idx];
                        const orgGroupFiles: GroupFile[] = await GetFilesFromGroup(groupId);
                        const orgGroupFileIsp = orgGroupFiles.filter((e) => e.isp?.id === row.isp.id);
                        const tableGroupFilesids = row.groupFiles.map((e) => e?.id);
                        const rmvGroupFiles = orgGroupFileIsp.filter((e) => !(tableGroupFilesids.includes(e.id)));

                        for (const gf of rmvGroupFiles) {
                          if (gf && gf?.id)
                            await RemoveFile(gf.id);
                        }
                        
                         for (const nf of newFiles) {
                          const formData = new FormData();
                          formData.append("file", nf);
                          if (!ispSelected)
                            return;
                          formData.append("isp", `${ispSelected?.id}`);
                          formData.append("group", `${groupId}`);
                          await uploadFile({
                            formData
                          });
                        }

                        const newData = await getTableData(groupId, ispData);
                        setTableData(newData);
                        setOpenNew(null);
                      } catch (error) {
                        if (isAuthError(error))
                          redirectToLogin(); 
                      }
                    }}>แก้ไข</Button>
                  }
                </DialogFooter>
              </DialogContent>
            </form>
          </Dialog>
 );
}