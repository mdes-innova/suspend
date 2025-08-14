import { AuthError } from "@/components/exceptions/auth";
import { notFound } from "next/navigation";
import RegisterForm from "@/components/register-form"
import { Suspense } from 'react';
import { redirect } from "next/navigation";
import { getIsps } from "@/components/actions/isp";
import ReloadPage from "@/components/reload-page";

async function getData() {
  try {
    const data = await getIsps();
    return data;
  } catch (error) {
    if (error instanceof AuthError) redirect('/login') ;
    else return [];
  }
}

async function Components() {
  try {
    const ispData = await getData();
    return (
      <RegisterForm ispData={ispData} />
      );
  } catch (error) {
    if (error instanceof AuthError)
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