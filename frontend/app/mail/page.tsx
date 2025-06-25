import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import DataTable from '@/components/mail/content';
import { cookies } from "next/headers";
import { AuthError, fetchWithAccessApp } from '@/lib/utils';
import { redirect } from "next/navigation";
import PlaylistDialog from '@/components/main/playlist-dialog';
import { NewPlaylistSheet } from '@/components/main/new-playlist-sheet';

async function getData() {
  const cookieStore = await cookies();
  const refresh = cookieStore?.get("refresh")?.value;
  const access = cookieStore?.get("access")?.value;
  const meUrl = `${process.env.NEXT_PUBLIC_BACKEND}/api/user/users/me/`;
  const url = `${process.env.NEXT_PUBLIC_BACKEND}/api/mail/mails/`;

  try {
    const userData = await fetchWithAccessApp({
      access, refresh, url: meUrl, method: 'GET'
    });
    console.log(userData);
    const data = userData.isp? await fetchWithAccessApp({
      access, refresh, url, method: 'GET'
    }) : await fetchWithAccessApp({
      access, refresh, url, method: 'GET'
    })
    ;
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
