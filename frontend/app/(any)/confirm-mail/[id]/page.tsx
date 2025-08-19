import { Suspense } from 'react';
import { CircleX, CheckCircle2Icon } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import ConfirmLoading from '@/components/loading/confirm';

async function Content({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const baseUrl = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;
        const res = await fetch(`${baseUrl}/mail/mails/confirm/`, {
        method: 'POST',
        body: JSON.stringify({
            confirmed_uuid: id
        }),
        headers: {
            "Content-Type": "application/json"
            },
        }); 

        if (!res.ok) {
            throw new Error('Confirm fail.');
        }

        const mail = await res.json();
        if (!(mail.confirmed))
            throw new Error("Confirm fail.");
        return (
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 ">
                <div className="w-full flex justify-center pt-4">
                    <Alert className="w-fit h-fit text-xl shadow-sm shadow-green-600">
                        <CheckCircle2Icon />
                        <AlertTitle className="text-green-900">ยืนยันสำเร็จ</AlertTitle>
                        <AlertDescription>
                            โปรดตรวจสอบอีเมลล์ของท่านเพื่อดำเนินการต่อไป
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    } catch (err) {
        console.error(err);
        return (
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 ">
                <div className="w-full flex justify-center pt-4">
                    <Alert className="w-fit h-fit text-xl">
                        <CircleX />
                        <AlertTitle className="text-red-900 shadow-sm shadow-red-600">ยืนยันไม่สำเร็จ</AlertTitle>
                        <AlertDescription>
                            โปรดยืนยันอีกครั้ง
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }
}

export default function Page({ params }: {
    params: Promise<{ id: string }>
}) {
    return (
      <Suspense fallback={<ConfirmLoading />}>
        <Content params={params}/>
      </Suspense>
    );
}