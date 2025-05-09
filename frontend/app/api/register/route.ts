import axios from 'axios';
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const params = await req.json();
    const cookieStore = await cookies();
    let access = cookieStore.get('access')?.value;
    const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/user/users/`, params,
        { 
            headers: {
                Authorization: `Bearer ${access}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return NextResponse.json({ data: { username: res.data.username }});
  } catch (err) {
    console.log(err);
    return NextResponse.json({message: 'Invalid credentials'}, {status: 401});
  }
}
