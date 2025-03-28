import { eq, desc } from 'drizzle-orm';
import { db } from '@/db/db-config';
import { userTable, otpCodeTable } from '@/db/schema';
import { OTP_DIGITS } from './generator';
import { hashOTP } from './hasher';  // Import the hasher
import type { OTPVerificationResult } from './types';

/**
 * Verifies an OTP code for validity and expiration
 * 
 * @param code The OTP code to verify
 * @returns A result object typed as OTPVerificationResult
 */
export async function verifyOTP(code: string): Promise<OTPVerificationResult> {
  try {
    // Basic validation of the code format
    if (!code || code.length !== OTP_DIGITS || !/^\d+$/.test(code)) {
      return {
        success: false,
        error: 'invalid-code-format',
        message: 'OTP code must be a 6-digit number'
      };
    }

    // Hash the OTP code - the OTP code is hashed and stored in the database
    const hashedCode = hashOTP(code);
    
    // Find the OTP entry in the database using the hashed code
    const otpEntries = await db
      .select({
        hashedCode: otpCodeTable.hashedCode,
        userId: otpCodeTable.userId,
        createdAt: otpCodeTable.createdAt,
        expiresAt: otpCodeTable.expiresAt
      })
      .from(otpCodeTable)
      .where(eq(otpCodeTable.hashedCode, hashedCode))  // Compare with hashed code
      .orderBy(desc(otpCodeTable.createdAt))
      .limit(1);
    
    // If no matching OTP found
    if (otpEntries.length === 0) {
      return {
        success: false,
        error: 'invalid-code',
        message: 'The OTP code is invalid or has expired'
      };
    }
    
    const otpEntry = otpEntries[0];
    
    // Check if OTP is expired using expiresAt field
    if (new Date() > otpEntry.expiresAt) {
      return {
        success: false,
        error: 'code-expired',
        message: 'The OTP code has expired. Please request a new one.'
      };
    }
    
    // Get the user associated with this OTP
    const users = await db
      .select({
        id: userTable.id,
        email: userTable.email
      })
      .from(userTable)
      .where(eq(userTable.id, otpEntry.userId))
      .limit(1);
    
    if (users.length === 0) {
      return {
        success: false,
        error: 'user-not-found',
        message: 'User associated with this code not found'
      };
    }
    
    const user = users[0];
    
    // Return success result
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
      message: 'Failed to verify code due to a system error'
    };
  }
}