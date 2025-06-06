
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchItems, createItem, updateItem, deleteItem } from '@/lib/api';
import { Loader2, PlusCircle, Edit, Trash2, Search, Filter, CalendarClock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Interfaces for data structures
interface CatalogCourseItem {
  id: string | number; // course_id
  course_code: string;
  title: string;
  department_id: string | number;
}

interface SemesterItem {
  id: string | number; // semester_id
  name: string;
}

interface TeacherItem {
  user_id: string | number; // teacher_id (maps to user_id in Users table)
  first_name: string;
  last_name: string;
}

interface RoomItem {
  id: string | number; // room_id
  room_number: string;
  building_name: string; // Pre-joined for simplicity in mock
}

interface DepartmentItem {
  id: string | number;
  name: string;
}

interface ScheduledCourseItem {
  scheduled_course_id: string | number;
  course_id: string | number;
  semester_id: string | number;
  teacher_id: string | number;
  room_id?: string | number | null;
  section_number: string;
  max_capacity: number;
  current_enrollment: number;
  days_of_week?: string | null;
  start_time?: string | null; // HH:mm format
  end_time?: string | null;   // HH:mm format

  // For display
  course_code?: string;
  course_title?: string;
  semester_name?: string;
  teacher_name?: string;
  room_display_name?: string; // e.g., "Room 101 (Building A)"
}

const scheduledCourseFormSchema = z.object({
  scheduled_course_id: z.union([z.string(), z.number()]).optional(),
  course_id: z.string().min(1, "Course is required"),
  semester_id: z.string().min(1, "Semester is required"),
  teacher_id: z.string().min(1, "Teacher is required"),
  room_id: z.string().optional().nullable(),
  section_number: z.string().min(1, "Section number is required").max(10),
  max_capacity: z.coerce.number().min(1, "Max capacity must be at least 1").max(500),
  days_of_week: z.string().max(10).optional().nullable().describe("e.g., MWF, TTH"),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid start time (HH:MM)").optional().nullable(),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid end time (HH:MM)").optional().nullable(),
}).refine(data => {
    if (data.start_time && data.end_time) {
        return data.end_time > data.start_time;
    }
    return true;
}, { message: "End time must be after start time", path: ["end_time"] });

type ScheduledCourseFormData = z.infer<typeof scheduledCourseFormSchema>;

const ALL_FILTER_VALUE = "all";

