import { getDocument } from "@/components/actions/document";
import DocumentView from "@/components/document-view";
import { AuthError } from "@/components/exceptions/auth";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";

async function Components({ params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const docData = await getDocument(parseInt(id));
    return <DocumentView docData={docData} />;
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
