'use client';

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PlusCircleIcon } from "lucide-react";
import {
    Table,
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
      </CardHeader>
      <CardContent>
        <div className="flex flex-col w-full items-start justify-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Button className="w-fit">
                  <PlusCircleIcon size={32}/><span>แนบเอกสาร</span>
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-background">
                <TableHead className="w-[20px]">#</TableHead>
                <TableHead className="w-[50px]">แก้ไข</TableHead>
                <TableHead className="w-[100px]">ลำดับ</TableHead>
                <TableHead className="w-[500px]">ชื่อเอกสาร</TableHead>
                <TableHead>ISP</TableHead>
              </TableRow>
            </TableHeader>
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
    </Card>
  )
}