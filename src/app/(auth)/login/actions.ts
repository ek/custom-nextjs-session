'use server'
import { redirect } from 'next/navigation'
import { config } from 'dotenv';
import { Resend } from 'resend';

import { createUserAndOTP } from '@/lib/otp-code';
import { EmailTemplate } from '@/components/email-template';

config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);
const emailRegex = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');

/**
 * Extract and validate email from form data
 */
function extractEmail(formData: FormData): string {
  const email = formData.get('email');
  
  // Check if the email is missing
  if (!email) {
    redirect('/login?error=missing-email');
  }
  
  // Type check to ensure email is a string
  if (typeof email !== 'string') {
    redirect('/login?error=invalid-email-format');
  }
  
  // Trim the email to remove leading/trailing whitespace
  const trimmedEmail = email.trim();
  if (trimmedEmail === '') {
    redirect('/login?error=empty-email');
  }
  
  // Validate the email format
  if (!emailRegex.test(trimmedEmail)) {
    redirect('/login?error=invalid-email');
  }
  
  return trimmedEmail;
}

/**
 * Generate OTP and associate with user
 */
async function generateUserOTP(email: string): Promise<{ code: string; userId: string }> {
  try {
    const otpEntry = await createUserAndOTP(email);
    
    if (!otpEntry.code) {
      redirect('/login?error=otp-generation-failed');
    }
    
    return otpEntry;
  } catch (error) {
    console.error('Error generating OTP:', error);
    redirect('/login?error=otp-generation-failed');
  }
}

/**
 * Send OTP email to user
 */
async function sendOTPEmail(email: string, otpCode: string): Promise<void> {
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
      redirect('/login?error=email-send-failed');
    }
    
    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Error sending email:', error);
    redirect('/login?error=email-send-failed');
  }
}

/**
 * Main login action function
 */
export async function submitLogin(formData: FormData) {
  // Step 1: Extract and validate email
  const email = extractEmail(formData);
  
  // Step 2: Generate OTP and create/find user
  const { code } = await generateUserOTP(email);
  
  // Step 3: Send email with OTP
  await sendOTPEmail(email, code);
  
  // Step 4: Redirect to success page
  redirect('/check-your-email');
}


