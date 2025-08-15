import { getDocument } from "@/components/actions/document";
import { getGroupFromDocument } from "@/components/actions/group";
import DocumentView from "@/components/document-view";
import ReloadPage from "@/components/reload-page";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isAuthError } from '@/components/exceptions/auth';

async function Components({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const docData = await getDocument(parseInt(id));
    const groupData = await getGroupFromDocument(parseInt(id));
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
