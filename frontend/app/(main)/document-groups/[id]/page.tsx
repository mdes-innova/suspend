import { getGroup, postGroup } from "@/components/actions/group";
import { GetFilesFromGroup } from "@/components/actions/group-file";
import { getIsps } from "@/components/actions/isp";
import { getCurrentDate } from "@/components/actions/utils";
import { AuthError, isAuthError } from '@/components/exceptions/auth';
import GroupView from "@/components/group-view";
import ReloadPage from "@/components/reload-page";
import { type Group} from "@/lib/types";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAccess } from "../../page";

async function Components({ params }: { params: Promise<{ id: string }>}) {
  const { id } = await params;

  try {
    const access = await getAccess();
    const baseUrl = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;
    const resDate = await fetch(`${baseUrl}/current-time/`, {
      headers: {
        Authorization: `Bearer ${access}`
      },
    });
      
    if (!resDate.ok) {
        if (resDate.status === 401)
            throw new AuthError('Authentication fail.')
    }

    const currentDate = await resDate.json();

    let groupData: Group | null = null;

    if (id === '-1') {
      try {
        const resUntitled = await fetch(`${baseUrl}/group/groups/`, {
          method: 'POST',
          body: JSON.stringify({
            name: "ไม่มีชื่อ"
          }),
          headers: {
              Authorization: `Bearer ${access}`,
              "Content-Type": "application/json"
            },
        }); 

        if (!resUntitled.ok) {
        if (resUntitled.status === 401)
            throw new AuthError('Authentication fail.')
        throw new Error('Create a new group fail.');
        }

        const createdUntitled = await resUntitled.json();
        createdUntitled.createdAt = currentDate;
        groupData = createdUntitled;
      } catch (err1) {
        if (isAuthError(err1))
            return <ReloadPage />;
        else
          return notFound();
      }
    } else {
      const resGroup = await fetch(`${baseUrl}/group/groups/${id}/`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${access}`
          },
      }); 

      if (!resGroup.ok) {
      if (resGroup.status === 401)
          throw new AuthError('Authentication fail.')
      throw new Error('Get a group fail.');
      }

      groupData = await resGroup.json();
    }

    const resIsps = await fetch(
      `${baseUrl}/isp/isps/`,
      {
        headers: {
          Authorization: `Bearer ${access}`
        },
      }
    );

    if (!resIsps.ok) {
      if (resIsps.status === 401)
        throw new AuthError('Authentication fail.');
      throw new Error('Get ISPs fail.');
    }

    const isps = await resIsps.json();

    const resGFs = await fetch(`${baseUrl}/group/files/by-group/${gid}/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${access}`
      }
    }); 
    if (!resGFs.ok) {
      if (resGFs.status === 401)
        throw new AuthError('Authenticatioin fail.');
      throw new Error('Get files from a group failed');
    }

    const fileData = await resGFs.json();

    return (
      <GroupView groupData={groupData} isps={isps} fileData={fileData}/>
    );

  } catch (error) {
    if (isAuthError(error)) {
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