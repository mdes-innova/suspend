import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextRequest, NextResponse } from "next/server";

type ReturnRes = {
  fail: NextResponse,
  success: NextResponse
}
type Params = {
  url: string,
  access: string | undefined,
  refresh: string | undefined,
  req: NextRequest,
  returnRes: ReturnRes,
  method: string,
  file?: null | File,
  params: object
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getAccessFromRefresh(refresh: string) {
  try {
    const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/token/refresh/`, {
          method: 'POST',
          body: JSON.stringify(
              {
                  refresh
              }
          ),
          headers: {
            'Content-Type': 'application/json'
          },
      },
    );
    if (!refreshRes.ok)
      throw new Error("Invalid refresh token");

    const { access } = await refreshRes.json();
    const response = NextResponse.next();
    response.cookies.set("access", access, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 5, // 5 minutes
    });
    return access;

  } catch (error) {
    throw new Error("Invalid refresh token");
  }
}

export async function fetchWithAccess(params: Params) {
  try {
    let { access } = params;
    let backendData: null | object | FormData = null;
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${params.access}`)
    if (params?.file) {
      backendData = new FormData();
      (backendData as FormData).append("file", params.file);
    } else {
      backendData = params.params;
      headers.append("Content-Type", "application/json");
    }
    if (access && params.refresh) {
      let res = await fetch(
          params.url,
          {
            method: params.method,
            body: params.file
            ? backendData as FormData 
            : JSON.stringify(backendData),
            headers
          });

      if (!res.ok) {
          if (res.status === 401) {
              access = await getAccessFromRefresh(params.refresh);
              res = await fetch(
                params.url,
                {
                  method: params.method,
                  body: params.file
                  ? backendData as FormData 
                  : JSON.stringify(backendData),
                  headers 
              });

              if (!res.ok) {
                  if (res.status === 401)
                      return NextResponse.json({ error: "Unauthorized." },
                    { status: 401 });
                  else
                    return params.returnRes.fail; 
              } else {
                  const resJson = await res.json();
                  return NextResponse.json({ data: resJson },
                    { status: params.returnRes.success.status });
              }
          } else
              return params.returnRes.fail; 
      } else {
          const resJson = await res.json();
          return NextResponse.json({ data: resJson },
            { status: params.returnRes.success.status });

      }

  } else if (!access && params.refresh) {
      access = await getAccessFromRefresh(params.refresh);
      let res = await fetch(
        params.url,
        {
          method: params.method,
          body: params.file
          ? backendData as FormData 
          : JSON.stringify(backendData),
          headers 
      });

      if (!res.ok) {
          if (res.status === 401)
              return NextResponse.json({ error: "Unauthorized." },
            { status: 401 });
          else
            return params.returnRes.fail;
      } else {
          const resJson = await res.json();
          return NextResponse.json({ data: resJson },
            { status: params.returnRes.success.status });
      }
    } else {
        return NextResponse.json({ error: "Unauthorized." },
          { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Fetch fail." }, { status: 400 });
  }
}