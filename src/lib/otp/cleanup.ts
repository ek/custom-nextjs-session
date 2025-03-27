import { eq, lt, sql } from 'drizzle-orm';
import { db } from '@/db/db-config';
import { otpCodeTable } from '@/db/schema';
import type { CleanupResult, OTPDeletionResult } from './types';

/**
 * Cleans up expired OTP codes from the database
 * This could be called from a cron job or scheduled task
 * 
 * @returns Information about the cleanup operation
 */
export async function cleanupExpiredOTPCodes(): Promise<CleanupResult> {
  try {
    // Use the expiresAt field directly instead of calculating from createdAt
    const now = new Date();
    
    // Delete all OTP codes that have expired
    const result = await db.delete(otpCodeTable)
      .where(lt(otpCodeTable.expiresAt, now))
      .returning();
    
    console.log(`Cleaned up ${result.length} expired OTP codes`);
    return {
      success: true,
      deletedCount: result.length
    };
  } catch (error) {
    console.error('Error cleaning up expired OTP codes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during OTP cleanup'
    };
  }
}

/**
 * Removes all OTP codes for a given user and verifies they were deleted
 * 
 * @param userId The ID of the user whose OTP codes should be removed
 * @returns Object with deletion status information
 */
export async function removeUserOTPCodes(userId: string): Promise<OTPDeletionResult> {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'Missing userId parameter'
      };
    }

    // Count how many OTP codes exist before deletion
    const beforeCount = await db
      .select({ count: sql`count(*)` })
      .from(otpCodeTable)
      .where(eq(otpCodeTable.userId, userId));
    
    const initialCount = Number(beforeCount[0]?.count || 0);
    
    // If no codes exist, return early
    if (initialCount === 0) {
      console.log(`No OTP codes to delete for user ${userId}`);
      return { 
        success: true, 
        initialCount,
        deletedCount: 0,
        remainingCount: 0
      };
    }
    
    // Delete all OTP codes for this user
    const result = await db.delete(otpCodeTable)
      .where(eq(otpCodeTable.userId, userId))
      .returning();
    
    const deletedCount = result.length;
    
    // Verify deletion by checking if any codes remain
    const afterCheck = await db
      .select({ code: otpCodeTable.code })
      .from(otpCodeTable)
      .where(eq(otpCodeTable.userId, userId))
      .limit(1);
    
    const remainingCount = afterCheck.length;
    
    if (remainingCount > 0) {
      console.error(`Failed to delete all OTP codes for user ${userId}. ${remainingCount} codes remain.`);
      return { 
        success: false,
        initialCount,
        deletedCount,
        remainingCount,
        error: 'Failed to delete all OTP codes' 
      };
    }
    
    console.log(`Successfully deleted ${deletedCount} of ${initialCount} OTP codes for user ${userId}`);
    
    return { 
      success: true,
      initialCount,
      deletedCount,
      remainingCount: 0
    };
  } catch (error) {
    console.error('Error removing OTP codes:', error);
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during OTP deletion'
    };
  }
}