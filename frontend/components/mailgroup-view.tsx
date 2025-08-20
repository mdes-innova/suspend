'use client';
import {type Mail, type Document, type Isp, type MailFile, type MailGroup } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Date2Thai, Datetime2Thai } from "@/lib/client/utils"
import { ArrowDownToLine} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { downloadFile } from "./actions/mail";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { isAuthError } from '@/components/exceptions/auth';
import { redirectToLogin } from "./reload-page";
import {useRouter} from 'next/navigation';
import { Button } from "./ui/button";
import { useState, useEffect } from 'react';

type IspMail = {
    isp: Isp | undefined,
    mailFiles: MailFile[],
    mails: Mail[]
}

export default function MailGroupView({
    mailGroup,
    ispData
}: {
    mailGroup: MailGroup,
    ispData: Isp[]
}) {
    const router = useRouter();
    const [ispMails, setIspMails] = useState<IspMail[]>([]);

    useEffect(() => {
        const getIspMails = () => {
            const allIspIds = mailGroup.mails.filter((e) => e != null && e != undefined)
                .map((e) => e?.receiver?.isp?.id).filter((e) => typeof e === 'number');
            const uniqueIspIds = [...new Set(allIspIds)];
            const newData = uniqueIspIds.map((eIspId) => {
                const isp = ispData.find((eIspData) => eIspData.id === eIspId);
                const mailFiles = mailGroup.mails.find((e) => e.receiver.isp?.id === eIspId)?.mailFiles;
                const mails = mailGroup.mails.filter((e) => e?.receiver?.isp?.id === eIspId)

                return {
                    isp,
                    mails: mails?? [],
                    mailFiles: mailFiles?? []
                }
            });

            setIspMails(newData?? []);
        }

        getIspMails();
    }, []);

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
                <div>
                    มาตรา: {mailGroup.section?.name?? '-'}
                </div>
            </div>
            <Card>
                <div className="w-full flex flex-col items-center gap-y-2">
                    {mailGroup?.allispMailFiles?.map((e, idx) => {
                        const filename = e?.originalFilename?? '-';
                        const fileSplited = filename.split('.');
                        const fileExt = fileSplited[fileSplited.length - 1];
                        const bg = (['xlsx', 'xls'].includes(fileExt))? 'bg-green-200': 'bg-background'
                        return <div className="w-11/12" key={`all-isp-file-${idx}`}>
                            <Button variant="outline" className={`w-full ${bg}`}
                                onClick={async(evt: React.MouseEvent<HTMLButtonElement>) => {
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
                    })}
                </div>
                <Table className='overflow-y-hidden px-2'>
                    <TableHeader>
                        <TableRow className="hover:bg-background">
                        <TableHead className="w-[20px] text-left">#</TableHead>
                        <TableHead className="w-[400px] text-left">ชื่อเอกสาร</TableHead>
                        <TableHead className='w-[200px] text-left'>ISP</TableHead>
                        <TableHead className="w-[50px] text-left">ส่ง ISP</TableHead>
                        <TableHead className="w-[50px] text-left">ISP ยืนยัน</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            ispMails && ispMails.length > 0 ?
                            ispMails?.map((e: IspMail, idx: number) => 
                            <TableRow key={`table-row-${idx}`}>
                                <TableCell>
                                    {idx + 1} 
                                </TableCell>
                                <TableCell className='max-w-[400px] flex flex-col items-start'>
                                {
                                    e?.mailFiles?.map((ee, idx2) => 
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
                                <TableCell>
                                    {
                                        e.mails.map((_, eMailIdx) => 
                                            <div key={`isp-name-mail-${idx}-${eMailIdx}`}>
                                                {e?.isp?.name?? '-'} {eMailIdx? `(${eMailIdx})`: ''}
                                            </div>
                                        )
                                    }
                                </TableCell>
                                <TableCell>
                                    {
                                        e.mails.map((eMail, eMailIdx) => 
                                            <div key={`isp-send-mail-${idx}-${eMailIdx}`}>
                                                {eMail.datetime? Datetime2Thai(eMail.datetime): '-'}
                                            </div>
                                        )
                                    }
                                </TableCell>
                                <TableCell>
                                    {
                                        e.mails.map((eMail, eMailIdx) => 
                                            <div key={`isp-send-mail-${idx}-${eMailIdx}`}>
                                                {eMail.confirmedDate? Datetime2Thai(eMail.confirmedDate): '-'}
                                            </div>
                                        )
                                    }
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
                            (mailGroup && mailGroup?.documents && mailGroup?.documents?.length > 0) &&
                                (mailGroup.section.name === 'ปกติ')?
                            mailGroup.documents.map((e: Document, idx: number) => 
                            <TableRow key={`table-row-${idx}`} className="cursor-default"
                                onClick={(evt: React.MouseEvent<HTMLTableRowElement>) => {
                                    evt.preventDefault();
                                    router.push(`/document-view/${e.id}`);
                                }}
                            >
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