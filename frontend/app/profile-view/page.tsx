import DocumentView from "@/components/document-view";
import ProfileView from "@/components/profile-view";
import { fetchWithAccessApp } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function Components({ searchParams }: { searchParams: any }) {
    const { ap } = (await searchParams);
  const cookieStore = await cookies();
  const refresh = cookieStore?.get("refresh")?.value;
  let access = cookieStore?.get("access")?.value;
  const userUrl = `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/api/user/users/me/`;
  const logUrl = `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/api/activity/activities/by-activity/?ap=${ap?? 0}`;

  try {
    const userData = await fetchWithAccessApp({
      access, refresh, url: userUrl, method: 'GET'
    });
    const logData = await fetchWithAccessApp({
      access, refresh, url: logUrl, method: 'GET'
    });
    return (
      <ProfileView logData={logData} userData={userData} ap={ap? parseInt(ap): 0}/>
    );
  } catch (error) {
    redirect(`/login?path=/profile-view/`)
  }
}

export default function Page({ searchParams }:
  { searchParams: { [key: string]: string }}) {
  return (
    <Suspense>
      <Components searchParams={searchParams}/>
    </Suspense>
  );
}