import { NextRequest, NextResponse } from "next/server";
import { fetchWithAccessApi } from "@/lib/utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
    const id = (await params).id;
    const data = await req.json();
    let access = req.cookies.get('access')?.value;
    const refresh = req.cookies.get('refresh')?.value;

    return await fetchWithAccessApi(
        {
            url: `${process.env.NEXT_PUBLIC_BACKEND}/api/group/groups/${id}/`,
            access,
            refresh,
            method: 'PATCH',
            req,
            params: {
                documentIds: data.documentIds.map((e :string) => parseInt(e)),
                append: data.append?? false
            },
            returnRes: {
                fail: NextResponse.json({ error: "Fail to create playlist." }, { status: 400 }),
                success: NextResponse.json({}, { status: 200 })
            }
        }
    );
}