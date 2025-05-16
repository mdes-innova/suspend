import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import { TableContent } from "@/components/table-content";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import DataTable from '@/components/main/content';
import PlaylistDialog from '@/components/main/playlist-dialog';

export default function Home() {
  return (
      <Suspense fallback={<ContentLoading />}>
        <div className='w-full h-full flex flex-col px-2'>
          <DataTable />
          <PlaylistDialog />
        </div>
      </Suspense>
  );
}
