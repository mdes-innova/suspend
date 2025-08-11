import { getGroup, postGroup } from "@/components/actions/group";
import { GetFilesFromGroup } from "@/components/actions/group-file";
import { getIsps } from "@/components/actions/isp";
import { getCurrentDate } from "@/components/actions/utils";
import { AuthError } from "@/components/exceptions/auth";
import GroupView from "@/components/group-view";
import { type Group} from "@/lib/types";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function Components({ params }: { params: Promise<{ id: string }>}) {
  const { id } = await params;

  try {
    const currentDate = await getCurrentDate();
    let groupData: Group | null = null;

    if (id === '-1') {
      try {
        const createdUntitled = await postGroup('ไม่มีชื่อ');
        createdUntitled.createdAt = currentDate;
        groupData = createdUntitled;
      } catch (err1) {
        if (err1 instanceof AuthError) throw err1;
            return <></>;
      }
    } else {
      groupData = await getGroup(parseInt(id));
    }

    const isps = await getIsps();
    const fileData = await GetFilesFromGroup((groupData as Group).id);

    return (
      <GroupView groupData={groupData} isps={isps} fileData={fileData}/>
    );

  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?path=/document-view/${id}/`)
    } else {
      return <></>;
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