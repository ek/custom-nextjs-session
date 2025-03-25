import Form from 'next/form'
import { submitLogin } from './actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  return (
    <Card className="max-w-md mx-auto p-6 mt-10 shadow-md">
      <h1 className="font-semibold text-left">Log in</h1>
      <p className="text-left text-gray-600 mb-4">Enter your email to receive a one-time login code</p>
      
      <Form action={submitLogin}>
        <div className="space-y-4">
          <div className="text-left">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email address
            </label>
            <Input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="name@example.com" 
              className="w-full" 
              required 
            />
          </div>
          
          <div className="flex justify-center mt-6">
            <Button type="submit" className="w-full">
              Continue with Email
            </Button>
          </div>
        </div>
      </Form>
      
      <p className="text-sm text-gray-500 mt-6 text-center">
        We will email you a magic code for a password-free sign in.
      </p>
    </Card>
  )
}