import { fetchWithAccessApi, getAccessFromRefreshApi } from "@/lib/utils";
import axios from "axios";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const getUploadUrl = (docId: number) => `${process.env.NEXT_PUBLIC_BACKEND}` + 
    `/api/document/documents/${docId}/file-upload/`;

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('file') as File?? null;
    const loginUrl = new URL('/login', req.url);
    const pathname = formData.get("pathname") as string;
    loginUrl.searchParams.set('pathname', pathname);
    const access = req.cookies.get('access')?.value;
    const refresh = req.cookies.get('refresh')?.value;
    const cookieHeader = req.headers.get('cookie') ?? "";
    let docId: null | number = null;      

    if (!file || file.type !== "application/pdf") {
          return NextResponse.json({ error: "Please upload a PDF file" }, { status: 400 });
    }

    try {
        const docRes = await fetch(
            `${process.env.NEXT_PUBLIC_FRONTEND}/api/doc/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Cookie": cookieHeader
                },
                body: JSON.stringify({
                    title: formData.get("title") as string,
                    category: formData.get("category") as string
                })
            },
        );
        if (docRes.ok) {
            const docJson = await docRes.json();
            docId = docJson.data.id as number;
            const uploadRes = await fetchWithAccessApi(
                {
                    url: getUploadUrl(docId),
                    access,
                    refresh,
                    method: 'POST',
                    params: {},
                    file,
                    req,
                    returnRes: {
                        fail: NextResponse.json({ error: "Fail to upload file." }, { status: 400 }),
                        success: NextResponse.json({}, { status: 201 })
                    }
                }
            );

            if (uploadRes.ok)
            {
                const uploadJson = await uploadRes.json();
                return NextResponse.json({data: uploadJson.data },
                    {status: 200});
            } else {
                if (docRes.status === 401)
                    return NextResponse.redirect(loginUrl);
                else
                    return NextResponse.json({ error: "Upload file fail." },
                    { status: 400 });
            }
        } else {
            if (docRes.status === 401)
                return NextResponse.redirect(loginUrl);
            else
                return NextResponse.json({ error: "Create a document fail. Cannot a upload file." },
                { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ error: "Upload file fail." }, { status: 400 });
    }
}
