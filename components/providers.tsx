'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/layout/navbar';
import { TokenCleanup } from '@/components/auth/token-cleanup';
import { AuthDebug } from '@/components/debug/auth-debug';
import { ClientOnly } from '@/components/client-only';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ClientOnly>
        <TokenCleanup />
      </ClientOnly>
      <div className="min-h-screen bg-background">
        <ClientOnly fallback={
          <nav className="bg-white shadow-sm border-b h-16 flex items-center justify-center">
            <div className="text-gray-500">Loading...</div>
          </nav>
        }>
          <Navbar />
        </ClientOnly>
        <main className="flex-1">
          {children}
        </main>
        <Toaster position="top-right" />
      </div>
      <ClientOnly>
        <AuthDebug />
      </ClientOnly>
    </QueryClientProvider>
  );
}