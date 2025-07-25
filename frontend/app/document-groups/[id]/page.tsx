import { getGroup, getUntilted, postGroup } from "@/components/actions/group";
import { getIsps } from "@/components/actions/isp";
import { getProfile, getUsers } from "@/components/actions/user";
import { getCurrentDate } from "@/components/actions/utils";
import Activity from "@/components/activity";
import DocumentView from "@/components/document-view";
import { AuthError } from "@/components/exceptions/auth";
import GroupView from "@/components/group-view";
import { type Group, type User } from "@/lib/types";
import { fetchWithAccessApp } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function Components({ params, searchParams }: { params: any, searchParams: any }) {
  const { id } = (await params);

  try {
    const currentDate = await getCurrentDate();
    let groupData: Group | null = null;

    if (id === '-1') {
      try {
        const createdUntitled = await postGroup('Untitled');
        createdUntitled.createdAt = currentDate;
        groupData = createdUntitled;
      } catch (err1) {
        if (err1 instanceof AuthError) throw err1;
        else {
          try {
            const gettedUntitled = await getUntilted();
            gettedUntitled.createdAt = currentDate;
            groupData = gettedUntitled;
          } catch (err2) {
            if (err1 instanceof AuthError) throw err1;
            else {
              return <></>;
            }
          }
        }
      }
    } else {
      groupData = await getGroup(id);
    }

    const isps = await getIsps();

    return (
      <GroupView groupData={groupData} isps={isps}/>
    );

  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?path=/document-view/${id}/`)
    } else {
      return <></>;
    }
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