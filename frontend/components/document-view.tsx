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
import { Date2Thai, Text2Thai } from "@/lib/utils";

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
  { docData, groupData }: { docData: Document, groupData: Group }) {
  return (
    <div className="h-full w-full flex flex-col justify-start items-center p-4">
      <div className="flex w-full justify-between h-[500px]">
        <div className="flex flex-col justify-start items-start w-full gap-y-4">
          <div className="flex flex-col">
            <div className="flex">
              <CategoryGroup group={groupData?? null} doc={docData} />
            </div>
            <div className="w-full text-start text-2xl font-bold mt-2">{docData.orderNo}</div>
            <div className="w-full text-start text-md">{Text2Thai(Date2Thai(docData.orderDate))}</div>
          </div>
          <div className="flex flex-col">
            <div className="w-full text-start text-xl font-bold">คดีหมายเลขดำที่:</div>
            <div className="w-full text-start text-md">{Text2Thai(docData.orderblackNo)?? ""}</div>
          </div>
          <div className="flex flex-col">
            <div className="w-full text-start text-xl font-bold">คดีหมายเลขแดงที่</div>
            <div className="w-full text-start text-md">{Text2Thai(docData.orderredNo)}</div>
          </div>
          <div className="mt-auto">

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
          </CardContent>
          <CardFooter className="flex-col gap-2">
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
