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
import {  type GroupFile, type Isp, type GroupFileTable, type Group } from "@/lib/types";
import { downloadFile, GetFilesFromGroup, RemoveFile, uploadFile } from "../actions/group-file";
import { isAuthError } from '@/components/exceptions/auth';
import { redirectToLogin } from "../reload-page";
import { useAppSelector } from "../store/hooks";
import { RootState } from "../store";
import { getGroup } from "../actions/group";

async function getTableData(
  groupId: number,
  ispData: Isp[],
  section?: string
): Promise<GroupFileTable[]> {
  try {
    let size = 0;

    const group: Group = await getGroup(groupId);
    const groupFilesData = group?.groupFiles?? [];
    const groupDocuments = group?.documents?? [];

    const ispIds = Array.from(
      new Set(
        groupFilesData
          .map(e => e.isp?.id)
          .filter((id): id is number => id != null && id != undefined)
      )
    );
    for (const d of groupDocuments ?? []) size += (d?.documentFile?.size ?? 0);

    const rows: GroupFileTable[] = ispIds.flatMap((ispId) => {
      const isp = ispData.find(e => e.id === ispId);
      const groupFilesIsp = groupFilesData.filter((e) => e?.isp?.id === ispId);
      for (const f of groupFilesIsp) size += (f?.size ?? 0);
      if (section != undefined && section != '' && section != '0') {
        const ispFilesAll = groupFilesData.filter((e) => e?.allIsp);
        for (const f of ispFilesAll) size += (f?.size ?? 0);
      }
      if (!isp) return [];
      return [{
        isp,
        groupFiles: groupFilesData.filter(ee => ee.isp?.id === ispId),
        size,
      }];
    });

    return rows;
  } catch (error) {
    if (isAuthError(error)) {
      redirectToLogin();
    }
    return [];
  }
}

async function getFilesAllData(
  groupId: number,
  section?: string
): Promise<GroupFile[]> {
  try {
    let size = 0;

    const group: Group = await getGroup(groupId);
    const groupFilesData = group?.groupFiles?? [];
    const groupDocuments = group?.documents?? [];

    const ispIds = Array.from(
      new Set(
        groupFilesData
          .map(e => e.isp?.id)
          .filter((id): id is number => id != null)
      )
    );
    for (const d of groupDocuments ?? []) size += (d?.documentFile?.size ?? 0);

    const rows: GroupFileTable[] = ispIds.flatMap((ispId) => {
      const isp = ispData.find(e => e.id === ispId);
      const groupFilesIsp = groupFilesData.filter((e) => e?.isp?.id === ispId);
      for (const f of groupFilesIsp) size += (f?.size ?? 0);
      if (!isp) return [];
      return [{
        isp,
        groupFiles: groupFilesData.filter(ee => ee.isp?.id === ispId),
        size,
      }];
    });

    return rows;
  } catch (error) {
    if (isAuthError(error)) {
      redirectToLogin();
    }
    return [];
  }
}

