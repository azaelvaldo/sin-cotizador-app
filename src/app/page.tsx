'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminView from '@/components/views/admin-view';
import UserView from '@/components/views/user-view';
import Navbar from '@/components/navbar';

interface User {
  id: string;
  email: string;
  role: string;
}

interface Session {
  access_token: string;
  token_type: string;
  expires_in: string;
  user: User;
}

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session in localStorage
    const storedSession = localStorage.getItem('session');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
      } catch (error) {
        console.error('Failed to parse stored session:', error);
        localStorage.removeItem('session');
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('session');
    setSession(null);
    router.push('/login');
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || !user) {
    return null;
  }

  // Render role-specific component with navbar
  if (session.user.role === 'ADMIN') {
    return (
      <>
        <Navbar />
        <AdminView />
      </>
    );
  } else if (session.user.role === 'USER') {
    return (
      <>
        <Navbar />
        <UserView user={session.user} />
      </>
    );
  }

  // Fallback for unknown roles
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to Sinecta</h1>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <span className="font-semibold">Email:</span> {session.user.email}
                </div>
                <div>
                  <span className="font-semibold">Role:</span> {session.user.role}
                </div>
                <div>
                  <span className="font-semibold">User ID:</span> {session.user.id}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
