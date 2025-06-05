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
import { BarChart3, Brain, Loader2, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CourseRecord {
  course_code: string;
  title: string;
  credits: number;
  final_grade: string;
  grade_points: number;
}

interface SemesterRecord {
  name: string;
  courses: CourseRecord[];
  semesterGPA: number;
}

interface AcademicHistoryData {
  semesters: SemesterRecord[];
  cumulativeGPA: number;
}

export default function AcademicHistoryPage() {
  const user = useAppStore((state) => state.user);
  const { toast } = useToast();

  const [history, setHistory] = useState<AcademicHistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (user?.user_id) {
      const loadHistory = async () => {
        setIsLoading(true);
        try {
          const data = await fetchAcademicHistory(user.user_id);
          setHistory(data);
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
      const studentProgressSummary = history.semesters
        .flatMap(s => s.courses.map(c => `${c.course_code} (${c.title}): ${c.final_grade}`))
        .join('\n');
      // In a real app, studentAcademicInterests might come from profile or an input field
      const studentAcademicInterests = "Interested in software development and AI."; 

      const response = await getGeminiAcademicInsights({ studentProgressSummary, studentAcademicInterests });
      setAiInsights(response.insights);
    } catch (error) {
      toast({ title: "AI Error", description: "Could not generate academic insights.", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const renderSemesterSkeleton = () => (
    <AccordionItem value="skeleton_semester">
        <AccordionTrigger><Skeleton className="h-6 w-1/3" /></AccordionTrigger>
        <AccordionContent>
            <Table>
                <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Title</TableHead><TableHead>Credits</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
                <TableBody>
                    {Array.from({length: 2}).map((_, i) => (
                        <TableRow key={`skel_course_${i}`}>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <p className="text-right font-semibold mt-2"><Skeleton className="h-5 w-24 inline-block" /></p>
        </AccordionContent>
    </AccordionItem>
  );

  if (isLoading) {
    return (
        <div className="space-y-6">
            <Card><CardHeader><Skeleton className="h-8 w-1/2" /><Skeleton className="h-5 w-3/4 mt-2" /></CardHeader></Card>
            <Accordion type="multiple" className="w-full space-y-2">
                {renderSemesterSkeleton()}
                {renderSemesterSkeleton()}
            </Accordion>
            <Card><CardContent className="pt-6 text-right"><Skeleton className="h-6 w-1/4 inline-block" /></CardContent></Card>
        </div>
    );
  }

  if (!history) {
    return <p>No academic history found.</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">My CoTBE Academic History</CardTitle>
          <CardDescription>An unofficial view of your academic performance and transcript.</CardDescription>
        </CardHeader>
      </Card>

      <Accordion type="multiple" className="w-full space-y-2" defaultValue={history.semesters.map(s => s.name)}>
        {history.semesters.map((semester) => (
          <AccordionItem value={semester.name} key={semester.name}>
            <AccordionTrigger className="bg-muted/50 px-4 py-3 rounded-md hover:bg-muted font-semibold">
              {semester.name}
            </AccordionTrigger>
            <AccordionContent className="pt-0">
              <div className="border rounded-b-md p-4">
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
                    {semester.courses.map((course) => (
                      <TableRow key={course.course_code}>
                        <TableCell>{course.course_code}</TableCell>
                        <TableCell>{course.title}</TableCell>
                        <TableCell className="text-center">{course.credits}</TableCell>
                        <TableCell className="text-center">{course.final_grade}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-right font-semibold mt-2">Semester GPA: {semester.semesterGPA.toFixed(2)}</p>
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
