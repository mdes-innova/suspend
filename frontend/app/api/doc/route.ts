import { getAccessFromRefresh } from "@/lib/utils";
import axios from "axios";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const params = await req.json();
    const docUrl = `${process.env.NEXT_PUBLIC_BACKEND}/api/document/documents/`;
    let access = req.cookies.get('access')?.value;
    const refresh = req.cookies.get('refresh')?.value;
    const pathname = params?.pathname;
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('pathname', pathname);

    try {
        if (access && refresh) {
            let res = await fetch(
                docUrl,
                {
                    method: 'POST',
                    body: JSON.stringify(
                        {
                            title: params?.title ?? null,
                        }
                    ),
                    headers: {
                        Authorization: `Bearer ${access}`,
                        "Content-Type": "application/json",
                    },
                });

            console.log(res)

            if (!res.ok) {
                if (res.status === 401) {
                    access = await getAccessFromRefresh(refresh);
                    res = await fetch(
                        docUrl,
                        {
                            method: 'POST',
                            body: JSON.stringify(
                                {
                                    title: params?.title ?? null,
                                    category: params?.category ?? null,
                                }
                            ),
                            headers: {
                                Authorization: `Bearer ${access}`,
                            },
                        });
                    if (!res.ok) {
                        if (res.status === 401)
                            return NextResponse.redirect(loginUrl);
                        else
                            return NextResponse.json({ error: "Create document fail." }, 
                                { status: 400 });
                    } else {
                        const resJson = await res.json();
                        return NextResponse.json({ data: resJson });
                    }
                } else
                    return NextResponse.json({ error: "Create document fail." }, 
                        { status: 400 });
            } else {
                const resJson = await res.json();
                return NextResponse.json({ data: resJson });

            }

        } else if (!access && refresh) {
            access = await getAccessFromRefresh(refresh);
            let res = await fetch(
                docUrl,
                {
                    method: 'POST',
                    body: JSON.stringify(
                        {
                            title: params?.title ?? null,
                            category: params?.category ?? null,
                        }
                    ),
                    headers: {
                        Authorization: `Bearer ${access}`,
                    },
                });
            if (!res.ok) {
                if (res.status === 401)
                    return NextResponse.redirect(loginUrl);
                else
                    return NextResponse.json({ error: "Create document fail." }, 
                        { status: 400 });
            } else {
                const resJson = await res.json();
                return NextResponse.json({ data: resJson });
            }
        } else {
            return NextResponse.redirect(loginUrl);
        }
    } catch (error) {
        return NextResponse.json({ error: "Create document fail." }, 
            { status: 400 });
    }
}