'use client';

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { PlusCircleIcon, Save, X } from "lucide-react";
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
import { useRef, useState } from 'react';
import { usePathname } from "next/navigation";
import DatePicker from "../date-picker";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function CourtCard() {
  const inputRefs = useRef<Array<Array<React.RefObject<HTMLInputElement | null>>>>([
    [useRef(null), useRef(null), useRef(null), useRef(null)]
  ]);

  const [numItems, setNumItems] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<(string | null)[]>([null]);
  const [downloadFiles, setDownloadFiles] = useState<(number | null)[]>([null]);
  const pathname = usePathname();
  const [uploading, setUploading] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleButtonClick = (e: any) => {
    e.preventDefault();
    const newRow = [
        React.createRef<HTMLInputElement>(),
        React.createRef<HTMLInputElement>(),
        React.createRef<HTMLInputElement>(),
        React.createRef<HTMLInputElement>()
    ];
    inputRefs.current.push(newRow);
    uploadedFiles.push(null);
    downloadFiles.push(null);
    setNumItems(prev => prev + 1);
  };

  const clearItems = (e: any) => {
    e.preventDefault();
    inputRefs.current = [
      [React.createRef(), React.createRef(), React.createRef(), React.createRef()]
    ];
    setUploadedFiles([null]);
    setDownloadFiles([null]);
    setNumItems(1);
  }

  const handleDownload = async (idx: number) => {
    try {
      const fileName = uploadedFiles[idx];
      const response = await fetch(
        'api/download/pdf/',
        {
          method: "POST",
          credentials: 'include',
          body: JSON.stringify({
            docId: downloadFiles[idx],
            documentName: fileName,
            pathname
          })
        }
      );
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
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
      alert("Failed to download document.");
    }
  }

  const handleFileChange = async (e: any, idx: number) => {
    const file = e.target.files[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
          alert("Please select a PDF file.");
          return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("pathname", pathname);
      formData.append("title", "Title 1");
      formData.append("category", "category 1");

      setUploading(true);

      try {
          const response = await fetch("api/upload/pdf/", {
              method: "POST",
              body: formData,
              credentials: 'include',
          });

          if (!response.ok) {
            const resJson = await response.json();
            throw new Error("Upload failed.\n" + resJson.error);
          }

          const data = await response.json();
          console.log("Uploaded:", data);
          setDownloadFiles(prev => {
            const updated = [...prev];
            updated[idx] = data.data.id;
            return updated;
          });
          alert("File uploaded successfully!");
          setShowInput(true);
          const fileNames = (e.target.value as string).split('\\');
          const fileName = fileNames[fileNames.length - 1];
          setUploading(false);
          setUploadedFiles(prev => {
            const updated = [...prev];
            updated[idx] = fileName;
            return updated;
          });
          e.target.value = "";
      } catch (error) {
          console.error(error);
          alert(error);
      }
    };

  return (
    <Card className="w-full border-2">
      <CardHeader>
        <CardTitle>แนบคำสั่งสาร</CardTitle>
        {/* <CardDescription>Deploy your new project in one-click.</CardDescription> */}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col w-full items-start justify-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Button className="w-fit" variant="secondary"
              onClick={handleButtonClick}>
                <PlusCircleIcon size={32}/><span>เพิ่ม</span>
            </Button>
            {/* <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Name of your project" /> */}
          </div>
          <Table>
            {/* <TableCaption>A list of your recent data.</TableCaption> */}
            <TableHeader>
              <TableRow className="hover:bg-background">
                <TableHead className="w-[20px]">#</TableHead>
                <TableHead className="w-[60px]">ลำดับ</TableHead>
                <TableHead className="w-[200px]">หมายเลขคดีแดง</TableHead>
                <TableHead className="w-[200px]">หมายเลขคดีดำ</TableHead>
                <TableHead className="w-[200px]">ลงวันที่</TableHead>
                <TableHead className="w-[200px]">ประเภท</TableHead>
                <TableHead className="w-[200px]">มาตรา</TableHead>
                <TableHead className="w-[300px]">อัพโหลดคำสั่งสาร</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="display-none">
              {Array.from({length: numItems}).map((d: any, idx: number) => (
                <TableRow key={`table-row-${idx}`}>
                  <TableCell></TableCell>
                  <TableCell><Input type='text' ref={inputRefs.current[idx][0]}/></TableCell>
                  <TableCell><Input type='text' ref={inputRefs.current[idx][1]}/></TableCell>
                  <TableCell><Input type='text' ref={inputRefs.current[idx][2]}/></TableCell>
                  <TableCell><DatePicker /></TableCell>
                  <TableCell>
                    <Select
                      name="court-order-type"
                      required
                    >
                      <SelectTrigger className="w-[180px]" >
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectGroup>
                          <SelectLabel>ISP</SelectLabel>
                          <SelectItem value="apple">Apple</SelectItem>
                          <SelectItem value="banana">Banana</SelectItem>
                          <SelectItem value="blueberry">Blueberry</SelectItem>
                          <SelectItem value="grapes">Grapes</SelectItem>
                          <SelectItem value="pineapple">Pineapple</SelectItem>
                          </SelectGroup>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      name="court-order-group"
                      required
                    >
                      <SelectTrigger className="w-[180px]" >
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectGroup>
                          <SelectLabel>ISP</SelectLabel>
                          <SelectItem value="apple">Apple</SelectItem>
                          <SelectItem value="banana">Banana</SelectItem>
                          <SelectItem value="blueberry">Blueberry</SelectItem>
                          <SelectItem value="grapes">Grapes</SelectItem>
                          <SelectItem value="pineapple">Pineapple</SelectItem>
                          </SelectGroup>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="max-w-[100px]">
                    {
                      uploadedFiles[idx]?
                        <div className="flex flex-col gap-y-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant='default' className="w-20 text-xs cursor-pointer h-8"
                                onClick={ async (e: any) => {
                                  e.preventDefault();
                                  await handleDownload(idx);
                                }}
                              >
                                {/* {uploadedFiles[idx]} */}
                                คำสั่งสาร
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{uploadedFiles[idx]}</p>
                            </TooltipContent>
                        </Tooltip>
                          <Button variant='secondary' className="w-20 text-xs cursor-pointer h-8"
                            onClick={ async (e: any) => {
                              e.preventDefault();
                              await handleDownload(idx);
                            }}
                          >
                            {/* urls.xlsx */}
                            urls
                          </Button>
                        </div>
                          :
                        <div>
                          <Button
                            type="button"
                            variant={'link'}
                            onClick={() => inputRefs.current[idx][3].current?.click()}
                          >
                            อัพโหลดไฟล์
                          </Button>
                          <Input
                            ref={inputRefs.current[idx][3]}
                            id="pdf-upload"
                            type="file"
                            accept="application/pdf"
                            onChange={ async (e: any) => {
                              await handleFileChange(e, idx)
                            }}
                            className="hidden"
                          />
                        </div>
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="flex flex-col w-full">
                      <Label className="justify-center">No data to display</Label>
                      <div className="flex w-full justify-end gap-x-1">
                          <Button className="text-[10px] px-1 h-fit" variant={'default'}>
                              <Save /><span>
                              บันทึก</span>
                          </Button>
                          <Button className="text-[10px] px-1 h-fit" variant={'destructive'} onClick={clearItems}>
                              <X /><span>
                              ยกเลิก</span>
                          </Button>
                      </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
      {/* <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter> */}
    </Card>
  )
}
