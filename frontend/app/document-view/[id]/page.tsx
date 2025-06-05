import Activity from "@/components/activity";
import DocumentView from "@/components/document-view";
import { fetchWithAccessApp } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function Components({ params }: { params: any }) {
  const { id } = (await params);
  const cookieStore = await cookies();
  const refresh = cookieStore?.get("refresh")?.value;
  let access = cookieStore?.get("access")?.value;
  const docUrl = `${process.env.NEXT_PUBLIC_BACKEND}/api/document/documents/${id}/`;
  const logUrl = `${process.env.NEXT_PUBLIC_BACKEND}/api/isp/isps/by-document/${id}/activity/`;

  try {
    const docData = await fetchWithAccessApp({
      access, refresh, url: docUrl, method: 'GET'
    });
    const logData = await fetchWithAccessApp({
      access, refresh, url: logUrl, method: 'GET'
    });
    console.log(logData);
    return (
      <DocumentView logData={logData} docData={docData} />
    );
  } catch (error) {
    let access = cookieStore?.get("access")?.value;
    if (access) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/user/users/me/`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${access}` },
      });
      if (!res.ok && res.status === 401) {
        redirect(`/login?path=/document-view/${id}/`)
      } else {
        return <></>;
      }
    } else {
      redirect(`/login?path=/document-view/${id}/`)
    }
    return <></>;
  }
}

export default function Page({ params }: { params: { id: string } }) {
  return (
    <Suspense>
      <Components params={params}/>
    </Suspense>
  );
}