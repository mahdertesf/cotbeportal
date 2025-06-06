
'use client';

import React, { useState, useEffect } from 'react';
import useAppStore from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAnnouncements } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface Announcement {
  announcement_id: string;
  title: string;
  content: string;
  publish_date: string;
  author_id: string; 
}

export default function TeacherAnnouncementsPage() {
  const user = useAppStore(state => state.user);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.user_id && user.role === 'Teacher') {
      const loadAnnouncements = async () => {
        setIsLoading(true);
        try {
          // Teachers might also see department-specific announcements if their department_id is passed
          const data = await fetchAnnouncements({ role: user.role, departmentId: user.department_id });
          setAnnouncements(data);
        } catch (error) {
          toast({ title: "Error", description: "Failed to load announcements.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      loadAnnouncements();
    } else if (user?.role !== 'Teacher') {
        setIsLoading(false);
    }
  }, [user, toast]);

  const AnnouncementCardSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/4 mt-1" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
        </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-headline font-semibold flex items-center">
                <Megaphone className="mr-3 h-8 w-8 text-primary" /> CoTBE Announcements
            </h1>
        </div>
        <AnnouncementCardSkeleton />
        <AnnouncementCardSkeleton />
      </div>
    );
  }
  
  if (!user || user.role !== 'Teacher') {
    return <p>You do not have access to this page.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold flex items-center">
          <Megaphone className="mr-3 h-8 w-8 text-primary" /> CoTBE Announcements for Faculty
        </h1>
      </div>

      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map(ann => (
            <Card key={ann.announcement_id}>
              <CardHeader>
                <CardTitle className="font-headline">{ann.title}</CardTitle>
                <CardDescription>
                  Published on: {format(new Date(ann.publish_date), 'PPP p')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{ann.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No announcements available for faculty at this time.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
