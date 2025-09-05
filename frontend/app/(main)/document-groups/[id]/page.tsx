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
    const baseUrl = process.env.NODE_ENV === "development" 
      ? process.env.BACKEND_URL_DEV 
      : process.env.BACKEND_URL_PROD;

    const isNew = id === '-1';
    const groupEndpoint = isNew 
      ? `${baseUrl}/group/groups/` 
      : `${baseUrl}/group/groups/${id}/`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${access}`,
      ...(isNew ? { "Content-Type": "application/json" } : {}),
    };

    const resGroup = await fetch(groupEndpoint, {
      method: isNew ? "POST" : "GET",
      headers,
      ...(isNew && { body: JSON.stringify({ name: "ไม่มีชื่อ" }) }),
    });

    if (!resGroup.ok) throw new Error(`Error ${resGroup.status}`);

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
      <GroupView groupData={groupData} isps={isps} idParam={id} datetime={new Date().toISOString()}/>
    );

  } catch (error) {
    console.error(error)
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