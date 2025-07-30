import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import DataTable from '@/components/main/content';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PlaylistDialog from '@/components/main/playlist-dialog';
import { NewPlaylistSheet } from '@/components/main/new-playlist-sheet';
import { clearSelections, getContent } from '@/components/actions/document';
import { AuthError } from '@/components/exceptions/auth';
import PlaylistTable from '@/components/playlist-table';
import { getGroupList, getGroups } from '@/components/actions/group';

async function getData() {
  try {
    const data = await getGroupList();
    return data;
  } catch (error) {
    if (error instanceof AuthError) redirect('/login') ;
    else return [];
  }
}

async function PlaylistContent() {
  const data = await getData();
  return (
    <div className='w-full h-full flex flex-col px-2'>
      <PlaylistTable data={data}/>
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
