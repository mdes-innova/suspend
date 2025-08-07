'use client';
import {type Mail } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Date2Thai, Datetime2Thai } from "@/lib/utils"
import { ArrowDownToLine} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { downloadFile } from "./actions/mail";

export default function MailView({
    data
}: {
    data: Mail[]
}) {
    return (
        <Table className='overflow-y-hidden'>
            <TableHeader>
                <TableRow className="hover:bg-background">
                <TableHead className="w-[20px]">#</TableHead>
                <TableHead className="w-[400px]">ชื่อเอกสาร</TableHead>
                <TableHead className='w-[200px]'>ISP</TableHead>
                <TableHead className="w-[50px] text-right">เวลาที่ส่ง</TableHead>
                <TableHead className="w-[50px] text-right">เวลาที่ยืนยัน</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    data && data.length > 0?
                    data.map((e: Mail, idx: number) => 
                    <TableRow key={`table-row-${idx}`}>
                        <TableCell>
                            {idx + 1} 
                        </TableCell>
                        <TableCell className='max-w-[400px]'>
                            <div className='w-full h-full flex'>
                            <ArrowDownToLine size={16} className='cursor-pointer' onClick={async(evt: any) => {
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
                                console.error(error) 
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
    );
}