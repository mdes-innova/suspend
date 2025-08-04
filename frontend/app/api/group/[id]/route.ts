import { fetchWithAccessApi } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const access = req.cookies.get('access')?.value;
    const refresh = req.cookies.get('refresh')?.value;
    const { id } = await params;

    return await fetchWithAccessApi(
        {
            url: `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/api/group/groups/by-document/${id}/`,
            access,
            refresh,
            method: 'GET',
            req,
            returnRes: {
                fail: NextResponse.json({ error: "Fail to create a document." }, { status: 400 }),
                success: NextResponse.json({}, { status: 201 })
            }
        }
    );
}