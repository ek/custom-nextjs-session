'use server'
import { redirect } from 'next/navigation';

// Updated imports
import { verifyOTP } from '@/lib/otp/verification';
import { removeUserOTPCodes } from '@/lib/otp/cleanup';
import { createUserSession } from '@/lib/session-utils';
import { extractOTPFromForm } from '@/lib/otp/utils';

/**
 * Verifies OTP code and creates a user session
 * 
 * 1. Extracts and validates the OTP from form data
 * 2. Checks if OTP matches one in the database
 * 3. Creates a session for the user if valid
 * 4. Sets session cookie
 * 5. Redirects to dashboard
 */
export async function submitOTP(formData: FormData) {
  try {
    // Step 1: Extract and validate OTP from form
    const code = extractOTPFromForm(formData);
    if (!code) {
      redirect('/check-your-email?error=invalid-code');
    }
    
    // Step 2: Verify the OTP code
    const result = await verifyOTP(code);
    if (!result.success) {
      redirect(`/check-your-email?error=${result.error}`);
    }
    
    // Step 3: Create session and set cookie
    await createUserSession(result.user.id);
    
    // Step 4: Clean up used OTP codes and verify deletion
    const deletionResult = await removeUserOTPCodes(result.user.id);
    if (!deletionResult.success) {
      console.error('OTP deletion issue:', deletionResult.error);
      // Continue even if deletion failed, but log the issue
    }
    
  } catch (error) {
    console.error('Error in submitOTP:', error);
    redirect('/check-your-email?error=verification-failed');
  }

  // Step 5: Redirect outside the try/catch block
  redirect('/dashboard');
}