import { z } from "zod";

const emailRegex = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');

// Create a Zod schema for email validation
const emailSchema = z.string().email({
  message: "Please enter a valid email address"
});

/**
 * Result type for email validation
 */
export type EmailValidationResult = 
  | { success: true; email: string }
  | { success: false; error: string; code: string };

/**
 * Extract and validate email from form data
 * Returns an object with validation result instead of redirecting
 */
export function extractEmail(formData: FormData): EmailValidationResult {
  const email = formData.get('email');
  
  // Check if the email is missing
  if (!email) {
    return { 
      success: false, 
      error: 'Email is required', 
      code: 'missing-email'
    };
  }
  
  // Type check to ensure email is a string
  if (typeof email !== 'string') {
    return { 
      success: false, 
      error: 'Email must be a string', 
      code: 'invalid-email-format'
    };
  }
  
  // Trim the email to remove leading/trailing whitespace
  const trimmedEmail = email.trim();
  if (trimmedEmail === '') {
    return { 
      success: false, 
      error: 'Email cannot be empty', 
      code: 'empty-email'
    };
  }
  
  // Basic regex validation
  if (!emailRegex.test(trimmedEmail)) {
    return { 
      success: false, 
      error: 'Please enter a valid email address', 
      code: 'invalid-email'
    };
  }
  
  // Final validation using Zod's email validator
  try {
    // Parse the email using Zod schema
    emailSchema.parse(trimmedEmail);
    
    // If we got here, the email is valid
    return { success: true, email: trimmedEmail };
  } catch (error) {
    // If Zod validation fails, return appropriate error
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Invalid email format',
        code: 'zod-invalid-email'
      };
    }
    
    // Handle any other unexpected errors
    return {
      success: false,
      error: 'Email validation failed',
      code: 'validation-error'
    };
  }
}