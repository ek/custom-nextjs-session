'use server'
import { redirect } from 'next/navigation'
import { config } from 'dotenv';
import { Resend } from 'resend';

import { createUserAndOTP } from '@/lib/otp-code';
import { EmailTemplate } from '@/components/email-template';
import { extractEmail } from '@/lib/email-utils';
import type { EmailValidationResult } from '@/lib/email-utils';

config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send OTP email to user
 * Returns success boolean instead of redirecting
 */
async function sendOTPEmail(email: string, otpCode: string): Promise<boolean> {
  try {
    const emailContent = await EmailTemplate({ otpCode });
    const { error, data } = await resend.emails.send({
      from: 'Session Test <onboarding@resend.dev>',
      to: [email],
      subject: 'Your login code',
      react: emailContent,
    });
    
    if (error) {
      console.error('Email sending error:', error);
      return false;
    }
    
    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Main login action function
 */
export async function submitLogin(formData: FormData) {
  // Step 1: Extract and validate email
  const validation: EmailValidationResult = extractEmail(formData);
  
  // Handle validation errors
  if (!validation.success) {
    console.log(`Email validation failed: ${validation.error}`);
    redirect(`/login?error=${validation.code}`);
  }
  
  // Validation succeeded
  const email = validation.email;
  
  // Variables to track operation status
  let otpEntry;
  let emailSent = false;
  let errorType = null;
  
  try {
    // Step 2: Generate OTP and create/find user
    otpEntry = await createUserAndOTP(email);

    // Check for OTP generation failure without redirecting
    if (!otpEntry || !otpEntry.code) {
      errorType = 'otp-generation-failed';
      console.error('OTP generation failed');
    } else {
      // Step 3: Send email with OTP
      emailSent = await sendOTPEmail(email, otpEntry.code);
      
      // Set error type if email sending failed
      if (!emailSent) {
        errorType = 'email-send-failed';
      }
    }
  } catch (error) {
    // Only actual exceptions from the code
    console.error('Error in login process:', error);
    errorType = 'server-error';
  }
  
  // Handle all redirects outside the try-catch
  if (errorType) {
    redirect(`/login?error=${errorType}`);
  }
  
  // Step 4: Success redirect (only reached if everything succeeded)
  redirect('/check-your-email');
}


