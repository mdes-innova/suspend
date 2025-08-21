import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import { isAuthError } from '@/components/exceptions/auth';
import ReloadPage from '@/components/reload-page';
import { notFound } from "next/navigation";
import { getAccess } from '../page';
import IspTable from '@/components/isp-table';
import { Isp, User } from '@/lib/types';


async function MailContent() {
  try {
   
    const access = await getAccess();
    const url = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;

    const resIsps = await fetch(
      `${url}/isp/isps/`,
      {
        headers: {
          Authorization: `Bearer ${access}`
        },
      }
    );

    const isps: Isp[] = await resIsps.json();
    const ispIds = isps.map((e) => e.id).filter((e) => typeof e === 'number');

    const resUserList = await fetch(
      `${url}/user/users/by-isps/`,
      {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${access}`,
            "Content-Type": "application/json"
            },
        body: JSON.stringify({
            ispIds
        })
        },
    );

    const userList: User[] = await resUserList.json();

    const data = isps.map((eIsp) => {
        if (eIsp) {
            const users: User[] = userList.filter((e) => typeof e?.isp?.id === 'number'
                && typeof eIsp?.id === 'number' && e?.isp?.id === eIsp?.id);
            return (
                {
                    users,
                    ...eIsp
                }
            );
        } else {
            return undefined;
        }
    }).filter((e) => e != undefined);

    return (
      <div className='w-full h-full flex flex-col px-2'>
        <IspTable data={data}/>
      </div>
    );
  } catch (error) {
    if (isAuthError(error))
      return <ReloadPage />;
    else {
        console.log(error)
      return notFound();
    }
  }
}

export default function Page() {
  return (
      <Suspense fallback={<ContentLoading />}>
        <MailContent />
      </Suspense>
  );
}
