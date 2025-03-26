// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { 
  COOKIE_MAX_AGE, 
  getSessionCookieName,
  getSessionTokenFromRequestCookies,
  getSameSitePolicy
} from '@/lib/cookie-utils';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (request.method === "GET") {
    const response = NextResponse.next();
    
    // Use the dedicated utility function instead of manual cookie checking
    const token = getSessionTokenFromRequestCookies(request.cookies);
    
    if (token !== null) {
      // Get the appropriate cookie name for the current environment
      const cookieName = getSessionCookieName();
      const sameSite = getSameSitePolicy();
      
      response.cookies.set(cookieName, token, {
        path: "/",
        maxAge: COOKIE_MAX_AGE,
        sameSite,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
      });
    }
    return response;
  }

  // CSRF protection
  const originHeader = request.headers.get("Origin");
// NOTE: You may need to use `X-Forwarded-Host` instead
  const hostHeader = request.headers.get("Host");
  if (originHeader === null || hostHeader === null) {
    return new NextResponse(null, {
      status: 403
    });
  }
  let origin: URL;
  try {
    origin = new URL(originHeader);
  } catch {
    return new NextResponse(null, {
      status: 403
    });
  }
  if (origin.host !== hostHeader) {
    return new NextResponse(null, {
      status: 403
    });
  }
  return NextResponse.next();
}
