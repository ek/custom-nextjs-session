'use server'
import { redirect } from 'next/navigation';
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { invalidateSession } from '@/lib/session';
import { getSessionCookie, clearSessionCookie } from '@/lib/cookie-utils';

/**
 * Logs the user out by:
 * 1. Getting the session token from cookies
 * 2. Invalidating the session in the database
 * 3. Clearing the session cookie
 * 4. Redirecting to the login page
 */
export async function logout() {
  const sessionToken = await getSessionCookie();
  
  if (sessionToken) {
    // Convert token to session ID 
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)));
    
    // Invalidate the session in the database
    await invalidateSession(sessionId);
    
    // Delete the session cookie using the centralized util
    await clearSessionCookie();
  }
  
  // Redirect to login page
  redirect('/login');
}