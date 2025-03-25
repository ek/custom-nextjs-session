'use server'
import { redirect } from 'next/navigation';

import { verifyOTP, removeUserOTPCodes } from '@/lib/otp-code';
import { createUserSession } from '@/lib/session-utils';
import { extractOTPFromForm } from '@/lib/otp-utils';

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
    console.log('submitOTP:', formData);
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
    // Now TypeScript knows result.user exists and has an id property
    await createUserSession(result.user.id);
    
    // Step 4: Clean up used OTP codes (security best practice)
    await removeUserOTPCodes(result.user.id);
    
  } catch (error) {
    console.error('Error in submitOTP:', error);
    redirect('/check-your-email?error=verification-failed');
  }

  // Step 5: Redirect outside the try/catch block
  redirect('/dashboard');
}