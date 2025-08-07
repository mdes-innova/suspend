import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import { redirect } from "next/navigation";
import { AuthError } from '@/components/exceptions/auth';
import GroupTable from '@/components/group-table';
import {getGroups } from '@/components/actions/group';

async function getData() {
  try {
    const data = await getGroups();
    return data;
  } catch (error) {
    if (error instanceof AuthError) redirect('/login') ;
    else return [];
  }
}

async function Components() {
  const data = await getData();
  return (
    <div className='w-full h-full flex flex-col px-2'>
      <GroupTable data={data}/>
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