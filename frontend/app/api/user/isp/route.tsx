import { fetchWithAccessApi } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const access = req.cookies.get('access')?.value;
    const refresh = req.cookies.get('refresh')?.value;

    const userData = await fetchWithAccessApi(
        {
            url: `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/api/user/users/`,
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

    if (userData.ok) {
        const data = await userData.json();
        return NextResponse.json({users: data.data.filter((x: any) => x.isp != null)});
    } else {
        return NextResponse.json({ error: "Fail to get users." }, { status: 404 });
    }
}