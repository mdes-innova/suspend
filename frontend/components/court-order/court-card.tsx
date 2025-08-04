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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusCircleIcon } from "lucide-react";
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

export function BookCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>เอกสารหนังสือ</CardTitle>
        {/* <CardDescription>Deploy your new project in one-click.</CardDescription> */}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col w-full items-start justify-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Button className="w-fit">
                  <PlusCircleIcon size={32}/><span>แนบเอกสาร</span>
            </Button>
            {/* <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Name of your project" /> */}
          </div>
          <Table>
            {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
            <TableHeader>
              <TableRow className="hover:bg-background">
                <TableHead className="w-[20px]">#</TableHead>
                <TableHead className="w-[50px]">แก้ไข</TableHead>
                <TableHead className="w-[100px]">ลำดับ</TableHead>
                <TableHead className="w-[500px]">ชื่อเอกสาร</TableHead>
                <TableHead>ISP</TableHead>
              </TableRow>
            </TableHeader>
            {/* <TableBody>
              {invoices.map((invoice: any, idx: number) => (
                <TableRow key={invoice.invoice}>
                  <TableCell className="font-medium">
                    <div className="flex justify-between w-full">
                      {invoices[idx].submit === 0 && <DeleteDialog />}
                      {invoices[idx].submit != 0 && <div className="flex-1"></div>}
                      <DocumentSheet />
                    </div>
                  </TableCell>
                  <TableCell>{invoice.topic}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.notice}</TableCell>
                  <TableCell>{invoice.type}</TableCell>
                  <TableCell className="text-center text-background flex flex-col cursor-pointer">
                    <div className={`py-2
                        rounded-md ${invoice.submit === 0? "bg-gray-500": "bg-blue-600"}`}>
                        <div>
                            {invoice.submit === 0? "บันทึกฉบับร่าง": "ส่งให้ ISP ดำเนินการ"}
                        </div>
                    </div>
                    </TableCell>
                </TableRow>
              ))}
            </TableBody> */}
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5}>
                    <Label className="justify-center">No data to display</Label>
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