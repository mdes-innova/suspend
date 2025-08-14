import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import { AuthError } from '@/components/exceptions/auth';
import { getMailGroup } from '@/components/actions/mail';
import MailView from '@/components/mail-view';
import ReloadPage from '@/components/reload-page';
import { notFound } from "next/navigation";


async function MailContent({params}: {params: Promise<{ id: string }>}) {
  try {
    const {id} = await params;
    const data = await getMailGroup(id);

    return (
      <div className='w-full h-full flex flex-col px-2'>
        <MailView mailGroup={data} />
      </div>
    );
  } catch (error) {
    if (error instanceof AuthError)
      return <ReloadPage />;
    else
      return notFound();
  }
}

export default function Page({params}: {params: Promise<{id: string}>}) {
  return (
      <Suspense fallback={<ContentLoading />}>
        <MailContent params={params}/>
      </Suspense>
  );
}
