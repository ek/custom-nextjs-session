import { generateRandomString, alphabet } from 'oslo/crypto'
import { eq, desc } from 'drizzle-orm'

import { userTable, otpCodeTable } from '@/db/schema';
import type { 
  User, 
  OTPCode,
} from '@/db/types';
import { db } from '@/db/db-config';
import { 
  userInsertSchema, 
  otpInsertSchema,
} from '@/db/validation/zod-validators';

/**
 * Generates a cryptographically secure 6-digit OTP
 * @returns A 6-digit numeric code as string
 */
export function generateOTP(): string {
  const otp = generateRandomString(6, alphabet('0-9'));
  return otp;
}

/**
 * Creates a new user and OTP code in the database or finds existing user
 * @param email The email address of the user
 * @returns The OTP code object
 */
export async function createUserAndOTP(email: string): Promise<Pick<OTPCode, 'code' | 'userId'>> {
  // Validate email
  const validatedUserData = userInsertSchema.parse({ email });
  
  // First check if user already exists
  const existingUser = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1) as User[];
  
  let userId: string;
  
  if (existingUser.length > 0) {
    // Use existing user
    userId = existingUser[0].id;
  } else {
    // Create new user
    const [newUser] = await db.insert(userTable)
      .values({
        ...validatedUserData,
        createdAt: new Date()
      })
      .returning({ id: userTable.id });
    
    userId = newUser.id;
  }
  
  // Generate OTP code
  const otpCode = generateOTP();
  
  // Validate OTP data
  const validatedOtpData = otpInsertSchema.parse({ 
    code: otpCode,
    userId 
  });
  
  const [insertedOtp] = await db.insert(otpCodeTable)
    .values({
      ...validatedOtpData,
      createdAt: new Date()
    })
    .returning({
      code: otpCodeTable.code,
      userId: otpCodeTable.userId
    });
    
  return insertedOtp;
}

/**
 * Type definitions for OTP verification results
 */
type OTPVerificationSuccess = {
  success: true;
  user: {
    id: string;
    email: string;
  };
  otpEntry: {
    code: string;
    userId: string;
    createdAt: Date;
  };
};

type OTPVerificationFailure = {
  success: false;
  error: string;
  message: string;
};

export type OTPVerificationResult = OTPVerificationSuccess | OTPVerificationFailure;

/**
 * Verifies an OTP code for validity and expiration
 * 
 * @param code The 6-digit OTP code to verify
 * @param expirationMinutes How many minutes before the OTP expires (default: 15)
 * @returns A properly typed verification result
 */
export async function verifyOTP(code: string, expirationMinutes = 15): Promise<OTPVerificationResult> {
  try {
    // Find the most recent OTP for this code
    const otpEntries = await db
      .select({
        code: otpCodeTable.code,
        userId: otpCodeTable.userId,
        createdAt: otpCodeTable.createdAt
      })
      .from(otpCodeTable)
      .where(eq(otpCodeTable.code, code))
      .orderBy(desc(otpCodeTable.createdAt))
      .limit(1);
    
    // Check if OTP exists
    if (otpEntries.length === 0) {
      return { 
        success: false, 
        error: 'invalid-code',
        message: 'Invalid verification code'
      };
    }
    
    const otpEntry = otpEntries[0];
    
    // Check if OTP is expired
    const now = new Date();
    const otpCreatedAt = new Date(otpEntry.createdAt);
    
    if ((now.getTime() - otpCreatedAt.getTime()) > expirationMinutes * 60 * 1000) {
      return { 
        success: false, 
        error: 'expired-code',
        message: 'Verification code has expired'
      };
    }
    
    // Find the user associated with this OTP
    const users = await db
      .select({ id: userTable.id, email: userTable.email })
      .from(userTable)
      .where(eq(userTable.id, otpEntry.userId))
      .limit(1);
      
    if (users.length === 0) {
      return { 
        success: false, 
        error: 'user-not-found',
        message: 'User not found for this verification code'
      };
    }
    
    const user = users[0];
    
    // Return success with user info
    return {
      success: true,
      user,
      otpEntry
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { 
      success: false, 
      error: 'verification-failed',
      message: 'Failed to verify code'
    };
  }
}

/**
 * Removes all OTP codes for a given user (after successful verification)
 * 
 * @param userId The ID of the user whose OTP codes should be removed
 */
export async function removeUserOTPCodes(userId: string): Promise<void> {
  await db.delete(otpCodeTable)
    .where(eq(otpCodeTable.userId, userId));
}
