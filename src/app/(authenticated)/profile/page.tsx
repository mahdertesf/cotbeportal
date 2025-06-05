'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAppStore from '@/stores/appStore';
import { Loader2 } from 'lucide-react';

export default function ProfileRedirectPage() {
  const user = useAppStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role) {
      const rolePath = user.role.toLowerCase().replace(/\s+/g, '');
      router.replace(`/${rolePath}/profile`);
    } else if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading profile...</p>
      </div>
    </div>
  );
}
