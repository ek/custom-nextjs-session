import { sha256 } from "@oslojs/crypto/sha2";

/**
 * Hashes the given OTP code using SHA-256
 * 
 * @param otpCode The OTP code to hash
 * @returns The hashed OTP code as a hex string
 */
export function hashOTP(otpCode: string): string {
  // Convert string to Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(otpCode);
  
  // Hash the data
  const hash = sha256(data);
  
  // Convert hash to hex string for storage
  return Array.from(hash)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}