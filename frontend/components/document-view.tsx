'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { type Group, type Document } from "@/lib/types";
import CategoryGroup from "./document-category";
import { Date2Thai, Text2Thai } from "@/lib/client/utils";
import { downloadPdf, downloadUrls } from "./actions/document";
import { isAuthError } from "./exceptions/auth";


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
            <div className="w-full text-start text-md">{
              docData && docData?.orderDate ? Text2Thai(Date2Thai(docData.orderDate)): '-'
            }</div>
          </div>
          <div className="flex flex-col">
            <div className="w-full text-start text-xl font-bold">คดีหมายเลขดำที่:</div>
            <div className="w-full text-start text-md">{
              docData && docData?.orderblackNo? Text2Thai(docData.orderblackNo): '-`'
            }</div>
          </div>
          <div className="flex flex-col">
            <div className="w-full text-start text-xl font-bold">คดีหมายเลขแดงที่</div>
            <div className="w-full text-start text-md">{
              docData && docData?.orderredNo? Text2Thai(docData.orderredNo): '-'
            }</div>
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
              <li onClick={async(e: React.MouseEvent<HTMLLIElement>) => {
                e.preventDefault();
                try {
                  const blob = await downloadPdf(docData.id);
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", `${docData.orderFilename}`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  if (isAuthError(error))
                    redirectToLogin();
                }
              }}>PDF</li>
              <li onClick={async(e: React.MouseEvent<HTMLLIElement>) => {
                e.preventDefault();
                try {
                  const orderFilename = docData.orderFilename;
                  const orderFilenames = orderFilename?.split('.');
                  const filename = 'urls_' +
                    orderFilenames?.slice(0, orderFilenames.length - 1).join('.') +
                    '.xlsx';
                  const blob = await downloadUrls(docData.id);
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", `${filename}`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  if (isAuthError(error))
                    redirectToLogin();
                }
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
