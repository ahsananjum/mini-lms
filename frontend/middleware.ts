import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES, COOKIE_NAME } from './src/lib/constants';

// This is the Phase 0 route protection scaffold.
// In Phase 1 we will verify JWTs or call an auth endpoint.
export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  
  if (!token) {
    // If no token, redirect to login for all protected paths matching config
    return NextResponse.redirect(new URL(ROUTES.PUBLIC.LOGIN, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/student/:path*',
    '/instructor/:path*',
    '/pending-approval'
  ],
};
