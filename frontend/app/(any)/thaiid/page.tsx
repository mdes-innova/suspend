import { getAccess } from '@/app/(main)/page';
import { redirect } from 'next/navigation'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ pathname: string }>
}) {
  const { pathname } = await searchParams;
  const goToPath = pathname === '/thaiid'? '/': pathname;
  const access = await getAccess();
  const baseUrl = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;
  if (access) {
    const resAccessMe = await fetch(`${baseUrl}/user/users/me/`, {
      headers: {
          Authorization: `Bearer ${access}`
        },
    }); 

    if (resAccessMe.ok) redirect(goToPath);
  }
  const thaiidEndpoint = process.env.THAIID_ENDPOINT;
  const clientId = process.env.THAIID_CLIENT_ID;
  const redirectUri = process.env.THAIID_CALLBACK;
  const scope = 'given_name%20family_name%20birthdate'
  const state = goToPath;

  const url = `${thaiidEndpoint}/?response_type=code&` +
      `client_id=${clientId}&redirect_uri=${redirectUri}&` +
      `scope=${scope}&state=${encodeURIComponent(state)}`;
    
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  if (res.status != 200) {
    console.log(res);
    redirect(`/login?pathname=${encodeURIComponent(goToPath)}`)
  }

  redirect(res.url);
}