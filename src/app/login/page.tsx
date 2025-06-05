'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAppStore, { type UserRole, type UserProfile } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AuthFormCard } from '@/components/auth/AuthFormCard';
import { handleLogin } from '@/lib/api'; // Placeholder for actual API call
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const loginUser = useAppStore((state) => state.loginUser);
  const globalIsLoading = useAppStore((state) => state.isLoading);
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);
  const user = useAppStore((state) => state.user);
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      // If user is already logged in, redirect to dashboard
      router.push('/dashboard');
    }
  }, [user, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast({
        title: "Role Required",
        description: "Please select your role to log in.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    setLoading(true);
    setError(null);

    // TEMPORARY DEVELOPMENT BYPASS
    // In production, this will call the actual backend API
    try {
      const { success, data, error } = await handleLogin(username, password, selectedRole);

      if (success && data) {
        loginUser(data);
        toast({
          title: "Login Successful",
          description: `Welcome, ${data.first_name}! Redirecting to dashboard...`,
        });
        router.push('/dashboard'); // Redirect to a generic dashboard, which will then redirect by role
      } else {
        setError(error || 'Login failed. Please check your credentials and role.');
        toast({
          title: "Login Failed",
          description: error || 'Please check your credentials and role.',
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <AuthFormCard 
      title="CoTBE Portal Login"
      description="Access your CoTBE account"
      footerContent={
        <Link href="/forgot-password" passHref>
          <Button variant="link" className="text-sm">Forgot Password?</Button>
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="role">Select Your Role:</Label>
          <Select onValueChange={(value: UserRole) => setSelectedRole(value)} value={selectedRole || undefined}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Student">Student</SelectItem>
              <SelectItem value="Teacher">Teacher</SelectItem>
              <SelectItem value="Staff Head">Staff Head</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. johndoe"
            // required (can be lenient during bypass)
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            // required (can be lenient during bypass)
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting || globalIsLoading}>
          {isSubmitting || globalIsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Login
        </Button>
      </form>
      <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md text-sm">
        <p className="font-bold">DEVELOPMENT NOTE:</p>
        <p>Login is currently using a temporary bypass. Username and password fields are optional. Select a role and click Login to proceed with mock data.</p>
        <p className="font-bold text-red-600 mt-2">CRITICAL SECURITY WARNING: This bypass MUST be removed for production.</p>
      </div>
    </AuthFormCard>
  );
}
