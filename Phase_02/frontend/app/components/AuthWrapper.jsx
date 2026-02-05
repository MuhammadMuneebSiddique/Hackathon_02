'use client';

import { getSessionData } from '@/lib/authentication-methods';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Higher-order component to protect routes
export function withAuthProtection(WrappedComponent) {
  return function ProtectedComponent(props) {
    const router = useRouter();
    const pathname = usePathname();
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is authenticated
    useEffect(() => {
      const checkAuth = async () => {
        setIsLoading(true);
        const sessionData = await getSessionData();
        setSession(sessionData);

        if (!sessionData) {
          // If not authenticated, redirect to login page with callback URL
          const callbackUrl = encodeURIComponent(pathname);
          console.log(callbackUrl);
          router.push(`/login?callbackUrl=${callbackUrl}`); // Fixed: added ? instead of /
        }
        setIsLoading(false);
      };

      checkAuth();
    }, [pathname, router]);

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

    // Render the wrapped component if authenticated
    return <WrappedComponent {...props} />;
  };
}