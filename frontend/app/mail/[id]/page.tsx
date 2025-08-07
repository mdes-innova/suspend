import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import { redirect } from "next/navigation";
import { AuthError } from '@/components/exceptions/auth';
import { getGroupMails, getMails } from '@/components/actions/mail';
import MailView from '@/components/mail-view';


async function getData(id: string) {
  try {
    const data = await getGroupMails(id);
    return data;
  } catch (error) {
    if (error instanceof AuthError) redirect('/login') ;
    else return [];
  }
}

async function MailContent({params}: {params: { id: string }}) {
    const {id} = (await params);
    const data = await getData(id);
    console.log(data);

  return (
    <div className='w-full h-full flex flex-col px-2'>
      <MailView data={data} />
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
