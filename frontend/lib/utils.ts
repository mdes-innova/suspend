import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextRequest, NextResponse } from "next/server";
import { NextApiResponse } from "next";

export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class LogError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 601) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ReturnRes = {
  fail: NextResponse,
  success: NextResponse
};

type Params = {
  url: string,
  access?: string,
  refresh?: string,
  req?: NextRequest,
  returnRes: ReturnRes,
  method: string,
  file?: File | null,
  params?: object
};

async function handleSuccess(res: Response, returnRes: ReturnRes) {
  const data = await res.json();
  return NextResponse.json({ data }, { status: returnRes.success.status });
}

function handleFailure(res: Response, returnRes: ReturnRes) {
  if (res.status === 401) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return res;
}

export async function getAccessFromRefreshApi(refresh: string) {
  try {
    const refreshRes = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/api/token/refresh/`, {
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

export async function fetchWithAccessApi(params: Params) {
  try {
    let { access, refresh, url, method, file, params: bodyParams, returnRes } = params;

    console.log(bodyParams)

    const headers = new Headers();
    let body: FormData | string | undefined;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      body = formData;
    } else if (bodyParams) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(bodyParams);
    }

    // Utility to send fetch with current headers and body
    const sendRequest = async (): Promise<Response> => {
      return fetch(url, {
        method,
        headers,
        body,
      });
    };

    // Try with current access token
    if (access && refresh) {
      headers.set("Authorization", `Bearer ${access}`);
      let res = await sendRequest();

      // Try to refresh if unauthorized
      if (res.status === 401) {
        access = await getAccessFromRefreshApi(refresh);
        headers.set("Authorization", `Bearer ${access}`);
        res = await sendRequest();

        if (!res.ok) {
          return handleFailure(res, returnRes);
        }
        return await handleSuccess(res, returnRes);
      }

      // Non-401 failure
      if (!res.ok) {
        return handleFailure(res, returnRes);
      }

      return await handleSuccess(res, returnRes);
    }

    // No access token — try refresh only
    if (!access && refresh) {
      access = await getAccessFromRefreshApi(refresh);
      headers.set("Authorization", `Bearer ${access}`);
      const res = await sendRequest();

      if (!res.ok) {
        return handleFailure(res, returnRes);
      }

      return await handleSuccess(res, returnRes);
    }

    // No valid access or refresh
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  } catch (error) {
    return NextResponse.json({ error: "Fetch failed." }, { status: 400 });
  }
}

export async function fetchWithAccessApp({ access, refresh, url, method, params: bodyParams }: {
  access?: string,
  refresh?: string,
  url: string,
  method: string,
  params?: object
}) {
    const headers = new Headers();
    let body: string | undefined;
    if (access) headers.append("Authorization", `Bearer ${access}`);
    if (bodyParams) {
      body = JSON.stringify(bodyParams);
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(url, { headers, body, method });

    if (!res.ok) {
      if (res.status === 401 && refresh) {
        const refreshRes = await fetch(`${process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.process.env.BACKEND_URL_PROD}/api/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        });
  
        if (!refreshRes.ok) throw new AuthError("Invalid refresh token");
  
        const { access: newAccess } = await refreshRes.json();
        headers.set("Authorization", `Bearer ${newAccess}`);
  
        const retryRes = await fetch(url, { headers, method, body });
        if (!retryRes.ok) {
          if (res.status === 401) throw new AuthError("Authentication fail.");
          else throw new Error("Retry fetch failed");
        }
        return retryRes.json();
      } else {
          throw new Error("Fetch failed");
      }
    }

    return res.json();
}

export function Date2Thai(date: string) {
  const newDate = new Date(date);
  return Text2Thai(new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(newDate));
}

export function Datetime2Thai(date: string) {
  const newDate = new Date(date);
  return (new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(newDate)).toString();
}

export function Text2Thai(text: string) {
  const digitsMap = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return text.replace(/\d/g, (d) => digitsMap[parseInt(d)]);
}