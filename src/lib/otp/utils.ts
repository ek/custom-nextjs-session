/**
 * Extracts a 6-digit OTP code from form data
 * 
 * @param formData The form data containing OTP digits
 * @returns The extracted OTP code or null if invalid
 */
export function extractOTPFromForm(formData: FormData): string | null {
  // Get the OTP from the hidden input field
  const code = formData.get('otp')?.toString() || '';
  // Validate OTP format
  if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
    console.error('Invalid OTP code:', code);
    return null;
  }
  return code;
}