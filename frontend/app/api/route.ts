import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';

export async function GET(req: NextRequest) {
    const response = await axios.post(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/api/token/`, {
        email: 'user@example.com',
        password: 'string'
    });
    console.log(response);
    return NextResponse.json({data: "hello"});
}