import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAccess } from './components/actions/auth';

const publicBases = ['/login', '/confirm', '/_not-found'];

function isPublicPath(pathname: string) {
  return publicBases.some((base: string) => pathname === base || pathname.startsWith(base + '/'));
}

export async function middleware(request: NextRequest) {
  const { pathname, href, search, hash } = request.nextUrl;
  const returnTo = pathname + search + hash;
  const dest = request.headers.get('sec-fetch-dest') ?? 'unknown';
  console.log('[MW] HIT', pathname, '| dest:', dest, '| href:', href);

  // Early skips
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/.well-known') ||
    pathname === '/favicon.ico' ||
    /\.(?:png|jpe?g|gif|webp|svg|ico|css|js|map|txt|xml|woff2?|ttf|eot)$/.test(pathname)
  ) {
    console.log('[MW] SKIP static/internal:', pathname);
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    console.log('[MW] SKIP /login');
    return NextResponse.next();
  }

  try {
    await getAccess();
  } catch {
    const url = new URL('/login', request.nextUrl);
    url.searchParams.set('pathname', returnTo);
    console.log('[MW] REDIRECT ->', url.href);
    return NextResponse.redirect(url);
  }

  console.log('[MW] NEXT:', pathname);
  return NextResponse.next();
}


export const config = { matcher: '/:path*' };