import { getDocument } from "@/components/actions/document";
import { getGroupFromDocument } from "@/components/actions/group";
import DocumentView from "@/components/document-view";
import { AuthError } from "@/components/exceptions/auth";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";

async function Components({ params }: { params: { id: string } }) {
  const { id } = await params;

  try {
    const docData = await getDocument(parseInt(id));
    const groupData = await getGroupFromDocument(parseInt(id));
    return <DocumentView docData={docData} groupData={Object.keys(groupData).length === 0? null: groupData} />;
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?path=/document-view/${id}/`);
    } else {
      notFound(); // or return <div>Error</div>;
    }
  }
}

export default function Page({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>Loading document...</div>}>
      <Components params={params} />
    </Suspense>
  );
}
