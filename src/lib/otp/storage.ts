import { eq } from 'drizzle-orm';
import { userTable, otpCodeTable } from '@/db/schema';
import { db } from '@/db/db-config';
import { userInsertSchema, otpInsertSchema } from '@/db/validation/zod-validators';
import type { User } from '@/db/types';
import { OTP_EXPIRY_MINUTES } from './generator';

/**
 * Find or create a user by email
 */
export async function findOrCreateUser(email: string): Promise<{ userId: string; isNewUser: boolean }> {

  // Validate the email using the Zod schema
  const validatedUserData = userInsertSchema.parse({ email });
  
  // Check if user exists
  const existingUser = await db.select()
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1) as User[];
  
  // Return existing user if found
  if (existingUser.length > 0) {
    return { userId: existingUser[0].id, isNewUser: false };
  }
  
  // Create new user
  const [newUser] = await db.insert(userTable)
    .values({
      ...validatedUserData
    })
    .returning({ id: userTable.id });
  
  return { userId: newUser.id, isNewUser: true };
}

/**
 * Store an OTP code for a user
 */
export async function storeOTP(userId: string, hashedOtpCode: string, otpCode: string): Promise<{ code: string; userId: string }> {
  // Calculate expiration time
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + OTP_EXPIRY_MINUTES);
  
  // Clean up any old OTP codes for this user
  try {
    await db.delete(otpCodeTable).where(eq(otpCodeTable.userId, userId));
  } catch (error) {
    console.error(`Failed to delete old OTP codes for user ${userId}:`, error);
    // Continue regardless of error
  }

  // Validate the OTP data - include expiresAt here
  const validatedOtpData = otpInsertSchema.parse({ 
    code: hashedOtpCode,
    userId,
    expiresAt: expirationTime
  });
  
  // Store the new OTP
  const [insertedOtp] = await db.insert(otpCodeTable)
    .values({
      ...validatedOtpData
    })
    .returning({
      code: otpCodeTable.code,
      userId: otpCodeTable.userId
    });
  
  if(!insertedOtp) {
    throw new Error('Failed to store OTP code');
  }
  
  return { code: otpCode, userId: userId };
}