import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const res = await fetch('/api/auth/status');
        if (res.ok) {
            const resJson = await res.json();
            return NextResponse.json({data: { username: resJson.username }})
        } else {
            return NextResponse.json({message: 'Authentication fail'}, {status: 401})
        }
    } catch (error: any) {
        return NextResponse.json({message: 'Authentication fail'}, {status: 401})
    }
}