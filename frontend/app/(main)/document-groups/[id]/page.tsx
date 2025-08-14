import { getGroup, postGroup } from "@/components/actions/group";
import { GetFilesFromGroup } from "@/components/actions/group-file";
import { getIsps } from "@/components/actions/isp";
import { getCurrentDate } from "@/components/actions/utils";
import { AuthError } from "@/components/exceptions/auth";
import GroupView from "@/components/group-view";
import ReloadPage from "@/components/reload-page";
import { type Group} from "@/lib/types";
import { notFound } from "next/navigation";
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
            return <ReloadPage />;
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
      return <ReloadPage />;
    } else {
      return notFound();
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