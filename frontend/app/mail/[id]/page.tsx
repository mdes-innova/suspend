import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import DataTable from '@/components/main/content';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PlaylistDialog from '@/components/main/playlist-dialog';
import { NewPlaylistSheet } from '@/components/main/new-playlist-sheet';
import { clearSelections, getContent } from '@/components/actions/document';
import { AuthError } from '@/components/exceptions/auth';
import { getGroups } from '@/components/actions/group';
import MailTable from '@/components/mail-table';
import { getMails } from '@/components/actions/mail';

async function getData(isp?: boolean) {
  try {
    const data = await getMails(isp);
    return data;
  } catch (error) {
    if (error instanceof AuthError) redirect('/login') ;
    else return [];
  }
}

async function MailContent({params}: {params: any}) {
    const {id} = (await params);
    const isp = (id === 'draft' || id === 'isp')? id === 'isp':
        undefined;
  const data = await getData(isp);
  return (
    <div className='w-full h-full flex flex-col px-2'>
      <MailTable data={data} isp={isp}/>
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
