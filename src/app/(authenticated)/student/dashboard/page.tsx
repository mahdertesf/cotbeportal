
'use client';

import React, { useEffect, useState } from 'react';
import useAppStore from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, CalendarCheck2, Megaphone, UserCircle, NotebookText, FileText, ExternalLink } from 'lucide-react';
import { fetchStudentRegisteredCourses, fetchStudentAssessments } from '@/lib/api'; // Mock API
import { Skeleton } from '@/components/ui/skeleton';

interface Course {
  registrationId: string;
  scheduledCourseId: string;
  course_code: string;
  title: string;
  status: string;
}

interface Assessment {
  assessment_id: string;
  name: string;
  score?: number | null; // Added to reflect usage in filter
  unique_key_for_list?: string; // Added for unique key generation
  // Add due_date if available from API
}

export default function StudentDashboardPage() {
  const user = useAppStore((state) => state.user);
  const [currentCourses, setCurrentCourses] = useState<Course[]>([]);
  const [upcomingAssessments, setUpcomingAssessments] = useState<Assessment[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]); // Placeholder for announcements
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.user_id) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const courses = await fetchStudentRegisteredCourses(user.user_id);
          setCurrentCourses(courses.filter(c => c.status === 'Registered').slice(0, 3)); // Show 3 courses

          // Fetch assessments and create unique keys
          const registeredCourses = courses.filter(c => c.status === 'Registered');
          const assessmentsPromises = registeredCourses.map(course =>
            fetchStudentAssessments(course.scheduledCourseId, user.user_id).then(assessments =>
              assessments.map(asm => ({
                ...asm,
                unique_key_for_list: `${course.scheduledCourseId}_${asm.assessment_id}` // Ensure unique key
              }))
            )
          );
          const allAssessmentsNested = await Promise.all(assessmentsPromises);
          const allAssessments = allAssessmentsNested.flat();
          
          // Filter for upcoming (mock: show first 3 non-graded assessments)
          setUpcomingAssessments(allAssessments.filter(a => a.score === null).slice(0,3));

          // Mock announcements
          setRecentAnnouncements([
            { id: 1, title: "Midterm Exam Schedule Released", date: "2024-07-25", link: "#" },
            { id: 2, title: "Library Hours Extended", date: "2024-07-24", link: "#" },
          ]);

        } catch (error) {
          console.error("Failed to fetch dashboard data", error);
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
        Welcome to your CoTBE Dashboard, {user.first_name}!
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center font-headline"><BookOpen className="mr-2 h-5 w-5 text-primary" /> My Current CoTBE Courses</CardTitle>
            <CardDescription>A quick overview of your ongoing courses.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-2/3" />
              </div>
            ) : currentCourses.length > 0 ? (
              <ul className="space-y-2">
                {currentCourses.map(course => (
                  <li key={course.registrationId} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Link href={`/student/courses/${course.scheduledCourseId}`} className="flex items-center justify-between group">
                      <span>{course.course_code} - {course.title}</span>
                       <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No current courses registered.</p>
            )}
             <Button variant="link" asChild className="p-0 mt-2 text-sm">
                <Link href="/student/courses">View All My Courses</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center font-headline"><CalendarCheck2 className="mr-2 h-5 w-5 text-primary" /> Upcoming Assessment Deadlines</CardTitle>
            <CardDescription>Stay on top of your assignments and exams.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : upcomingAssessments.length > 0 ? (
              <ul className="space-y-2">
                {upcomingAssessments.map(assessment => (
                  <li key={assessment.unique_key_for_list || assessment.assessment_id} className="text-sm text-muted-foreground">
                    {assessment.name} - <span className="text-accent">Due Soon</span> {/* Add actual due date */}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming assessments found.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center font-headline"><Megaphone className="mr-2 h-5 w-5 text-primary" /> Recent CoTBE Announcements</CardTitle>
            <CardDescription>Latest news and updates from the college.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-2/3" />
                </div>
            ) : recentAnnouncements.length > 0 ? (
              <ul className="space-y-2">
                {recentAnnouncements.map(announcement => (
                  <li key={announcement.id} className="text-sm">
                    <Link href={announcement.link} className="text-primary hover:underline">{announcement.title}</Link>
                    <p className="text-xs text-muted-foreground">{announcement.date}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recent announcements.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Button variant="outline" asChild className="justify-start">
            <Link href="/student/profile"><UserCircle className="mr-2 h-4 w-4" /> My Profile</Link>
          </Button>
          <Button variant="outline" asChild className="justify-start">
            <Link href="/student/courses/register"><NotebookText className="mr-2 h-4 w-4" /> Course Registration</Link>
          </Button>
           <Button variant="outline" asChild className="justify-start">
            <Link href="/student/courses"><BookOpen className="mr-2 h-4 w-4" /> My Enrolled Courses</Link>
          </Button>
          <Button variant="outline" asChild className="justify-start">
            <Link href="/student/academic-history"><FileText className="mr-2 h-4 w-4" /> Academic History</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
