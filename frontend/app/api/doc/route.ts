import { fetchWithAccessApi } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const params = await req.json();
    const access = req.cookies.get('access')?.value;
    const refresh = req.cookies.get('refresh')?.value;

    return await fetchWithAccessApi(
        {
            url: `${process.env.NEXT_PUBLIC_BACKEND}/api/document/documents/`,
            access,
            refresh,
            method: 'POST',
            params: {
                title: params?.title?? null,
            },
            req,
            returnRes: {
                fail: NextResponse.json({ error: "Fail to create a document." }, { status: 400 }),
                success: NextResponse.json({}, { status: 201 })
            }
        }
    );
}