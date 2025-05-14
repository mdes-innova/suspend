import { getAccessFromRefresh } from "@/lib/utils";
import axios from "axios";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const params = await req.json();
    const docUrl = `${process.env.NEXT_PUBLIC_BACKEND}/api/document/documents/`;
    let access = req.cookies.get('access')?.value;
    const refresh = req.cookies.get('refresh')?.value;

    try {
        const res = await axios.post(
            docUrl,
            {
                headers: {
                    Authorization: `Bearer ${access}`,
                }
            }
        );
    } catch (error) {
        
    }
}