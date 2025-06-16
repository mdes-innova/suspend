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
import { Fragment, memo } from "react";
import { number } from "zod";
import { MyPagination, type Paginor } from "./my-pagination";
import { type GroupType } from "./group-list";
import DocumentList from "./document-list";

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

export default function GroupView(
  { logData, groupData, ap }: { logData: LogactivityType, groupData: GroupType, ap: number}) {
  return (
    <div className="h-full w-full flex flex-col justify-start items-center p-4">
      <div className="flex w-full justify-between h-[500px]">
        <div className="flex flex-col justify-start items-start w-full gap-y-4">
          <div className="flex flex-col">
            <div className="w-full text-start text-2xl font-bold">{groupData.name}</div>
            <div className="w-full text-start text-md">{new Date(groupData.createdAt).toLocaleString("en-GB", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}</div>
          </div>
        <DocumentList data={groupData.documents} />
          <div className="mt-auto">
          <Urls />
          </div>
        </div>
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
          {/* <ol className="list-decimal list-outside pl-6">
            {urls.map((e: string) => <li key={`urls-${e}`}>{e}</li>)}
          </ol> */}
          <ScrollArea className="h-72">
            <ol className="list-decimal list-outside pl-6 p-4">
              {/* <h4 className="mb-4 text-sm leading-none font-medium">Tags</h4> */}
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