import { Suspense } from 'react';
import { notFound } from "next/navigation";
import GroupTable from '@/components/group-table';
import LoadingTable from '@/components/loading/content';
import { getAccess } from '../page';
import { AuthError, isAuthError } from '@/components/exceptions/auth';
import ReloadPage from '@/components/reload-page';


async function Components() {
  try{
    const access = await getAccess(); 
    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;
    const res = await fetch(`${url}/user/users/me/`, {
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

    if (!res.ok) {
      if (res.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Get content fail.');
    }

    return (
      <div className='w-full h-full flex flex-col px-2'>
        <GroupTable />
      </div>
    );  
  } catch (error) {
    if (isAuthError(error))  
      return <ReloadPage />;
    else
      return notFound();
  }
}

export default function Page() {
  return (
      <Suspense fallback={<LoadingTable />}>
        <Components />
      </Suspense>
  );
}