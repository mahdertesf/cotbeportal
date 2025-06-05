'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { AuthFormCard } from '@/components/auth/AuthFormCard';
import { handleResetPassword } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const token = typeof params.token === 'string' ? params.token : '';

  useEffect(() => {
    if (!token) {
       toast({
        title: "Invalid Link",
        description: "Password reset token is missing or invalid.",
        variant: "destructive",
      });
      router.push('/login');
    }
  }, [token, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Mismatch",
        description: "The new password and confirmation password do not match.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 8) {
        toast({
            title: "Password Too Short",
            description: "Password must be at least 8 characters long.",
            variant: "destructive",
        });
        return;
    }

    setIsSubmitting(true);
    try {
      const { success, message, error } = await handleResetPassword(token, newPassword);
      if (success) {
        toast({
          title: "Password Reset Successful",
          description: message,
        });
        router.push('/login');
      } else {
        toast({
          title: "Error",
          description: error || "Failed to reset password.",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!token) {
    return (
        <AuthFormCard title="Invalid Token">
            <p className="text-center text-destructive">This password reset link is invalid or has expired.</p>
             <Link href="/login" passHref className="mt-4 block text-center">
                <Button variant="link">Back to Login</Button>
            </Link>
        </AuthFormCard>
    );
  }

  return (
    <AuthFormCard 
      title="Reset Your Password"
      description="Enter your new password below."
       footerContent={
        <Link href="/login" passHref>
          <Button variant="link" className="text-sm">Back to Login</Button>
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Reset Password
        </Button>
      </form>
    </AuthFormCard>
  );
}
