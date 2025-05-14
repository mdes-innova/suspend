import axios from 'axios';
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const params = await req.json();
    const resData = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND}/api/token/`, params);
    const { access, refresh } = resData.data;

    const response = NextResponse.json({ data: { username: params['username'] }});

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
