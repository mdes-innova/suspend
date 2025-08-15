'use client';
import {type Mail, Document, MailGroup } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Date2Thai, Datetime2Thai } from "@/lib/utils"
import { ArrowDownToLine} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { downloadFile } from "./actions/mail";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { isAuthError } from '@/components/exceptions/auth';
import { redirectToLogin } from "./reload-page";

export default function MailView({
    mailGroup
}: {
    mailGroup: MailGroup
}) {
    return (
        <div className="w-full h-full flex flex-col gap-y-2">
            <div className="grid grid-cols-2 py-4">
                <div className="col-span-2 text-2xl font-bold">
                    {mailGroup.documentNo}
                </div>
                <div className="col-span-2 text-lg">
                    {Date2Thai(mailGroup.documentDate as string)}
                </div>
                <div className="col-span-2 text-lg mt-4 italic">
                    {mailGroup.subject}
                </div>
                <div>
                    ชั้นความเร็ว: {['ปกติ', 'ด่วน', 'ด่วนมาก', 'ด่วนที่สุด'][mailGroup.speed as number]}
                </div>
                <div>
                    ชั้นความลับ: {['ปกติ', 'ลับ', 'ลับมาก', 'ลับที่สุด'][mailGroup.secret as number]}
                </div>
            </div>
            <Card>
                <Table className='overflow-y-hidden px-2'>
                    <TableHeader>
                        <TableRow className="hover:bg-background">
                        <TableHead className="w-[20px] text-left">#</TableHead>
                        <TableHead className="w-[400px] text-left">ชื่อเอกสาร</TableHead>
                        <TableHead className='w-[200px] text-left'>ISP</TableHead>
                        <TableHead className="w-[50px] text-left">เวลาที่ส่ง</TableHead>
                        <TableHead className="w-[50px] text-left">เวลาที่ยืนยัน</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            mailGroup != undefined && mailGroup?.mails && mailGroup?.mails?.length > 0?
                            mailGroup?.mails.map((e: Mail, idx: number) => 
                            <TableRow key={`table-row-${idx}`}>
                                <TableCell>
                                    {idx + 1} 
                                </TableCell>
                                <TableCell className='max-w-[400px]'>
                                    <div className='w-full h-full flex'>
                                    <ArrowDownToLine size={16} className='cursor-pointer'
                                    onClick={async(evt: React.MouseEvent<SVGSVGElement>) => {
                                        evt.preventDefault();
                                        const fileName = e.mailFile.originalFilename;
                                        const fileId = e.mailFile.id;
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
                                            if (isAuthError(error))
                                                redirectToLogin();
                                        }
                                    }}/>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                        <p className='w-full truncate'>
                                            {e.mailFile.originalFilename}
                                        </p>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                        <p>{e.mailFile.originalFilename}</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    </div>
                                    </TableCell>
                                <TableCell>
                                    {e.mailFile.isp.name} 
                                </TableCell>
                                <TableCell>
                                    {e.status === "successful"? Datetime2Thai(e.datetime as string): '-'} 
                                </TableCell>
                                <TableCell>
                                    {e.confirmed? Datetime2Thai(e.confirmedDate as string): '-'} 
                                </TableCell>
                            </TableRow>):(
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                                No results.
                                </TableCell>
                            </TableRow>
                            )
                        }
                    </TableBody> 
                </Table>
            </Card>
            <Label className="font-bold text-2xl mt-6">คำสั่งศาล</Label>
            <Card>
                <Table className='overflow-y-hidden px-2'>
                    <TableHeader>
                        <TableRow className="hover:bg-background">
                        <TableHead className="w-[20px]">#</TableHead>
                        <TableHead className="w-[400px]">คำสั่งศาล</TableHead>
                        <TableHead className='w-[200px]'>วันที่</TableHead>
                        <TableHead className="w-[50px]">หมายเลขดำ</TableHead>
                        <TableHead className="w-[50px]">หมายเลขแดง</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            mailGroup && mailGroup?.documents && mailGroup?.documents?.length > 0?
                            mailGroup.documents.map((e: Document, idx: number) => 
                            <TableRow key={`table-row-${idx}`}>
                                <TableCell>
                                    {idx + 1} 
                                </TableCell>
                                <TableCell>
                                    {e.orderNo} 
                                </TableCell>
                                <TableCell>
                                     {Date2Thai(e.orderDate as string)}
                                </TableCell>
                                <TableCell>
                                    {e?.orderblackNo? e.orderblackNo: '-'}
                                </TableCell>
                                <TableCell>
                                    {e?.orderredNo? e.orderredNo: '-'}
                                </TableCell>
                            </TableRow>):(
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                                No results.
                                </TableCell>
                            </TableRow>
                            )
                        }
                    </TableBody> 
                </Table>

            </Card>
        </div>
    );
}