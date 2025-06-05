'use client';
import React, { useState, useEffect } from 'react';
import useAppStore from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { fetchTeacherAssignedCourses } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, Library, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AssignedCourse {
  scheduled_course_id: string;
  course_code: string;
  title: string;
  section: string;
  // Add semester info if available from API
}

export default function TeacherCoursesPage() {
  const user = useAppStore(state => state.user);
  const [courses, setCourses] = useState<AssignedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.user_id && user.role === 'Teacher') {
      const loadCourses = async () => {
        setIsLoading(true);
        try {
          // Placeholder: ideally fetch for a specific semester or allow semester selection
          const data = await fetchTeacherAssignedCourses(user.user_id);
          setCourses(data);
        } catch (error) {
          toast({ title: "Error", description: "Failed to load assigned courses.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      loadCourses();
    }
  }, [user, toast]);

  const CourseRowSkeleton = () => (
    <TableRow>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <Library className="mr-3 h-7 w-7 text-primary" /> My Assigned CoTBE Courses
          </CardTitle>
          <CardDescription>Manage materials, assessments, and grades for your assigned courses.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({length:3}).map((_, i) => <CourseRowSkeleton key={i} />)}
                </TableBody>
            </Table>
          ) : courses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Section</TableHead>
                  {/* <TableHead>Semester</TableHead> */}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map(course => (
                  <TableRow key={course.scheduled_course_id}>
                    <TableCell>{course.course_code}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.section}</TableCell>
                    {/* <TableCell>Current Semester</TableCell> */}
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/teacher/courses/${course.scheduled_course_id}/manage`}>
                          Manage Course <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">You are not assigned to any courses for the current semester, or data is unavailable.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
