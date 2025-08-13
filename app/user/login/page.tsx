'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/lib/hooks/use-auth';
import { useMounted } from '@/lib/hooks/use-mounted';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const mounted = useMounted();

  // Debug logs
  console.log('LoginPage render:', { mounted, isAuthenticated, isLoading, callbackUrl });

  // Redirect if already authenticated, but wait for loading to finish
  useEffect(() => {
    console.log('LoginPage useEffect:', { mounted, isAuthenticated, isLoading, callbackUrl });
    if (mounted && !isLoading && isAuthenticated) {
      const target = callbackUrl || '/eventos';
      console.log('Redirecting to:', target);
      // Avoid redirecting to login page itself
      if (target !== '/user/login') {
        router.push(target);
      } else {
        router.push('/eventos');
      }
    }
  }, [mounted, isAuthenticated, isLoading, router, callbackUrl]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
}