export default function ScheduledCoursesManagementPage() {
  const [scheduledCoursesList, setScheduledCoursesList] = useState<ScheduledCourseItem[]>([]);
  const [catalogCourses, setCatalogCourses] = useState<CatalogCourseItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScheduledCourse, setEditingScheduledCourse] = useState<ScheduledCourseItem | null>(null);
  const [scheduledCourseToDelete, setScheduledCourseToDelete] = useState<ScheduledCourseItem | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<string>(ALL_FILTER_VALUE);
  const [departmentFilter, setDepartmentFilter] = useState<string>(ALL_FILTER_VALUE);
  const { toast } = useToast();

  const form = useForm<ScheduledCourseFormData>({
    resolver: zodResolver(scheduledCourseFormSchema),
    defaultValues: {
      section_number: '',
      max_capacity: 30,
      days_of_week: '',
      start_time: '',
      end_time: '',
    },
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [
        scheduledData,
        catalogData,
        semesterData,
        teacherData,
        roomData,
        departmentData,
      ] = await Promise.all([
        fetchItems('scheduledCourses') as Promise<ScheduledCourseItem[]>,
        fetchItems('courses') as Promise<CatalogCourseItem[]>,
        fetchItems('semesters') as Promise<SemesterItem[]>,
        fetchItems('teachers') as Promise<TeacherItem[]>,
        fetchItems('rooms') as Promise<RoomItem[]>,
        fetchItems('departments') as Promise<DepartmentItem[]>,
      ]);

      setCatalogCourses(catalogData);
      setSemesters(semesterData);
      setTeachers(teacherData);
      setRooms(roomData);
      setDepartments(departmentData);

      const enrichedScheduledCourses = scheduledData.map(sc => {
        const courseInfo = catalogData.find(c => String(c.id) === String(sc.course_id));
        const semesterInfo = semesterData.find(s => String(s.id) === String(sc.semester_id));
        const teacherInfo = teacherData.find(t => String(t.user_id) === String(sc.teacher_id));
        const roomInfo = roomData.find(r => String(r.id) === String(sc.room_id));
        return {
          ...sc,
          course_code: courseInfo?.course_code,
          course_title: courseInfo?.title,
          semester_name: semesterInfo?.name,
          teacher_name: teacherInfo ? `${teacherInfo.first_name} ${teacherInfo.last_name}` : 'N/A',
          room_display_name: roomInfo ? `${roomInfo.room_number} (${roomInfo.building_name})` : 'N/A',
        };
      });
      setScheduledCoursesList(enrichedScheduledCourses);

    } catch (error) {
      toast({ title: "Error", description: "Failed to load necessary data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (scheduledCourse: ScheduledCourseItem | null = null) => {
    setEditingScheduledCourse(scheduledCourse);
    if (scheduledCourse) {
      form.reset({
        scheduled_course_id: scheduledCourse.scheduled_course_id,
        course_id: String(scheduledCourse.course_id),
        semester_id: String(scheduledCourse.semester_id),
        teacher_id: String(scheduledCourse.teacher_id),
        room_id: scheduledCourse.room_id ? String(scheduledCourse.room_id) : null,
        section_number: scheduledCourse.section_number,
        max_capacity: scheduledCourse.max_capacity,
        days_of_week: scheduledCourse.days_of_week || '',
        start_time: scheduledCourse.start_time || '',
        end_time: scheduledCourse.end_time || '',
      });
    } else {
      form.reset({ // Reset to default for new schedule
        course_id: '', semester_id: '', teacher_id: '', room_id: null,
        section_number: '', max_capacity: 30, days_of_week: '', start_time: '', end_time: ''
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: ScheduledCourseFormData) => {
    setIsSubmitting(true);
    try {
      let response;
      const payload = { ...data }; // current_enrollment will be handled by backend or defaults to 0

      if (editingScheduledCourse && data.scheduled_course_id) {
        response = await updateItem('scheduledCourses', data.scheduled_course_id, payload);
        toast({ title: "Success", description: "Scheduled course updated successfully." });
      } else {
        response = await createItem('scheduledCourses', payload);
        toast({ title: "Success", description: "Course scheduled successfully." });
      }
      
      if (response.success) {
        loadInitialData(); // Reload all data
        setIsDialogOpen(false);
      } else {
        toast({ title: "Error", description: response.error || "Failed to save schedule.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteScheduledCourse = async () => {
    if (!scheduledCourseToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteItem('scheduledCourses', scheduledCourseToDelete.scheduled_course_id);
      toast({ title: "Success", description: `Schedule for "${scheduledCourseToDelete.course_title}" deleted.` });
      setScheduledCourseToDelete(null);
      loadInitialData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete schedule. It might have registrations.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredScheduledCourses = useMemo(() => {
    return scheduledCoursesList.filter(sc => {
      const courseInfo = catalogCourses.find(c => String(c.id) === String(sc.course_id));
      const departmentMatch = departmentFilter === ALL_FILTER_VALUE || (courseInfo && String(courseInfo.department_id) === departmentFilter);
      const semesterMatch = semesterFilter === ALL_FILTER_VALUE || String(sc.semester_id) === semesterFilter;
      const searchMatch = searchTerm === '' ||
        sc.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sc.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sc.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase());
      return departmentMatch && semesterMatch && searchMatch;
    });
  }, [scheduledCoursesList, catalogCourses, searchTerm, semesterFilter, departmentFilter]);

  const RowSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      <TableCell><Skeleton className="h-5 w-8" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell><Skeleton className="h-5 w-10" /></TableCell>
      <TableCell><Skeleton className="h-5 w-10" /></TableCell>
      <TableCell className="space-x-2"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-20" /></TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="font-headline text-2xl flex items-center">
                <CalendarClock className="mr-3 h-7 w-7 text-primary"/> Scheduled Courses Management
              </CardTitle>
              <CardDescription>Manage course offerings for different semesters, assign teachers, rooms, and set capacities.</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Schedule New Course
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border rounded-lg bg-background shadow">
            <h3 className="text-lg font-semibold mb-3 font-headline">Filters & Search</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="search-schedule" className="block text-sm font-medium text-muted-foreground mb-1">Search Course/Teacher</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="search-schedule" placeholder="Code, title, or teacher name..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="semester-filter" className="block text-sm font-medium text-muted-foreground mb-1">Filter by Semester</Label>
                <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                  <SelectTrigger id="semester-filter"><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Filter by Semester" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_FILTER_VALUE}>All Semesters</SelectItem>
                    {semesters.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="department-filter" className="block text-sm font-medium text-muted-foreground mb-1">Filter by Department</Label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger id="department-filter"><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Filter by Department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_FILTER_VALUE}>All Departments</SelectItem>
                    {departments.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <Table><TableHeader><TableRow><TableHead>Course</TableHead><TableHead>Sec</TableHead><TableHead>Semester</TableHead><TableHead>Teacher</TableHead><TableHead>Room</TableHead><TableHead>Schedule</TableHead><TableHead>Enrolled</TableHead><TableHead>Cap</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>{Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}</TableBody></Table>
          ) : filteredScheduledCourses.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Course</TableHead><TableHead>Sec</TableHead><TableHead>Semester</TableHead><TableHead>Teacher</TableHead><TableHead>Room</TableHead><TableHead>Schedule</TableHead><TableHead className="text-center">Enrolled</TableHead><TableHead className="text-center">Capacity</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredScheduledCourses.map(sc => (
                  <TableRow key={sc.scheduled_course_id}>
                    <TableCell className="font-medium">{sc.course_code} - {sc.course_title}</TableCell>
                    <TableCell>{sc.section_number}</TableCell>
                    <TableCell>{sc.semester_name}</TableCell>
                    <TableCell>{sc.teacher_name}</TableCell>
                    <TableCell>{sc.room_display_name}</TableCell>
                    <TableCell className="text-xs">{sc.days_of_week || 'N/A'} {sc.start_time && sc.end_time ? `${sc.start_time}-${sc.end_time}` : 'N/A'}</TableCell>
                    <TableCell className="text-center">{sc.current_enrollment}</TableCell>
                    <TableCell className="text-center">{sc.max_capacity}</TableCell>
                    <TableCell className="space-x-1">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(sc)}><Edit className="mr-1 h-3 w-3" /> Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => setScheduledCourseToDelete(sc)}><Trash2 className="mr-1 h-3 w-3" /> Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No scheduled courses found{searchTerm || semesterFilter !== ALL_FILTER_VALUE || departmentFilter !== ALL_FILTER_VALUE ? ' matching your criteria' : ''}.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) { form.reset(); setEditingScheduledCourse(null); } setIsDialogOpen(open); }}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingScheduledCourse ? 'Edit Scheduled Course' : 'Schedule New Course'}</DialogTitle>
            <DialogDescription>
              {editingScheduledCourse ? 'Modify the schedule details below.' : 'Fill in the details to schedule a new course offering.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course_id">Course</Label>
                <Select onValueChange={(value) => form.setValue('course_id', value)} defaultValue={form.getValues('course_id')}>
                  <SelectTrigger id="course_id"><SelectValue placeholder="Select Course" /></SelectTrigger>
                  <SelectContent>{catalogCourses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.course_code} - {c.title}</SelectItem>)}</SelectContent>
                </Select>
                {form.formState.errors.course_id && <p className="text-sm text-destructive mt-1">{form.formState.errors.course_id.message}</p>}
              </div>
              <div>
                <Label htmlFor="semester_id">Semester</Label>
                <Select onValueChange={(value) => form.setValue('semester_id', value)} defaultValue={form.getValues('semester_id')}>
                  <SelectTrigger id="semester_id"><SelectValue placeholder="Select Semester" /></SelectTrigger>
                  <SelectContent>{semesters.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
                {form.formState.errors.semester_id && <p className="text-sm text-destructive mt-1">{form.formState.errors.semester_id.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teacher_id">Teacher</Label>
                <Select onValueChange={(value) => form.setValue('teacher_id', value)} defaultValue={form.getValues('teacher_id')}>
                  <SelectTrigger id="teacher_id"><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                  <SelectContent>{teachers.map(t => <SelectItem key={t.user_id} value={String(t.user_id)}>{t.first_name} {t.last_name}</SelectItem>)}</SelectContent>
                </Select>
                {form.formState.errors.teacher_id && <p className="text-sm text-destructive mt-1">{form.formState.errors.teacher_id.message}</p>}
              </div>
              <div>
                <Label htmlFor="room_id">Room (Optional)</Label>
                <Select onValueChange={(value) => form.setValue('room_id', value)} defaultValue={form.getValues('room_id') || undefined}>
                  <SelectTrigger id="room_id"><SelectValue placeholder="Select Room (Optional)" /></SelectTrigger>
                  <SelectContent>{rooms.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.room_number} ({r.building_name})</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="section_number">Section Number</Label>
                <Input id="section_number" {...form.register('section_number')} />
                {form.formState.errors.section_number && <p className="text-sm text-destructive mt-1">{form.formState.errors.section_number.message}</p>}
              </div>
              <div>
                <Label htmlFor="max_capacity">Max Capacity</Label>
                <Input id="max_capacity" type="number" {...form.register('max_capacity')} />
                {form.formState.errors.max_capacity && <p className="text-sm text-destructive mt-1">{form.formState.errors.max_capacity.message}</p>}
              </div>
            </div>
            <div>
                <Label htmlFor="days_of_week">Days of Week (e.g., MWF, TTH)</Label>
                <Input id="days_of_week" {...form.register('days_of_week')} />
                {form.formState.errors.days_of_week && <p className="text-sm text-destructive mt-1">{form.formState.errors.days_of_week.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Start Time (HH:MM)</Label>
                <Input id="start_time" type="time" {...form.register('start_time')} />
                {form.formState.errors.start_time && <p className="text-sm text-destructive mt-1">{form.formState.errors.start_time.message}</p>}
              </div>
              <div>
                <Label htmlFor="end_time">End Time (HH:MM)</Label>
                <Input id="end_time" type="time" {...form.register('end_time')} />
                {form.formState.errors.end_time && <p className="text-sm text-destructive mt-1">{form.formState.errors.end_time.message}</p>}
              </div>
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingScheduledCourse ? 'Save Changes' : 'Schedule Course'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {scheduledCourseToDelete && (
        <AlertDialog open={!!scheduledCourseToDelete} onOpenChange={() => setScheduledCourseToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this schedule?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Deleting the schedule for "{scheduledCourseToDelete.course_title} - Section {scheduledCourseToDelete.section_number}" might affect student registrations and historical data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setScheduledCourseToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteScheduledCourse} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete Schedule
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

    