import { getAccessFromRefresh } from "@/lib/utils";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const getUploadUrl = (docId: number) => `${process.env.NEXT_PUBLIC_BACKEND}` + 
    `/api/document/documents/${docId}/file_upload/`;

export async function POST(req: NextRequest) {
    const params = await req.json();
    const docUrl = `${process.env.NEXT_PUBLIC_BACKEND}/api/document/documents/`;
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const pathname = formData.get("pathname") as string;
    const loginUrl = new URL('/login', req.url);

    loginUrl.searchParams.set('pathname', pathname);

    let access = req.cookies.get('access')?.value;
    const refresh = req.cookies.get('refresh')?.value;

    if (!file || file.type !== "application/pdf") {
        return NextResponse.json({ error: "Please upload a PDF file" }, { status: 400 });
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file);
    let backendResponse: null | Response = null;

    if (access) {
        let backendResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${access}`,
            },
            body: backendFormData,
        });

        if (!backendResponse.ok) {
            if (backendResponse.status === 401) {
                if (refresh) {
                    try {
                        access = await getAccessFromRefresh(refresh);
                        const docResponse = axios.post(

                        );
                        backendResponse = await fetch(uploadUrl, {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${access}`,
                            },
                            body: backendFormData,
                        });

                        if (!backendResponse.ok) {
                            if (backendResponse.status === 401)
                                return NextResponse.redirect(loginUrl);
                            else
                                return NextResponse.json({ error: "Upload failed" }, { status: backendResponse.status });
                        }
                        const data = await backendResponse.json();
                        return NextResponse.json(data);
                    } catch (error) {
                        return NextResponse.redirect(loginUrl);
                    }
                } else
                    return NextResponse.redirect(loginUrl);
            } else
                return NextResponse.json({ error: "Upload failed" }, { status: backendResponse.status });
        } else {
            const data = await backendResponse.json();
            return NextResponse.json(data);
        }
    } else {
        if (refresh) {
            try {
                access = await getAccessFromRefresh(refresh);
                backendResponse = await fetch(uploadUrl, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${access}`,
                    },
                    body: backendFormData,
                });

                if (!backendResponse.ok) {
                    if (backendResponse.status === 401)
                        return NextResponse.redirect(loginUrl);
                    else
                        return NextResponse.json({ error: "Upload failed" }, { status: backendResponse.status });
                }
                const data = await backendResponse.json();
                return NextResponse.json(data);
            } catch (error) {
                return NextResponse.redirect(loginUrl);
            }
        } else
            return NextResponse.redirect(loginUrl);
    }
}
