'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAppStore from '@/stores/appStore';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirectPage() {
  const user = useAppStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role) {
      switch (user.role) {
        case 'Student':
          router.replace('/student/dashboard');
          break;
        case 'Teacher':
          router.replace('/teacher/dashboard');
          break;
        case 'Staff Head':
          router.replace('/staff/dashboard');
          break;
        case 'Admin': // Admin uses staff dashboard
          router.replace('/staff/dashboard');
          break;
        default:
          router.replace('/login'); 
      }
    } else if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
