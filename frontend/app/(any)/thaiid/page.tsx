import { getAccess } from '@/app/(main)/page';
import { redirect } from 'next/navigation'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ pathname: string }>
}) {
  const { pathname } = await searchParams;
  const thaiidEndpoint = process.env.THAIID_ENDPOINT;
  const clientId = process.env.THAIID_CLIENT_ID;
  const redirectUri = process.env.THAIID_CALLBACK;
  const scope = 'given_name%20family_name%20birthdate'
  const state = pathname;

  const url = `${thaiidEndpoint}/?response_type=code&` +
      `client_id=${clientId}&redirect_uri=${redirectUri}&` +
      `scope=${scope}&state=${encodeURIComponent(state)}`;
  
  console.log(url);
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  if (res.status != 200) {
    redirect(`/login?pathname=${encodeURIComponent(pathname)}`)
  } else {
    redirect(res.url);
  }
}