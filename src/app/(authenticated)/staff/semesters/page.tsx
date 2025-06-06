
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
import { Loader2, PlusCircle, Edit, Trash2, CalendarDays, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';

interface Semester {
  id: string | number;
  name: string;
  academic_year: number;
  term: 'Semester One' | 'Semester Two'; // Updated term options
  start_date: string; // ISO date string e.g., "2024-09-01"
  end_date: string;   // ISO date string
  registration_start_date: string; // ISO datetime string e.g., "2024-07-15T09:00:00"
  registration_end_date: string;   // ISO datetime string
  add_drop_start_date: string;     // ISO datetime string
  add_drop_end_date: string;       // ISO datetime string
}

const semesterFormSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(3, "Name must be at least 3 characters").max(50, "Max 50 characters"),
  academic_year: z.coerce.number().min(2000, "Academic year must be 2000 or later").max(2100, "Academic year too far in future"),
  term: z.enum(['Semester One', 'Semester Two'], { required_error: "Term is required" }), // Updated term options
  start_date: z.string().min(1, "Start date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  end_date: z.string().min(1, "End date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
  registration_start_date: z.string().min(1, "Reg. start is required").regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Date/time must be YYYY-MM-DDTHH:mm"),
  registration_end_date: z.string().min(1, "Reg. end is required").regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Date/time must be YYYY-MM-DDTHH:mm"),
  add_drop_start_date: z.string().min(1, "Add/drop start is required").regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Date/time must be YYYY-MM-DDTHH:mm"),
  add_drop_end_date: z.string().min(1, "Add/drop end is required").regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Date/time must be YYYY-MM-DDTHH:mm"),
}).refine(data => new Date(data.end_date) > new Date(data.start_date), {
  message: "End date must be after start date",
  path: ["end_date"],
}).refine(data => new Date(data.registration_end_date) > new Date(data.registration_start_date), {
  message: "Registration end must be after start",
  path: ["registration_end_date"],
}).refine(data => new Date(data.add_drop_end_date) > new Date(data.add_drop_start_date), {
  message: "Add/drop end must be after start",
  path: ["add_drop_end_date"],
});

type SemesterFormData = z.infer<typeof semesterFormSchema>;

// Helper to format date for input type="date"
const formatDateForInput = (isoDate: string | undefined) => {
  if (!isoDate) return '';
  try {
    return format(parseISO(isoDate), 'yyyy-MM-dd');
  } catch { return ''; }
};

// Helper to format datetime for input type="datetime-local"
const formatDateTimeForInput = (isoDateTime: string | undefined) => {
  if (!isoDateTime) return '';
  try {
    return format(parseISO(isoDateTime), "yyyy-MM-dd'T'HH:mm");
  } catch { return ''; }
};


