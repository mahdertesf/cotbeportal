
'use client';

import React, { useState, useEffect } from 'react';
import useAppStore from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { fetchAcademicHistory } from '@/lib/api'; // Mock API
import { getGeminiAcademicInsights } from '@/ai/flows/get-gemini-academic-insights';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Brain, Loader2, AlertTriangle, CalendarDays } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from "@/lib/utils";

interface CourseRecord {
  course_code: string;
  title: string;
  credits: number;
  final_grade: string;
  grade_points: number;
}

interface SemesterDetails {
  name: "Semester One" | "Semester Two";
  courses: CourseRecord[];
  semesterGPA: number;
}

interface AcademicYearDetails {
  year: string; // e.g., "Academic Year 2022-2023"
  semesters: SemesterDetails[];
  annualGPA?: number; 
}

interface AcademicHistoryPageData {
  academic_years: AcademicYearDetails[];
  cumulativeGPA: number;
}

export default function AcademicHistoryPage() {
  const user = useAppStore((state) => state.user);
  const { toast } = useToast();

  const [history, setHistory] = useState<AcademicHistoryPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (user?.user_id) {
      const loadHistory = async () => {
        setIsLoading(true);
        try {
          const data = await fetchAcademicHistory(user.user_id);
          setHistory(data as AcademicHistoryPageData);
        } catch (error) {
          toast({ title: "Error", description: "Could not load academic history.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      loadHistory();
    }
  }, [user, toast]);

  const handleGetAiInsights = async () => {
    if (!history) return;
    setIsAiLoading(true);
    setAiInsights(null);
    try {
      const studentProgressSummary = history.academic_years
        .flatMap(ay => 
            ay.semesters.flatMap(s => 
                s.courses.map(c => `${ay.year} ${s.name} - ${c.course_code} (${c.title}): ${c.final_grade}`)
            )
        )
        .join('\n');
        
      const studentAcademicInterests = "Interested in software development and AI."; 

      const response = await getGeminiAcademicInsights({ studentProgressSummary, studentAcademicInterests });
      setAiInsights(response.insights);
    } catch (error) {
      toast({ title: "AI Error", description: "Could not generate academic insights.", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const renderSemesterCoursesTable = (courses: CourseRecord[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Course Code</TableHead>
          <TableHead>Course Title</TableHead>
          <TableHead className="text-center">Credits</TableHead>
          <TableHead className="text-center">Final Grade</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course.course_code}>
            <TableCell>{course.course_code}</TableCell>
            <TableCell>{course.title}</TableCell>
            <TableCell className="text-center">{course.credits}</TableCell>
            <TableCell className="text-center">{course.final_grade}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
  
  const renderSemesterSkeleton = (keySuffix: string) => (
    <AccordionItem value={`skel_sem_${keySuffix}`} className="mb-2 border rounded-md shadow-sm">
        <AccordionTrigger className="bg-muted/30 px-4 py-3 hover:bg-muted/50 font-medium text-sm">
            <Skeleton className="h-5 w-28" />
        </AccordionTrigger>
        <AccordionContent className="pt-0">
            <div className="border-t p-3">
                <Table>
                    <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Title</TableHead><TableHead>Credits</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {Array.from({length: 2}).map((_, i) => (
                            <TableRow key={`skel_course_${keySuffix}_${i}`}>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <p className="text-right font-semibold mt-2"><Skeleton className="h-5 w-24 inline-block" /></p>
            </div>
        </AccordionContent>
    </AccordionItem>
  );

  const renderAcademicYearSkeleton = (keySuffix: string) => (
    <AccordionItem value={`skel_ay_${keySuffix}`} className="border-b-0">
        <AccordionTrigger className="bg-primary/20 hover:bg-primary/30 px-4 py-3 rounded-md font-semibold text-lg">
            <Skeleton className="h-6 w-1/2" />
        </AccordionTrigger>
        <AccordionContent className="pt-0 pl-4 pr-2 pb-2">
            <Accordion type="multiple" className="w-full space-y-1 mt-2">
                {renderSemesterSkeleton(`sem1_${keySuffix}`)}
                {renderSemesterSkeleton(`sem2_${keySuffix}`)}
            </Accordion>
            {/* Optional: Skeleton for Annual GPA if you plan to show it */}
            {/* <p className="text-right font-semibold mt-2 pr-2"><Skeleton className="h-5 w-32 inline-block" /></p> */}
        </AccordionContent>
    </AccordionItem>
  );


  if (isLoading) {
    return (
        <div className="space-y-6">
            <Card><CardHeader><Skeleton className="h-8 w-3/5" /><Skeleton className="h-5 w-4/5 mt-2" /></CardHeader></Card>
            <Accordion type="multiple" className="w-full space-y-3">
                {renderAcademicYearSkeleton("1")}
            </Accordion>
            <Card><CardContent className="pt-6 text-right"><Skeleton className="h-7 w-1/3 inline-block" /></CardContent></Card>
        </div>
    );
  }

  if (!history || history.academic_years.length === 0) {
    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center"><CalendarDays className="mr-3 h-7 w-7 text-primary"/> My CoTBE Academic History</CardTitle>
                    <CardDescription>An official view of your academic performance and transcript.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No academic history found.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center"><CalendarDays className="mr-3 h-7 w-7 text-primary"/> My CoTBE Academic History</CardTitle>
          <CardDescription>An official view of your academic performance and transcript.</CardDescription>
        </CardHeader>
      </Card>

      <Accordion 
        type="multiple" 
        className="w-full space-y-3" 
        defaultValue={history.academic_years.map(ay => ay.year)}
      >
        {history.academic_years.map((academicYear) => (
          <AccordionItem value={academicYear.year} key={academicYear.year} className="border rounded-lg shadow-md overflow-hidden">
            <AccordionTrigger 
              className={cn(
                "px-4 py-3 rounded-t-md font-semibold text-lg data-[state=open]:rounded-b-none",
                "bg-primary/20 text-primary-foreground hover:bg-primary/30 data-[state=open]:bg-primary/30"
              )}
            >
              {academicYear.year}
            </AccordionTrigger>
            <AccordionContent className="pt-0">
                <div className="bg-background p-1">
                    <Accordion 
                        type="multiple" 
                        className="w-full space-y-1"
                        defaultValue={academicYear.semesters.map(sem => academicYear.year + '-' + sem.name)}
                    >
                        {academicYear.semesters.map((semester) => (
                        <AccordionItem value={academicYear.year + '-' + semester.name} key={semester.name} className="mb-1 border rounded-md shadow-sm">
                            <AccordionTrigger className="bg-muted/50 px-4 py-3 hover:bg-muted font-medium text-sm">
                            {semester.name}
                            </AccordionTrigger>
                            <AccordionContent className="pt-0">
                                <div className="border-t p-3">
                                    {renderSemesterCoursesTable(semester.courses)}
                                    <p className="text-right font-semibold mt-2">Semester GPA: {semester.semesterGPA.toFixed(2)}</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                    {academicYear.annualGPA && (
                        <p className="text-right font-bold mt-2 pr-2 text-md">Annual GPA: {academicYear.annualGPA.toFixed(2)}</p>
                    )}
                </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Card>
        <CardContent className="pt-6 text-right">
          <p className="text-xl font-bold font-headline">
            Cumulative GPA (CGPA): {history.cumulativeGPA.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Brain className="mr-2 h-5 w-5 text-primary" /> AI Academic Progress Insights</CardTitle>
          <CardDescription>Get AI-powered suggestions based on your academic performance. Review carefully.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGetAiInsights} disabled={isAiLoading} className="mb-4">
            {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
            Get AI Insights
          </Button>
          {isAiLoading && <div className="p-4 border rounded-md"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /> <p className="text-center text-muted-foreground mt-2">Generating insights...</p></div>}
          {aiInsights && (
            <div className="p-4 border rounded-md bg-background shadow">
                <div className="p-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 mb-4 text-sm">
                    <AlertTriangle className="inline mr-2 h-4 w-4" />
                    These insights are AI-generated and for informational purposes only. Always consult with an academic advisor for official guidance.
                </div>
                <h3 className="font-semibold mb-2 text-lg">CoTBE AI Analysis:</h3>
                <p className="text-sm whitespace-pre-wrap text-foreground/80">{aiInsights}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

