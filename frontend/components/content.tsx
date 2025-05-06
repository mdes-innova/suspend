import { Card } from "@/components/ui/card";
import axios from 'axios';
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import ContentLoading from "./loading/content";

type Document = {
    id: number,
    title: string
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getData() {
    // try {
        const content: Document[] = await axios.get(
            `${process.env.NEXT_PUBLIC_FRONTEND}/api/content/`,
            {
                withCredentials: true
            }
        );
        // return (
        //     content?.map((e, index) => {
        //         return (
        //             <Card>
        //                 <div key={`content-${index}`} className="w-full flex justify-between px-4">
        //                     <div>{e.title}</div>
        //                     <a className="w-6 h-6" href="#" onClick={
        //                         (event: React.MouseEvent<HTMLAnchorElement>) => {
        //                         event.preventDefault();
        //                         const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/` + 
        //                             `document/documents/${e.id}/file_download/`, {
        //                             method: 'GET',
        //                             credentials: 'include', // Required if using cookies for auth
        //                         });
        //                     }}>
        //                         <img src="/PDF_file_icon.svg" alt="pdf" />
        //                     </a>
        //                 </div>
        //             </Card>
        //         );
        //     }));
            // Array.from({length: 10}).map((_, index: number) => {
            //     return (
            //         <Card>
            //             <div key={`content-${index}`} className="w-full flex justify-between px-4">
            //                 <div>Topic</div>
            //                 <a className="w-6 h-6" href="#">
            //                     <img src="/PDF_file_icon.svg" alt="pdf" />
            //                 </a>
            //             </div>
            //         </Card>
            //     );
            // })
    // } catch (error) {
        return <ContentLoading />
    // }
    // await sleep(3000);
    // return (
    //     Array.from({length: 10}).map((_, index: number) => {
    //         return (
    //             <Card>
    //                 <div key={`content-${index}`} className="w-full flex justify-between px-4">
    //                     <div>Topic</div>
    //                     <a className="w-6 h-6" href="#">
    //                         <img src="/PDF_file_icon.svg" alt="pdf" />
    //                     </a>
    //                 </div>
    //             </Card>
    //         );
    //     })
    // );
}

export default async function Content() {
    const data = await getData();
    return (
        <div className="w-full flex justify-start min-h-fit">
            <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 
                sm:p-20 font-[family-name:var(--font-geist-sans)] w-full">
                <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full h-full">
                    <div className="w-full h-full flex flex-col justify-start gap-y-2">
                    {
                        data
                    }
                    </div>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                            <PaginationPrevious href="#" />
                            </PaginationItem>
                            <PaginationItem>
                            <PaginationLink href="#">1</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                            <PaginationLink href="#" isActive>
                                2
                            </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                            <PaginationLink href="#">3</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                            <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                            <PaginationNext href="#" />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </main>
            </div>
        </div>
    );
}