import { fetchWithAccessApi } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const access = req.cookies.get('access')?.value;
    const refresh = req.cookies.get('refresh')?.value;

    return await fetchWithAccessApi(
        {
            url: `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/api/document/documents/content/`,
            access,
            refresh,
            method: 'GET',
            req,
            returnRes: {
                fail: NextResponse.json({ error: "Fail to get documents." }, { status: 400 }),
                success: NextResponse.json({}, { status: 200 })
            }
        }
    );
}