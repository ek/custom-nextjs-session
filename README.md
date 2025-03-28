# Custom Next.js Session Management

A production-ready implementation of custom session management for Next.js applications, demonstrating secure authentication and session handling without third-party auth libraries.

This repo has been setup by using the [Lucia](https://lucia-auth.com/) learning resource on implementing auth from scratch.

> **🔍 Code Review Welcome**: This project is intended as both a learning resource and a practical implementation. Security experts and developers are encouraged to review the code and suggest improvements via issues or pull requests.

## Motivation

This project was created to:

1. **Learn by Implementing**: Understand the internals of authentication systems by building one from scratch
2. **Demonstrate Best Practices**: Show how to implement secure session management without relying on black-box solutions
3. **Fill a Gap**: Provide a lightweight alternative when full auth libraries are overkill
4. **Apply OWASP Guidelines**: Implement OWASP's recommended practices for web application security in a Next.js context
5. **Explore Modern Tools**: Demonstrate how modern tools like Drizzle ORM, Oslo crypto libraries, and Next.js App Router can work together

While excellent auth libraries like Auth.js, Clerk, and Supabase Auth exist, building your own system provides deeper insights into security considerations and greater flexibility for custom requirements.

## Live Demo

Try the [live demo](https://custom-nextjs-session.vercel.app) to see the authentication flow in action.

## Key Features

- **Passwordless Authentication**: Email-based OTP (one-time password) verification
- **Secure Session Management**: SHA-256 hashed tokens, HTTP-only cookies
- **CSRF Protection**: Origin validation, SameSite cookie policies
- **Database Integration**: PostgreSQL with Drizzle ORM for data persistence
- **Sliding Session Expiration**: Auto-extends sessions during active use
- **Environment-Aware Security**: Enhanced security in production environments

## Technical Architecture

- **Frontend**: Next.js App Router, React Server Components, TypeScript
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM for type-safe database interactions
- **Email**: Resend API for transactional emails
- **Security**: Oslo for cryptographic operations
- **UI**: TailwindCSS with shadcn/ui components

## Authentication Flow

```
┌─────────────┐     ┌────────────────┐     ┌────────────────┐
│ Login Page  │────►│ Email with OTP │────►│ OTP Validation │
└─────────────┘     └────────────────┘     └───────┬────────┘
                                                   │
┌─────────────┐     ┌────────────────┐             │
│  Dashboard  │◄────│ Session Cookie │◄────────────┘
└─────────────┘     └────────────────┘
```

## Security Implementation

### Session Management

- **Token Generation**: Cryptographically secure random tokens (100 bits of entropy)
- **Storage Model**: Tokens delivered to users, only SHA-256 hashes stored in database
- **Cookie Security**: HTTP-only, SameSite=strict, Secure flags, __Secure- prefix in production
- **Session Validation**: Server-side validation on each protected request

### CSRF Protection

- **Origin Verification**: Strict origin/host validation in middleware
- **SameSite Policy**: 'strict' in production, 'lax' in development
- **Token Management**: Explicit API for consistent cookie handling

## How It Works

1. **Login Flow**:
   - User enters email address
   - System generates OTP and stores it in database
   - Email sent with verification code
   - User enters code to verify identity
   - On verification, session created and cookie set

2. **Session Verification**:
   - Session token from cookie is hashed and compared with database
   - User data retrieved if session is valid
   - Session extended if approaching expiration (sliding window)

3. **Security Measures**:
   - Sessions invalidated on logout
   - Automatic cleanup of used OTP codes
   - Middleware protection for all routes
   - Environment-specific security enhancements

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon account)
- Resend API key for email delivery

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/custom-nextjs-session.git
cd custom-nextjs-session
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Create .env.local file
DATABASE_URL=your_postgresql_connection_string
RESEND_API_KEY=your_resend_api_key
```

4. Run database migrations:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

5. Start the development server:

```bash
npm run dev
```

### Implementation Details

#### Cookie Management

The system implements a tiered approach to cookie security:

- Development: Standard cookie names, SameSite=lax
- Production: __Secure- prefix, SameSite=strict, HTTPOnly, Secure flags

#### Session Token Strategy

1. Generate cryptographically secure random token (via Oslo)
2. Store SHA-256 hash in database, not the token itself
3. Set token in client cookie
4. For verification, hash incoming cookie value and compare with database

#### Database Schema

- Users: Store basic user information
- Sessions: Store hashed session tokens with expiration
- OTP Codes: Temporary storage for verification codes

#### Inspiration and References

- Best practices from Lucia Auth
- Security patterns from OWASP recommendations
- Next.js 15 App Router architecture
- Drizzle ORM for database interactions
- Oslo security libraries for cryptographic operations

## Comparison with Auth Libraries

| Feature | This Project | Auth.js | Lucia | Clerk |
|---------|--------------|---------|-------|-------|
| Size | Lightweight | Moderate | Lightweight | Full-featured |
| Customization | High | Medium | High | Limited |
| Setup Complexity | Moderate | Low | Moderate | Very Low |
| Database | Any via Drizzle | Adapters | Adapters | Managed |
| Learning Value | High | Medium | High | Low |

## Troubleshooting

Common issues and their solutions:

- **OTP not received**: Check spam folder or server logs for email delivery issues
- **Database connection errors**: Verify your Neon connection string
- **Session not persisting**: Check cookie configuration and browser settings

## Resources

- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Lucia Auth Documentation](https://lucia-auth.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Neon DB Docs](https://neon.tech/docs/introduction)

### License

MIT
