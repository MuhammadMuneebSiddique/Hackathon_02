'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionData } from '@/lib/authentication-methods';
import VitalTasks from '../components/vitalTasks';

export default function VitalTasksPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const sessionData = await getSessionData();
      setSession(sessionData);

      if (!sessionData) {
        // If not authenticated, redirect to login page
        router.push('/login');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // If not authenticated, don't render anything as redirect happens in useEffect
  if (!session) {
    return null;
  }

  return (
    <VitalTasks />
  );
}