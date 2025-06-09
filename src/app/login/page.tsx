
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
import { handleLogin } from '@/lib/api'; 
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
    if (!username || !password) {
      toast({
        title: "Credentials Required",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    setLoading(true);
    setError(null);

    try {
      const { success, data, error } = await handleLogin(username, password, selectedRole);

      if (success && data) {
        loginUser(data);
        toast({
          title: "Login Successful",
          description: `Welcome, ${data.first_name}! Redirecting to dashboard...`,
        });
        // Admin and Staff Head share the same dashboard redirect for now
        if (data.role === 'Admin' || data.role === 'Staff Head') {
            router.push('/staff/dashboard');
        } else if (data.role === 'Teacher') {
            router.push('/teacher/dashboard');
        } else if (data.role === 'Student') {
            router.push('/student/dashboard');
        } else {
            router.push('/dashboard');
        }
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
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Staff Head">Staff Head</SelectItem>
              <SelectItem value="Teacher">Teacher</SelectItem>
              <SelectItem value="Student">Student</SelectItem>
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
            placeholder="e.g. johndoe or your ID"
            required
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
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting || globalIsLoading}>
          {isSubmitting || globalIsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Login
        </Button>
      </form>
    </AuthFormCard>
  );
}
