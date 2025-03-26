import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container max-w-6xl mx-auto py-16 px-4">
      <div className="flex flex-col gap-8 items-center">
        <h1 className="text-4xl font-bold text-center">
          Next.js Custom Session Management
        </h1>
        
        <p className="text-xl text-center max-w-3xl text-muted-foreground">
          A secure, production-ready implementation of stateful session management 
          with passwordless email authentication.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Secure Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Implements SHA-256 based session tokens, secure cookies, and server-side validation with sliding expiration.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Passwordless Auth</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Demonstrates email-based one-time password (OTP) login flow with secure verification and automatic cleanup.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CSRF Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Features comprehensive CSRF protection via middleware with origin validation and same-site cookie policies.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold text-center">How It Works</h2>
          <p className="max-w-3xl text-center">
            This project implements a secure session management system using Next.js server components and server actions. 
            It demonstrates best practices for session-based authentication without relying on third-party libraries.
          </p>
          
          <ol className="list-decimal list-inside max-w-2xl mx-auto space-y-2 mt-4">
            <li>Enter your email to receive a one-time login code</li>
            <li>Verify your identity with the 6-digit code</li>
            <li>A secure HTTP-only session cookie is established</li>
            <li>Your session is stored in the database and verified on each request</li>
            <li>Sliding session expiration extends your session when active</li>
          </ol>
        </div>

        <div className="mt-8">
          <Link href="/login">
            <Button size="lg" className="px-8">
              Try the Demo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
