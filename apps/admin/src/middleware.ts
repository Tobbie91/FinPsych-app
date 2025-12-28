import { type NextRequest } from 'next/server';
import { updateSession } from '@fintech/lib';

/**
 * Middleware to refresh Supabase auth session.
 * This runs before every request to keep the session alive.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
