import axios from 'axios';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const params = await req.json();
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND}/api/token/refresh/`,{
            refresh: params?.refresh
        });
        const { access } = response.data;
        const nextResponse = NextResponse.json({ data: { access }});

        nextResponse.cookies.set('access', access, {
            httpOnly: true,       // 🛡️ Prevent JS access
            secure: process.env.NODE_ENV === 'production',  // 🛡️ HTTPS only in prod
            sameSite: 'lax',   // 🛡️ Mitigate CSRF
            path: '/',            // available throughout the app
            maxAge: 60 * 5, // 5 minutes
        });

        return nextResponse;
    } catch (error) {
        return NextResponse.json({ message: 'Invalid refresh token' }, { status: 403 });
    }
}