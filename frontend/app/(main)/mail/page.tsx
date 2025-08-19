import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import MailTable from '@/components/mail-table';


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
