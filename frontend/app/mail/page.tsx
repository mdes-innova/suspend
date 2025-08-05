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
import { type User, type Mail } from '@/lib/types';
import { getProfile } from '@/components/actions/user';

async function getData() {
  try {
    const data: User = await getProfile();
    return data;
  } catch (error) {
    if (error instanceof AuthError) redirect('/login') ;
    else return [];
  }
}

async function PlaylistContent() {
  const user = await getData();
  return (
    <div className='w-full h-full flex flex-col px-2'>
      <MailTable user={user}/>
    </div>
  );
}

export default function Page() {
  return (
      <Suspense fallback={<ContentLoading />}>
        <PlaylistContent />
      </Suspense>
  );
}
