import { confirm } from '@/components/actions/mail';
import {type Mail } from '@/lib/types';
import { Suspense } from 'react';
async function Content({params} : {params: any}) {
    const { id } = await params;

    try {
        const mail: Mail = await confirm(id);
        if (!(mail.confirmed))
            throw new Error("Confirm fail.");
        return (
            <div>
                Confirm successfully.
            </div>
        );
    } catch (err: any) {
        return (
            <div>
                Confirm fail.
            </div>
        );
    }
}

export default function Page({ params }: {
    params: { id: string }
}) {
    return (
      <Suspense fallback={"Loading..."}>
        <Content params={params}/>
      </Suspense>
    );
}