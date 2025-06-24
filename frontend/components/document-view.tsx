'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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


import { Button } from "@/components/ui/button";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fragment, memo, useEffect, useState } from "react";
import { number } from "zod";
import { MyPagination, type Paginor } from "./my-pagination";
import { type Group, type Document } from "@/lib/types";
import CategoryGroup from "./document-category";
import axios from "axios";
import { useAppSelector } from "./store/hooks";

type Logtype = {
  id: number
  activity: string
  createdAt: string
}

type Downloads = {
  pdf: number,
  xlsx: number
}
type LogactivityType = {
  count: number,
  downloads: Downloads,
  data: Logtype[]
}

export default function DocumentView(
  { logData, docData, group, ap }: { logData: LogactivityType, docData: Document, group: Group | null, ap: number}) {
  return (
    <div className="h-full w-full flex flex-col justify-start items-center p-4">
      <div className="flex w-full justify-between h-[500px]">
        <div className="flex flex-col justify-start items-start w-full gap-y-4">
          <div className="flex flex-col">
            <div className="flex">
              <CategoryGroup category={docData?.category?.name} group={group?? null} doc={docData} />
            </div>
            <div className="w-full text-start text-2xl font-bold">ขอให้มีคำสั่งระงับการทำให้แพร่หลายซึ่งข้อมูลคอมพิวเตอร์</div>
            <div className="w-full text-start text-md">{new Date(docData.date).toLocaleString("en-GB", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}</div>
          </div>
          <div className="flex flex-col">
            <div className="w-full text-start text-xl font-bold">คดีหมายเลขดำที่:</div>
            <div className="w-full text-start text-md">รทยE๑๐๒๗/๒๕๖๘</div>
          </div>
          <div className="flex flex-col">
            <div className="w-full text-start text-xl font-bold">คดีหมายเลขแดงที่</div>
            <div className="w-full text-start text-md">รทยE๑๐๒๗/๒๕๖๘</div>
          </div>
          <div className="mt-auto">
          <Urls />

          </div>
        </div>
        <Card className="w-full max-w-sm h-fit">
          <CardHeader>
            <CardTitle>ไฟล์</CardTitle>
            <CardDescription>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-decimal list-outside pl-6 underline cursor-pointer">
              <li onClick={(e) => {
                e.preventDefault();
              }}>PDF</li>
              <li onClick={(e) => {
                e.preventDefault();
              }}>XLSX</li>
            </ul>
          </CardContent>
          <CardHeader>
            <CardTitle>ดาวน์โหลด</CardTitle>
            <CardDescription>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-outside">
              <li onClick={(e) => {
                e.preventDefault();
              }}>PDF ({logData.downloads.pdf})</li>
              <li onClick={(e) => {
                e.preventDefault();
              }}>XLSX ({logData.downloads.xlsx})</li>
            </ul>
          </CardContent>
          <CardFooter className="flex-col gap-2">
          </CardFooter>
        </Card>
      </div>
      <DocumentLogs data={logData.data} pagination={
        {
          active: ap,
          count: logData.count
        }
      } />
    </div>
  );
}

function DocumentLogs({ data, pagination }: { data: Logtype[], pagination: Paginor}) {
  return (
    <Table className="">
      {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
      <TableHeader>
        <TableRow>
          {/* <TableHead className="w-[100px]">Invoice</TableHead> */}
          <TableHead>วันที่ เวลา</TableHead>
          <TableHead>กิจกรรม</TableHead>
          <TableHead className="text-right">ไฟล์</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((log) => (
          <TableRow key={`log-${log.id}`}>
            {/* <TableCell className="font-medium">{log.}</TableCell> */}
            <TableCell>{new Date(log.createdAt).toLocaleString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}</TableCell>
            <TableCell>{log.activity}</TableCell>
            <TableCell className="text-right">-</TableCell>
          </TableRow>
        ))}
      </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>
              <MyPagination pagination={pagination} />
            </TableCell>
          </TableRow>
      </TableFooter>
    </Table>
  )
}



function Urls() {
  const urls = Array.from({length: 10}).map((_, idx: number) => `https://example${idx}.com`);
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">เปิด Urls</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <ScrollArea className="h-72">
            <ol className="list-decimal list-outside pl-6 p-4">
              {urls.map((url) => (
                <Fragment key={url}>
                  <li className="text-sm">{url}</li>
                  <Separator className="my-2" />
                </Fragment>
              ))}
            </ol>
          </ScrollArea>
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </form>
    </Dialog>
  )
}