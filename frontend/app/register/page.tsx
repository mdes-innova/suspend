import { AuthError } from "@/components/exceptions/auth";
import RegisterForm from "@/components/register-form"
import { Suspense } from 'react';
import { redirect } from "next/navigation";
import { getIsps } from "@/components/actions/isp";

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
  const ispData = await getData();
  return (
    <RegisterForm ispData={ispData} />
    );
}

export default function RegisterPage() {
    return (
      <Suspense>
        <Components/>
      </Suspense>
    )
}