'use server'
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { invalidateSession } from '@/lib/session';

/**
 * Logs the user out by:
 * 1. Getting the session token from cookies
 * 2. Invalidating the session in the database
 * 3. Clearing the session cookie
 * 4. Redirecting to the login page
 */
export async function logout() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (sessionCookie?.value) {
    // Convert token to session ID 
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(sessionCookie.value)));
    
    // Invalidate the session in the database
    await invalidateSession(sessionId);
    
    // Delete the session cookie
    cookieStore.delete('session');
  }
  
  // Redirect to login page
  redirect('/login');
}