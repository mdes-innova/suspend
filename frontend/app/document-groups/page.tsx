import Activity from "@/components/activity";
import DocumentView from "@/components/document-view";
import GroupList from "@/components/group-list";
import { fetchWithAccessApp } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function Components() {

  const cookieStore = await cookies();
  const refresh = cookieStore?.get("refresh")?.value;
  let access = cookieStore?.get("access")?.value;
  const groupUrl = `${process.env.NEXT_PUBLIC_BACKEND}/api/group/groups/`;

  try {
    const groupsData = await fetchWithAccessApp({
      access, refresh, url: groupUrl, method: 'GET'
    });

    return (
      <GroupList data={groupsData}/>
    );
  } catch (error) {
    let access = cookieStore?.get("access")?.value;
    if (access) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/user/users/me/`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${access}` },
      });
      if (!res.ok && res.status === 401) {
        redirect(`/login?path=/document-gen/`)
      } else {
        return <></>;
      }
    } else {
      redirect(`/login?path=/document-gen/`)
    }
    return <></>;
  }
}

export default function Page() {
  return (
    <Suspense>
      <div className="text-3xl mb-4 pl-2">เลือกหมวดหมู่ที่ท่านต้องการสร้าง</div>
      <Components />
    </Suspense>
  );
}