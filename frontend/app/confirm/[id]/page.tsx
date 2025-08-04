import { Suspense } from 'react';

async function Component(params: any) {
   const id = await params; 

   const res = await fetch(
    `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/group/files/confirm/${id}/`
   );

   if (!res.ok) return (
        <div>Fail to confirm</div>
   );

   const content = await res.json();

   return (
        content.confirmed?
            <div>Confirmed</div>:
            <div>Fail to confirm</div>
   );
}

export default function Page({
    params
}: {
    params: { id: string }
}) {
    return (
        <Suspense>
            <Component params={params} />
        </Suspense>
    );
}