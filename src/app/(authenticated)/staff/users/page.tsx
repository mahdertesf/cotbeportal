
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchAllUsers, createItem, updateItem } from '@/lib/api';
import type { UserProfile, UserRole } from '@/stores/appStore';
import { Loader2, PlusCircle, Edit, Filter, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const userFormSchema = z.object({
  user_id: z.string().optional(), // Present when editing
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  role: z.enum(['Student', 'Teacher', 'Staff Head'], { required_error: "Role is required" }),
  password: z.string().optional(), // Required for new users, optional for edit
  is_active: z.boolean().default(true),
}).superRefine((data, ctx) => {
  if (!data.user_id && (!data.password || data.password.length < 6)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must be at least 6 characters for new users",
      path: ["password"],
    });
  }
});

type UserFormData = z.infer<typeof userFormSchema>;

const ALL_ROLES_FILTER = "all_roles_filter_value";

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | typeof ALL_ROLES_FILTER | ''>(ALL_ROLES_FILTER);

  const { toast } = useToast();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role: undefined,
      password: '',
      is_active: true,
    },
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load users.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (user: UserProfile | null = null) => {
    setEditingUser(user);
    if (user) {
      form.reset({
        user_id: String(user.user_id),
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role as UserRole, // Ensure UserRole is one of the enum values
        is_active: user.is_active,
        password: '', // Password not pre-filled for editing
      });
    } else {
      form.reset(); // Reset to default for new user
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      let response;
      const payload: Partial<UserProfile> = {
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        is_active: data.is_active,
      };
      if (data.password && data.password.length > 0) {
        // In a real app, hash this password before sending to backend
        payload.password_hash = `hashed_${data.password}`; 
      }

      if (editingUser && data.user_id) {
        response = await updateItem('users', data.user_id, payload);
        toast({ title: "Success", description: "User updated successfully." });
      } else {
        // Ensure password is provided for new user (schema handles this but good to double check)
        if (!payload.password_hash) throw new Error("Password required for new user.");
        response = await createItem('users', payload);
        toast({ title: "Success", description: "User created successfully." });
      }
      
      if (response.success) {
        loadUsers(); // Reload users after successful operation
        setIsDialogOpen(false);
      } else {
        toast({ title: "Error", description: response.error || "Failed to save user.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserStatus = async (user: UserProfile) => {
    try {
      const newStatus = !user.is_active;
      await updateItem('users', user.user_id, { is_active: newStatus });
      toast({ title: "Success", description: `User ${user.first_name} ${newStatus ? 'activated' : 'deactivated'}.` });
      loadUsers();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user status.", variant: "destructive" });
    }
  };
  
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const nameMatch = `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const usernameMatch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = roleFilter === ALL_ROLES_FILTER || !roleFilter || user.role === roleFilter;
      return (nameMatch || emailMatch || usernameMatch) && roleMatch;
    });
  }, [users, searchTerm, roleFilter]);
  
  const UserRowSkeleton = () => (
    <TableRow>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
        <TableCell className="space-x-2"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-24" /></TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="font-headline text-2xl">User Management</CardTitle>
              <CardDescription>Manage all CoTBE portal users and their roles.</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border rounded-lg bg-background shadow">
            <h3 className="text-lg font-semibold mb-3 font-headline">Filters & Search</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <Label htmlFor="search-user" className="block text-sm font-medium text-muted-foreground mb-1">Search by Name, Email, or Username</Label>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="search-user" 
                      placeholder="Enter search term..." 
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
              </div>
              <div>
                <Label htmlFor="role-filter" className="block text-sm font-medium text-muted-foreground mb-1">Filter by Role</Label>
                <Select value={roleFilter || ALL_ROLES_FILTER} onValueChange={(value) => setRoleFilter(value as UserRole | typeof ALL_ROLES_FILTER)}>
                  <SelectTrigger id="role-filter">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_ROLES_FILTER}>All Roles</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Staff Head">Staff Head</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({length: 5}).map((_, i) => <UserRowSkeleton key={i}/>)}
                </TableBody>
            </Table>
          ) : filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.user_id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.first_name} {user.last_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(user)}>
                        <Edit className="mr-1 h-4 w-4" /> Edit
                      </Button>
                      <Button variant={user.is_active ? "destructive" : "default"} size="sm" onClick={() => toggleUserStatus(user)}>
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <p className="text-center text-muted-foreground py-8">No users found matching your criteria.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) form.reset(); // Reset form if dialog is closed without submitting
          setIsDialogOpen(open);
        }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Modify the user details below.' : 'Fill in the details to create a new user.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...form.register('username')} readOnly={!!editingUser} />
              {form.formState.errors.username && <p className="text-sm text-destructive mt-1">{form.formState.errors.username.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} />
              {form.formState.errors.email && <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" {...form.register('first_name')} />
                {form.formState.errors.first_name && <p className="text-sm text-destructive mt-1">{form.formState.errors.first_name.message}</p>}
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" {...form.register('last_name')} />
                {form.formState.errors.last_name && <p className="text-sm text-destructive mt-1">{form.formState.errors.last_name.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={(value) => form.setValue('role', value as UserRole)} defaultValue={form.getValues('role')}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Teacher">Teacher</SelectItem>
                  <SelectItem value="Staff Head">Staff Head</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role && <p className="text-sm text-destructive mt-1">{form.formState.errors.role.message}</p>}
            </div>
            {!editingUser && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register('password')} />
                {form.formState.errors.password && <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>}
                 <p className="text-xs text-muted-foreground mt-1">Required for new users (min 6 characters). For existing users, password changes are handled separately.</p>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Switch id="is_active" checked={form.watch('is_active')} onCheckedChange={(checked) => form.setValue('is_active', checked)} />
              <Label htmlFor="is_active">User is Active</Label>
            </div>
             {form.formState.errors.is_active && <p className="text-sm text-destructive mt-1">{form.formState.errors.is_active.message}</p>}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingUser ? 'Save Changes' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    