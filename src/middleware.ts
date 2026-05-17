import { NextRequest, NextResponse } from 'next/server';

import { getSubdomain } from '@/lib/domain';
import { domainConfig } from '@/config/domain';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /*
  |--------------------------------------------------------------------------
  | IGNORE INTERNALS / STATIC FILES
  |--------------------------------------------------------------------------
  */

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
  | CLEAN SUBDOMAIN URLS
  |--------------------------------------------------------------------------
  |
  | admin.localhost/admin/dashboard
  | -> admin.localhost/dashboard
  |
  */

  if (subdomain === domainConfig.subdomains.admin && pathname.startsWith('/admin')) {
    url.pathname = pathname.replace('/admin', '') || '/';

    return NextResponse.redirect(url);
  }

  /*
  |--------------------------------------------------------------------------
  | OPTIONAL DIRECT PATH ACCESS
  |--------------------------------------------------------------------------
  */

  if (pathname.startsWith('/admin')) {
    // Allow localhost/admin/*
    if (domainConfig.enableAdminPathRouting) {
      return NextResponse.next();
    }

    // Block direct access when disabled
    url.pathname = '/404';

    return NextResponse.rewrite(url);
  }

  /*
  |--------------------------------------------------------------------------
  | INTERNAL USER ROUTES
  |--------------------------------------------------------------------------
  */

  if (pathname.startsWith('/user')) {
    return NextResponse.next();
  }

  /*
  |--------------------------------------------------------------------------
  | ROOT REDIRECTS
  |--------------------------------------------------------------------------
  */

  // admin.localhost -> /dashboard
  if (subdomain === domainConfig.subdomains.admin && pathname === '/') {
    url.pathname = '/dashboard';

    return NextResponse.redirect(url);
  }

  // localhost -> /login-screen
  if (!subdomain && pathname === '/') {
    url.pathname = '/login-screen';

    return NextResponse.redirect(url);
  }

  /*
  |--------------------------------------------------------------------------
  | SUBDOMAIN ROUTING
  |--------------------------------------------------------------------------
  */

  // admin.localhost/dashboard
  // -> /admin/dashboard
  if (subdomain === domainConfig.subdomains.admin) {
    url.pathname = `/admin${pathname}`;

    return NextResponse.rewrite(url);
  }

  /*
  |--------------------------------------------------------------------------
  | DEFAULT USER ROUTING
  |--------------------------------------------------------------------------
  */

  // localhost/dashboard
  // -> /user/dashboard
  url.pathname = `/user${pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!.*\\.).*)'],
};
