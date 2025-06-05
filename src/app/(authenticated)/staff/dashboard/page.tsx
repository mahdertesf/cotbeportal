'use client';

import React, { useEffect, useState } from 'react';
import useAppStore from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, BookOpen, Building, CalendarDays, ShieldAlert, TrendingUp, ExternalLink, Megaphone } from 'lucide-react';
import { fetchAllUsers, fetchItems, fetchAuditLogs } from '@/lib/api'; // Mock API
import { Skeleton } from '@/components/ui/skeleton';
// Import AI flow if needed for audit log summary feature button
// import { getGeminiLogSummary } from '@/ai/flows/get-gemini-log-summary';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  isLoading: boolean;
  linkTo?: string;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, isLoading, linkTo, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium font-body">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold font-headline">{value}</div>}
      {description && !isLoading && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
      {linkTo && !isLoading && (
        <Button variant="link" asChild className="p-0 mt-1 text-xs">
          <Link href={linkTo}>View Details <ExternalLink className="ml-1 h-3 w-3"/></Link>
        </Button>
      )}
       {linkTo && isLoading && <Skeleton className="h-4 w-20 mt-2" />}
    </CardContent>
  </Card>
);


export default function StaffDashboardPage() {
  const user = useAppStore((state) => state.user);
  const [stats, setStats] = useState({ totalUsers: 0, activeCourses: 0, studentEnrollment: 0 });
  const [recentAuditHighlights, setRecentAuditHighlights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.user_id) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const users = await fetchAllUsers();
          const scheduledCourses = await fetchItems('scheduledCourses'); // Assuming API endpoint
          // Student enrollment would be more complex, sum of current_enrollment from scheduledCourses
          
          setStats({
            totalUsers: users.length,
            activeCourses: scheduledCourses.length, // This is total scheduled, not necessarily 'active'
            studentEnrollment: scheduledCourses.reduce((sum, course: any) => sum + (course.current_enrollment || 0), 0)
          });

          const auditLogs = await fetchAuditLogs({ limit: 3 }); // Fetch 3 most recent logs
          setRecentAuditHighlights(auditLogs);

        } catch (error) {
          console.error("Failed to fetch staff dashboard data", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  if (!user) {
    return <div className="flex flex-1 items-center justify-center"><p>Loading user data...</p></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">
        CoTBE Administration Dashboard, {user.first_name}!
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Total Users" value={stats.totalUsers} icon={Users} isLoading={isLoading} linkTo="/staff/users" description="All registered users"/>
        <MetricCard title="Active Scheduled Courses" value={stats.activeCourses} icon={BookOpen} isLoading={isLoading} linkTo="/staff/courses/schedule" description="Courses scheduled for current/upcoming terms"/>
        <MetricCard title="Total Student Enrollments" value={stats.studentEnrollment} icon={TrendingUp} isLoading={isLoading} linkTo="/staff/courses/schedule" description="Across all scheduled courses"/>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><ShieldAlert className="mr-2 h-5 w-5 text-primary" /> Recent System Activity</CardTitle>
            <CardDescription>Highlights from the audit log.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : recentAuditHighlights.length > 0 ? (
              <ul className="space-y-2">
                {recentAuditHighlights.map(log => (
                  <li key={log.id} className="text-sm border-b pb-1">
                    <p><span className="font-semibold">{log.username}</span>: {log.action_type} on {log.target_entity_type} ({log.target_entity_id})</p>
                    <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recent audit logs found.</p>
            )}
            <Button variant="outline" size="sm" asChild className="mt-3">
                <Link href="/staff/system/audit-log">View Full Audit Log</Link>
            </Button>
            {/* Optional: Button for AI Log Summary */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Administrative Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" asChild className="justify-start"><Link href="/staff/users"><Users className="mr-2 h-4 w-4"/>Manage Users</Link></Button>
            <Button variant="outline" asChild className="justify-start"><Link href="/staff/courses/catalog"><BookOpen className="mr-2 h-4 w-4"/>Course Catalog</Link></Button>
            <Button variant="outline" asChild className="justify-start"><Link href="/staff/semesters"><CalendarDays className="mr-2 h-4 w-4"/>Semester Mgmt</Link></Button>
            <Button variant="outline" asChild className="justify-start"><Link href="/staff/infrastructure/buildings"><Building className="mr-2 h-4 w-4"/>Infrastructure</Link></Button>
            <Button variant="outline" asChild className="justify-start"><Link href="/staff/courses/schedule"><CalendarDays className="mr-2 h-4 w-4"/>Course Scheduling</Link></Button>
            <Button variant="outline" asChild className="justify-start"><Link href="/staff/communication/announcements/ai-assistant"><Megaphone className="mr-2 h-4 w-4"/>AI Announcer</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
