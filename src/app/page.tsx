import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
          with passwordless email authentication. This is a learning project, meant to implement the knowledge shared from <Link href="https://lucia-auth.com/" className="underline">Lucia Auth</Link> learning resource and OWASP security best practices.
        </p>
        
        <div className="bg-muted/40 p-4 rounded-md max-w-3xl text-center">
          <p className="text-sm">
            <span className="font-semibold">🔍 Code Review Welcome:</span> This project is intended as both a learning resource and a practical implementation. 
            Security experts and developers are encouraged to review the code and suggest improvements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
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

        <div className="mt-8 space-y-4 max-w-3xl">
          <h2 className="text-2xl font-semibold text-center">Authentication Flow</h2>
          <div className="bg-muted/40 p-4 rounded-md font-mono text-sm overflow-auto">
            <pre>{`┌─────────────┐     ┌────────────────┐     ┌────────────────┐
│ Login Page  │────►│ Email with OTP │────►│ OTP Validation │
└─────────────┘     └────────────────┘     └───────┬────────┘
                                                   │
┌─────────────┐     ┌────────────────┐             │
│  Dashboard  │◄────│ Session Cookie │◄────────────┘
└─────────────┘     └────────────────┘`}</pre>
          </div>
        </div>

        <div className="mt-8 space-y-4 max-w-3xl">
          <h2 className="text-2xl font-semibold text-center">Motivation</h2>
          <p className="text-center">
            This project was created to understand the internals of authentication systems by building one from scratch
            and demonstrate best practices in secure session management without relying on black-box solutions.
            While excellent auth libraries exist, building your own system provides deeper insights
            into security considerations.
          </p>
        </div>

        <div className="mt-8 space-y-4 max-w-3xl">
          <h2 className="text-2xl font-semibold text-center">How It Works</h2>
          <p className="text-center">
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

        <div className="mt-8 space-y-4 max-w-3xl">
          <h2 className="text-2xl font-semibold text-center">Technical Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="bg-muted/40 p-3 rounded-md text-center">
              <p className="font-medium">Next.js App Router</p>
            </div>
            <div className="bg-muted/40 p-3 rounded-md text-center">
              <p className="font-medium">PostgreSQL via Neon</p>
            </div>
            <div className="bg-muted/40 p-3 rounded-md text-center">
              <p className="font-medium">Drizzle ORM</p>
            </div>
            <div className="bg-muted/40 p-3 rounded-md text-center">
              <p className="font-medium">Resend Email API</p>
            </div>
            <div className="bg-muted/40 p-3 rounded-md text-center">
              <p className="font-medium">Oslo Crypto</p>
            </div>
            <div className="bg-muted/40 p-3 rounded-md text-center">
              <p className="font-medium">ShadCN UI</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/login">
            <Button size="lg" className="px-8">
              Try the Demo
            </Button>
          </Link>
          <Link href="https://github.com/ek/custom-nextjs-session" target="_blank">
            <Button size="lg" variant="outline" className="px-8">
              View Source
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 text-center text-muted-foreground">
          Based on patterns from <Link href="https://lucia-auth.com/" className="underline">Lucia Auth</Link> and OWASP security best practices
        </div>
      </div>
    </div>
  );
}
