import Content from "@/components/content";
import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import { TableContent } from "@/components/table-content";

export default function Home() {
  return (
      <Suspense fallback={<ContentLoading />}>
        <TableContent />
      </Suspense>
  );
}
