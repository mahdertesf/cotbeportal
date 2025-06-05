'use client';

import React, { useState, useEffect } from 'react';
import useAppStore, { UserProfile } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { fetchStudentProfile, updateStudentProfile } from '@/lib/api'; // Mock API calls
import { Loader2, Edit3, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentProfilePage() {
  const storeUser = useAppStore((state) => state.user);
  const updateUserInStore = useAppStore((state) => state.updateUserProfile);
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (storeUser?.user_id) {
      const loadProfile = async () => {
        setIsLoading(true);
        try {
          const data = await fetchStudentProfile(storeUser.user_id);
          setProfileData(data);
        } catch (error) {
          console.error("Failed to fetch profile", error);
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
      // Only send mutable fields
      const { address, phone_number, email } = profileData;
      const updatePayload: Partial<UserProfile> = { address, phone_number, email };
      
      const response = await updateStudentProfile(storeUser.user_id, updatePayload);
      if (response.success && response.data) {
        setProfileData(response.data);
        updateUserInStore(response.data); // Update Zustand store as well
        toast({ title: "Success", description: "Profile updated successfully." });
        setIsEditing(false);
      } else {
        toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to save profile", error);
      toast({ title: "Error", description: "An error occurred while saving.", variant: "destructive" });
    } finally {
      setIsSaving(false);
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
          <CardDescription>View and manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderSkeletonField("Full Name")}
          {renderSkeletonField("Username")}
          {renderSkeletonField("Email Address")}
          {renderSkeletonField("Phone Number")}
          {renderSkeletonField("Address")}
          {renderSkeletonField("Department")}
          {renderSkeletonField("Enrollment Date")}
          {renderSkeletonField("Date of Birth")}
        </CardContent>
        <CardFooter className="flex justify-end">
           <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }
  
  const ProfileField = ({ label, value, name, isEditing, onChange, type = "text", placeholder }: { label: string, value?: string | number, name: keyof UserProfile, isEditing: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, placeholder?: string }) => (
    <div className="space-y-1">
      <Label htmlFor={name} className="text-sm font-medium text-muted-foreground">{label}</Label>
      {isEditing && (name === 'phone_number' || name === 'address' || name === 'email') ? (
        <Input id={name} name={name} type={type} value={value || ''} onChange={onChange} placeholder={placeholder || `Enter ${label.toLowerCase()}`} />
      ) : (
        <p className="text-sm h-9 flex items-center px-3 py-2 rounded-md border border-transparent bg-muted/50">
          {value || <span className="italic text-gray-400">Not set</span>}
        </p>
      )}
    </div>
  );


  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline">My CoTBE Profile</CardTitle>
                <CardDescription>View and manage your personal information.</CardDescription>
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
            <ProfileField label="First Name" name="first_name" value={profileData.first_name} isEditing={false} onChange={handleInputChange} />
            <ProfileField label="Last Name" name="last_name" value={profileData.last_name} isEditing={false} onChange={handleInputChange} />
        </div>
        <ProfileField label="Username" name="username" value={profileData.username} isEditing={false} onChange={handleInputChange} />
        <ProfileField label="Email Address" name="email" value={profileData.email} isEditing={isEditing} onChange={handleInputChange} type="email" placeholder="you@example.com" />
        <ProfileField label="Phone Number" name="phone_number" value={profileData.phone_number} isEditing={isEditing} onChange={handleInputChange} placeholder="e.g. 0912345678" />
        <ProfileField label="Address" name="address" value={profileData.address} isEditing={isEditing} onChange={handleInputChange} placeholder="Your current address" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileField label="Department" name="department_name" value={profileData.department_name} isEditing={false} onChange={handleInputChange} />
            <ProfileField label="Enrollment Date" name="enrollment_date" value={profileData.enrollment_date ? new Date(profileData.enrollment_date).toLocaleDateString() : ''} isEditing={false} onChange={handleInputChange} />
        </div>
        <ProfileField label="Date of Birth" name="date_of_birth" value={profileData.date_of_birth ? new Date(profileData.date_of_birth).toLocaleDateString() : ''} isEditing={false} onChange={handleInputChange} />
      
        {isEditing && (
            <div className="mt-2">
              <Button variant="link" className="p-0 h-auto text-sm">Change Password</Button>
               <p className="text-xs text-muted-foreground">Password changes are handled separately for security.</p>
            </div>
        )}
      </CardContent>
      {isEditing && (
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={() => {
            setIsEditing(false);
            // Optionally revert changes if not saved by re-fetching or using original storeUser data
            if (storeUser) setProfileData(storeUser);
          }}>Cancel</Button>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
