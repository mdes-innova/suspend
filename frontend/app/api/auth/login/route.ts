import axios from 'axios';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from "next/server";
import { redirect } from 'next/navigation';

export async function POST(req: NextRequest) {
  try {
    const params = await req.json();
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND}/api/token/`, params);
    const { access, refresh } = response.data;

    cookies().set('access', access, {
        httpOnly: true,       // 🛡️ Prevent JS access
        secure: process.env.NODE_ENV === 'production',  // 🛡️ HTTPS only in prod
        sameSite: 'Lax',   // 🛡️ Mitigate CSRF
        path: '/',            // available throughout the app
        maxAge: 60 * 5, // 5 minutes
    });

    cookies().set('refresh', refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'Lax',
    });

    // res.setHeader('Set-Cookie', [
    //   cookie.serialize('access', access, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === 'production',
    //     path: '/',
    //     maxAge: 60 * 5, // 5 minutes
    //     sameSite: 'Lax',
    //   }),
    //   cookie.serialize('refresh', refresh, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === 'production',
    //     path: '/',
    //     maxAge: 60 * 60 * 24 * 7, // 7 days
    //     sameSite: 'Lax',
    //   }),
    // ]);

    // res.status(200).json({ success: true });
    return NextResponse.json({ data: { email: params['email'] }});
  } catch (err) {
    console.log(err);
    return NextResponse.json({message: 'Invalid credentials'}, {status: 401});
  }
}
