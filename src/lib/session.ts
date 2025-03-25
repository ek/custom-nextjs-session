import { eq } from "drizzle-orm";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

import { db } from "@/db/db-config";
import { userTable, sessionTable } from "@/db/schema";
import type { User, Session } from "@/db/schema";

/**
 * Generates a cryptographically secure random session token.
 * 
 * Creates a 20-byte random value using the Web Crypto API and
 * encodes it as a base32 string (without padding) for safe use in cookies
 * and URLs. This provides approximately 100 bits of entropy.
 * 
 * Base32 is preferred over:
 * - base64 (case sensitive, problematic in URLs)
 * - hex (less compact encoding)
 * 
 * IMPORTANT: Never use Math.random() or non-secure UUID generators for session tokens.
 * 
 * @returns {string} A secure random base32-encoded token string
 */
export function generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
}

/**
 * Creates a new session in the database for a given user.
 * 
 * Security model:
 * - User receives a session token (stored in cookies/localStorage)
 * - Database stores only the SHA-256 hash of this token as session ID
 * - This ensures that even if the database is compromised, valid session tokens cannot be derived
 * 
 * The session has a default expiration of 30 days from creation.
 * 
 * @param {string} token - The session token generated by generateSessionToken()
 * @param {number} userId - The ID of the user this session belongs to
 * @returns {Promise<Session>} The newly created session object
 */
export async function createSession(token: string, userId: number): Promise<Session> {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const session: Session = {
        id: sessionId,
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    };
    await db.insert(sessionTable).values(session);
    return session;
}

/**
 * Validates a session token and retrieves the associated user.
 * 
 * This function implements a sliding expiration model:
 * - Sessions automatically extend their expiration when used
 * - Inactive sessions will eventually expire
 * - The extension only happens when the session is within 15 days of expiring
 * 
 * Session validation process:
 * 1. Converts the token to a session ID using SHA-256 (same as creation)
 * 2. Looks up the session and associated user in a single query
 * 3. Verifies the session hasn't expired
 * 4. Automatically extends the session expiration if needed
 * 
 * @param {string} token - The session token to validate
 * @returns {Promise<SessionValidationResult>} Object containing the session and user if valid,
 * or null values if invalid/expired
 */
export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
    // Convert token to session ID using the same hash method as during creation
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    
    // Fetch both session and user in a single query for efficiency
    const result = await db
        .select({ user: userTable, session: sessionTable })
        .from(sessionTable)
        .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
        .where(eq(sessionTable.id, sessionId));
    
    // If no session found, return null values
    if (result.length < 1) {
        return { session: null, user: null };
    }
    
    const { user, session } = result[0];
    
    // Check if session is expired
    if (Date.now() >= session.expiresAt.getTime()) {
        // Delete expired session from database
        await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
        return { session: null, user: null };
    }
    
    // Auto-extend session if it's within 15 days of expiring (sliding expiration)
    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
        session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        await db
            .update(sessionTable)
            .set({
                expiresAt: session.expiresAt
            })
            .where(eq(sessionTable.id, session.id));
    }
    
    return { session, user };
}

/**
 * Invalidates (deletes) a specific session.
 * 
 * Used for logging out a user from a specific device/browser.
 * Note that this takes the session ID (hash) not the original token.
 * 
 * @param {string} sessionId - The ID of the session to invalidate
 * @returns {Promise<void>}
 */
export async function invalidateSession(sessionId: string): Promise<void> {
    await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

/**
 * Invalidates (deletes) all sessions for a specific user.
 * 
 * Used for security purposes such as:
 * - Password changes
 * - Account compromises/suspicious activity
 * - Account deletion
 * - Forcing a user to log out from all devices
 * 
 * @param {number} userId - The ID of the user whose sessions should be invalidated
 * @returns {Promise<void>}
 */
export async function invalidateAllSessions(userId: number): Promise<void> {
    await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
}

/**
 * Type defining the possible return values from validateSessionToken.
 * 
 * Either returns both a valid session and user, or null for both values
 * when the session is invalid/expired.
 */
export type SessionValidationResult =
    | { session: Session; user: User }
    | { session: null; user: null };

/**
 * Example usage:
 * 
 * Sign in:
 * ```
 * const token = generateSessionToken();
 * const session = await createSession(token, user.id);
 * setCookie("session", token);
 * ```
 * 
 * Authenticate:
 * ```
 * const token = getCookie("session");
 * if (token) {
 *   const { user, session } = await validateSessionToken(token);
 *   if (user) {
 *     // User is authenticated
 *   }
 * }
 * ```
 * 
 * Logout:
 * ```
 * const token = getCookie("session");
 * const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
 * await invalidateSession(sessionId);
 * removeCookie("session");
 * ```
 */

