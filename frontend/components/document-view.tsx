'use client';

import useSWR from 'swr';
import { useParams } from 'next/navigation';

const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then((res) => res.json());

export default function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const { data } = useSWR(id ? `/api/content/${id}` : null, fetcher,
    { suspense: true ,
        fallbackData: { data: [] }
    });

  return <div>Data: {JSON.stringify(data?.data)}</div>;
}