import { Suspense } from 'react';
import { notFound } from "next/navigation";
import DataTable from '@/components/main/content';
import ReloadPage from '@/components/reload-page';
import { AuthError, isAuthError } from '@/components/exceptions/auth';
import { cookies } from "next/headers";
import LoadingTable from '@/components/loading/content';

export async function getAccess() {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("access")?.value;
    const refresh = cookieStore.get("refresh")?.value;

    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;

    if (access) {
      const resAccessMe = await fetch(`${url}/user/users/me/`, {
        headers: {
            Authorization: `Bearer ${access}`
          },
      }); 

      if (resAccessMe.ok) return access;
    }

    if (!refresh) throw new AuthError(`Refresh token not found.`);

    const res = await fetch(
      `${url}/token/refresh/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      }
    );

    if (!res.ok) {
      throw new AuthError(`Token refresh failed: ${res.status}`);
    }

    const data = await res.json();
    return data.access;
    
  } catch {
    throw new AuthError('Get access token fail.');
  }
}

async function Content() {
  try {
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
        <DataTable />
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
      <Suspense fallback={<LoadingTable />}>
        <Content />
      </Suspense>
  );
}
