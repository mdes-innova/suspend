import { Suspense } from 'react';
import ContentLoading from "@/components/loading/content";
import { TableContent } from "@/components/table-content";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
      <Suspense fallback={<ContentLoading />}>
        <div className='w-full h-full flex flex-col'>
          <div className='flex w-full'>
            <Button className='ml-auto mr-4'>
              <Link href="/newdoc">
                <Plus />
              </Link>
            </Button>
          </div>
          <TableContent />
        </div>
      </Suspense>
  );
}
