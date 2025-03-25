import { generateRandomString, alphabet } from 'oslo/crypto'
import { eq } from 'drizzle-orm'

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
      .values(validatedUserData)
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
    .values(validatedOtpData)
    .returning({
      code: otpCodeTable.code,
      userId: otpCodeTable.userId
    });
    
  return insertedOtp;
}
