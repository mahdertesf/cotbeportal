'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAppStore, { type UserRole } from '@/stores/appStore';
import { Loader2 } from 'lucide-react';

const getRoleBasePath = (role: UserRole | undefined): string => {
  if (!role) return 'general';
  switch (role) {
    case 'Student': return 'student';
    case 'Teacher': return 'teacher';
    case 'Staff Head': return 'staff';
    default: return 'general';
  }
};

export default function SettingsRedirectPage() {
  const user = useAppStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role) {
      const rolePath = getRoleBasePath(user.role);
      // For now, all roles might share a generic settings page, or redirect to profile
      // This can be expanded later for role-specific settings
      // Example: router.replace(`/${rolePath}/settings`);
      // For now, let's assume a general settings page or redirect to profile as fallback
      if (rolePath !== 'general') {
        router.replace(`/${rolePath}/profile`); // Or a dedicated /settings page if it exists
      } else {
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
        <p className="mt-4 text-lg text-muted-foreground">Loading settings...</p>
      </div>
    </div>
  );
}
