import Form from 'next/form'
import { submitOTP } from './actions'

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CheckYourEmail() {
  return (
    <Card className="max-w-md mx-auto p-6 mt-10 shadow-md">
      <h1 className="font-semibold">Check Your Email for your one-time login code</h1>
      <p>Please enter the 6-digit code we sent to your email address.</p>
      
      <Form action={submitOTP}>
        {/* First flex container for the OTP input */}
        <div className="flex justify-center mt-4">
          <InputOTP maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        
        {/* Second flex container for the button */}
        <div className="flex justify-center mt-4">
          <Button type="submit">Submit</Button>
        </div>
      </Form>
      
      <p>If you do not see the email, check your spam folder.</p>
      <p>If you still cannot find the email, <a href="/resend-email">click here</a> to resend it.</p>
    </Card>
  )
}