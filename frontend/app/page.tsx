import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import DataTable from '@/components/main/content';
import { cookies } from "next/headers";
import { fetchWithAccessApp } from '@/lib/utils';
import { redirect } from "next/navigation";
import PlaylistDialog from '@/components/main/playlist-dialog';
import { NewPlaylistSheet } from '@/components/main/new-playlist-sheet';

async function getData() {
  const cookieStore = await cookies();
  const refresh = cookieStore?.get("refresh")?.value;
  const access = cookieStore?.get("access")?.value;
  const url = `${process.env.NEXT_PUBLIC_BACKEND}/api/document/documents/`;

  try {
    const data = await fetchWithAccessApp({
      access, refresh, url
    });
    return data;
  } catch (error) {
    redirect('/login') ;
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
