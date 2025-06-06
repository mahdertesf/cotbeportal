
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchItems, createItem, updateItem, deleteItem } from '@/lib/api';
import { Loader2, PlusCircle, Edit, Trash2, Search, Filter, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CourseCatalogItem {
  id: string | number; // course_id from backend
  course_code: string;
  title: string;
  description?: string | null;
  credits: number;
  department_id: string | number;
  department_name?: string; // For display
}

interface Department {
  id: string | number;
  name: string;
}

const courseFormSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  course_code: z.string().min(3, "Course code must be at least 3 characters").max(10, "Max 10 characters"),
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Max 200 characters"),
  description: z.string().max(1000, "Max 1000 characters").optional().nullable(),
  credits: z.coerce.number().min(0.5, "Credits must be at least 0.5").max(10, "Max 10 credits"),
  department_id: z.string().min(1, "Department is required"), // Department ID will be string from select
});

type CourseFormData = z.infer<typeof courseFormSchema>;

const ALL_DEPARTMENTS_FILTER = "all_departments_filter_value";

export default function CourseCatalogManagementPage() {
  const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseCatalogItem | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<CourseCatalogItem | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>(ALL_DEPARTMENTS_FILTER);
  const { toast } = useToast();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      course_code: '',
      title: '',
      description: '',
      credits: 3,
      department_id: '',
    },
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [coursesData, departmentsData] = await Promise.all([
        fetchItems('courses') as Promise<CourseCatalogItem[]>,
        fetchItems('departments') as Promise<Department[]>
      ]);
      setDepartments(departmentsData);
      // Map department names to courses
      const coursesWithDeptNames = coursesData.map(course => ({
        ...course,
        department_name: departmentsData.find(dept => String(dept.id) === String(course.department_id))?.name || 'Unknown'
      }));
      setCourses(coursesWithDeptNames);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load catalog data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (course: CourseCatalogItem | null = null) => {
    setEditingCourse(course);
    if (course) {
      form.reset({
        id: course.id,
        course_code: course.course_code,
        title: course.title,
        description: course.description,
        credits: course.credits,
        department_id: String(course.department_id),
      });
    } else {
      form.reset({ course_code: '', title: '', description: '', credits: 3, department_id: '' });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      let response;
      const payload = {
        course_code: data.course_code,
        title: data.title,
        description: data.description,
        credits: data.credits,
        department_id: data.department_id, // This will be the ID string
      };

      if (editingCourse && data.id) {
        response = await updateItem('courses', data.id, payload);
        toast({ title: "Success", description: "Course updated successfully." });
      } else {
        response = await createItem('courses', payload);
        toast({ title: "Success", description: "Course created successfully." });
      }
      
      if (response.success) {
        loadInitialData();
        setIsDialogOpen(false);
      } else {
        toast({ title: "Error", description: response.error || "Failed to save course.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteItem('courses', courseToDelete.id);
      toast({ title: "Success", description: `Course "${courseToDelete.title}" deleted.` });
      setCourseToDelete(null);
      loadInitialData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete course. It might be in use.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(course =>
      (course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       course.course_code.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (departmentFilter === ALL_DEPARTMENTS_FILTER || String(course.department_id) === departmentFilter)
    );
  }, [courses, searchTerm, departmentFilter]);

  const CourseRowSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
      <TableCell><Skeleton className="h-5 w-10" /></TableCell>
      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
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
                <BookOpen className="mr-3 h-7 w-7 text-primary"/> Course Catalog Management
              </CardTitle>
              <CardDescription>Manage the master list of all courses offered at CoTBE.</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Course
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border rounded-lg bg-background shadow">
            <h3 className="text-lg font-semibold mb-3 font-headline">Filters & Search</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                    <Label htmlFor="search-course" className="block text-sm font-medium text-muted-foreground mb-1">Search by Code or Title</Label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                        id="search-course" 
                        placeholder="Enter code or title..." 
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <Label htmlFor="department-filter" className="block text-sm font-medium text-muted-foreground mb-1">Filter by Department</Label>
                    <Select value={departmentFilter} onValueChange={(value) => setDepartmentFilter(value)}>
                        <SelectTrigger id="department-filter">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Filter by Department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_DEPARTMENTS_FILTER}>All Departments</SelectItem>
                            {departments.map(dept => (
                            <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </div>

          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 3 }).map((_, i) => <CourseRowSkeleton key={i} />)}
              </TableBody>
            </Table>
          ) : filteredCourses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map(course => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.course_code}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell className="text-center">{course.credits}</TableCell>
                    <TableCell>{course.department_name || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-xs">{course.description || 'N/A'}</TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(course)}>
                        <Edit className="mr-1 h-4 w-4" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setCourseToDelete(course)}>
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No courses found{searchTerm || departmentFilter !== ALL_DEPARTMENTS_FILTER ? ' matching your criteria' : ''}.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          form.reset();
          setEditingCourse(null);
        }
        setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
            <DialogDescription>
              {editingCourse ? 'Modify the course details below.' : 'Fill in the details to create a new course for the catalog.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="course_code">Course Code</Label>
              <Input id="course_code" {...form.register('course_code')} />
              {form.formState.errors.course_code && <p className="text-sm text-destructive mt-1">{form.formState.errors.course_code.message}</p>}
            </div>
            <div>
              <Label htmlFor="title">Course Title</Label>
              <Input id="title" {...form.register('title')} />
              {form.formState.errors.title && <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="credits">Credits</Label>
              <Input id="credits" type="number" step="0.5" {...form.register('credits')} />
              {form.formState.errors.credits && <p className="text-sm text-destructive mt-1">{form.formState.errors.credits.message}</p>}
            </div>
            <div>
              <Label htmlFor="department_id">Department</Label>
              <Select onValueChange={(value) => form.setValue('department_id', value)} defaultValue={form.getValues('department_id')}>
                <SelectTrigger id="department_id">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.department_id && <p className="text-sm text-destructive mt-1">{form.formState.errors.department_id.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" {...form.register('description')} />
              {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingCourse ? 'Save Changes' : 'Create Course'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {courseToDelete && (
        <AlertDialog open={!!courseToDelete} onOpenChange={() => setCourseToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this course?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Deleting course "{courseToDelete.title} ({courseToDelete.course_code})" from the catalog might affect historical data or future scheduling.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCourseToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteCourse} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete Course
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
