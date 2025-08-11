import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import MailTable from '@/components/mail-table';

// async function getData() {
//   try {
//     const data: User = await getProfile();
//     return data;
//   } catch (error) {
//     if (error instanceof AuthError) redirect('/login') ;
//     else return [];
//   }
// }

async function PlaylistContent() {
  return (
    <div className='w-full h-full flex flex-col px-2'>
      <MailTable />
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
