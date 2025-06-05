'use client';

import React, { useEffect, useState } from 'react';
import useAppStore from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Library, ListChecks, Megaphone, UserCircle, ExternalLink } from 'lucide-react';
import { fetchTeacherAssignedCourses } from '@/lib/api'; // Mock API
import { Skeleton } from '@/components/ui/skeleton';

interface AssignedCourse {
  scheduled_course_id: string;
  course_code: string;
  title: string;
  section: string;
}

export default function TeacherDashboardPage() {
  const user = useAppStore((state) => state.user);
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([]);
  // Placeholder for other data like assessments needing grading, announcements
  const [assessmentsToGrade, setAssessmentsToGrade] = useState<any[]>([]); 
  const [facultyAnnouncements, setFacultyAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.user_id) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch assigned courses for current/selected semester (mock API might not support semester filter yet)
          const courses = await fetchTeacherAssignedCourses(user.user_id);
          setAssignedCourses(courses.slice(0, 3)); // Show 3 courses

          // Mock assessments needing grading
          setAssessmentsToGrade([
            { id: 1, course: "EE305 - Section A", name: "Quiz 3", submissions: 5 },
            { id: 2, course: "EE450 - Section A", name: "Project Milestone 1", submissions: 12 },
          ]);

          // Mock faculty announcements
          setFacultyAnnouncements([
            { id: 1, title: "Faculty Meeting Next Tuesday", date: "2024-07-28", link: "#" },
            { id: 2, title: "New Curriculum Guidelines Published", date: "2024-07-25", link: "#" },
          ]);

        } catch (error) {
          console.error("Failed to fetch teacher dashboard data", error);
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
        Welcome to your CoTBE Teacher Dashboard, {user.first_name}!
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center font-headline"><Library className="mr-2 h-5 w-5 text-primary" /> My Assigned CoTBE Courses</CardTitle>
            <CardDescription>Quick access to your courses for the current semester.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-2/3" />
              </div>
            ) : assignedCourses.length > 0 ? (
              <ul className="space-y-2">
                {assignedCourses.map(course => (
                  <li key={course.scheduled_course_id} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Link href={`/teacher/courses/${course.scheduled_course_id}/manage`} className="flex items-center justify-between group">
                      <span>{course.course_code} - {course.title} (Sec: {course.section})</span>
                      <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No courses assigned for the current semester.</p>
            )}
             <Button variant="link" asChild className="p-0 mt-2 text-sm">
                <Link href="/teacher/courses">View All Assigned Courses</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center font-headline"><ListChecks className="mr-2 h-5 w-5 text-primary" /> Assessments Requiring Grading</CardTitle>
            <CardDescription>Student submissions awaiting your review.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : assessmentsToGrade.length > 0 ? (
              <ul className="space-y-2">
                {assessmentsToGrade.map(assessment => (
                  <li key={assessment.id} className="text-sm text-muted-foreground">
                    {assessment.course}: {assessment.name} - <span className="text-accent">{assessment.submissions} pending</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No assessments currently require grading.</p>
            )}
            {/* Link to a full grading page would go here */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center font-headline"><Megaphone className="mr-2 h-5 w-5 text-primary" /> Recent CoTBE Announcements for Faculty</CardTitle>
            <CardDescription>Stay updated with college news relevant to faculty.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-2/3" />
                </div>
            ) : facultyAnnouncements.length > 0 ? (
              <ul className="space-y-2">
                {facultyAnnouncements.map(announcement => (
                  <li key={announcement.id} className="text-sm">
                    <Link href={announcement.link} className="text-primary hover:underline">{announcement.title}</Link>
                    <p className="text-xs text-muted-foreground">{announcement.date}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recent announcements for faculty.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button variant="outline" asChild className="justify-start">
            <Link href="/teacher/profile"><UserCircle className="mr-2 h-4 w-4" /> My Profile</Link>
          </Button>
          <Button variant="outline" asChild className="justify-start">
            <Link href="/teacher/courses"><Library className="mr-2 h-4 w-4" /> Manage My Courses</Link>
          </Button>
          {/* Add other relevant quick links for teachers */}
        </CardContent>
      </Card>
    </div>
  );
}
