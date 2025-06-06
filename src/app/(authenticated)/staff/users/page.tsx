
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
import useAppStore, { type UserProfile, type UserRole } from '@/stores/appStore';
import { Loader2, PlusCircle, Edit, Filter, Search, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const userFormSchema = z.object({
  user_id: z.string().optional(), 
  username: z.string().min(3, "Username must be at least 3 characters (this will also be their ID).").max(100),
  email: z.string().email("Invalid email address"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  role: z.enum(['Student', 'Teacher', 'Staff Head', 'Admin'], { required_error: "Role is required" }),
  is_active: z.boolean().default(true),
  // Password field removed, handled by backend/API default
});

type UserFormData = z.infer<typeof userFormSchema>;

const ALL_ROLES_FILTER = "all_roles_filter_value";

export default function UserManagementPage() {
  const loggedInUser = useAppStore((state) => state.user);
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
        role: user.role as UserRole,
        is_active: user.is_active,
      });
    } else {
      form.reset({ username: '', email: '', first_name: '', last_name: '', role: undefined, is_active: true });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      let response;
      const payload: Partial<UserProfile> & { password?: string } = {
        username: data.username, // Username will also be used as default ID and password by mock API
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        is_active: data.is_active,
      };
      
      // For new users, the mock API will use username as default password
      // For editing, password is not changed here.

      if (editingUser && data.user_id) {
        response = await updateItem('users', data.user_id, payload);
        toast({ title: "Success", description: "User updated successfully." });
      } else {
        response = await createItem('users', payload); // API handles default password
        toast({ title: "Success", description: `User created. Default password is their username: ${data.username}` });
      }
      
      if (response.success) {
        loadUsers(); 
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

  const toggleUserStatus = async (userToToggle: UserProfile) => {
    // Prevent Admin from deactivating themselves if they are the only one
    if (userToToggle.role === 'Admin' && userToToggle.user_id === loggedInUser?.user_id) {
        const adminCount = users.filter(u => u.role === 'Admin' && u.is_active).length;
        if (adminCount <= 1 && !userToToggle.is_active === false) { // Trying to deactivate
            toast({ title: "Action Denied", description: "Cannot deactivate the only active Admin.", variant: "destructive" });
            return;
        }
    }

    try {
      const newStatus = !userToToggle.is_active;
      await updateItem('users', userToToggle.user_id, { is_active: newStatus });
      toast({ title: "Success", description: `User ${userToToggle.first_name} ${newStatus ? 'activated' : 'deactivated'}.` });
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

  const getCreatableRoles = (): UserRole[] => {
    if (loggedInUser?.role === 'Admin') {
      return ['Student', 'Teacher', 'Staff Head'];
    }
    if (loggedInUser?.role === 'Staff Head') {
      return ['Student', 'Teacher'];
    }
    return [];
  };
  const creatableRoles = getCreatableRoles();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="font-headline text-2xl">User Management</CardTitle>
              <CardDescription>Manage all CoTBE portal users and their roles.</CardDescription>
            </div>
            {creatableRoles.length > 0 && (
                <Button onClick={() => handleOpenDialog(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New User
                </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border rounded-lg bg-background shadow">
            <h3 className="text-lg font-semibold mb-3 font-headline">Filters & Search</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <Label htmlFor="search-user" className="block text-sm font-medium text-muted-foreground mb-1">Search by Name, Email, or Username/ID</Label>
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
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Staff Head">Staff Head</SelectItem>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Username/ID</TableHead>
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
                  <TableHead>Username/ID</TableHead>
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
                       {!(user.role === 'Admin' && user.user_id === loggedInUser?.user_id && users.filter(u => u.role === 'Admin' && u.is_active).length <= 1 && user.is_active) && ( // Prevent deactivating only admin
                        <Button variant={user.is_active ? "destructive" : "default"} size="sm" onClick={() => toggleUserStatus(user)}>
                            {user.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                       )}
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
          if (!open) form.reset(); 
          setIsDialogOpen(open);
        }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Modify the user details below. Username/ID cannot be changed.' : 'Fill in the details to create a new user.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="username">Username/ID</Label>
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
              <Select 
                onValueChange={(value) => form.setValue('role', value as UserRole)} 
                defaultValue={form.getValues('role')}
                disabled={!!editingUser && loggedInUser?.role !== 'Admin' && editingUser.role === 'Staff Head'} // Staff Head cannot change role of other Staff Heads
                // Admin can change roles, but be cautious with demoting other Admins if this is added
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {creatableRoles.map(roleValue => (
                    <SelectItem key={roleValue} value={roleValue!}>{roleValue}</SelectItem>
                  ))}
                   {/* If editing, show current role even if not creatable by current user, unless it's Staff Head being edited by non-Admin */}
                  {editingUser && !creatableRoles.includes(editingUser.role) && editingUser.role && (
                     <SelectItem value={editingUser.role} disabled>{editingUser.role} (Cannot change to this role)</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.role && <p className="text-sm text-destructive mt-1">{form.formState.errors.role.message}</p>}
            </div>
            
            {!editingUser && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm space-y-1">
                  <div className="flex items-center">
                    <Info className="mr-2 h-4 w-4" />
                    <span className="font-semibold">Default Password Information</span>
                  </div>
                  <p>A password is not required at creation.</p>
                  <p>The user's default password will be their <strong>Username/ID</strong>.</p>
                  <p>They will be prompted or can change it from their profile after logging in.</p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch 
                id="is_active" 
                checked={form.watch('is_active')} 
                onCheckedChange={(checked) => form.setValue('is_active', checked)} 
                disabled={editingUser?.role === 'Admin' && editingUser?.user_id === loggedInUser?.user_id && users.filter(u => u.role === 'Admin' && u.is_active).length <= 1 && form.watch('is_active')}
                />
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
