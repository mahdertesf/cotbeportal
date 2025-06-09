
'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { 
  fetchItems,
  createItem, 
  updateItem, 
  deleteItem,
  fetchStudentRoster,
  saveStudentAssessmentEntry, // Specific function for saving student assessment entries
} from '@/lib/api'; 
import { getGeminiAssessmentIdeas, getGeminiFeedbackSuggestions } from '@/ai/flows';
import { Users, BookOpen, ClipboardEdit, Percent, CheckSquare, Loader2, PlusCircle, Edit, Trash2, Upload, LinkIcon, Brain, Send, Bot, User, FileText, AlertTriangle, Eye, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

// Types
interface Student { student_id: string; first_name: string; last_name: string; email: string; }
interface CourseMaterial { id: string; title: string; description?: string | null; material_type: 'File' | 'Link'; file_path?: string | null; url?: string | null; scheduled_course_id?: string;}
interface Assessment { id: string; name: string; description?: string | null; max_score: number; due_date: string; type: string; scheduledCourseId?: string; }
interface StudentAssessmentEntry { student_assessment_id?: string; student_id: string; assessment_id: string; registration_id: string; score: number | null; feedback: string | null; }
interface ScheduledCourseDetails { 
    scheduled_course_id: string; 
    course_code?: string; 
    title?: string; 
    section?: string;
    teacher_name?: string;
    semester_name?: string;
    room_display_name?: string;
    schedule?: string;
}
interface StudentRegistration { registration_id: string, student_id: string, first_name: string, last_name: string, email: string, final_grade: string | null, grade_points: number | null }


interface StudentFinalGradeEntry {
  registration_id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  status: 'Calculated' | 'PendingGrading' | 'Error' | 'NoAssessments';
  calculated_numeric_score: number | null;
  calculated_letter_grade: string | null;
  calculated_grade_points: number | null;
  original_letter_grade: string | null; 
  original_grade_points: number | null;
  has_changed: boolean;
}

// CourseMaterialsCRUD Component
const CourseMaterialsCRUD = ({ scheduledCourseId }: { scheduledCourseId: string }) => {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState<Partial<CourseMaterial>>({ title: '', description: '', material_type: 'File' });
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const loadMaterials = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchItems(`courseMaterials?scheduledCourseId=${scheduledCourseId}`); 
      if (response.success && Array.isArray(response.data)) {
        setMaterials(response.data as CourseMaterial[]);
      } else {
        setMaterials([]);
        toast({ title: "Error loading materials", description: response.error || response.message || "Could not fetch materials.", variant: "destructive"});
      }
    } catch (e: any) { 
      toast({ title: "Error loading materials", description: e.message || "An unexpected error occurred.", variant: "destructive"}); 
      setMaterials([]);
    }
    setIsLoading(false);
  }, [scheduledCourseId, toast]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleSubmitMaterial = async () => {
    try {
      const materialPayload: Partial<CourseMaterial> = {
        ...newMaterial,
        scheduled_course_id: scheduledCourseId,
      };
      if (newMaterial.material_type === 'File' && file) {
        materialPayload.file_path = `/uploads/mock/${file.name}`; // Mock path for demo
      } else if (newMaterial.material_type === 'Link' && newMaterial.url) {
         materialPayload.url = newMaterial.url;
      }


      const createdResponse = await createItem('courseMaterials', materialPayload); 
      if (createdResponse.success && createdResponse.data) {
        setMaterials(prev => [...prev, createdResponse.data as CourseMaterial]);
        setShowForm(false);
        setNewMaterial({ title: '', description: '', material_type: 'File' });
        setFile(null);
        toast({title: "Material added"});
      } else {
        toast({title: "Error adding material", description: createdResponse.error || "Could not save material.", variant: "destructive"});
      }
    } catch(e: any) {
      toast({title: "Error adding material", description: e.message || "An unexpected error occurred.", variant: "destructive"});
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    try {
        const response = await deleteItem('courseMaterials', materialId);
        if (response.success) {
            setMaterials(prev => prev.filter(m => m.id !== materialId));
            toast({ title: "Material Deleted" });
        } else {
            toast({ title: "Error", description: response.error || "Failed to delete material.", variant: "destructive" });
        }
    } catch (error: any) {
        toast({ title: "Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };


  if (isLoading) return <Skeleton className="h-40 w-full" />;

  return (
    <Card>
      <CardHeader><CardTitle>Course Materials</CardTitle></CardHeader>
      <CardContent className="space-y-4">
      <Button onClick={() => setShowForm(!showForm)}><PlusCircle className="mr-2 h-4 w-4"/>Add Material</Button>
      {showForm && (
        <Card className="p-4 space-y-3">
          <Input placeholder="Title" value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} />
          <Textarea placeholder="Description" value={newMaterial.description || ''} onChange={e => setNewMaterial({...newMaterial, description: e.target.value})} />
          <select value={newMaterial.material_type} onChange={e => setNewMaterial({...newMaterial, material_type: e.target.value as 'File' | 'Link'})} className="border p-2 rounded w-full bg-background text-foreground">
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
            <div>
                <p className="font-semibold">{m.title} ({m.material_type})</p>
                <p className="text-xs text-muted-foreground">{m.description}</p>
            </div>
            <div className="space-x-1">
              {/* Edit functionality can be added here, similar to Add */}
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteMaterial(m.id)}><Trash2 className="h-4 w-4"/></Button>
            </div>
          </li>
        ))}
        {materials.length === 0 && <p className="text-muted-foreground">No materials added yet.</p>}
      </ul>
      </CardContent>
    </Card>
  );
};

// AssessmentsCRUD Component
const AssessmentsCRUD = ({ scheduledCourseId }: { scheduledCourseId: string }) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<Partial<Assessment>>({name: '', description: '', max_score: 100, due_date: '', type: ''});
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiIdeas, setAiIdeas] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const { toast } = useToast();

  const loadData = useCallback(async () => {
      setIsLoading(true);
      try {
        const response = await fetchItems(`assessments?scheduledCourseId=${scheduledCourseId}`);
        if (response.success && Array.isArray(response.data)) {
            setAssessments(response.data as Assessment[]);
        } else {
            setAssessments([]);
            toast({title: "Error loading assessments", description: response.error || response.message || "Could not fetch assessments.", variant: "destructive"});
        }
      } catch(e: any) { 
          toast({title: "Error loading assessments", description: e.message || "An unexpected error occurred.", variant: "destructive"});
          setAssessments([]);
      }
      setIsLoading(false);
    }, [scheduledCourseId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const handleSaveAssessment = async () => {
    try {
      const payload: Partial<Assessment> = {...currentAssessment, scheduledCourseId: scheduledCourseId}; // Ensure scheduledCourseId is sent as scheduledCourseId
      let response;
      if(currentAssessment.id) {
        response = await updateItem('assessments', currentAssessment.id, payload);
      } else {
        response = await createItem('assessments', payload); 
      }
      if (response.success) {
        loadData(); 
        setShowForm(false);
        setCurrentAssessment({name: '', description: '', max_score: 100, due_date: '', type: ''});
        toast({title: "Assessment saved"});
      } else {
        toast({title: "Error saving assessment", description: response.error || "Could not save assessment.", variant: "destructive"});
      }
    } catch(e:any) { toast({title: "Error saving assessment", description: e.message || "An unexpected error occurred.", variant: "destructive"});}
  };
  
  const handleGetAiAssessmentIdeas = async () => {
    if (!aiTopic) { toast({title: "Topic required for AI Ideas", variant: "destructive"}); return; }
    setIsAiLoading(true);
    try {
      const ideas = await getGeminiAssessmentIdeas({ inputText: aiTopic, courseContext: `Course ID: ${scheduledCourseId}` });
      setAiIdeas(ideas.assessmentIdeas);
    } catch (e: any) { toast({title: "AI Error", description: e.message || "Could not get AI ideas.", variant: "destructive"}); }
    setIsAiLoading(false);
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    try {
        const response = await deleteItem('assessments', assessmentId);
        if (response.success) {
            loadData();
            toast({ title: "Assessment Deleted" });
        } else {
            toast({ title: "Error", description: response.error || "Failed to delete assessment.", variant: "destructive" });
        }
    } catch (error: any) {
        toast({ title: "Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };


  if (isLoading) return <Skeleton className="h-60 w-full" />;

  return (
    <Card>
        <CardHeader><CardTitle>Assessments</CardTitle></CardHeader>
        <CardContent className="space-y-4">
      <Button onClick={() => { setShowForm(true); setCurrentAssessment({name: '', description: '', max_score: 100, due_date: '', type: ''}); setAiIdeas(''); setAiTopic(''); }}><PlusCircle className="mr-2 h-4 w-4"/>Create Assessment</Button>
      {showForm && (
        <Card className="p-4 space-y-3">
          <Input placeholder="Name" value={currentAssessment.name || ''} onChange={e => setCurrentAssessment({...currentAssessment, name: e.target.value})} />
          <Textarea placeholder="Description" value={currentAssessment.description || ''} onChange={e => setCurrentAssessment({...currentAssessment, description: e.target.value})} />
          <Input type="number" placeholder="Max Score" value={currentAssessment.max_score || ''} onChange={e => setCurrentAssessment({...currentAssessment, max_score: parseInt(e.target.value)})} />
          <Input type="datetime-local" placeholder="Due Date" value={currentAssessment.due_date || ''} onChange={e => setCurrentAssessment({...currentAssessment, due_date: e.target.value})} />
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
            <span>{a.name} (Max: {a.max_score}) - Due: {new Date(a.due_date).toLocaleString()}</span>
            <div className="space-x-1">
              <Button variant="ghost" size="sm" onClick={() => { setCurrentAssessment(a); setShowForm(true); }}><Edit className="h-4 w-4"/></Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteAssessment(a.id)}><Trash2 className="h-4 w-4"/></Button>
            </div>
          </li>
        ))}
         {assessments.length === 0 && <p className="text-muted-foreground">No assessments created yet.</p>}
      </ul>
      </CardContent>
    </Card>
  );
};

// Gradebook Component
const Gradebook = ({ scheduledCourseId, students }: { scheduledCourseId: string, students: Student[] }) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [grades, setGrades] = useState<Record<string, StudentAssessmentEntry>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentSubmissionText, setCurrentSubmissionText] = useState(''); 
  const [aiFeedback, setAiFeedback] = useState('');
  const [isAiFeedbackLoading, setIsAiFeedbackLoading] = useState(false);
  const [registrations, setRegistrations] = useState<Array<{registration_id: string, student_id: string}>>([]);
  const {toast} = useToast();

  const loadGradebookData = useCallback(async () => {
    setIsLoading(true);
    try {
        const asmResponse = await fetchItems(`assessments?scheduledCourseId=${scheduledCourseId}`);
        if (asmResponse.success && Array.isArray(asmResponse.data)) {
            setAssessments(asmResponse.data as Assessment[]);
        } else {
            setAssessments([]);
            toast({title: "Error", description: asmResponse.error || "Could not load assessments for gradebook.", variant: "destructive"});
        }

        const entriesResponse = await fetchItems(`studentAssessments?scheduledCourseId=${scheduledCourseId}`);
        const gradesMap: Record<string, StudentAssessmentEntry> = {};
        if (entriesResponse.success && Array.isArray(entriesResponse.data)) {
            (entriesResponse.data as StudentAssessmentEntry[]).forEach(entry => {
                gradesMap[`${entry.student_id}_${entry.assessment_id}`] = entry;
            });
        } // No toast here, empty gradesMap is fine if no entries exist yet
        setGrades(gradesMap);
        
        const regsResponse = await fetchItems(`registrations?scheduledCourseId=${scheduledCourseId}`);
        if (regsResponse && Array.isArray(regsResponse)) { // Assuming fetchItems for registrations returns array directly
            setRegistrations(regsResponse.map(r => ({ registration_id: r.registration_id, student_id: r.student_id })));
        } else {
            setRegistrations([]);
            toast({title: "Error", description: "Could not load student registrations for grading.", variant: "destructive"});
        }

    } catch (e: any) { 
        toast({title: "Error loading gradebook data", description: e.message, variant: "destructive"});
        setAssessments([]);
        setRegistrations([]);
    }
    setIsLoading(false);
  }, [scheduledCourseId, toast]);

  useEffect(() => {
    loadGradebookData();
  }, [loadGradebookData]);

  const handleGradeChange = (studentId: string, assessmentId: string, field: 'score' | 'feedback', value: string | number | null) => {
    const key = `${studentId}_${assessmentId}`;
    const reg = registrations.find(r => r.student_id === studentId);
    if (!reg) {
        toast({title: "Error", description: "Student registration not found for grading.", variant: "destructive"});
        return;
    }

    setGrades(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { student_id: studentId, assessment_id: assessmentId, registration_id: reg.registration_id, score: null, feedback: null }),
        [field]: field === 'score' ? (value === '' || value === null ? null : Number(value)) : value,
      }
    }));
  };
  
  const handleGetAiFeedback = async (assessmentCriteria: string | null | undefined) => {
    if(!currentSubmissionText) { toast({title: "Submission text needed for AI feedback", variant: "destructive"}); return; }
    setIsAiFeedbackLoading(true);
    try {
      const feedbackSuggestions = await getGeminiFeedbackSuggestions({ submissionText: currentSubmissionText, assessmentCriteria: assessmentCriteria || '' });
      setAiFeedback(feedbackSuggestions.feedbackSuggestions);
    } catch(e: any) { toast({title: "AI Feedback Error", description: e.message, variant: "destructive"});}
    setIsAiFeedbackLoading(false);
  };
  
  const handleSaveGrades = async () => {
    setIsLoading(true); 
    let successCount = 0;
    for (const key in grades) {
        const entry = grades[key];
        if (entry.registration_id) {
           try {
                // The saveStudentAssessmentEntry function now directly calls POST /api/studentAssessments
                const response = await saveStudentAssessmentEntry(entry); 
                if (response.success) {
                    successCount++;
                } else {
                    toast({title: "Error Saving Grade", description: response.error || `Could not save grade for student ID ${entry.student_id}, assessment ID ${entry.assessment_id}`, variant: "destructive"})
                }
           } catch (error: any) {
               toast({title: "Error Saving Grade", description: error.message || `Could not save grade for student ID ${entry.student_id}, assessment ID ${entry.assessment_id}`, variant: "destructive"})
           }
        }
    }
    if (successCount > 0) toast({ title: "Grades Saved", description: `${successCount} grade entries processed.`});
    setIsLoading(false);
    loadGradebookData(); 
  };


  if(isLoading && assessments.length === 0 && students.length === 0) return <Skeleton className="h-80 w-full" />;

  return (
    <Card>
        <CardHeader><CardTitle>Gradebook</CardTitle></CardHeader>
        <CardContent className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            {assessments.map(a => <TableHead key={a.id} className="text-center">{a.name} (/{a.max_score})</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map(s => (
            <TableRow key={s.student_id}>
              <TableCell>{s.first_name} {s.last_name}</TableCell>
              {assessments.map(a => {
                const gradeKey = `${s.student_id}_${a.id}`;
                const currentGradeEntry = grades[gradeKey];
                return (
                <TableCell key={a.id} className="text-center">
                  <Input 
                    type="number" 
                    placeholder="Score" 
                    className="mb-1 w-20 mx-auto"
                    value={currentGradeEntry?.score ?? ''}
                    onChange={e => handleGradeChange(s.student_id, a.id, 'score', e.target.value === '' ? null : e.target.value)}
                    max={a.max_score}
                  />
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
                            value={currentGradeEntry?.feedback ?? aiFeedback} 
                            onChange={e => {
                                handleGradeChange(s.student_id, a.id, 'feedback', e.target.value);
                                if(aiFeedback) setAiFeedback(''); 
                            }}
                         />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" onClick={() => {setCurrentSubmissionText(''); setAiFeedback('');}}>Save & Close</Button></DialogClose>
                        </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              )})}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={handleSaveGrades} disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
        Save All Grades & Feedback
        </Button>
      </CardContent>
    </Card>
  );
};

// Final Grades Submission Component
const getGradeDetailsFromScore = (scoreOutOf100: number | null): { letter_grade: string | null, grade_points: number | null } => {
  if (scoreOutOf100 === null || isNaN(scoreOutOf100) || scoreOutOf100 < 0 || scoreOutOf100 > 100) return { letter_grade: null, grade_points: null };
  const score = Math.round(scoreOutOf100);
  if (score >= 90) return { letter_grade: 'A', grade_points: 4.0 };
  if (score >= 85) return { letter_grade: 'A-', grade_points: 3.7 };
  if (score >= 80) return { letter_grade: 'B+', grade_points: 3.3 };
  if (score >= 75) return { letter_grade: 'B', grade_points: 3.0 };
  if (score >= 70) return { letter_grade: 'B-', grade_points: 2.7 };
  if (score >= 65) return { letter_grade: 'C+', grade_points: 2.3 };
  if (score >= 60) return { letter_grade: 'C', grade_points: 2.0 };
  if (score >= 55) return { letter_grade: 'C-', grade_points: 1.7 };
  if (score >= 50) return { letter_grade: 'D', grade_points: 1.0 };
  return { letter_grade: 'F', grade_points: 0.0 };
};

const FinalGradesSubmission = ({ scheduledCourseId }: { scheduledCourseId: string }) => {
  const [gradeEntries, setGradeEntries] = useState<StudentFinalGradeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const calculateAndSetGradeEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const asmResponse = await fetchItems(`assessments?scheduledCourseId=${scheduledCourseId}`);
      const courseAssessments: Assessment[] = (asmResponse.success && Array.isArray(asmResponse.data)) ? asmResponse.data : [];

      const regResponse = await fetchItems(`registrations?scheduledCourseId=${scheduledCourseId}`);
      const studentRegistrations: StudentRegistration[] = Array.isArray(regResponse) ? regResponse : [];
      
      const scoresResponse = await fetchItems(`studentAssessments?scheduledCourseId=${scheduledCourseId}`);
      const allStudentRawScoresData: StudentAssessmentEntry[] = (scoresResponse.success && Array.isArray(scoresResponse.data)) ? scoresResponse.data : [];
      
      const allStudentRawScores: Record<string, Record<string, { score: number | null }>> = {};
      allStudentRawScoresData.forEach(entry => {
          if (!allStudentRawScores[entry.student_id]) {
              allStudentRawScores[entry.student_id] = {};
          }
          allStudentRawScores[entry.student_id][entry.assessment_id] = { score: entry.score };
      });

      const courseTotalMaxScore = courseAssessments.reduce((sum, asm) => sum + (asm.max_score || 0), 0);

      const newGradeEntries = studentRegistrations.map(reg => {
        let status: StudentFinalGradeEntry['status'] = 'PendingGrading';
        let numericScore100: number | null = null;
        let letter_grade: string | null = null;
        let grade_points: number | null = null;

        if (courseAssessments.length === 0) {
          status = 'NoAssessments';
        } else {
          const studentScoresForCourse = allStudentRawScores[reg.student_id] || {};
          const isFullyGraded = courseAssessments.every(asm => 
            studentScoresForCourse[asm.id]?.score !== null && studentScoresForCourse[asm.id]?.score !== undefined
          );

          if (!isFullyGraded) {
            status = 'PendingGrading';
          } else if (courseTotalMaxScore === 0 && courseAssessments.length > 0) { // Only error if there are assessments but total score is 0
            status = 'Error'; 
          } else if (courseTotalMaxScore === 0 && courseAssessments.length === 0) { // No assessments, no error
             status = 'NoAssessments';
          } else {
            const studentTotalRawScore = courseAssessments.reduce((sum, asm) => {
              const scoreEntry = studentScoresForCourse[asm.id];
              return sum + (scoreEntry?.score || 0);
            }, 0);
            
            numericScore100 = Math.max(0, Math.min(100, (studentTotalRawScore / courseTotalMaxScore) * 100));
            const gradeDetails = getGradeDetailsFromScore(numericScore100);
            letter_grade = gradeDetails.letter_grade;
            grade_points = gradeDetails.grade_points;
            status = 'Calculated';
          }
        }
        
        const hasChanged = status === 'Calculated' && (letter_grade !== reg.final_grade || grade_points !== reg.grade_points);

        return {
          registration_id: reg.registration_id,
          student_id: reg.student_id,
          first_name: reg.first_name,
          last_name: reg.last_name,
          status: status,
          calculated_numeric_score: numericScore100,
          calculated_letter_grade: letter_grade,
          calculated_grade_points: grade_points,
          original_letter_grade: reg.final_grade,
          original_grade_points: reg.grade_points,
          has_changed: hasChanged,
        };
      });
      setGradeEntries(newGradeEntries);

    } catch (error: any) {
      console.error("Error calculating grade entries:", error);
      toast({ title: "Error", description: error.message || "Failed to calculate final grades.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [scheduledCourseId, toast]);

  useEffect(() => {
    calculateAndSetGradeEntries();
  }, [calculateAndSetGradeEntries]);

  const handleSaveAllFinalGrades = async () => {
    setIsSaving(true);
    let successCount = 0;
    let errorCount = 0;

    for (const entry of gradeEntries) {
      if (entry.status === 'Calculated' && entry.has_changed) {
        try {
          const response = await updateItem('registrations', entry.registration_id, {
            final_grade: entry.calculated_letter_grade,
            grade_points: entry.calculated_grade_points,
          });
          if(response.success) successCount++;
          else errorCount++;

        } catch (error) {
          errorCount++;
          toast({ title: `Error Saving for ${entry.first_name}`, description: "Could not save the grade.", variant: "destructive" });
        }
      }
    }
    setIsSaving(false);
    if (successCount > 0) {
      toast({ title: "Grades Saved", description: `${successCount} student grade(s) submitted successfully.` });
      calculateAndSetGradeEntries(); 
    }
    if (errorCount > 0) {
      toast({ title: "Some Grades Not Saved", description: `${errorCount} student grade(s) had issues.`, variant: "destructive" });
    }
    if (successCount === 0 && errorCount === 0) {
        toast({ title: "No Changes", description: "No grades were changed or needed submission."});
    }
  };

  if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2">Calculating final grades...</p></div>;
  
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Final grades are calculated based on all assessments in the Gradebook. Ensure all assessments are graded for accurate calculation. Click "Submit All Calculated Grades" to save.</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Calculated Score (/100)</TableHead>
            <TableHead>Calculated Letter Grade</TableHead>
            <TableHead>Calculated Grade Points</TableHead>
            <TableHead>Previously Saved Grade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gradeEntries.map(entry => (
            <TableRow key={entry.registration_id}>
              <TableCell>{entry.first_name} {entry.last_name}</TableCell>
              <TableCell>
                {entry.status === 'Calculated' && <span className="text-green-600">Calculated</span>}
                {entry.status === 'PendingGrading' && <span className="text-yellow-600">Assessments Incomplete</span>}
                {entry.status === 'Error' && <span className="text-red-600">Error in Calculation</span>}
                {entry.status === 'NoAssessments' && <span className="text-gray-500">No Assessments</span>}
              </TableCell>
              <TableCell>{entry.calculated_numeric_score !== null ? entry.calculated_numeric_score.toFixed(2) : '--'}</TableCell>
              <TableCell>{entry.calculated_letter_grade || '--'}</TableCell>
              <TableCell>{entry.calculated_grade_points !== null ? entry.calculated_grade_points.toFixed(2) : '--'}</TableCell>
              <TableCell>{entry.original_letter_grade || 'N/A'}</TableCell>
            </TableRow>
          ))}
           {gradeEntries.length === 0 && <TableRow><TableCell colSpan={6} className="text-center">No students found for final grade calculation.</TableCell></TableRow>}
        </TableBody>
      </Table>
      <Button onClick={handleSaveAllFinalGrades} disabled={isSaving || gradeEntries.every(e => e.status !== 'Calculated' || !e.has_changed)}>
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Submit All Calculated Grades
      </Button>
    </div>
  );
};


export default function TeacherCourseManagementPage() {
  const params = useParams();
  const scheduledCourseId = params.scheduledCourseId as string;
  const { toast } = useToast();
  const user = useAppStore(state => state.user); 
  const [courseDetails, setCourseDetails] = useState<ScheduledCourseDetails | null>(null);
  const [students, setStudents] = useState<Student[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (scheduledCourseId && user?.user_id) { 
      const loadData = async () => {
        setIsLoading(true);
        try {
          const fetchedCourseDetailsResponse = await fetchItems('scheduledCourses', scheduledCourseId);
          if (fetchedCourseDetailsResponse && typeof fetchedCourseDetailsResponse === 'object' && !Array.isArray(fetchedCourseDetailsResponse) && ('scheduled_course_id' in fetchedCourseDetailsResponse) ) {
            const details = fetchedCourseDetailsResponse as ScheduledCourseDetails;
             setCourseDetails({
                scheduled_course_id: details.scheduled_course_id,
                course_code: details.course_code || 'N/A',
                title: details.title || 'N/A',
                section: details.section || 'N/A',
                teacher_name: details.teacher_name,
                semester_name: details.semester_name,
                room_display_name: details.room_display_name,
                schedule: details.schedule
            });
          } else {
            toast({title: "Error", description: "Course details not found or in unexpected format.", variant: "destructive"});
            setCourseDetails(null);
          }
          
          const roster = await fetchStudentRoster(scheduledCourseId);
          setStudents(roster);
        } catch (error: any) {
          console.error("Error loading course management data:", error)
          toast({ title: "Error", description: error.message || "Failed to load course management data.", variant: "destructive" });
          setCourseDetails(null);
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    } else if (!user?.user_id) {
        setIsLoading(false);
        toast({title: "Authentication Error", description: "User not found.", variant: "destructive"});
    }
  }, [scheduledCourseId, user, toast]);

  if (isLoading) {
    return (
        <div className="space-y-4 p-4">
            <Skeleton className="h-12 w-3/4 md:w-1/2" />
            <Skeleton className="h-8 w-1/2 md:w-1/3" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 border-b pb-2 mb-2"> 
                <Skeleton className="h-10 w-full" /> 
                <Skeleton className="h-10 w-full" /> 
                <Skeleton className="h-10 w-full" /> 
                <Skeleton className="h-10 w-full" /> 
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }
  if (!courseDetails) {
      return (
        <Card className="m-4">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-destructive">Course Not Found</CardTitle>
                <CardDescription>The course you are trying to manage could not be loaded. It might not exist or you may not have permission to view it.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild variant="outline">
                    <Link href="/teacher/courses">Back to My Courses</Link>
                </Button>
            </CardContent>
        </Card>
      );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Manage Course: {courseDetails.course_code} - {courseDetails.title} (Section {courseDetails.section})</CardTitle>
          <CardDescription>
            Teacher: {courseDetails.teacher_name || 'N/A'} | Semester: {courseDetails.semester_name || 'N/A'} | Room: {courseDetails.room_display_name || 'N/A'}
             | Schedule: {courseDetails.schedule || 'N/A'}
            <br/>
            Oversee students, materials, assessments, and grades for this course.
          </CardDescription>
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
                  {students.length > 0 ? students.map(s => <TableRow key={s.student_id}><TableCell>{s.first_name} {s.last_name}</TableCell><TableCell>{s.email}</TableCell><TableCell><Button size="sm" variant="outline" disabled><Eye className="mr-1 h-3 w-3"/>View Progress (NYI)</Button></TableCell></TableRow>) : <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No students enrolled.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="materials"><CourseMaterialsCRUD scheduledCourseId={scheduledCourseId} /></TabsContent>
        <TabsContent value="assessments"><AssessmentsCRUD scheduledCourseId={scheduledCourseId} /></TabsContent>
        <TabsContent value="gradebook"><Gradebook scheduledCourseId={scheduledCourseId} students={students} /></TabsContent>
        <TabsContent value="final-grades">
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Final Grades Submission</CardTitle>
                <CardDescription>Calculated final grades based on all course assessments. Ensure all individual assessments are graded in the 'Gradebook' tab before submitting final grades.</CardDescription>
            </CardHeader>
            <CardContent>
              <FinalGradesSubmission scheduledCourseId={scheduledCourseId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

