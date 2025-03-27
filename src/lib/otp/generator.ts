import { generateRandomIntegerNumber } from "@oslojs/crypto/random";
import type { RandomReader } from "@oslojs/crypto/random";

// Configuration
export const OTP_DIGITS = 6;
// OTP expires after 10 minutes
export const OTP_EXPIRY_MINUTES = 10;

/**
 * Create a RandomReader that uses the Web Crypto API
 */
const random: RandomReader = {
  read(bytes: Uint8Array): void {
    crypto.getRandomValues(bytes);
  }
};

/**
 * Generates a random 6-digit OTP code for email verification
 */
export function generateOTP(): string {
  const MIN_SIX_DIGIT = 100000;
  const MAX_SIX_DIGIT = 999999;
  // set range to be from 1 to 899999
  const RANGE = MAX_SIX_DIGIT - MIN_SIX_DIGIT;
  // add 100000 to the random value to guarantee a 6-digit number
  const randomValue = generateRandomIntegerNumber(random, RANGE) + MIN_SIX_DIGIT;
  return randomValue.toString();
}