import { AuthError, isAuthError } from '@/components/exceptions/auth';
import GroupView from "@/components/group-view";
import ReloadPage from "@/components/reload-page";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAccess } from "../../page";

async function Components({ params }: { params: Promise<{ id: string }>}) {
  const { id } = await params;

  try {
    const access = await getAccess();
    const baseUrl = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;
    const groupEndpoint = id === '-1'? `${baseUrl}/group/groups/`:
      `${baseUrl}/group/groups/${id}/`;
    const groupMethod = id === '-1'? 'POST': 'GET';
    const resGroup = await fetch(groupEndpoint, {
      method: groupMethod,
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

    if (!resGroup.ok) {
      if (resGroup.status === 401)
          throw new AuthError('Authentication fail.')
        throw new Error('Get a group fail.');
    }

    const groupData = await resGroup.json();

    const resIsps = await fetch(
      `${baseUrl}/isp/isps/`,
      {
        headers: {
          Authorization: `Bearer ${access}`
        },
      }
    );

    if (!resIsps.ok) {
      if (resIsps.status === 401)
        throw new AuthError('Authentication fail.');
      throw new Error('Get ISPs fail.');
    }

    const isps = await resIsps.json();

    return (
      <GroupView groupData={groupData} isps={isps} idParam={id}/>
    );

  } catch (error) {
    console.log(error)
    if (isAuthError(error)) {
      return <ReloadPage />;
    } else {
      return notFound();
    }
  }
}

export default function Page({ params }:
  { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <Components params={params} />
    </Suspense>
  );
}