
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { fetchAvailableCourses, handleRegisterCourse, fetchStudentRegisteredCourses, handleDropCourse, fetchItems } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Filter, PlusCircle, MinusCircle, Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import useAppStore from '@/stores/appStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

interface Course {
  id: string;
  course_code: string;
  title: string;
  credits: number;
  section_number: string;
  teacher_name: string;
  room_name: string;
  schedule: string;
  max_capacity: number;
  current_enrollment: number;
  description: string;
  prerequisites: string[];
}

interface RegisteredCourse {
  registrationId: string;
  scheduledCourseId: string;
  course_code: string;
  title: string;
  status: string;
}

interface Department {
  id: string | number;
  name: string;
}

const ALL_DEPARTMENTS_VALUE = "all"; // Define a constant for clarity

export default function CourseRegistrationPage() {
  const user = useAppStore(state => state.user);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [registeredCourses, setRegisteredCourses] = useState<RegisteredCourse[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<Course | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState(''); // Initial value for placeholder
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingRegistered, setIsLoadingRegistered] = useState(true);
  const [isRegistering, setIsRegistering] = useState<Record<string, boolean>>({});
  const [isDropping, setIsDropping] = useState<Record<string, boolean>>({});

  const { toast } = useToast();

  useEffect(() => {
    async function loadInitialData() {
      setIsLoadingCourses(true);
      setIsLoadingRegistered(true);
      try {
        const [coursesData, departmentsData] = await Promise.all([
          fetchAvailableCourses(),
          fetchItems('departments')
        ]);
        setAvailableCourses(coursesData);
        setDepartments(departmentsData as Department[]);

        if (user?.user_id) {
            const registeredData = await fetchStudentRegisteredCourses(user.user_id);
            setRegisteredCourses(registeredData);
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load course data.", variant: "destructive" });
      } finally {
        setIsLoadingCourses(false);
        setIsLoadingRegistered(false);
      }
    }
    loadInitialData();
  }, [toast, user]);

  const handleRegister = async (courseId: string) => {
    setIsRegistering(prev => ({...prev, [courseId]: true }));
    try {
      // Client-side checks (mock for now)
      const course = availableCourses.find(c => c.id === courseId);
      if (course && course.current_enrollment >= course.max_capacity) {
         toast({ title: "Registration Failed", description: "Course is full.", variant: "destructive" });
         setIsRegistering(prev => ({...prev, [courseId]: false }));
         return;
      }
      // Add prerequisite checks, schedule conflicts here in real app.

      const response = await handleRegisterCourse(courseId);
      if (response.success) {
        toast({ title: "Success", description: response.message, className: "bg-green-500 text-white" });
        // Refresh registered courses list
        if (user?.user_id) {
            const updatedRegistered = await fetchStudentRegisteredCourses(user.user_id);
            setRegisteredCourses(updatedRegistered);
        }
      } else {
        toast({ title: "Registration Failed", description: "Could not register for the course.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred during registration.", variant: "destructive" });
    } finally {
      setIsRegistering(prev => ({...prev, [courseId]: false }));
    }
  };
  
  const handleDrop = async (registrationId: string) => {
    setIsDropping(prev => ({...prev, [registrationId]: true}));
    try {
      const response = await handleDropCourse(registrationId);
      if (response.success) {
        toast({ title: "Success", description: response.message, className: "bg-green-500 text-white" });
        // Refresh registered courses list
         if (user?.user_id) {
            const updatedRegistered = await fetchStudentRegisteredCourses(user.user_id);
            setRegisteredCourses(updatedRegistered);
        }
      } else {
        toast({ title: "Drop Failed", description: "Could not drop the course.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred while dropping the course.", variant: "destructive" });
    } finally {
       setIsDropping(prev => ({...prev, [registrationId]: false}));
    }
  };

  const filteredCourses = availableCourses.filter(course => 
    (course.title.toLowerCase().includes(searchTerm.toLowerCase()) || course.course_code.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!departmentFilter || departmentFilter === ALL_DEPARTMENTS_VALUE ? true : course.teacher_name.includes(departmentFilter)) // Adjusted filter logic
  );

  const CourseRowSkeleton = () => (
    <TableRow>
        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell className="space-x-2"><Skeleton className="h-8 w-8 inline-block" /><Skeleton className="h-8 w-20 inline-block" /></TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Course Registration & Management</CardTitle>
          <CardDescription>Browse available courses, register, and manage your enrollments for the active semester.</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="available">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">Available Courses</TabsTrigger>
          <TabsTrigger value="registered">My Registered Courses</TabsTrigger>
        </TabsList>
        <TabsContent value="available">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                      <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-grow">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by course code or title..." className="pl-8 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Filter by Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_DEPARTMENTS_VALUE}>All Departments</SelectItem>
                                {departments.map(dept => <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                      </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingCourses ? Array.from({length: 3}).map((_, i) => <CourseRowSkeleton key={i}/> ) : 
                        filteredCourses.length > 0 ? filteredCourses.map((course) => (
                        <TableRow key={course.id}>
                            <TableCell>{course.course_code}</TableCell>
                            <TableCell>{course.title}</TableCell>
                            <TableCell>{course.credits}</TableCell>
                            <TableCell>{course.teacher_name}</TableCell>
                            <TableCell>{course.schedule}</TableCell>
                            <TableCell>{course.current_enrollment}/{course.max_capacity}</TableCell>
                            <TableCell className="space-x-1">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => setSelectedCourseDetails(course)}>
                                        <Info className="mr-1 h-4 w-4"/>Details
                                    </Button>
                                </DialogTrigger>
                            </Dialog>
                            <Button size="sm" onClick={() => handleRegister(course.id)} disabled={isRegistering[course.id] || course.current_enrollment >= course.max_capacity || registeredCourses.some(rc => rc.scheduledCourseId === course.id)}>
                                {isRegistering[course.id] ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-1 h-4 w-4" />}
                                {registeredCourses.some(rc => rc.scheduledCourseId === course.id) ? "Registered" : "Register"}
                            </Button>
                            </TableCell>
                        </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={7} className="text-center">No available courses match your criteria.</TableCell></TableRow>
                        )}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="registered">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">My Registered Courses</CardTitle>
                    <CardDescription>Courses you are currently enrolled in or waitlisted for.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingRegistered ? Array.from({length: 2}).map((_, i) => (
                                <TableRow key={`reg_skel_${i}`}>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                                </TableRow>
                            ) ) : 
                            registeredCourses.length > 0 ? registeredCourses.map(regCourse => (
                                <TableRow key={regCourse.registrationId}>
                                    <TableCell>{regCourse.course_code}</TableCell>
                                    <TableCell>{regCourse.title}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            regCourse.status === 'Registered' ? 'bg-green-100 text-green-700' : 
                                            regCourse.status === 'Waitlisted' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {regCourse.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="destructive" size="sm" onClick={() => handleDrop(regCourse.registrationId)} disabled={isDropping[regCourse.registrationId]}>
                                            {isDropping[regCourse.registrationId] ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <MinusCircle className="mr-1 h-4 w-4" />}
                                            Drop Course
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={4} className="text-center">You are not registered for any courses.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      {selectedCourseDetails && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedCourseDetails.course_code} - {selectedCourseDetails.title}</DialogTitle>
            <DialogDescription>{selectedCourseDetails.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm py-4">
            <p><strong>Credits:</strong> {selectedCourseDetails.credits}</p>
            <p><strong>Teacher:</strong> {selectedCourseDetails.teacher_name}</p>
            <p><strong>Room:</strong> {selectedCourseDetails.room_name}, Section: {selectedCourseDetails.section_number}</p>
            <p><strong>Schedule:</strong> {selectedCourseDetails.schedule}</p>
            <p><strong>Capacity:</strong> {selectedCourseDetails.current_enrollment} / {selectedCourseDetails.max_capacity}</p>
            {selectedCourseDetails.prerequisites.length > 0 && (
              <div>
                <strong>Prerequisites:</strong>
                <ul className="list-disc list-inside ml-4">
                  {selectedCourseDetails.prerequisites.map(pr => <li key={pr}>{pr}</li>)}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      )}
    </div>
  );
}

