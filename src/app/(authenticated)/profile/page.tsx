'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAppStore, { type UserRole } from '@/stores/appStore';
import { Loader2 } from 'lucide-react';

const getRoleBasePath = (role: UserRole | undefined): string => {
  if (!role) return 'general'; // Should not happen if user is defined
  switch (role) {
    case 'Student': return 'student';
    case 'Teacher': return 'teacher';
    case 'Staff Head': return 'staff';
    default: return 'general';
  }
};

export default function ProfileRedirectPage() {
  const user = useAppStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role) {
      const rolePath = getRoleBasePath(user.role);
      if (rolePath !== 'general') {
        router.replace(`/${rolePath}/profile`);
      } else {
        // Fallback for unrecognized role, though ideally this is handled at login
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
        <p className="mt-4 text-lg text-muted-foreground">Loading profile...</p>
      </div>
    </div>
  );
}
