import axios from 'axios';
import { NextRequest, NextResponse } from "next/server";
import { headers } from 'next/headers';
import { fetchWithAccessApi } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const params = await req.json();
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for') || '';
    const ip = forwardedFor.split(',')[0];
    params['ipAddress'] = ip;
    let access = req.cookies.get('access')?.value;
    const refresh = req.cookies.get('refresh')?.value;

    // const response = NextResponse.json({ data: { username: params['username'] }});

    try {
    if (access) {
      const res = await fetch(
        `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/api/activity/activities/by-activity/register/`,
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
        return NextResponse.json({ message: 'Cannot log before register new user.' }, {
          status: 404})
    } else if (!access && refresh) {
        const refreshRes = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/api/token/refresh/`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${access}`
          },
          body: JSON.stringify({ refresh }),
        });

        if (!refreshRes.ok)
          return NextResponse.json({ message: 'Cannot log before register new user.' }, {
            status: 404})

        access = (await refreshRes.json()).access;

        const res = await fetch(
          `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/api/activity/by-activity/register/activity/`,
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
        return NextResponse.json({ message: 'Cannot log before register new user.' }, {
            status: 404})
    } else {
      return NextResponse.json({ message: 'Cannot log before register new user.' }, {
        status: 404})
    }
    
  } catch (error) {
    return NextResponse.json({ message: 'Cannot log before register new user.' }, {
      status: 404})
  }

    return await fetchWithAccessApi(
        {
            url: `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/api/user/users/`,
            access,
            refresh,
            method: 'POST',
            req,
            params: {
              username: params['username'],
              password: params['password'],
              isp: params['isp'],
              isStaff: params['userType'] === 'user'? false: true
            },
            returnRes: {
                fail: NextResponse.json({ error: "Fail to create a user." }, { status: 400 }),
                success: NextResponse.json({}, { status: 201 })
            }
        }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({message: 'Invalid credentials'}, {status: 401});
  }
}
