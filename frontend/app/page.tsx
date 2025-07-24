import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import DataTable from '@/components/main/content';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PlaylistDialog from '@/components/main/playlist-dialog';
import { NewPlaylistSheet } from '@/components/main/new-playlist-sheet';
import { clearSelections, getContent } from '@/components/actions/document';
import { AuthError } from '@/components/exceptions/auth';

async function getData() {
  try {
    await clearSelections();
    const data = await getContent();
    // console.log(data.slice(0, 20))
    return data;
  } catch (error) {
    if (error instanceof AuthError) redirect('/login') ;
    else return [];
  }
}

async function Content() {
  const data = await getData();
  return (
    <div className='w-full h-full flex flex-col px-2'>
      <DataTable data={data}/>
    </div>
  );
}

export default function Home() {
  return (
      <Suspense fallback={<ContentLoading />}>
        <Content />
        <NewPlaylistSheet />
        <PlaylistDialog />
      </Suspense>
  );
}
