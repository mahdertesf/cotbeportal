'use client';
import React, { useState, useEffect } from 'react';
import useAppStore from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { fetchStudentRegisteredCourses } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, BookOpen, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface RegisteredCourse {
  registrationId: string;
  scheduledCourseId: string;
  course_code: string;
  title: string;
  status: string;
  final_grade?: string | null; // Optional, might not be available for ongoing courses
}

export default function StudentCoursesListPage() {
  const user = useAppStore(state => state.user);
  const [courses, setCourses] = useState<RegisteredCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.user_id) {
      const loadCourses = async () => {
        setIsLoading(true);
        try {
          const data = await fetchStudentRegisteredCourses(user.user_id);
          setCourses(data);
        } catch (error) {
          toast({ title: "Error", description: "Failed to load your courses.", variant: "destructive" });
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
        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <BookOpen className="mr-3 h-7 w-7 text-primary" /> My Enrolled CoTBE Courses
          </CardTitle>
          <CardDescription>Access materials, view assessments, and track your progress for each course.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map(course => (
                  <TableRow key={course.registrationId}>
                    <TableCell>{course.course_code}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                            course.status === 'Registered' ? 'bg-green-100 text-green-700' : 
                            course.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                            course.status === 'Waitlisted' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                            {course.status}
                        </span>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/student/courses/${course.scheduledCourseId}`}>
                          View Course <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">You are not enrolled in any courses.</p>
          )}
        </CardContent>
      </Card>
       <Button asChild variant="default" className="mt-4">
          <Link href="/student/courses/register">Register for More Courses</Link>
      </Button>
    </div>
  );
}
