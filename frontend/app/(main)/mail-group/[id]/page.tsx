import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import { AuthError, isAuthError } from '@/components/exceptions/auth';
import MailGroupView from '@/components/mailgroup-view';
import ReloadPage from '@/components/reload-page';
import { notFound } from "next/navigation";
import { getAccess } from '../../page';


async function MailContent({params}: {params: Promise<{ id: string }>}) {
  try {
    const {id} = await params;
    const access = await getAccess();

    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;
    const res = await fetch(`${url}/mail/mailgroups/${id}/`, {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

    if (!res.ok) {
    if (res.status === 401)
        throw new AuthError('Authentication fail.')
    throw new Error('Get a mail group fail.');
    }

    const data = await res.json();

    const resIsps = await fetch(
      `${url}/isp/isps/`,
      {
        headers: {
          Authorization: `Bearer ${access}`
        },
      }
    );

    if (!resIsps.ok) {
      if (resIsps.status === 401)
        throw new AuthError('Authentication fail.');
      throw new Error('Get ISPs fail.');
    }

    const isps = await resIsps.json();

    return (
      <div className='w-full h-full flex flex-col px-2'>
        <MailGroupView mailGroup={data} ispData={isps}/>
      </div>
    );
  } catch (error) {
    if (isAuthError(error))
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
