'use client';

import { ArrowUpDown } from "lucide-react";
import { Card } from "./ui/card";
import { useRouter } from "next/navigation";

export type DocumentType = {
  id: number, 
  pinned: boolean,
  download?: string,
  redNumber?: string,
  blackNumber?: string,
  section?: string,
  title: string,
  date: string,
  selected: boolean,
  downloads: string,
  active: boolean
}

export default function DocumentList({ data }: { data: DocumentType[] }) {
    console.log(data)
    const router = useRouter();
    return (
        
        <div className="flex flex-col justify-start gap-y-2 px-2 w-full ">
            <Card className="flex flex-row w-full px-4 border-0 shadow-none py-0">
                <div className="flex-[1] cursor-pointer">ลำดับที่</div>
                <div className="flex-[2] cursor-pointer">วันที่<span className="inline-block"><ArrowUpDown size={12} /></span></div>
                <div className="flex-[4] cursor-pointer">ชื่อ<span className="inline-block"><ArrowUpDown size={12} /></span></div>
                <div className="flex-[2] ml-auto text-right cursor-pointer">จำนวนคำสั่งสาร<span className="inline-block"><ArrowUpDown size={12} /></span></div>
            </Card>
            <>
                { data && data.length &&
                    data.map((e: any, idx: number) => {
                        return <Card key={`group-${idx}`}
                            className="flex flex-row px-4 hover:shadow-md w-full"
                            onClick={(evt: any) => {
                                evt.preventDefault();
                                router.push(`/document-groups/${e.id}/`);
                            }}
                            >
                            <div className="flex-[1]">{idx}</div>
                            <div className="flex-[2]">{(new Date(e.createdAt)).toLocaleString("en-GB", {
                                    year: "numeric",
                                    day: "2-digit",
                                    month: "2-digit"
                                })}</div>
                            <div className="flex-[4]">{e.title}</div>
                            <div className="flex-[2] ml-auto text-right">0</div>
                            {/* <div className="w-10">{idx + 1}</div> */}
                        </Card>
                    })
                }
            </>
        </div>
    );
}