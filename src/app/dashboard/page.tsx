import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Form from 'next/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { validateSessionToken } from '@/lib/session';
import { logout } from './actions';

export default async function Dashboard() {
  // Get the session cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  // If no session cookie, redirect to login
  if (!sessionCookie?.value) {
    redirect('/login');
  }
  
  // Validate the session and get user info
  const { user, session } = await validateSessionToken(sessionCookie.value);
  
  // If session is invalid, redirect to login
  if (!user) {
    redirect('/login');
  }
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Form action={logout}>
          <Button type="submit" variant="outline" className="px-4">
            Log out
          </Button>
        </Form>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>User ID:</strong> {user.id}
            </div>
            <div>
              <strong>Session Expires:</strong> {new Date(session.expiresAt).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <p>Welcome to your dashboard! You are now logged in.</p>
    </div>
  );
}