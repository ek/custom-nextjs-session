import { generateOTP } from './otp/generator';
import { findOrCreateUser, storeOTP } from './otp/storage';
import { hashOTP } from './otp/hasher';
import type { OTPCode } from '@/db/types';

/**
 * Creates a new user and OTP code in the database
 * 
 * @param email User's email address
 * @returns The OTP code object with code and userId
 */
export async function createUserAndOTP(email: string): Promise<Pick<OTPCode, 'code' | 'userId'>> {
  try {
    // Find or create the user
    const { userId } = await findOrCreateUser(email);

    // Generate an OTP code
    const otpCode = generateOTP();

    // hash the OTP code and store it in the database
    const hashedOtpCode = await hashOTP(otpCode);

    // Store the OTP in the database
    return await storeOTP(userId, hashedOtpCode, otpCode);

  } catch (error) {
    console.error('Error in createUserAndOTP:', error);
    throw new Error(`Failed to create user or OTP: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}