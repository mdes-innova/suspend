import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refresh = request.cookies.get('refresh')?.value;
  const isLoginPage = pathname === '/login';

  // Allow public paths (you can customize this list)
  const publicPaths = ['/login'];
  const isPublic = publicPaths.includes(pathname);

  // If no refresh token and not on a public route, redirect
  if (!refresh && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('pathname', pathname); // remember where to return
    return NextResponse.redirect(loginUrl);
  }

  
  const access = request.cookies.get('access')?.value;
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