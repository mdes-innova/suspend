import ReloadPage from "@/components/reload-page";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AuthError, isAuthError } from '@/components/exceptions/auth';
import { getAccess } from "@/app/(main)/page";
import { ProfileUserView } from "@/components/profile-view";

async function Components({params}: {params: Promise<{ id: string }>}) {

  try {
    const { id } = await params;
    const access = await getAccess();

    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;
    const res = await fetch(`${url}/user/users/${id}/`, {
    method: 'GET',
    headers: {
        Authorization: `Bearer ${access}`
        },
    }); 
    if (!res.ok) {
        if (res.status === 401)
            throw new AuthError('Authentication fail.')
        throw new Error('Get a mail group fail.');
    }

    const data = await res.json();

    return <ProfileUserView user={data}/>;
  } catch (error) {
    if (isAuthError(error)) {
      return <ReloadPage />;
    } else {
      notFound();
    }
  }
}

export default function Page({params}: {params: Promise<{id: string}>}) {
  return (
    <Suspense fallback={<div>Loading document...</div>}>
      <Components params={params}/>
    </Suspense>
  );
}
