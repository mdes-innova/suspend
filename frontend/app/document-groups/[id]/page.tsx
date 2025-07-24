import { getGroup } from "@/components/actions/group";
import { getIsps } from "@/components/actions/isp";
import { getProfile, getUsers } from "@/components/actions/user";
import { getCurrentDate } from "@/components/actions/utils";
import Activity from "@/components/activity";
import DocumentView from "@/components/document-view";
import { AuthError } from "@/components/exceptions/auth";
import GroupView from "@/components/group-view";
import { type User } from "@/lib/types";
import { fetchWithAccessApp } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function Components({ params, searchParams }: { params: any, searchParams: any }) {
  const { id } = (await params);

  try {
    const currentDate = await getCurrentDate();
    const user = await getProfile();
    const groupData = id != '-1'? await getGroup(id): {
      id: -1,
      createdAt: currentDate,
      name: 'Untitled',
      documents: [],
      user
    };
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