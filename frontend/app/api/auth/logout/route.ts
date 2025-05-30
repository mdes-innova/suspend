import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  const params = await req.json();
  const response = NextResponse.json({ message: 'Logged out' });
  const refresh = req.cookies.get('refresh')?.value;
  let access = req.cookies.get('access')?.value;

  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for') || '';
  const ip = forwardedFor.split(',')[0];

  try {
    if (access) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/isp/isps/by-activity/logout/activity/`,
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

      if (!res.ok)
        return NextResponse.json({ message: 'Cannot log before logging out.' }, {
          status: 404})
    } else if (!access && refresh) {
        const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/token/refresh/`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${access}`
          },
          body: JSON.stringify({ refresh }),
        });

        if (!refreshRes.ok)
          return NextResponse.json({ message: 'Cannot log before logging out.' }, {
            status: 404})

        access = (await refreshRes.json()).access;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/isp/isps/by-activity/logout/activity/`,
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

        if (!res.ok)
          return NextResponse.json({ message: 'Cannot log before logging out.' }, {
            status: 404})
    } else {
      return NextResponse.json({ message: 'Cannot log before logging out.' }, {
        status: 404})
    }
    
  } catch (error) {
    return NextResponse.json({ message: 'Cannot log before logging out.' }, {
      status: 404})
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
