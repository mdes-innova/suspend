import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import { redirect } from "next/navigation";
import { AuthError } from '@/components/exceptions/auth';
import { getMails } from '@/components/actions/mail';


async function getData() {
  try {
    const data = await getMails();
    return data;
  } catch (error) {
    if (error instanceof AuthError) redirect('/login') ;
    else return [];
  }
}

async function MailContent({params}: {params: { id: string }}) {
    const {id} = (await params);

  return (
    <div className='w-full h-full flex flex-col px-2'>
      {id}
    </div>
  );
}

export default function Page({params}: {params: {id: string}}) {
  return (
      <Suspense fallback={<ContentLoading />}>
        <MailContent params={params}/>
      </Suspense>
  );
}
