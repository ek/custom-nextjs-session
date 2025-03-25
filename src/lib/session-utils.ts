import { cookies } from 'next/headers';
import { generateSessionToken, createSession } from '@/lib/session';

/**
 * Creates a new session for a user and sets the session cookie
 * 
 * @param userId The ID of the user to create a session for
 * @returns The generated session token
 */
export async function createUserSession(userId: string): Promise<string> {
  // Create a session token
  const sessionToken = generateSessionToken();
  
  // Create a session in the database
  await createSession(sessionToken, userId);
  
  // Set the session cookie (secure in production, expires in 30 days)
  const cookieStore = await cookies(); // Add await here
  cookieStore.set({
    name: 'session',
    value: sessionToken,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax'
  });
  
  return sessionToken;
}