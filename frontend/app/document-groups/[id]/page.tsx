import Activity from "@/components/activity";
import DocumentView from "@/components/document-view";
import GroupView from "@/components/group-view";
import { type User } from "@/lib/types";
import { fetchWithAccessApp } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function Components({ params, searchParams }: { params: any, searchParams: any }) {
  const { id } = (await params);
  const { ap } = (await searchParams);
  const cookieStore = await cookies();
  const refresh = cookieStore?.get("refresh")?.value;
  let access = cookieStore?.get("access")?.value;
  const groupUrl = `${process.env.NEXT_PUBLIC_BACKEND}/api/group/groups/${id}/`;
  const logUrl = `${process.env.NEXT_PUBLIC_BACKEND}/api/activity/activities/by-group/${id}/?ap=${ap?? 0}`;
  const ispUserUrl = `${process.env.NEXT_PUBLIC_BACKEND}/api/user/users/`;

  try {
    const groupData = await fetchWithAccessApp({
      access, refresh, url: groupUrl, method: 'GET'
    });
    const userData = await fetchWithAccessApp({
      access, refresh, url: ispUserUrl, method: 'GET'
    });

    // const logData = await fetchWithAccessApp({
    //   access, refresh, url: logUrl, method: 'GET'
    // });
    return (
      <GroupView groupData={groupData} logData={
        {
            count: 0,
            data: [],
            downloads: {
                pdf: 0,
                xlsx: 0
            }
        }
      } ap={parseInt(ap)?? 0}
        ispUsers={userData.filter((x: User) => x.isp != null)}
      />
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

export default function Page({ params, searchParams }:
  { params: { id: string }, searchParams: { [key: string]: string }}) {
  return (
    <Suspense>
      <Components params={params} searchParams={searchParams} />
    </Suspense>
  );
}