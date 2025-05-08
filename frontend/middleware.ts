import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refresh = request.cookies.get('refresh')?.value;

  // Allow public paths (you can customize this list)
  const publicPaths = ['/login', '/register'];
  const isPublic = publicPaths.includes(pathname);

  // If no refresh token and not on a public route, redirect
  if (!refresh && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('pathname', pathname); // remember where to return
    return NextResponse.redirect(loginUrl);
  }

  const access = request.cookies.get('access')?.value;
  if (!access && refresh) {
  const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh }),
  });

  if (tokenRes.ok) {
    const response = NextResponse.next();
    const data = await tokenRes.json();
    response.cookies.set('access', data.data.access, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      path: '/',
      maxAge: 60 * 5,
    });
    return response;
  }
}

  return NextResponse.next(); // allow request to proceed
}

export const config = {
  matcher: [
    '/((?!api|_next|static|favicon.ico).*)',
  ],
};