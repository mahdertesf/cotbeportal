'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import useAppStore from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { fetchTeacherAssignedCourses, fetchStudentRoster, createCourseMaterial, fetchStudentCourseMaterials as fetchMaterials, fetchItems as fetchAssessmentsForCourse, createItem as createAssessment, updateItem as updateAssessment, deleteItem as deleteAssessment } from '@/lib/api'; // Mock API
import { getGeminiAssessmentIdeas, getGeminiFeedbackSuggestions } from '@/ai/flows';
import { Users, BookOpen, ClipboardEdit, Percent, CheckSquare, Loader2, PlusCircle, Edit, Trash2, Upload, LinkIcon, Brain, Send, Bot, User, FileText, AlertTriangle, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Types (can be moved to a types file)
interface Student { student_id: string; first_name: string; last_name: string; email: string; }
interface CourseMaterial { id: string; title: string; description: string; material_type: 'File' | 'Link'; file_path?: string | null; url?: string | null; }
interface Assessment { id: string; name: string; description: string; max_score: number; due_date: string; type: string; }
interface StudentAssessmentEntry { student_id: string; assessment_id: string; score: number | null; feedback: string | null; }
interface ScheduledCourseDetails { scheduled_course_id: string; course_code: string; title: string; section: string;}

// CourseMaterialsCRUD Component
const CourseMaterialsCRUD = ({ scheduledCourseId }: { scheduledCourseId: string }) => {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState<Partial<CourseMaterial>>({ title: '', description: '', material_type: 'File' });
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadMaterials = async () => {
      setIsLoading(true);
      try {
        const data = await fetchMaterials(scheduledCourseId); // Using student's fetch as placeholder
        setMaterials(data);
      } catch (e) { toast({ title: "Error loading materials", variant: "destructive"}); }
      setIsLoading(false);
    }
    loadMaterials();
  }, [scheduledCourseId, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleSubmitMaterial = async () => {
    // Placeholder: In a real app, upload file if material_type is 'File'
    // Then call createCourseMaterial with material data (including file_path or url)
    try {
      const created = await createCourseMaterial(scheduledCourseId, {...newMaterial, id: Date.now().toString()}); // Mock ID
      setMaterials(prev => [...prev, created.data as CourseMaterial]);
      setShowForm(false);
      setNewMaterial({ title: '', description: '', material_type: 'File' });
      setFile(null);
      toast({title: "Material added"});
    } catch(e) {
      toast({title: "Error adding material", variant: "destructive"});
    }
  };

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowForm(!showForm)}><PlusCircle className="mr-2 h-4 w-4"/>Add Material</Button>
      {showForm && (
        <Card className="p-4 space-y-3">
          <Input placeholder="Title" value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} />
          <Textarea placeholder="Description" value={newMaterial.description} onChange={e => setNewMaterial({...newMaterial, description: e.target.value})} />
          <select value={newMaterial.material_type} onChange={e => setNewMaterial({...newMaterial, material_type: e.target.value as 'File' | 'Link'})} className="border p-2 rounded w-full">
            <option value="File">File</option>
            <option value="Link">Link</option>
          </select>
          {newMaterial.material_type === 'File' ? <Input type="file" onChange={handleFileChange} /> : <Input placeholder="URL" value={newMaterial.url || ''} onChange={e => setNewMaterial({...newMaterial, url: e.target.value})} />}
          <Button onClick={handleSubmitMaterial}>Save Material</Button>
        </Card>
      )}
      <ul className="space-y-2">
        {materials.map(m => (
          <li key={m.id} className="p-3 border rounded flex justify-between items-center">
            <span>{m.title} ({m.material_type})</span>
            <div className="space-x-1">
              <Button variant="ghost" size="sm"><Edit className="h-4 w-4"/></Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// AssessmentsCRUD Component (Simplified)
const AssessmentsCRUD = ({ scheduledCourseId }: { scheduledCourseId: string }) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<Partial<Assessment>>({});
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiIdeas, setAiIdeas] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Fetch assessments for this course
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAssessmentsForCourse(`assessments?courseId=${scheduledCourseId}`);
        setAssessments(data as Assessment[]);
      } catch(e) { toast({title: "Error loading assessments", variant: "destructive"});}
      setIsLoading(false);
    }
    loadData();
  }, [scheduledCourseId, toast]);
  
  const handleSaveAssessment = async () => {
    // Save or update assessment
    try {
      if(currentAssessment.id) {
        await updateAssessment('assessments', currentAssessment.id, currentAssessment);
      } else {
        await createAssessment('assessments', {...currentAssessment, id: Date.now().toString(), scheduledCourseId }); // Mock ID
      }
      // Refresh list
      const data = await fetchAssessmentsForCourse(`assessments?courseId=${scheduledCourseId}`);
      setAssessments(data as Assessment[]);
      setShowForm(false);
      setCurrentAssessment({});
      toast({title: "Assessment saved"});
    } catch(e) { toast({title: "Error saving assessment", variant: "destructive"});}
  };
  
  const handleGetAiAssessmentIdeas = async () => {
    if (!aiTopic) { toast({title: "Topic required for AI Ideas", variant: "destructive"}); return; }
    setIsAiLoading(true);
    try {
      const ideas = await getGeminiAssessmentIdeas({ inputText: aiTopic, courseContext: `Course ID: ${scheduledCourseId}` });
      setAiIdeas(ideas.assessmentIdeas);
    } catch (e) { toast({title: "AI Error", description: "Could not get AI ideas.", variant: "destructive"}); }
    setIsAiLoading(false);
  };

  if (isLoading) return <Skeleton className="h-60 w-full" />;

  return (
    <div className="space-y-4">
      <Button onClick={() => { setShowForm(true); setCurrentAssessment({}); setAiIdeas(''); setAiTopic(''); }}><PlusCircle className="mr-2 h-4 w-4"/>Create Assessment</Button>
      {showForm && (
        <Card className="p-4 space-y-3">
          <Input placeholder="Name" value={currentAssessment.name || ''} onChange={e => setCurrentAssessment({...currentAssessment, name: e.target.value})} />
          <Textarea placeholder="Description" value={currentAssessment.description || ''} onChange={e => setCurrentAssessment({...currentAssessment, description: e.target.value})} />
          <Input type="number" placeholder="Max Score" value={currentAssessment.max_score || ''} onChange={e => setCurrentAssessment({...currentAssessment, max_score: parseInt(e.target.value)})} />
          <Input type="date" placeholder="Due Date" value={currentAssessment.due_date || ''} onChange={e => setCurrentAssessment({...currentAssessment, due_date: e.target.value})} />
          <Input placeholder="Type (e.g., Quiz, Exam)" value={currentAssessment.type || ''} onChange={e => setCurrentAssessment({...currentAssessment, type: e.target.value})} />
          <Button onClick={handleSaveAssessment}>Save Assessment</Button>
          
          <Card className="mt-4 p-3">
            <Label>AI Assessment Idea Generator</Label>
            <Input placeholder="Enter topic/learning objective" className="my-2" value={aiTopic} onChange={e => setAiTopic(e.target.value)} />
            <Button onClick={handleGetAiAssessmentIdeas} disabled={isAiLoading}>
                {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Brain className="mr-2 h-4 w-4"/>} Get Ideas
            </Button>
            {aiIdeas && <Textarea value={aiIdeas} readOnly rows={5} className="mt-2 bg-muted" />}
             {aiIdeas && <p className="text-xs text-muted-foreground mt-1">AI suggestions. Review and adapt carefully.</p>}
          </Card>
        </Card>
      )}
      <ul className="space-y-2">
        {assessments.map(a => (
          <li key={a.id} className="p-3 border rounded flex justify-between items-center">
            <span>{a.name} (Max: {a.max_score}) - Due: {new Date(a.due_date).toLocaleDateString()}</span>
            <div className="space-x-1">
              <Button variant="ghost" size="sm" onClick={() => { setCurrentAssessment(a); setShowForm(true); }}><Edit className="h-4 w-4"/></Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Gradebook Component (Simplified)
const Gradebook = ({ scheduledCourseId, students }: { scheduledCourseId: string, students: Student[] }) => {
  // State for grades, assessments for the course
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [grades, setGrades] = useState<Record<string, Record<string, StudentAssessmentEntry>>>({}); // { studentId: { assessmentId: gradeData }}
  const [isLoading, setIsLoading] = useState(true);
  const [currentSubmissionText, setCurrentSubmissionText] = useState(''); // For AI Feedback
  const [aiFeedback, setAiFeedback] = useState('');
  const [isAiFeedbackLoading, setIsAiFeedbackLoading] = useState(false);
  const {toast} = useToast();

  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        try {
            const assessmentData = await fetchAssessmentsForCourse(`assessments?courseId=${scheduledCourseId}`);
            setAssessments(assessmentData as Assessment[]);
            // TODO: Fetch existing grades for all students and assessments. Initialize `grades` state.
        } catch (e) { toast({title: "Error loading gradebook data", variant: "destructive"});}
        setIsLoading(false);
    }
    loadData();
  }, [scheduledCourseId, toast]);

  const handleGradeChange = (studentId: string, assessmentId: string, field: 'score' | 'feedback', value: string | number) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [assessmentId]: {
          ...(prev[studentId]?.[assessmentId] || { student_id: studentId, assessment_id: assessmentId, score: null, feedback: null }),
          [field]: field === 'score' ? (value === '' ? null : Number(value)) : value,
        }
      }
    }));
  };
  
  const handleGetAiFeedback = async (assessmentCriteria: string) => {
    if(!currentSubmissionText) { toast({title: "Submission text needed for AI feedback", variant: "destructive"}); return; }
    setIsAiFeedbackLoading(true);
    try {
      const feedbackSuggestions = await getGeminiFeedbackSuggestions({ submissionText: currentSubmissionText, assessmentCriteria });
      setAiFeedback(feedbackSuggestions.feedbackSuggestions);
    } catch(e) { toast({title: "AI Feedback Error", variant: "destructive"});}
    setIsAiFeedbackLoading(false);
  };

  if(isLoading) return <Skeleton className="h-80 w-full" />;

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            {assessments.map(a => <TableHead key={a.id}>{a.name} (/{a.max_score})</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map(s => (
            <TableRow key={s.student_id}>
              <TableCell>{s.first_name} {s.last_name}</TableCell>
              {assessments.map(a => (
                <TableCell key={a.id}>
                  <Input 
                    type="number" 
                    placeholder="Score" 
                    className="mb-1 w-20"
                    value={grades[s.student_id]?.[a.id]?.score ?? ''}
                    onChange={e => handleGradeChange(s.student_id, a.id, 'score', e.target.value)}
                    max={a.max_score}
                  />
                  {/* Placeholder for feedback input/modal */}
                  <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm"><FileText className="mr-1 h-3 w-3"/> Feedback</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Feedback for {s.first_name} on {a.name}</DialogTitle>
                        </DialogHeader>
                        <Textarea 
                            placeholder="Student's submission text (paste here for AI)" 
                            rows={5} 
                            className="my-2"
                            value={currentSubmissionText}
                            onChange={e => setCurrentSubmissionText(e.target.value)}
                        />
                         <Button onClick={() => handleGetAiFeedback(a.description)} disabled={isAiFeedbackLoading}>
                            {isAiFeedbackLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Brain className="mr-2 h-4 w-4"/>} Get AI Feedback Suggestions
                        </Button>
                        {aiFeedback && <Textarea value={aiFeedback} rows={5} className="mt-2 bg-muted" onChange={e => setAiFeedback(e.target.value)}/>}
                         {aiFeedback && <p className="text-xs text-muted-foreground mt-1">AI suggestions. Review and adapt carefully.</p>}
                        <Textarea 
                            placeholder="Enter feedback..." 
                            rows={5} 
                            className="mt-2"
                            value={grades[s.student_id]?.[a.id]?.feedback ?? aiFeedback} // Pre-fill with AI feedback if available
                            onChange={e => {
                                handleGradeChange(s.student_id, a.id, 'feedback', e.target.value);
                                if(aiFeedback) setAiFeedback(''); // Clear AI feedback if manually typing
                            }}
                         />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" onClick={() => {setCurrentSubmissionText(''); setAiFeedback('');}}>Save & Close</Button></DialogClose>
                        </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button>Save All Grades</Button>
    </div>
  );
};


export default function TeacherCourseManagementPage() {
  const params = useParams();
  const scheduledCourseId = params.scheduledCourseId as string;
  const { toast } = useToast();
  const [courseDetails, setCourseDetails] = useState<ScheduledCourseDetails | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (scheduledCourseId) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          // Fetch course details (using fetchTeacherAssignedCourses and finding by ID as placeholder)
          const courses = await fetchTeacherAssignedCourses("teacherId_placeholder"); // Replace with actual teacher ID
          const currentCourse = courses.find(c => c.scheduled_course_id === scheduledCourseId);
          if (currentCourse) {
            setCourseDetails(currentCourse);
          } else {
            toast({title: "Error", description: "Course not found.", variant: "destructive"});
          }
          const roster = await fetchStudentRoster(scheduledCourseId);
          setStudents(roster);
        } catch (error) {
          toast({ title: "Error", description: "Failed to load course management data.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }
  }, [scheduledCourseId, toast]);

  if (isLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-8 w-1/3" />
            <div className="grid grid-cols-5 gap-2"> {/* 5 tabs */}
                <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }
  if (!courseDetails) return <p>Course details not found.</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Manage Course: {courseDetails.course_code} - {courseDetails.title} (Section {courseDetails.section})</CardTitle>
          <CardDescription>Oversee students, materials, assessments, and grades for this course.</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="roster">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="roster"><Users className="mr-2 h-4 w-4"/>Student Roster</TabsTrigger>
          <TabsTrigger value="materials"><BookOpen className="mr-2 h-4 w-4"/>Course Materials</TabsTrigger>
          <TabsTrigger value="assessments"><ClipboardEdit className="mr-2 h-4 w-4"/>Assessments</TabsTrigger>
          <TabsTrigger value="gradebook"><Percent className="mr-2 h-4 w-4"/>Gradebook</TabsTrigger>
          <TabsTrigger value="final-grades"><CheckSquare className="mr-2 h-4 w-4"/>Final Grades</TabsTrigger>
        </TabsList>

        <TabsContent value="roster">
          <Card><CardHeader><CardTitle>Student Roster</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {students.map(s => <TableRow key={s.student_id}><TableCell>{s.first_name} {s.last_name}</TableCell><TableCell>{s.email}</TableCell><TableCell><Button size="sm" variant="outline"><Eye className="mr-1 h-3 w-3"/>View Progress</Button></TableCell></TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="materials"><CourseMaterialsCRUD scheduledCourseId={scheduledCourseId} /></TabsContent>
        <TabsContent value="assessments"><AssessmentsCRUD scheduledCourseId={scheduledCourseId} /></TabsContent>
        <TabsContent value="gradebook"><Gradebook scheduledCourseId={scheduledCourseId} students={students} /></TabsContent>
        <TabsContent value="final-grades">
          <Card><CardHeader><CardTitle>Final Grades Submission</CardTitle></CardHeader>
            <CardContent><p>Interface to enter/update final grades. (Placeholder)</p></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
