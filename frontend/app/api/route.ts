import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';

export async function GET(req: NextRequest) {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND}/api/token/`, {
        email: 'user@example.com',
        password: 'string'
    });
    console.log(response);
    return NextResponse.json({data: "hello"});
}