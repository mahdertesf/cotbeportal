
'use client';

import React, { useState, useEffect } from 'react';
import useAppStore from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { fetchAnnouncements } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Loader2, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface Announcement {
  announcement_id: string;
  title: string;
  content: string;
  publish_date: string;
  target_audience: string;
  status: string;
  author_id: string;
}

export default function StaffAnnouncementsPage() {
  const user = useAppStore(state => state.user);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.user_id && user.role === 'Staff Head') {
      const loadAnnouncements = async () => {
        setIsLoading(true);
        try {
          // Staff might see all announcements or a broader set
          const data = await fetchAnnouncements({ role: user.role }); 
          setAnnouncements(data);
        } catch (error) {
          toast({ title: "Error", description: "Failed to load announcements.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      loadAnnouncements();
    } else if (user?.role !== 'Staff Head') {
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
            <Skeleton className="h-10 w-32" />
        </div>
        <AnnouncementCardSkeleton />
        <AnnouncementCardSkeleton />
      </div>
    );
  }
  
  if (!user || user.role !== 'Staff Head') {
    return <p>You do not have access to this page.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold flex items-center">
          <Megaphone className="mr-3 h-8 w-8 text-primary" /> Portal Announcements
        </h1>
        <Button asChild>
          <Link href="/staff/communication/announcements/ai-assistant">
            <Edit className="mr-2 h-4 w-4" /> Create/Manage Announcements
          </Link>
        </Button>
      </div>
      <CardDescription>
        View announcements published on the portal. To create, edit, or manage draft/scheduled announcements, use the "Create/Manage Announcements" button.
      </CardDescription>

      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map(ann => (
            <Card key={ann.announcement_id}>
              <CardHeader>
                <CardTitle className="font-headline">{ann.title}</CardTitle>
                <CardDescription>
                  Published on: {format(new Date(ann.publish_date), 'PPP p')} | Target: {ann.target_audience} | Status: {ann.status}
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
            <p className="text-center text-muted-foreground">No announcements have been published yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
