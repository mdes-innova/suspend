import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import GroupTable from '@/components/group-table';
import { getProfile } from '@/components/actions/user';
import { AuthError } from '@/components/exceptions/auth';
import ReloadPage from '@/components/reload-page';
import { notFound } from "next/navigation";

// async function getData() {
//   try {
//     const data = await getGroups();
//     return data;
//   } catch (error) {
//     if (error instanceof AuthError) redirect('/login') ;
//     else return [];
//   }
// }

async function Components() {
  try {
    await getProfile();

    return (
      <div className='w-full h-full flex flex-col px-2'>
        <GroupTable />
      </div>
    );
  } catch (error) {
    console.error(error);
    if (error instanceof AuthError) {
      return (
        <ReloadPage />
      );
    } else {
      return notFound();
    }
  }
}

export default function Page() {
  return (
      <Suspense fallback={<ContentLoading />}>
        <Components />
      </Suspense>
  );
}