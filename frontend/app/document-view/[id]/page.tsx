import Activity from "@/components/activity";
import DocumentView from "@/components/document-view";
import { fetchWithAccessApp } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
        <DocumentView />
    </Suspense>
  );
}