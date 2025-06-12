import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';

export async function middleware(request: NextRequest) {

  const url = request.nextUrl.clone();
  const { pathname } = request.nextUrl;
  const access = request.cookies.get('access')?.value;
  const refresh = request.cookies.get('refresh')?.value;
  const isLoginPage = pathname === '/login';
  const fullPath =  process.env.NEXT_PUBLIC_FRONTEND + url.pathname + url.search;

  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for') || '';
  const ip = forwardedFor.split(',')[0];
  const headerss = new Headers();
  headerss.set("Content-Type", "application/json");
  if (access) {
    headerss.set("Authorization", `Bearer ${access}`);
  }

  try {
    const fullPathList = fullPath.split('/');
    const docviewIdx = fullPathList.findIndex(e => e === 'document-view');

    const _ = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/activity/activities/by-activity/visit/`,
      {
        method: 'POST',
        headers: headerss,
        body: JSON.stringify({
          ipAddress: ip,
          path: fullPath,
          did: parseInt(fullPathList[docviewIdx + 1])
        })
      }
    );
  } catch (error) {
    
  }

  // Allow public paths (you can customize this list)
  const publicPaths = ['/login'];
  const isPublic = publicPaths.includes(pathname);

  // If no refresh token and not on a public route, redirect
  if (!refresh && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('pathname', pathname); // remember where to return
    return NextResponse.redirect(loginUrl);
  }

  
  if (!access && refresh) {
    const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
      credentials: 'include',
    });
    
    if (tokenRes.ok) {
      const response = isLoginPage
      ? NextResponse.redirect(new URL('/', request.url))
      : NextResponse.next();
      
      const data = await tokenRes.json();
      response.cookies.set('access', data.access, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 5,
      });
      return response;
    }
}
    if (access) {
      const response = isLoginPage
        ? NextResponse.redirect(new URL('/', request.url))
        : NextResponse.next();
      return response;
  }
  return NextResponse.next(); // allow request to proceed
}

export const config = {
  matcher: [
    '/((?!api|_next|static|favicon.ico).*)',
  ],
};