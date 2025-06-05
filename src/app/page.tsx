'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAppStore from '@/stores/appStore';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const user = useAppStore((state) => state.user);
  const isLoading = useAppStore((state) => state.isLoading); // Use app-wide loading if needed for initial check
  const router = useRouter();

  useEffect(() => {
    // This effect will run once on the client after hydration
    // No need for a separate isLoading state here unless there's an async check
    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg font-semibold text-foreground">Loading CoTBE Portal...</p>
    </div>
  );
}
