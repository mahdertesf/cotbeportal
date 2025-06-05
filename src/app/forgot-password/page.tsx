'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { AuthFormCard } from '@/components/auth/AuthFormCard';
import { handleForgotPassword } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { success, message, error } = await handleForgotPassword(email);
      if (success) {
        toast({
          title: "Request Sent",
          description: message,
        });
      } else {
        toast({
          title: "Error",
          description: error || "Failed to send reset link.",
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

  return (
    <AuthFormCard 
      title="Forgot Password"
      description="Enter your email to receive a password reset link."
      footerContent={
        <Link href="/login" passHref>
          <Button variant="link" className="text-sm">Back to Login</Button>
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Send Reset Link
        </Button>
      </form>
    </AuthFormCard>
  );
}
