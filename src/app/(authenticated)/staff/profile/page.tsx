
'use client';

import React, { useState, useEffect } from 'react';
import useAppStore, { UserProfile } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchStaffProfile, updateStaffProfile, handleChangePassword } from '@/lib/api'; // Mock API calls
import { Loader2, Edit3, Save, KeyRound } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmNewPassword: z.string().min(1, "Please confirm your new password"),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});

type PasswordFormData = z.infer<typeof passwordFormSchema>;

export default function StaffProfilePage() {
  const storeUser = useAppStore((state) => state.user);
  const updateUserInStore = useAppStore((state) => state.updateUserProfile);
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  useEffect(() => {
    if (storeUser?.user_id) {
      const loadProfile = async () => {
        setIsLoading(true);
        try {
          // Ensure this API function exists and fetches appropriate staff data
          const data = await fetchStaffProfile(storeUser.user_id); 
          setProfileData(data);
        } catch (error) {
          console.error("Failed to fetch staff profile", error);
          toast({ title: "Error", description: "Could not load profile data.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      loadProfile();
    }
  }, [storeUser, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (!storeUser?.user_id) return;
    setIsSaving(true);
    try {
      // Only send mutable fields for staff
      const { job_title, phone_number, email } = profileData;
      const updatePayload: Partial<UserProfile> = { job_title, phone_number, email };
      
      // Ensure this API function exists
      const response = await updateStaffProfile(storeUser.user_id, updatePayload); 
      if (response.success && response.data) {
        setProfileData(response.data);
        updateUserInStore(response.data); // Update Zustand store
        toast({ title: "Success", description: "Profile updated successfully." });
        setIsEditing(false);
      } else {
        toast({ title: "Error", description: response.error || "Failed to update profile.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to save profile", error);
      toast({ title: "Error", description: "An error occurred while saving.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const onPasswordChangeSubmit = async (data: PasswordFormData) => {
    if (!storeUser?.user_id) return;
    setIsChangingPassword(true);
    try {
      const response = await handleChangePassword(storeUser.user_id, data.currentPassword, data.newPassword);
      if (response.success) {
        toast({ title: "Success", description: response.message });
        setIsPasswordDialogOpen(false);
        passwordForm.reset();
      } else {
        toast({ title: "Password Change Failed", description: response.error, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An error occurred while changing password.", variant: "destructive" });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const renderSkeletonField = (label: string) => (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      <Skeleton className="h-9 w-full" />
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">My CoTBE Profile</CardTitle>
          <CardDescription>View and manage your personal and professional information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderSkeletonField("Full Name")}
          {renderSkeletonField("Username")}
          {renderSkeletonField("Email Address")}
          {renderSkeletonField("Phone Number")}
          {renderSkeletonField("Job Title")}
        </CardContent>
        <CardFooter className="flex justify-end">
           <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }
  
  const ProfileField = ({ label, value, name, isEditingThisField, onChange, type = "text", placeholder }: { label: string, value?: string | number, name: keyof UserProfile, isEditingThisField: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, placeholder?: string }) => (
    <div className="space-y-1">
      <Label htmlFor={name} className="text-sm font-medium text-muted-foreground">{label}</Label>
      {isEditingThisField ? (
        <Input id={name} name={name} type={type} value={value || ''} onChange={onChange} placeholder={placeholder || `Enter ${label.toLowerCase()}`} />
      ) : (
        <p className="text-sm h-9 flex items-center px-3 py-2 rounded-md border border-transparent bg-muted/50">
          {value || <span className="italic text-gray-400">Not set</span>}
        </p>
      )}
    </div>
  );

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
              <div>
                  <CardTitle className="font-headline">My CoTBE Profile</CardTitle>
                  <CardDescription>View and manage your personal and professional information.</CardDescription>
              </div>
              {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
              )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileField label="First Name" name="first_name" value={profileData.first_name} isEditingThisField={false} onChange={handleInputChange} />
              <ProfileField label="Last Name" name="last_name" value={profileData.last_name} isEditingThisField={false} onChange={handleInputChange} />
          </div>
          <ProfileField label="Username" name="username" value={profileData.username} isEditingThisField={false} onChange={handleInputChange} />
          <ProfileField label="Email Address" name="email" value={profileData.email} isEditingThisField={isEditing} onChange={handleInputChange} type="email" placeholder="you@example.com" />
          <ProfileField label="Phone Number" name="phone_number" value={profileData.phone_number} isEditingThisField={isEditing} onChange={handleInputChange} placeholder="e.g. 0912345678" />
          <ProfileField label="Job Title" name="job_title" value={profileData.job_title} isEditingThisField={isEditing} onChange={handleInputChange} placeholder="e.g. Department Head" />
        
          {isEditing && (
              <div className="mt-2">
                <Button variant="link" className="p-0 h-auto text-sm" onClick={() => setIsPasswordDialogOpen(true)}>
                  <KeyRound className="mr-1 h-3 w-3" /> Change Password
                </Button>
                <p className="text-xs text-muted-foreground">Password changes are handled separately for security.</p>
              </div>
          )}
        </CardContent>
        {isEditing && (
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => {
              setIsEditing(false);
              if (storeUser) setProfileData(storeUser);
            }}>Cancel</Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </CardFooter>
        )}
      </Card>

      <Dialog open={isPasswordDialogOpen} onOpenChange={(open) => {
        setIsPasswordDialogOpen(open);
        if (!open) passwordForm.reset();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and your new password below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={passwordForm.handleSubmit(onPasswordChangeSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} />
              {passwordForm.formState.errors.currentPassword && <p className="text-sm text-destructive mt-1">{passwordForm.formState.errors.currentPassword.message}</p>}
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
              {passwordForm.formState.errors.newPassword && <p className="text-sm text-destructive mt-1">{passwordForm.formState.errors.newPassword.message}</p>}
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input id="confirmNewPassword" type="password" {...passwordForm.register('confirmNewPassword')} />
              {passwordForm.formState.errors.confirmNewPassword && <p className="text-sm text-destructive mt-1">{passwordForm.formState.errors.confirmNewPassword.message}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => passwordForm.reset()}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Change Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

