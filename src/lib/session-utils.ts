import { generateSessionToken, createSession } from '@/lib/session';
import { setSessionCookie } from '@/lib/cookie-utils';

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
  
  // Set the session cookie using the centralized util
  await setSessionCookie(sessionToken);
  
  return sessionToken;
}