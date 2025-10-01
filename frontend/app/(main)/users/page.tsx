import { Suspense } from 'react';
import { isAuthError } from '@/components/exceptions/auth';
import ReloadPage from '@/components/reload-page';
import { notFound } from "next/navigation";
import { getAccess } from '../page';
import {  User } from '@/lib/types';
import { LoadingUsersTable } from '@/components/loading/content';
import UserTable from '@/components/user-table';


async function Users() {
  try {
   
    const access = await getAccess();
    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;

    const users = await fetch(
      `${url}/user/users/`,
      {
        headers: {
          Authorization: `Bearer ${access}`
        },
      }
    );

    const data: User[] = await users.json();

    return (
      <div className='w-full h-full flex flex-col px-2'>
        <UserTable data={data}/>
      </div>
    );
  } catch (error) {
    if (isAuthError(error))
      return <ReloadPage />;
    else {
      return notFound();
    }
  }
}

export default function Page() {
  return (
      <Suspense fallback={<LoadingUsersTable />}>
        <Users />
      </Suspense>
  );
}
