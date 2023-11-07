import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { supabaseServiceKey, supabaseUrl } from '@/lib/supabase';

import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/forgot', '/reset'];

const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function middleware(req: NextRequest) {
  // Store current request url in a custom header, which you can read later
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-current-pathname', req.nextUrl.pathname);
  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (
    !session &&
    !(
      publicPaths.includes(req.nextUrl.pathname) ||
      req.nextUrl.pathname.startsWith('/auth')
    )
  ) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|bg1.jpg|403|404).*)',
  ],
};
