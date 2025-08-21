import ReloadPage from "@/components/reload-page";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isAuthError } from '@/components/exceptions/auth';
import { getAccess } from "../page";
import ProfileView from "@/components/profile-view";

async function Components() {

  try {
    await getAccess();

    return <ProfileView />;
  } catch (error) {
    if (isAuthError(error)) {
      return <ReloadPage />;
    } else {
      notFound();
    }
  }
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading document...</div>}>
      <Components/>
    </Suspense>
  );
}
