
'use client';
// Placeholder for /staff/courses/schedule - ScheduledCoursesManagementPage.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { PlusCircle, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

export default function ScheduledCoursesManagementPage() {
  // Mock data for semesters and departments, replace with API calls
  const semesters = [
    { id: 'sem1', name: 'Fall 2024' },
    { id: 'sem2', name: 'Spring 2025' },
  ];
  const departments = [
    { id: 'dept1', name: 'Computer Science' },
    { id: 'dept2', name: 'Electrical Engineering' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="font-headline text-2xl">Scheduled Courses Management</CardTitle>
              <CardDescription>Manage course offerings for different semesters, assign teachers, and set capacities.</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Schedule New Course
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Schedule New Course</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to schedule a new course. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="course-name" className="text-right">
                      Course
                    </Label>
                    <Select>
                        <SelectTrigger id="course-name" className="col-span-3">
                            <SelectValue placeholder="Select Course" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cs101">CS101 - Intro to Programming</SelectItem>
                            <SelectItem value="ma202">MA202 - Calculus II</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="semester" className="text-right">
                      Semester
                    </Label>
                     <Select>
                        <SelectTrigger id="semester" className="col-span-3">
                            <SelectValue placeholder="Select Semester" />
                        </SelectTrigger>
                        <SelectContent>
                             {semesters.map(semester => (
                                <SelectItem key={semester.id} value={semester.id}>{semester.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="teacher" className="text-right">
                      Teacher
                    </Label>
                    <Input id="teacher" placeholder="Assign Teacher ID" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="capacity" className="text-right">
                      Capacity
                    </Label>
                    <Input id="capacity" type="number" placeholder="Max students" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Save Schedule</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border rounded-lg bg-background shadow">
            <h3 className="text-lg font-semibold mb-3 font-headline">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="semester-filter" className="block text-sm font-medium text-muted-foreground mb-1">Semester</label>
                <Select>
                  <SelectTrigger id="semester-filter">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map(semester => (
                      <SelectItem key={semester.id} value={semester.id}>{semester.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="department-filter" className="block text-sm font-medium text-muted-foreground mb-1">Department</label>
                <Select>
                  <SelectTrigger id="department-filter">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="course-search" className="block text-sm font-medium text-muted-foreground mb-1">Search Course</label>
                <Input id="course-search" placeholder="Enter course code or title..." />
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-4">
              <Filter className="mr-2 h-4 w-4" /> Apply Filters
            </Button>
          </div>
          
          <p className="text-muted-foreground">Scheduled course listing, detailed views, and CRUD operations will be implemented here.</p>
          {/* Placeholder for Table of scheduled courses */}
        </CardContent>
      </Card>
    </div>
  );
}
