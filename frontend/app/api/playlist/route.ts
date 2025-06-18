import { fetchWithAccessApi } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    let access = req.cookies.get('access')?.value;
    const refresh = req.cookies.get('refresh')?.value;

    return await fetchWithAccessApi(
        {
            url: `${process.env.NEXT_PUBLIC_BACKEND}/api/group/groups/`,
            access,
            refresh,
            method: 'GET',
            req,
            returnRes: {
                fail: NextResponse.json({ error: "Fail to get playlist." }, { status: 404 }),
                success: NextResponse.json({}, { status: 200 })
            }
        }
    );
}

export async function POST(req: NextRequest) {
    const params = await req.json();
    let access = req.cookies.get('access')?.value;
    const refresh = req.cookies.get('refresh')?.value;

    return await fetchWithAccessApi(
        {
            url: `${process.env.NEXT_PUBLIC_BACKEND}/api/group/groups/`,
            access,
            refresh,
            method: 'POST',
            req,
            params: {
                name: params.name,
                kind: params.kind
            },
            returnRes: {
                fail: NextResponse.json({ error: "Fail to create playlist." }, { status: 400 }),
                success: NextResponse.json({}, { status: 200 })
            }
        }
    );
}

export async function PATCH(req: NextRequest) {
    const params = await req.json();
    let access = req.cookies.get('access')?.value;
    const refresh = req.cookies.get('refresh')?.value;

    return await fetchWithAccessApi(
        {
            url: `${process.env.NEXT_PUBLIC_BACKEND}/api/group/groups/`,
            access,
            refresh,
            method: 'PATCH',
            req,
            params: {
                documentIds: params.documentIds,
                mode: params.mode?? null 
            },
            returnRes: {
                fail: NextResponse.json({ error: "Fail to create playlist." }, { status: 400 }),
                success: NextResponse.json({}, { status: 200 })
            }
        }
    );
}
