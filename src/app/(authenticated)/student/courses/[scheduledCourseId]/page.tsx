
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchItems } from '@/lib/api'; // Using generic fetchItems
import { askGeminiAboutCourse } from '@/ai/flows/ask-gemini-about-course';
import { useToast } from '@/hooks/use-toast';
import { Book, ClipboardList, Brain, Download, LinkIcon, Loader2, Send, User, Bot, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import useAppStore from '@/stores/appStore';

interface CourseMaterial {
  id: string;
  title: string;
  description: string;
  material_type: 'File' | 'Link';
  file_path: string | null;
  url: string | null;
}

interface Assessment { // This is the structure of items from /api/assessments
  id: string;
  scheduled_course_id: string;
  name: string;
  description: string;
  max_score: number;
  due_date: string;
  type: string;
}

interface StudentAssessmentEntry { // This is from /api/studentAssessments
    student_assessment_id?: string;
    registration_id: string;
    assessment_id: string;
    score: number | null;
    feedback: string | null;
    submission_timestamp?: string;
    graded_at?: string;
}

interface DisplayableAssessment extends Assessment {
    student_score: number | null;
    student_feedback: string | null;
}


interface CourseDetails { // Assuming a structure for course details from GET /api/scheduledCourses/[id]
  scheduled_course_id: string; // Renamed from 'id' for clarity
  course_code: string;
  title: string;
  description: string;
  // other fields...
}

interface AiMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

interface StudentRegistration {
    registration_id: string;
    student_id: string | number;
    scheduled_course_id: string | number;
    // ... other registration fields if needed
}

export default function StudentCourseViewPage() {
  const params = useParams();
  const scheduledCourseId = params.scheduledCourseId as string;
  const user = useAppStore(state => state.user);
  const { toast } = useToast();

  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [displayableAssessments, setDisplayableAssessments] = useState<DisplayableAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [aiQuestion, setAiQuestion] = useState('');
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedMaterialContext, setSelectedMaterialContext] = useState('');


  useEffect(() => {
    async function loadData() {
      if (!scheduledCourseId || !user?.user_id) {
        setIsLoading(false); // Stop loading if essential IDs are missing
        return;
      }
      setIsLoading(true);
      try {
        // Fetch course details
        const courseData = await fetchItems('scheduledCourses', scheduledCourseId) as CourseDetails;
        if (courseData) {
          setCourseDetails(courseData);
        } else {
           toast({title: "Error", description: "Course details not found.", variant: "destructive"});
        }

        // Fetch materials
        const materialsData = await fetchItems(`courseMaterials?scheduledCourseId=${scheduledCourseId}`) as CourseMaterial[];
        setMaterials(materialsData);

        // Fetch all assessments for the course
        const courseAssessmentsData = await fetchItems(`assessments?scheduledCourseId=${scheduledCourseId}`) as Assessment[];

        // Fetch student's registrations to find the relevant registration_id
        const studentRegistrations = await fetchItems(`registrations?studentId=${user.user_id}`) as StudentRegistration[];
        const currentRegistration = studentRegistrations.find(reg => String(reg.scheduled_course_id) === String(scheduledCourseId));

        let studentScoresData: StudentAssessmentEntry[] = [];
        if (currentRegistration) {
            studentScoresData = await fetchItems(`studentAssessments?registrationId=${currentRegistration.registration_id}`) as StudentAssessmentEntry[];
        }

        // Combine assessments with student's scores
        const combinedAssessments = courseAssessmentsData.map(assessment => {
            const studentEntry = studentScoresData.find(entry => entry.assessment_id === assessment.id);
            return {
                ...assessment,
                student_score: studentEntry?.score ?? null,
                student_feedback: studentEntry?.feedback ?? null,
            };
        });
        setDisplayableAssessments(combinedAssessments);

      } catch (error) {
        console.error("Error loading course data:", error);
        toast({ title: "Error", description: "Failed to load course data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [scheduledCourseId, user, toast]);

  const handleAiSubmit = async () => {
    if (!aiQuestion.trim()) return;
    const userMessage: AiMessage = { id: Date.now().toString(), text: aiQuestion, sender: 'user' };
    setAiMessages(prev => [...prev, userMessage]);
    setAiQuestion('');
    setIsAiLoading(true);

    try {
      const context = selectedMaterialContext || "General course information for " + (courseDetails?.title || "this course") + ". " + (courseDetails?.description || "");
      const response = await askGeminiAboutCourse({ questionText: userMessage.text, courseMaterialContextText: context });
      const botMessage: AiMessage = { id: (Date.now() + 1).toString(), text: response.answer, sender: 'bot' };
      setAiMessages(prev => [...prev, botMessage]);
    } catch (error) {
      toast({ title: "AI Error", description: "Could not get response from AI assistant.", variant: "destructive" });
      const errorMessage: AiMessage = { id: (Date.now() + 1).toString(), text: "Sorry, I couldn't process that.", sender: 'bot' };
      setAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const selectMaterialForAiContext = (material: CourseMaterial) => {
    setSelectedMaterialContext(`Regarding the material titled "${material.title}": ${material.description}`);
    toast({title: "Context Set", description: `AI context set to material: ${material.title}`});
  }

  if (isLoading) {
    return (
        <div className="space-y-4 p-4">
            <Skeleton className="h-12 w-3/4 md:w-1/2" />
            <Skeleton className="h-8 w-1/2 md:w-1/3 mb-4" />
            <div className="grid grid-cols-3 gap-2 border-b pb-2 mb-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }
  
  if (!courseDetails) {
    return <p className="p-4 text-destructive">Course details could not be loaded. You might not be enrolled or the course does not exist.</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{courseDetails.course_code} - {courseDetails.title}</CardTitle>
          <CardDescription>{courseDetails.description}</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="materials">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="materials"><Book className="mr-2 h-4 w-4" />Course Materials</TabsTrigger>
          <TabsTrigger value="assessments"><ClipboardList className="mr-2 h-4 w-4" />Assessments & Grades</TabsTrigger>
          <TabsTrigger value="ai-helper"><Brain className="mr-2 h-4 w-4" />CoTBE AI Study Helper</TabsTrigger>
        </TabsList>

        <TabsContent value="materials">
          <Card>
            <CardHeader><CardTitle className="font-headline">Materials</CardTitle></CardHeader>
            <CardContent>
              {materials.length > 0 ? (
                <ul className="space-y-3">
                  {materials.map(material => (
                    <li key={material.id} className="p-3 border rounded-md shadow-sm flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{material.title}</h3>
                        <p className="text-sm text-muted-foreground">{material.description}</p>
                      </div>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => selectMaterialForAiContext(material)}>Set AI Context</Button>
                        {material.material_type === 'File' && material.file_path && (
                          <Button size="sm" asChild><a href={material.file_path} target="_blank" rel="noopener noreferrer"><Download className="mr-1 h-4 w-4"/>Download</a></Button>
                        )}
                        {material.material_type === 'Link' && material.url && (
                          <Button size="sm" asChild><a href={material.url} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-1 h-4 w-4"/>Open Link</a></Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p>No materials uploaded for this course yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments">
          <Card>
            <CardHeader><CardTitle className="font-headline">Assessments</CardTitle></CardHeader>
            <CardContent>
              {displayableAssessments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-center">Max Score</TableHead>
                      <TableHead className="text-center">Your Score</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayableAssessments.map(asm => (
                      <TableRow key={asm.id}>
                        <TableCell>{asm.name}</TableCell>
                        <TableCell className="text-center">{asm.max_score}</TableCell>
                        <TableCell className="text-center">{asm.student_score ?? <span className="italic text-muted-foreground">Not Graded</span>}</TableCell>
                        <TableCell>{asm.student_feedback ?? <span className="italic text-muted-foreground">No Feedback</span>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <p>No assessments available for this course yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-helper">
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">AI Study Helper</CardTitle>
                <CardDescription>Ask questions about selected course material or general concepts. Results are AI-generated and should be verified.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-[500px]">
              <div className="p-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 mb-4 text-sm">
                  <AlertTriangle className="inline mr-2 h-4 w-4" />
                  AI responses are for assistance only. Always verify critical information with your instructor or official course materials.
              </div>
              <ScrollArea className="flex-grow mb-4 pr-4">
                <div className="space-y-4">
                  {aiMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.sender === 'bot' && <Bot className="mr-2 h-6 w-6 text-primary flex-shrink-0" />}
                      <div className={`max-w-[75%] p-3 rounded-lg shadow ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      </div>
                       {msg.sender === 'user' && <User className="ml-2 h-6 w-6 text-muted-foreground flex-shrink-0" />}
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex justify-start"> <Bot className="mr-2 h-6 w-6 text-primary flex-shrink-0" /> <div className="p-3 rounded-lg shadow bg-muted"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div></div>
                  )}
                </div>
              </ScrollArea>
              <div className="mt-auto flex items-center space-x-2 pt-4 border-t">
                <Textarea value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} placeholder="Ask about the selected material..." className="flex-grow" rows={2} />
                <Button onClick={handleAiSubmit} disabled={isAiLoading || !aiQuestion.trim()}>
                    {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />} Send
                </Button>
              </div>
               {selectedMaterialContext && <p className="text-xs text-muted-foreground mt-2">Context: Based on material "{selectedMaterialContext.substring(selectedMaterialContext.indexOf('"')+1, selectedMaterialContext.lastIndexOf('"'))}"</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

