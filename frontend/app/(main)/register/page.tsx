import { AuthError, isAuthError } from '@/components/exceptions/auth';
import { notFound } from "next/navigation";
import RegisterForm from "@/components/register-form"
import { Suspense } from 'react';
import { getIsps } from "@/components/actions/isp";
import ReloadPage from "@/components/reload-page";
import { getAccess } from '../page';


async function Components() {
  try {
    const access = await getAccess();
    const res = await fetch(
      `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD}/isp/isps/`,
      {
        headers: {
          Authorization: `Bearer ${access}`
        },
      }
    );

    if (!res.ok) {
      if (res.status === 401)
        throw new AuthError('Authentication fail.');
      throw new Error('Get ISPs fail.');
    }

    const ispData = await res.json();
    return (
      <RegisterForm ispData={ispData} />
      );
  } catch (error) {
    if (isAuthError(error))
      return <ReloadPage />;
    else
      return notFound();
  }
}

export default function RegisterPage() {
    return (
      <Suspense>
        <Components/>
      </Suspense>
    )
}