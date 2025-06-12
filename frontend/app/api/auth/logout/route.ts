import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { fetchWithAccessApi } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const params = await req.json();
  const refresh = req.cookies.get('refresh')?.value;
  const access = req.cookies.get('access')?.value;

  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for') || '';
  const ip = forwardedFor.split(',')[0];

  const response = await fetchWithAccessApi(
    {
      method: 'POST',
      req,
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/activity/activities/by-activity/logout/`,
      access,
      refresh,
      params: {
          ipAddress: ip,
          path: params.path 
      },
      returnRes: {
            fail: NextResponse.json({ error: "Fail to log." }, { status: 400 }),
            success: NextResponse.json({}, { status: 200 })
        },
    }
  );

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
