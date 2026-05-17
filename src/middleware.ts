import { NextRequest, NextResponse } from 'next/server';

import { getSubdomain } from '@/lib/domain';
import { domainConfig } from '@/config/domain';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const host = req.headers.get('host') ?? '';

  const subdomain = getSubdomain(host);

  const url = req.nextUrl.clone();

  /*
  |--------------------------------------------------------------------------
  | BLOCK DIRECT ACCESS
  |--------------------------------------------------------------------------
  */

  // localhost cannot access /admin
  if (!subdomain && pathname.startsWith('/admin')) {
    url.pathname = '/404';

    return NextResponse.rewrite(url);
  }

  // admin.localhost cannot access /user
  if (subdomain === domainConfig.subdomains.admin && pathname.startsWith('/user')) {
    url.pathname = '/404';

    return NextResponse.rewrite(url);
  }

  /*
  |--------------------------------------------------------------------------
  | INTERNAL ROUTES
  |--------------------------------------------------------------------------
  */

  if (pathname.startsWith('/admin') || pathname.startsWith('/user')) {
    return NextResponse.next();
  }

  /*
  |--------------------------------------------------------------------------
  | DOMAIN ROUTING
  |--------------------------------------------------------------------------
  */

  // admin.localhost
  if (subdomain === domainConfig.subdomains.admin) {
    url.pathname = `/admin${pathname}`;

    return NextResponse.rewrite(url);
  }

  // default user site
  url.pathname = `/user${pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!.*\\.).*)'],
};
