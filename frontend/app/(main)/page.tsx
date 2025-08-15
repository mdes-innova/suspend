import { Suspense } from 'react';
import { notFound } from "next/navigation";
import ContentLoading from "@/components/loading/content";
import DataTable from '@/components/main/content';
import PlaylistDialog from '@/components/main/playlist-dialog';
import { NewPlaylistSheet } from '@/components/main/new-playlist-sheet';
import ReloadPage from '@/components/reload-page';
import { isAuthError } from '@/components/exceptions/auth';
import { getContent } from '@/components/actions/document';


async function Content() {
  try {
    const data = await getContent();
    return (
      <div className='w-full h-full flex flex-col px-2'>
        <DataTable data={data}/>
      </div>
    );
  } catch (error) {
    if (isAuthError(error))  
      return <ReloadPage />;
    else
      return notFound();
  }
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
