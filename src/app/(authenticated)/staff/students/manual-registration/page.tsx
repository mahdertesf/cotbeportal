
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchAllUsers, fetchItems, handleManualStudentRegistration } from '@/lib/api';
import type { UserProfile } from '@/stores/appStore';
import { Loader2, UserPlus, CalendarDays, BookOpen, AlertTriangle, Check, ChevronsUpDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from '@/lib/utils';

interface Student extends UserProfile {
  // student_id is user_id for students
}

interface Semester {
  id: string | number;
  name: string;
}

interface CatalogCourse { // For course title lookup
  id: string | number;
  title: string;
}

interface ScheduledCourse {
  scheduled_course_id: string | number;
  course_id: string | number;
  semester_id: string | number;
  section_number: string;
  max_capacity: number;
  current_enrollment: number;
  // For display
  course_title?: string; 
}

const manualRegistrationSchema = z.object({
  student_id: z.string().min(1, "Student is required"),
  semester_id: z.string().min(1, "Semester is required"),
  scheduled_course_id: z.string().min(1, "Course is required"),
});

type ManualRegistrationFormData = z.infer<typeof manualRegistrationSchema>;

export default function ManualRegistrationPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [allScheduledCourses, setAllScheduledCourses] = useState<ScheduledCourse[]>([]);
  const [catalogCourses, setCatalogCourses] = useState<CatalogCourse[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationData, setConfirmationData] = useState<ManualRegistrationFormData | null>(null);
  
  const [studentComboboxOpen, setStudentComboboxOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<ManualRegistrationFormData>({
    resolver: zodResolver(manualRegistrationSchema),
    defaultValues: {
      student_id: '',
      semester_id: '',
      scheduled_course_id: '',
    },
  });

  const selectedSemesterId = form.watch('semester_id');
  const selectedStudentId = form.watch('student_id');

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [usersData, semestersData, scheduledCoursesData, catalogData] = await Promise.all([
          fetchAllUsers(),
          fetchItems('semesters') as Promise<Semester[]>,
          fetchItems('scheduledCourses') as Promise<ScheduledCourse[]>,
          fetchItems('courses') as Promise<CatalogCourse[]>,
        ]);
        
        setStudents(usersData.filter(u => u.role === 'Student') as Student[]);
        setSemesters(semestersData);
        setCatalogCourses(catalogData);

        // Enrich scheduled courses with titles
        const enrichedScheduledCourses = scheduledCoursesData.map(sc => {
          const courseInfo = catalogData.find(cc => String(cc.id) === String(sc.course_id));
          return {
            ...sc,
            course_title: courseInfo?.title || 'Unknown Course',
          };
        });
        setAllScheduledCourses(enrichedScheduledCourses);

      } catch (error) {
        toast({ title: "Error", description: "Failed to load initial data for registration.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [toast]);

  const availableCoursesForSemester = useMemo(() => {
    if (!selectedSemesterId) return [];
    return allScheduledCourses.filter(sc => String(sc.semester_id) === String(selectedSemesterId));
  }, [allScheduledCourses, selectedSemesterId]);

  const onSubmit = (data: ManualRegistrationFormData) => {
    setConfirmationData(data);
  };

  const handleConfirmRegistration = async () => {
    if (!confirmationData) return;
    setIsSubmitting(true);
    try {
      const response = await handleManualStudentRegistration(confirmationData.student_id, confirmationData.scheduled_course_id);
      if (response.success) {
        toast({ title: "Registration Successful", description: response.message });
        form.reset(); 
      } else {
        toast({ title: "Registration Failed", description: response.error || "Could not register student.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      setConfirmationData(null);
    }
  };
  
  const getStudentName = (studentId: string) => {
    const student = students.find(s => String(s.user_id) === String(studentId));
    return student ? `${student.first_name} ${student.last_name} (ID: ${student.user_id})` : 'Unknown Student';
  };

  const getCourseDisplayInfo = (scheduledCourseId: string) => {
    const sc = allScheduledCourses.find(c => String(c.scheduled_course_id) === String(scheduledCourseId));
    return sc ? `${sc.course_title} (Sec: ${sc.section_number})` : 'Unknown Course';
  };
  
  const getSemesterName = (semesterId: string) => {
    return semesters.find(s => String(s.id) === String(semesterId))?.name || 'Unknown Semester';
  }


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center"><UserPlus className="mr-3 h-7 w-7 text-primary"/> Manual Student Registration</CardTitle>
          <CardDescription>Register a student for a course, bypassing standard enrollment periods.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-1/3" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center"><UserPlus className="mr-3 h-7 w-7 text-primary"/> Manual Student Registration</CardTitle>
          <CardDescription>Register a student for a course, bypassing standard enrollment periods. Use with caution.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="student_id_combobox">Select Student</Label>
              <Popover open={studentComboboxOpen} onOpenChange={setStudentComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={studentComboboxOpen}
                    className="w-full justify-between"
                    id="student_id_combobox"
                  >
                    {selectedStudentId
                      ? students.find((student) => String(student.user_id) === selectedStudentId)?.username
                      : "Select student..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search student by ID, name, or username..." />
                    <CommandList>
                      <CommandEmpty>No student found.</CommandEmpty>
                      <CommandGroup>
                        {students.map((student) => (
                          <CommandItem
                            key={student.user_id}
                            value={`${student.username} ${student.first_name} ${student.last_name} ${student.user_id}`}
                            onSelect={() => {
                              form.setValue("student_id", String(student.user_id));
                              setStudentComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedStudentId === String(student.user_id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {student.first_name} {student.last_name} ({student.username} - ID: {student.user_id})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {form.formState.errors.student_id && <p className="text-sm text-destructive mt-1">{form.formState.errors.student_id.message}</p>}
            </div>

            <div>
              <Label htmlFor="semester_id">Select Semester</Label>
              <Select 
                onValueChange={(value) => {
                    form.setValue('semester_id', value);
                    form.setValue('scheduled_course_id', ''); // Reset course when semester changes
                }} 
                value={form.watch('semester_id')}
              >
                <SelectTrigger id="semester_id">
                  <SelectValue placeholder="Select a semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map(semester => (
                    <SelectItem key={semester.id} value={String(semester.id)}>{semester.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.semester_id && <p className="text-sm text-destructive mt-1">{form.formState.errors.semester_id.message}</p>}
            </div>

            <div>
              <Label htmlFor="scheduled_course_id">Select Course</Label>
              <Select 
                onValueChange={(value) => form.setValue('scheduled_course_id', value)} 
                value={form.watch('scheduled_course_id')}
                disabled={!selectedSemesterId || availableCoursesForSemester.length === 0}
              >
                <SelectTrigger id="scheduled_course_id">
                  <SelectValue placeholder={!selectedSemesterId ? "Select semester first" : availableCoursesForSemester.length === 0 ? "No courses for this semester" : "Select a course"} />
                </SelectTrigger>
                <SelectContent>
                  {availableCoursesForSemester.map(course => (
                    <SelectItem key={course.scheduled_course_id} value={String(course.scheduled_course_id)}>
                      {course.course_title} - Section {course.section_number} (Enrolled: {course.current_enrollment}/{course.max_capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.scheduled_course_id && <p className="text-sm text-destructive mt-1">{form.formState.errors.scheduled_course_id.message}</p>}
            </div>
            
            <div className="flex items-center p-3 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md text-sm">
                <AlertTriangle className="mr-2 h-5 w-5" />
                <div>
                    <p className="font-semibold">Warning: Manual Registration Override</p>
                    <p>This action bypasses normal enrollment rules (e.g., registration periods, capacity limits). Ensure this is the correct action.</p>
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Proceed to Confirmation
            </Button>
          </form>
        </CardContent>
      </Card>

      {confirmationData && (
        <AlertDialog open={!!confirmationData} onOpenChange={() => setConfirmationData(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Manual Registration</AlertDialogTitle>
              <AlertDialogDescription>
                Please review the details before confirming:
                <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                    <li><strong>Student:</strong> {getStudentName(confirmationData.student_id)}</li>
                    <li><strong>Course:</strong> {getCourseDisplayInfo(confirmationData.scheduled_course_id)}</li>
                    <li><strong>Semester:</strong> {getSemesterName(confirmationData.semester_id)}</li>
                </ul>
                 <p className="mt-3 text-destructive font-medium">This action may override course capacity and other standard enrollment rules.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmationData(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmRegistration} disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirm Registration
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}


    