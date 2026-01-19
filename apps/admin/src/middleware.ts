import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');
  const isLandingPage = request.nextUrl.pathname === '/';
  const isVerifyPage = request.nextUrl.pathname.startsWith('/verify');
  const isProtectedPage = !isAuthPage && !isLandingPage && !isVerifyPage && !request.nextUrl.pathname.startsWith('/_next');

  // Only check auth for protected pages or auth pages (to avoid unnecessary calls)
  if (isProtectedPage || isAuthPage) {
    // Refresh session if expired
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const role = user?.user_metadata?.role;

    // If accessing protected pages without auth, redirect to login
    if (isProtectedPage && !user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // If authenticated but not admin, redirect to login with error
    if (isProtectedPage && user && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // If authenticated admin on login page, redirect to dashboard
    if (isAuthPage && user && role === 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
