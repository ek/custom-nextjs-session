import { z } from 'zod';
import { 
  createInsertSchema, 
  createSelectSchema, 
  createUpdateSchema 
} from 'drizzle-zod';
import { userTable, otpCodeTable, sessionTable } from '@/db/schema';

/**
 * User schemas
 */
export const userSelectSchema = createSelectSchema(userTable);
export const userInsertSchema = createInsertSchema(userTable, {
  id: z.string().uuid().optional(),
  email: z.string().email({ message: "Invalid email format" }),
  createdAt: z.date().optional()
});
export const userUpdateSchema = createUpdateSchema(userTable, {
  email: z.string().email({ message: "Invalid email format" }).optional(),
});

/**
 * OTP schemas
 */
export const otpSelectSchema = createSelectSchema(otpCodeTable);
export const otpInsertSchema = createInsertSchema(otpCodeTable, {
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  code: z.string().length(6, { message: "OTP code must be exactly 6 characters" }),
  createdAt: z.date().optional()
});
export const otpUpdateSchema = createUpdateSchema(otpCodeTable, {
  code: z.string().length(6, { message: "OTP code must be exactly 6 characters" }).optional(),
});

/**
 * Session schemas
 */
export const sessionSelectSchema = createSelectSchema(sessionTable);
export const sessionInsertSchema = createInsertSchema(sessionTable, {
  id: z.string(), // Use string instead of UUID
  userId: z.string().uuid(),
  expiresAt: z.date()
});
export const sessionUpdateSchema = createUpdateSchema(sessionTable, {
  expiresAt: z.date().optional()
});

/**
 * Custom login schema for form validation
 */
export const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" })
});

/**
 * Custom OTP verification schema
 */
export const otpVerificationSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  code: z.string().length(6, { message: "OTP code must be exactly 6 digits" })
    .regex(/^\d+$/, { message: "OTP code must contain only numbers" })
});

// Type inference helpers
export type UserSelect = z.infer<typeof userSelectSchema>;
export type UserInsert = z.infer<typeof userInsertSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;

export type OTPSelect = z.infer<typeof otpSelectSchema>;
export type OTPInsert = z.infer<typeof otpInsertSchema>;
export type OTPUpdate = z.infer<typeof otpUpdateSchema>;

export type SessionSelect = z.infer<typeof sessionSelectSchema>;
export type SessionInsert = z.infer<typeof sessionInsertSchema>;
export type SessionUpdate = z.infer<typeof sessionUpdateSchema>;
