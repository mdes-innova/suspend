import { confirm } from '@/components/actions/mail';
import {type Mail } from '@/lib/types';
import { Suspense } from 'react';
import { CircleX, CheckCircle2Icon, PopcornIcon } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import ConfirmLoading from '@/components/loading/confirm';

async function Content({params} : {params: any}) {
    const { id } = await params;

    try {
        const mail: Mail = await confirm(id);
        if (!(mail.confirmed))
            throw new Error("Confirm fail.");
        return (
            <div className="w-full flex justify-center pt-4">
                <Alert className="w-fit h-fit text-xl">
                    <CheckCircle2Icon />
                    <AlertTitle>ยืนยันสำเร็จ</AlertTitle>
                    <AlertDescription>
                        โปรดตรวจสอบอีเมลล์ของท่านเพื่อดำเนินการต่อไป
                    </AlertDescription>
                </Alert>
            </div>
        );
    } catch (err: any) {
        return (
            <div className="w-full flex justify-center pt-4">
                <Alert className="w-fit h-fit text-xl">
                    <CircleX />
                    <AlertTitle>ยืนยันไม่สำเร็จ</AlertTitle>
                    <AlertDescription>
                        โปรดยืนยันอีกครั้ง
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
}

export default function Page({ params }: {
    params: { id: string }
}) {
    return (
      <Suspense fallback={ConfirmLoading}>
        <Content params={params}/>
      </Suspense>
    );
}