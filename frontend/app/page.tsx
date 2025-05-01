import Content from "@/components/content";
import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";

export default function Home() {
  return (
    <>
      <Suspense fallback={<ContentLoading />}>
        <Content />
      </Suspense>
    </>
  );
}
