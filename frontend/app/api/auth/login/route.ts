import axios from 'axios';
import cookie from 'cookie';
import { NextRequest, NextResponse } from "next/server";
import { redirect } from 'next/navigation';

export async function POST(req: NextRequest) {
  try {
    const params = await req.json();
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND}/api/token/`, params);
    const { access, refresh } = response.data;

    console.log(access);
    console.log(refresh);

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
    return NextResponse.json({message: 'Invalid credentials'}, {status: 401});
  }
}
