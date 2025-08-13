import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const path = (pathname.split('/'))[1];
  if (['_not-found', 'confirm-mail'].includes(path))
    return NextResponse.next();
  const access = request.cookies.get('access')?.value;
  const refresh = request.cookies.get('refresh')?.value;
  const isLoginPage = pathname === '/login';

  const publicPaths = ['/login'];
  const isPublic = publicPaths.includes(pathname);

  // If no refresh and not public, redirect to login
  if (!refresh && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('pathname', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If refresh exists but access is missing, try to refresh
  if (!access && refresh) {
    try {
      const baseUrl = process.env.NODE_ENV === "development"? process.env.BACKEND_URL_DEV: process.env.BACKEND_URL_PROD;

      const tokenRes = await fetch(`${baseUrl}/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      });

      if (tokenRes.ok) {
        const data = await tokenRes.json();
        const response = isLoginPage
          ? NextResponse.redirect(new URL('/', request.url))
          : NextResponse.next();

        response.cookies.set('access', data.access, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 5,
        });

        return response;
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
    }
  }

  // If already has access token
  if (access) {
    return isLoginPage
      ? NextResponse.redirect(new URL('/', request.url))
      : NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|static|favicon.ico).*)'],
};
