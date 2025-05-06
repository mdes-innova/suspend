import axios from 'axios';
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

type Tag = {
    id: number,
    name: string,
    createAt: string,
    modifiedAt: string
}

type Category = {
    id: number,
    name: string,
    createAt: string,
    modifiedAt: string
}

type Document = {
    id: number,
    title: string,
    category: Category,
    tags?: Tag[],
    createAt: string,
    modifiedAt: string
}

export async function GET(req: NextRequest) {
  const refresh = req.cookies.get('refresh')?.value;
  const access = req.cookies.get('access')?.value;

  console.log(req.cookies)
  console.log('Access:', access);
  console.log('Refresh:', refresh);

  if (!refresh || !access) {
    return NextResponse.json({ message: 'No token' }, { status: 401 });
  }

  // make authenticated backend call or return content
  return NextResponse.json({ message: 'Authenticated!' });
}

// export async function GET(req: NextRequest) {
//     const token = req.cookies.get('refresh')?.value;
//     console.log(token);
    // let cookieStore = cookies();
    // let access = cookieStore.get('access')?.value;
    // console.log("XXXXXXXXXXXXXXXXX");
    // console.log(access)
    // console.log("XXXXXXXXXXXXXXXXX");
    // const refresh = cookieStore.get('refresh');

    // if (!access) return NextResponse.json({ message:  'No access token'}, {
    //     status: 401
    // });

    // try {
    //     const response: Document[] = await axios.get(
    //         `${process.env.NEXT_PUBLIC_BACKEND}/api/document/documents/`, {
    //         headers: { Authorization: `Bearer ${access}` },
    //     });

    //     return NextResponse.json({ data: response.map((e, _) => ({
    //         id: e.id,
    //         title: e.title
    //     }))})
    // } catch (error: any) {
    //     if (error.response?.status === 401 && refresh) {
    //         try {
    //             const refreshResponse = await fetch(
    //                 `${process.env.NEXT_PUBLIC_FRONTEND}/api/auth/refresh/`, {
    //                 method: 'GET'
    //             })
    //             if (refreshResponse.ok) {
    //                 cookieStore = cookies();
    //                 access = cookieStore.get('access');
    //                 const retryResponse: Document[] = await axios.get(
    //                     `${process.env.NEXT_PUBLIC_BACKEND}/api/document/documents/`, {
    //                     headers: {
    //                         Authorization: `Bearer ${access}`,
    //                     },
    //                 });

    //                 return NextResponse.json({ data: retryResponse.map((e, _) => ({
    //                     id: e.id,
    //                     title: e.title
    //                 }))})
    //             } else {
    //                 return NextResponse.json({ message:  'No access token'}, {
    //                     status: 401
    //                 });
    //             }
    //         } catch (refreshError: any) {
                //  return NextResponse.json({ message : 'Refresh token expired or invalid' },
                //     { status: 403 }
                //  );
    //         }
    //     }
    // }

// }