import DocumentView from "@/components/document-view";
import ReloadPage from "@/components/reload-page";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AuthError, isAuthError } from '@/components/exceptions/auth';
import { getAccess } from "../../page";

async function Components({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const access = await getAccess();

    const res = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV:
      process.env.BACKEND_URL_PROD}/document/documents/${id}/`, {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

    if (!res.ok) {
    if (res.status === 401)
        throw new AuthError('Authentication fail.')
    throw new Error('Get a document fail.');
    }
    const docData = await res.json();

    const resGroup = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV:
      process.env.BACKEND_URL_PROD}/group/groups/by-document/${id}/`, {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

    if (!resGroup.ok) {
    if (resGroup.status === 401)
        throw new AuthError('Authentication fail.')
    throw new Error('Get a group from a document fail.');
    }

    const groupData = await resGroup.json();

    return <DocumentView docData={docData} groupData={Object.keys(groupData).length === 0? null: groupData} />;
  } catch (error) {
    if (isAuthError(error)) {
      return <ReloadPage />;
    } else {
      notFound();
    }
  }
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div>Loading document...</div>}>
      <Components params={params} />
    </Suspense>
  );
}