export default function SemesterManagementPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [semesterToDelete, setSemesterToDelete] = useState<Semester | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const form = useForm<SemesterFormData>({
    resolver: zodResolver(semesterFormSchema),
    defaultValues: {
      name: '',
      academic_year: new Date().getFullYear(),
      term: undefined, // No default term selected
      start_date: '',
      end_date: '',
      registration_start_date: '',
      registration_end_date: '',
      add_drop_start_date: '',
      add_drop_end_date: '',
    },
  });

  useEffect(() => {
    loadSemesters();
  }, []);

  const loadSemesters = async () => {
    setIsLoading(true);
    try {
      const data = await fetchItems('semesters') as Semester[];
      setSemesters(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load semesters.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (semester: Semester | null = null) => {
    setEditingSemester(semester);
    if (semester) {
      form.reset({
        id: semester.id,
        name: semester.name,
        academic_year: semester.academic_year,
        term: semester.term,
        start_date: formatDateForInput(semester.start_date),
        end_date: formatDateForInput(semester.end_date),
        registration_start_date: formatDateTimeForInput(semester.registration_start_date),
        registration_end_date: formatDateTimeForInput(semester.registration_end_date),
        add_drop_start_date: formatDateTimeForInput(semester.add_drop_start_date),
        add_drop_end_date: formatDateTimeForInput(semester.add_drop_end_date),
      });
    } else {
      form.reset(); // Reset to default for new semester
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: SemesterFormData) => {
    setIsSubmitting(true);
    try {
      let response;
      // Ensure dates are in ISO format if needed by backend, though current mock takes strings.
      const payload = { ...data }; 

      if (editingSemester && data.id) {
        response = await updateItem('semesters', data.id, payload);
        toast({ title: "Success", description: "Semester updated successfully." });
      } else {
        response = await createItem('semesters', payload);
        toast({ title: "Success", description: "Semester created successfully." });
      }
      
      if (response.success) {
        loadSemesters();
        setIsDialogOpen(false);
      } else {
        toast({ title: "Error", description: response.error || "Failed to save semester.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSemester = async () => {
    if (!semesterToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteItem('semesters', semesterToDelete.id);
      toast({ title: "Success", description: `Semester "${semesterToDelete.name}" deleted.` });
      setSemesterToDelete(null);
      loadSemesters();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete semester. It might be in use.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSemesters = useMemo(() => {
    return semesters.filter(sem =>
      sem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(sem.academic_year).includes(searchTerm)
    );
  }, [semesters, searchTerm]);

  const SemesterRowSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell><Skeleton className="h-5 w-12" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
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
                <CalendarDays className="mr-3 h-7 w-7 text-primary"/> Semester Management
              </CardTitle>
              <CardDescription>Manage academic semesters, terms, and important dates for CoTBE.</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Semester
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border rounded-lg bg-background shadow">
            <Label htmlFor="search-semester" className="block text-sm font-medium text-muted-foreground mb-1">Search Semesters</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-semester"
                placeholder="Search by name or academic year..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 3 }).map((_, i) => <SemesterRowSkeleton key={i} />)}
              </TableBody>
            </Table>
          ) : filteredSemesters.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  {/* Consider adding Reg. Start/End for quick view */}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSemesters.map(sem => (
                  <TableRow key={sem.id}>
                    <TableCell className="font-medium">{sem.name}</TableCell>
                    <TableCell>{sem.academic_year}</TableCell>
                    <TableCell>{sem.term}</TableCell>
                    <TableCell>{format(parseISO(sem.start_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(parseISO(sem.end_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(sem)}>
                        <Edit className="mr-1 h-4 w-4" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setSemesterToDelete(sem)}>
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No semesters found{searchTerm ? ' matching your search' : ''}.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          form.reset();
          setEditingSemester(null);
        }
        setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl"> {/* Increased width for more fields */}
          <DialogHeader>
            <DialogTitle className="font-headline">{editingSemester ? 'Edit Semester' : 'Add New Semester'}</DialogTitle>
            <DialogDescription>
              {editingSemester ? 'Modify the semester details below.' : 'Fill in the details to create a new semester.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Semester Name</Label>
                <Input id="name" {...form.register('name')} />
                {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="academic_year">Academic Year (e.g., 2024)</Label>
                <Input id="academic_year" type="number" {...form.register('academic_year')} />
                {form.formState.errors.academic_year && <p className="text-sm text-destructive mt-1">{form.formState.errors.academic_year.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="term">Term</Label>
              <Select onValueChange={(value) => form.setValue('term', value as 'Semester One'|'Semester Two')} defaultValue={form.getValues('term')}>
                <SelectTrigger id="term">
                  <SelectValue placeholder="Select a term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semester One">Semester One</SelectItem>
                  <SelectItem value="Semester Two">Semester Two</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.term && <p className="text-sm text-destructive mt-1">{form.formState.errors.term.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" type="date" {...form.register('start_date')} />
                {form.formState.errors.start_date && <p className="text-sm text-destructive mt-1">{form.formState.errors.start_date.message}</p>}
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" type="date" {...form.register('end_date')} />
                {form.formState.errors.end_date && <p className="text-sm text-destructive mt-1">{form.formState.errors.end_date.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="registration_start_date">Registration Start</Label>
                <Input id="registration_start_date" type="datetime-local" {...form.register('registration_start_date')} />
                {form.formState.errors.registration_start_date && <p className="text-sm text-destructive mt-1">{form.formState.errors.registration_start_date.message}</p>}
              </div>
              <div>
                <Label htmlFor="registration_end_date">Registration End</Label>
                <Input id="registration_end_date" type="datetime-local" {...form.register('registration_end_date')} />
                {form.formState.errors.registration_end_date && <p className="text-sm text-destructive mt-1">{form.formState.errors.registration_end_date.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="add_drop_start_date">Add/Drop Start</Label>
                <Input id="add_drop_start_date" type="datetime-local" {...form.register('add_drop_start_date')} />
                {form.formState.errors.add_drop_start_date && <p className="text-sm text-destructive mt-1">{form.formState.errors.add_drop_start_date.message}</p>}
              </div>
              <div>
                <Label htmlFor="add_drop_end_date">Add/Drop End</Label>
                <Input id="add_drop_end_date" type="datetime-local" {...form.register('add_drop_end_date')} />
                {form.formState.errors.add_drop_end_date && <p className="text-sm text-destructive mt-1">{form.formState.errors.add_drop_end_date.message}</p>}
              </div>
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingSemester ? 'Save Changes' : 'Create Semester'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {semesterToDelete && (
        <AlertDialog open={!!semesterToDelete} onOpenChange={() => setSemesterToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this semester?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Deleting semester "{semesterToDelete.name}" might affect scheduled courses and student registrations.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSemesterToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSemester} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete Semester
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

