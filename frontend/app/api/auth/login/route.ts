import axios from 'axios';
import { NextRequest, NextResponse } from "next/server";
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const params = await req.json();
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for') || '';
    const ip = forwardedFor.split(',')[0];
    params['ipAddress'] = ip;
    const resData = await axios.post(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/api/token/`, params);
    let { access } = resData.data;
    let { refresh } = resData.data;


    const response = NextResponse.json({ data: { username: params['username'] }});

    try {
    if (access) {
      const res = await fetch(
        `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/api/activity/activities/by-activity/login/`,
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
        return NextResponse.json({ message: 'Cannot log before logging in.' }, {
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
          return NextResponse.json({ message: 'Cannot log before logging in.' }, {
            status: 404})

        access = (await refreshRes.json()).access;

        const res = await fetch(
          `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/api/activity/activities/by-activity/login/`,
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
        return NextResponse.json({ message: 'Cannot log before logging in.' }, {
            status: 404})
    } else {
      return NextResponse.json({ message: 'Cannot log before logging in.' }, {
        status: 404})
    }
    
  } catch (error) {
    return NextResponse.json({ message: 'Cannot log before logging in.' }, {
      status: 404})
  }

    response.cookies.set('access', access, {
        httpOnly: true,       // 🛡️ Prevent JS access
        secure: process.env.NODE_ENV === 'production',  // 🛡️ HTTPS only in prod
        sameSite: 'lax',   // 🛡️ Mitigate CSRF
        path: '/',            // available throughout the app
        maxAge: 60 * 5, // 5 minutes
    });

    response.cookies.set('refresh', refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
    });

    return response;
  } catch (err) {
    console.log(err);
    return NextResponse.json({message: 'Invalid credentials'}, {status: 401});
  }
}
