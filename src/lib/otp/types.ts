/**
 * Type definitions for OTP operations
 */

// Success response format for OTP verification
export type OTPVerificationSuccess = {
  success: true;
  user: {
    id: string;
    email: string;
  };
  otpEntry: {
    userId: string;
    createdAt: Date;
  };
};

// Error response format for OTP verification
export type OTPVerificationFailure = {
  success: false;
  error: string;
  message: string;
};

// Combined type for verification results
export type OTPVerificationResult = OTPVerificationSuccess | OTPVerificationFailure;

// Cleanup operation result type
export type CleanupResult = {
  success: boolean;
  deletedCount?: number;
  error?: string;
};

// OTP deletion result type
export type OTPDeletionResult = {
  success: boolean;
  deletedCount?: number;
  initialCount?: number;
  remainingCount?: number;
  error?: string;
};