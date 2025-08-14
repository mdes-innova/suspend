import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import { redirect } from "next/navigation";
import { AuthError } from '@/components/exceptions/auth';
import { getMailGroup } from '@/components/actions/mail';
import MailView from '@/components/mail-view';


async function getData(id: string) {
  try {
    const data = await getMailGroup(id);
    return data;
  } catch (error) {
    if (error instanceof AuthError) redirect('/login') ;
    else return [];
  }
}

async function MailContent({params}: {params: Promise<{ id: string }>}) {
    const {id} = await params;
    const data = await getData(id);

  return (
    <div className='w-full h-full flex flex-col px-2'>
      <MailView mailGroup={data} />
    </div>
  );
}

export default function Page({params}: {params: Promise<{id: string}>}) {
  return (
      <Suspense fallback={<ContentLoading />}>
        <MailContent params={params}/>
      </Suspense>
  );
}
