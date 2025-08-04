import { getAccessFromRefreshApi } from "@/lib/utils";

import { NextRequest, NextResponse } from "next/server";

const getDownloadUrl = (docId: number) => `${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}` + 
    `/api/document/documents/${docId}/file_download/`;

export async function POST(req: NextRequest) {
    const params = await req.json();
    const loginUrl = new URL('/login', req.url);
    const pathname = params.pathname;
    loginUrl.searchParams.set('pathname', pathname);
    let access = req.cookies.get('access')?.value;
    const refresh = req.cookies.get('refresh')?.value;
    const url = getDownloadUrl(params.docId);

    try {
        if (access && refresh) {
            let res = await fetch(
                url,
                {
                    body: JSON.stringify({
                        ext: params.ext
                    }),
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${access}`
                    }
                }
            );

            if (!res.ok) {
                if (res.status === 401) {
                    access = await getAccessFromRefreshApi(refresh);
                    res = await fetch(
                        url,
                        {
                            body: JSON.stringify({
                                ext: params.ext
                            }),
                            method: "GET",
                            headers: {
                                "Authorization": `Bearer ${access}`
                            }
                    });

                    if (!res.ok) {
                        if (res.status === 401)
                            return NextResponse.redirect(loginUrl);
                        else
                            return NextResponse.json({ error: "Download file fail." },
                                { status: 400 });
                    } else {
                       const filename = params.documentName;
                        const encodedFilename = encodeURIComponent(filename);
                        return new NextResponse(res.body, {
                            status: 200,
                            headers: params.ext == 'xlsx'? {
                                'Content-Type': 'application/pdf',
                                'Content-Disposition': `attachment; filename="download.pdf"; filename*=UTF-8''${encodedFilename}`
                            }: {
                                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                    'Content-Disposition': `attachment; filename="download.xlsx"; filename*=UTF-8''${encodedFilename}`
                            }
                        }); 
                    }
                } else
                    return NextResponse.json({ error: "Download file fail." },
                        { status: 400 });
            } else {
                const filename = params.documentName;
                const encodedFilename = encodeURIComponent(filename);
                return new NextResponse(res.body, {
                    status: 200,
                    headers: params.ext == 'xlsx'? {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `attachment; filename="download.pdf"; filename*=UTF-8''${encodedFilename}`
                    }: {
                            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            'Content-Disposition': `attachment; filename="download.xlsx"; filename*=UTF-8''${encodedFilename}`
                    }
                });
            }
        } else if (!access && refresh) {
            access = await getAccessFromRefreshApi(refresh);
            let res = await fetch(
                url,
                {
                    body: JSON.stringify({
                        ext: params.ext
                    }),
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${access}`
                    }
            });

            if (!res.ok) {
                if (res.status === 401)
                    return NextResponse.redirect(loginUrl); 
                else
                    return NextResponse.json({ error: "Download file fail." },
                        { status: 400 }); 
            } else {
               const filename = params.documentName;
                const encodedFilename = encodeURIComponent(filename);
                return new NextResponse(res.body, {
                    status: 200,
                    headers: params.ext == 'xlsx'? {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `attachment; filename="download.pdf"; filename*=UTF-8''${encodedFilename}`
                    }: {
                            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            'Content-Disposition': `attachment; filename="download.xlsx"; filename*=UTF-8''${encodedFilename}`
                    }
                }); 
            }
        } else {
            return NextResponse.redirect(loginUrl);  
        }
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Download fail." }, { status: 400 });
    }
}
