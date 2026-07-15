import { NextRequest, NextResponse } from 'next/server';
import { getSubdomain } from '@/lib/domain';
import { domainConfig } from '@/config/domain';

const PUBLIC_FILE = /\.(.*)$/;

// Helper sederhana untuk cek status login (sesuaikan dengan mekanisme auth Anda)
const isAuthenticated = (req: NextRequest) => {
  const token = req.cookies.get('token'); // Sesuaikan nama cookie Anda
  return !!token;
};

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
    if (domainConfig.enableAdminPathRouting) {
      return NextResponse.next();
    }
    url.pathname = '/404';
    return NextResponse.rewrite(url);
  }

  /*
  |--------------------------------------------------------------------------
  | INTERNAL USER ROUTES
  |--------------------------------------------------------------------------
  */
  /*
  |--------------------------------------------------------------------------
  | INTERNAL USER ROUTES
  |--------------------------------------------------------------------------
  */
  // Tambahkan /clearance ke sini agar tidak direwrite ke /user/clearance
  if (
    pathname.startsWith('/user') || 
    pathname.startsWith('/clearence')
  ) {
    return NextResponse.next();
  }

  /*
  |--------------------------------------------------------------------------
  | ROOT REDIRECTS
  |--------------------------------------------------------------------------
  */
  if (subdomain === domainConfig.subdomains.admin && pathname === '/') {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  if (!subdomain && pathname === '/') {
    url.pathname = '/login-screen';
    return NextResponse.redirect(url);
  }

  /*
  |--------------------------------------------------------------------------
  | SUBDOMAIN ROUTING (DITAMBAHKAN PROTEKSI DI SINI)
  |--------------------------------------------------------------------------
  */
  if (subdomain === domainConfig.subdomains.admin) {
    const isLoginPath = pathname === '/login-screen';
    const isAuth = isAuthenticated(req);

    // 1. Jika belum login dan tidak akses halaman login, paksa ke login
    if (!isAuth && !isLoginPath) {
      url.pathname = '/login-screen';
      return NextResponse.redirect(url);
    }

    // 2. Jika sudah login dan mencoba buka halaman login, lempar ke dashboard
    if (isAuth && isLoginPath) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // 3. Rewrite normal ke /admin
    url.pathname = `/admin${pathname}`;
    return NextResponse.rewrite(url);
  }

  /*
  |--------------------------------------------------------------------------
  | DEFAULT USER ROUTING
  |--------------------------------------------------------------------------
  */
  url.pathname = `/user${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!.*\\.).*)'],
};