export function BookCard({ispData, groupId, section}:
  {ispData: Isp[], groupId: number, section: string}) {
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const uploadIspAllRef = useRef<HTMLInputElement | null>(null);
  const [ispSelected, setIspSelected] = useState<Isp | null>(null);
  const [selectedIsps, setSelectedIsps] = useState<Isp[]>([]);
  const [tableData, setTableData] = useState<GroupFileTable[]>([]);
  const [openNew, setOpenNew] = useState<number | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [ispFilesAll, setIspFilesAll] = useState<GroupFile[]>([]);

  const groupDocuments = useAppSelector((state: RootState) => state.groupUi.documents);

  useEffect(() => {
    const getData = async() => {
      const data: GroupFileTable[] = await getTableData(groupId, ispData, section);
      setTableData((data ?? []) as GroupFileTable[]);
    }

    getData();
  }, [groupDocuments, ispFilesAll, section]);

  useEffect(() => {
    const getData = async() => {
      const groupFiles: GroupFile[] = await GetFilesFromGroup(groupId);
      const allFilesIsp = groupFiles.filter((e) => e?.allIsp);
      setIspFilesAll(allFilesIsp);
    }

    getData();
  }, [section]);

  useEffect(() => {
    if (openNew === null || openNew === -1) {
      setIspSelected(null);
      const ispList = tableData
        ?.map((e: GroupFileTable) => e?.isp)
        .filter((isp: Isp | undefined): isp is Isp => isp !== undefined);

      if (ispList && ispList.length > 0) {
        setSelectedIsps(ispList);
      }
    } else {
      const currentRow = tableData?.[openNew];
      if (!currentRow) return;
      const currentIsp = currentRow.isp;
      setIspSelected(currentIsp?? null);
      if (currentIsp)
        setSelectedIsps((prev: Isp[]) => {
          return prev.filter((isp) => isp.id !== currentIsp.id);
        });
      setNewFiles([]);
    }

    setNewFiles([]);
  }, [openNew])

  useEffect(() => {
    const ispList = tableData
      ?.map((e: GroupFileTable) => e.isp)
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
          <EditDialog groupId={groupId} ispData={ispData} ispSelected={ispSelected} openNew={openNew} 
            selectedIsps={selectedIsps} setIspSelected={setIspSelected} 
            setOpenNew={setOpenNew} setSelectedIsps={setSelectedIsps} setTableData={setTableData} 
            tableData={tableData} uploadRef={uploadRef}
            newFiles={newFiles} setNewFiles={setNewFiles}
            />
          {
            section != '0' && section != '' &&
            <div className="flex flex-col w-full">
              <Button variant='secondary' className="w-fit px-2 py-1" onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                if (uploadIspAllRef.current) uploadIspAllRef.current.click();
              }}>อัพโหลดเอกสาร</Button>
              <Input
                ref={uploadIspAllRef}
                id="isp-all-pdf-upload"
                type="file"
                accept=".pdf,.xlsx,.xls"
                multiple
                onChange={ async (e: ChangeEvent<HTMLInputElement>) => {
                  const files = e.currentTarget.files;
                  if (!files || files.length === 0) return;

                  const selected: File[] = Array.from(files);
                  Promise.all(
                    selected.map(async (file: File) => {
                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("all_isp", String(true));
                      formData.append("group", String(groupId));
                      
                      await uploadFile({
                        formData
                      });
                      
                      const groupFiles: GroupFile[] = await GetFilesFromGroup(groupId);
                      const allFilesIsp = groupFiles.filter((e) => e?.allIsp);
                      setIspFilesAll(allFilesIsp);
                    })
                  );
                }}
                className="hidden"
              />
              <div className="flex flex-col gap-y-2 mt-4 w-full">
              {
                ispFilesAll.map((e: GroupFile) => {
                  const filename = e?.originalFilename?? '-';
                  const fileSplited = filename.split('.');
                  const fileExt = fileSplited[fileSplited.length - 1];
                  const bg = (['xlsx', 'xls'].includes(fileExt))? 'bg-green-200': 'bg-background'
                  return <div className="flex w-full gap-x-1">
                    <div className="w-full">
                      <Button variant="outline" className={`w-full ${bg}`}
                        onClick={async(evt: React.MouseEvent<SVGSVGElement>) => {
                        evt.preventDefault();
                        const fileId = e.id;
                        try {
                          const blob = await downloadFile(fileId as number);
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.setAttribute("download", `${filename}`);
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          window.URL.revokeObjectURL(url);
                        } catch (error) {
                        console.error(error);
                        if (isAuthError(error))
                          redirectToLogin(); 
                        }
                      }}  
                      >
                        {filename}
                      </Button>
                    </div>
                    <div className="w-10">
                      <Button variant="destructive" className="w-full"
                        onClick={async(evt: React.MouseEvent<HTMLButtonElement>) => {
                          evt.preventDefault();
                          if (e?.id)
                            await RemoveFile(e?.id);
                          const groupFiles: GroupFile[] = await GetFilesFromGroup(groupId);
                          const allFilesIsp = groupFiles.filter((e) => e?.allIsp);
                          setIspFilesAll(allFilesIsp);
                        }}
                      >
                        <CircleX />
                      </Button>
                    </div>
                  </div>
                })
              }
              </div>
            </div>
          }

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
                <TableHead className='w-[50px]'>ขนาดไฟล์</TableHead>
                <TableHead className="w-[50px] text-right">แก้ไข</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {tableData?.length > 0 ? (
                  <TableData tableData={tableData} setTableData={setTableData} setOpenNew={setOpenNew} 
                     groupId={groupId} ispData={ispData}
                  />
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
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
    tableData: GroupFileTable[], setTableData: React.Dispatch<React.SetStateAction<GroupFileTable[]>>,
    setOpenNew: React.Dispatch<React.SetStateAction<number | null>>, groupId: number,
    ispData: Isp[]
  }) {

  return (
    <>
      {
        tableData.map((e: GroupFileTable, idx: number) => {
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
            <TableCell className='w-[200px]'>{e?.size? (e.size/(1024 * 1024)).toFixed(2): '-'} MB</TableCell>
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
                    const newData: GroupFileTable[] = await getTableData(groupId, ispData);
                    setTableData((newData?? []) as GroupFileTable[]);
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
  ispData, selectedIsps, uploadRef, tableData, setTableData,
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
    uploadRef: React.RefObject<HTMLInputElement | null>,
    tableData: GroupFileTable[],
    setTableData: React.Dispatch<React.SetStateAction<GroupFileTable[]>>,
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
                      openNew === -1 || !tableData ?
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
                              setTableData((prev: GroupFileTable[]) => {
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
                        const files = e.currentTarget.files;
                        if (!files || files.length === 0) return;

                        const selected = Array.from(files);
                        setNewFiles((prev: File[]) =>  [...prev, ...selected]);
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
                        const newData: GroupFileTable[] = await getTableData(groupId, ispData);
                        setTableData((newData?? []) as GroupFileTable[]);
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

                        const newData: GroupFileTable[] = await getTableData(groupId, ispData);
                        setTableData((newData?? []) as GroupFileTable[]);
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