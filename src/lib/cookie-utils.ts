import { cookies } from 'next/headers';

export const COOKIE_NAME = 'session';
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Returns the appropriate cookie name based on environment
 * Production uses the __Secure- prefix for added security
 */
export function getSessionCookieName(): string {
  return process.env.NODE_ENV === 'production'
    ? `__Secure-${COOKIE_NAME}`
    : COOKIE_NAME;
}

/**
 * Returns the appropriate SameSite policy based on environment
 * Production uses strict for maximum security
 * Development uses lax for easier testing
 */
export function getSameSitePolicy(): 'strict' | 'lax' {
  return process.env.NODE_ENV === 'production' ? 'strict' : 'lax';
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  const cookieName = getSessionCookieName();
  const sameSite = getSameSitePolicy();
  
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite,
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE,
    path: "/"
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const cookieName = getSessionCookieName();
  const sameSite = getSameSitePolicy();
  
  cookieStore.set(cookieName, "", {
    httpOnly: true,
    sameSite,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: "/"
  });
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const cookieName = getSessionCookieName();
  
  const sessionCookie = cookieStore.get(cookieName);
  return sessionCookie?.value;
}

/**
 * Gets the session token from request cookies, checking both standard
 * and secure formats regardless of environment.
 * 
 * This is useful for middleware where cookies might exist in either format
 * due to environment transitions.
 */
export function getSessionTokenFromRequestCookies(
  requestCookies: {get: (name: string) => {value: string} | undefined}
): string | null {
  // Check for secure cookie format first
  const secureToken = requestCookies.get(`__Secure-${COOKIE_NAME}`)?.value;
  if (secureToken) {
    return secureToken;
  }
  
  // Fall back to standard cookie format
  const standardToken = requestCookies.get(COOKIE_NAME)?.value;
  if (standardToken) {
    return standardToken;
  }
  
  return null;
}