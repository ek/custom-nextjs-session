import { cleanupExpiredOTPCodes } from '@/lib/otp/cleanup';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify the request is from your cron service using a secret
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  try {
    const result = await cleanupExpiredOTPCodes();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to clean up OTPs:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' }, 
      { status: 500 }
    );
  }
}