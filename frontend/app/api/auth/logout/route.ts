import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  const params = await req.json();
  const response = NextResponse.json({ message: 'Logged out' });
  const refresh = req.cookies.get('refresh')?.value;
  const access = req.cookies.get('access')?.value;

  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for') || '';
  const ip = forwardedFor.split(',')[0];

  const myHeaders = new Headers();

  if (access) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/isp/isps/by-activity/visit/activity/`,
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${access}`
        },
        body: JSON.stringify({
          ipAddress: ip,
          path: params.path
        })
      }
    );
  } else (!access && refresh) {
      const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (!refreshRes.ok) {

      }

      const { access: newAccess } = await refreshRes.json();
      headers.set("Authorization", `Bearer ${newAccess}`);
  } else {

  }

  // Clear both cookies
  response.cookies.set('access', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set('refresh', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
