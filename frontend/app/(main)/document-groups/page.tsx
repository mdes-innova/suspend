import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import GroupTable from '@/components/group-table';


async function Components() {
    return (
      <div className='w-full h-full flex flex-col px-2'>
        <GroupTable />
      </div>
    );
}

export default function Page() {
  return (
      <Suspense fallback={<ContentLoading />}>
        <Components />
      </Suspense>
  );
}