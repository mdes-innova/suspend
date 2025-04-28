import axios from 'axios';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const cookieStore = cookies();
    const refresh = cookieStore.get('refresh'); // get the cookie named 'refresh'
    if (!refresh || !refresh?.value) 
        return NextResponse.json({ message: 'No refresh token' }, { status: 401 });

    try {
        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
            refresh: refresh?.value,
        });

        const { access } = response.data;

        cookies().set('access', access, {
            httpOnly: true,       // 🛡️ Prevent JS access
            secure: process.env.NODE_ENV === 'production',  // 🛡️ HTTPS only in prod
            sameSite: 'Lax',   // 🛡️ Mitigate CSRF
            path: '/',            // available throughout the app
            maxAge: 60 * 5, // 5 minutes
        });

        return NextResponse.json({ data: { isAuthenticated: true }});
    } catch (error) {
        return NextResponse.json({ message: 'Invalid refresh token' }, { status: 403 });
    }
}