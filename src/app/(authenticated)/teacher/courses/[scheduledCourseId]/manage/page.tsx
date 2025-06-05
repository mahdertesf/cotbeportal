
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
  fetchTeacherAssignedCourses, 
  fetchStudentRoster, 
  createCourseMaterial, 
  fetchStudentCourseMaterials as fetchMaterials, 
  fetchItems as fetchAssessmentsForCourse, 
  createItem as createAssessment, 
  updateItem as updateAssessment, 
  deleteItem as deleteAssessment,
  fetchStudentFinalGradesForCourse, // New import
  updateItem // Ensure updateItem is imported for saving final grades
} from '@/lib/api'; 
import { getGeminiAssessmentIdeas, getGeminiFeedbackSuggestions } from '@/ai/flows';
import { Users, BookOpen, ClipboardEdit, Percent, CheckSquare, Loader2, PlusCircle, Edit, Trash2, Upload, LinkIcon, Brain, Send, Bot, User, FileText, AlertTriangle, Eye, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Types
interface Student { student_id: string; first_name: string; last_name: string; email: string; }
interface CourseMaterial { id: string; title: string; description: string; material_type: 'File' | 'Link'; file_path?: string | null; url?: string | null; }
interface Assessment { id: string; name: string; description: string; max_score: number; due_date: string; type: string; }
interface StudentAssessmentEntry { student_id: string; assessment_id: string; score: number | null; feedback: string | null; }
interface ScheduledCourseDetails { scheduled_course_id: string; course_code: string; title: string; section: string;}

interface StudentFinalGradeEntry {
  registration_id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  input_score: string; // Keep as string for input flexibility
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

  useEffect(() => {
    const loadMaterials = async () => {
      setIsLoading(true);
      try {
        const data = await fetchMaterials(scheduledCourseId); 
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
    try {
      const created = await createCourseMaterial(scheduledCourseId, {...newMaterial, id: Date.now().toString()}); 
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

// AssessmentsCRUD Component
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
    try {
      if(currentAssessment.id) {
        await updateAssessment('assessments', currentAssessment.id, currentAssessment);
      } else {
        await createAssessment('assessments', {...currentAssessment, id: Date.now().toString(), scheduledCourseId }); 
      }
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

// Gradebook Component
const Gradebook = ({ scheduledCourseId, students }: { scheduledCourseId: string, students: Student[] }) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [grades, setGrades] = useState<Record<string, Record<string, StudentAssessmentEntry>>>({}); 
  const [isLoading, setIsLoading] = useState(true);
  const [currentSubmissionText, setCurrentSubmissionText] = useState(''); 
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
                            value={grades[s.student_id]?.[a.id]?.feedback ?? aiFeedback} 
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
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button>Save All Grades</Button>
    </div>
  );
};

// Final Grades Submission Component
const getGradeDetailsFromScore = (score: number | null): { letter_grade: string | null, grade_points: number | null } => {
  if (score === null || isNaN(score) || score < 0 || score > 100) return { letter_grade: null, grade_points: null };
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

const FinalGradesSubmission = ({ scheduledCourseId, studentsRoster }: { scheduledCourseId: string, studentsRoster: Student[] }) => {
  const [gradeEntries, setGradeEntries] = useState<StudentFinalGradeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const initializeGradeEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const finalGradesData = await fetchStudentFinalGradesForCourse(scheduledCourseId);
      const entries = studentsRoster.map(student => {
        const existingGrade = finalGradesData.find(g => g.student_id === student.student_id);
        let inputScore = '';
        // Attempt to derive score from grade - this is an approximation
        if (existingGrade?.letter_grade) {
            if (existingGrade.letter_grade === 'A') inputScore = '95';
            else if (existingGrade.letter_grade === 'A-') inputScore = '87';
            else if (existingGrade.letter_grade === 'B+') inputScore = '82';
            else if (existingGrade.letter_grade === 'B') inputScore = '77';
            // Add more as needed, or leave blank
        }

        const { letter_grade: calculated_letter_grade, grade_points: calculated_grade_points } = getGradeDetailsFromScore(inputScore ? parseFloat(inputScore) : null);

        return {
          registration_id: existingGrade?.registration_id || '', // This needs to be valid
          student_id: student.student_id,
          first_name: student.first_name,
          last_name: student.last_name,
          input_score: inputScore,
          calculated_letter_grade: existingGrade?.final_grade || calculated_letter_grade, // Show stored if input is blank
          calculated_grade_points: existingGrade?.grade_points || calculated_grade_points,
          original_letter_grade: existingGrade?.final_grade || null,
          original_grade_points: existingGrade?.grade_points || null,
          has_changed: false,
        };
      });
      setGradeEntries(entries);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load student grade data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [scheduledCourseId, studentsRoster, toast]);

  useEffect(() => {
    if (studentsRoster.length > 0) {
      initializeGradeEntries();
    }
  }, [studentsRoster, initializeGradeEntries]);

  const handleScoreChange = (student_id: string, score_str: string) => {
    setGradeEntries(prevEntries =>
      prevEntries.map(entry => {
        if (entry.student_id === student_id) {
          const score_num = score_str === '' ? null : parseFloat(score_str);
          const { letter_grade, grade_points } = getGradeDetailsFromScore(score_num);
          return {
            ...entry,
            input_score: score_str,
            calculated_letter_grade: letter_grade,
            calculated_grade_points: grade_points,
            has_changed: true,
          };
        }
        return entry;
      })
    );
  };

  const handleSaveAllFinalGrades = async () => {
    setIsSaving(true);
    let successCount = 0;
    let errorCount = 0;

    for (const entry of gradeEntries) {
      if (entry.has_changed && entry.registration_id && entry.input_score !== '') { // Only save if changed, valid registration_id, and score is entered
        const score_num = parseFloat(entry.input_score);
        if (isNaN(score_num) || score_num < 0 || score_num > 100) {
            toast({ title: `Invalid Score for ${entry.first_name}`, description: "Score must be between 0 and 100.", variant: "destructive"});
            errorCount++;
            continue;
        }
        try {
          await updateItem('registrations', entry.registration_id, {
            final_grade: entry.calculated_letter_grade,
            grade_points: entry.calculated_grade_points,
          });
          successCount++;
        } catch (error) {
          errorCount++;
          toast({ title: `Error Saving Grade for ${entry.first_name}`, description: "Could not save the grade.", variant: "destructive" });
        }
      }
    }
    setIsSaving(false);
    if (successCount > 0) {
      toast({ title: "Grades Saved", description: `${successCount} student grade(s) saved successfully.` });
      initializeGradeEntries(); // Refresh data
    }
    if (errorCount > 0) {
      toast({ title: "Some Grades Not Saved", description: `${errorCount} student grade(s) had issues.`, variant: "destructive" });
    }
    if (successCount === 0 && errorCount === 0) {
        toast({ title: "No Changes", description: "No grades were changed or needed saving."});
    }
  };

  if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2">Loading grade sheet...</p></div>;
  if (!studentsRoster.length) return <p className="text-muted-foreground">No students in this course roster.</p>

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Enter a numerical score (0-100) for each student. The letter grade and grade points will be calculated automatically. Click "Save All Final Grades" to submit.</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Stored Grade</TableHead>
            <TableHead className="w-1/4">Input Score (0-100)</TableHead>
            <TableHead>New Letter Grade</TableHead>
            <TableHead>New Grade Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gradeEntries.map(entry => (
            <TableRow key={entry.student_id}>
              <TableCell>{entry.first_name} {entry.last_name}</TableCell>
              <TableCell>{entry.original_letter_grade || '--'}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={entry.input_score}
                  onChange={(e) => handleScoreChange(entry.student_id, e.target.value)}
                  placeholder="e.g. 85"
                  min="0"
                  max="100"
                  className="w-full"
                />
              </TableCell>
              <TableCell>{entry.calculated_letter_grade || '--'}</TableCell>
              <TableCell>{entry.calculated_grade_points?.toFixed(2) || '--'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={handleSaveAllFinalGrades} disabled={isSaving}>
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save All Final Grades
      </Button>
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
          const courses = await fetchTeacherAssignedCourses("teacherId_placeholder"); 
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
            <div className="grid grid-cols-5 gap-2"> 
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
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Final Grades Submission</CardTitle>
                <CardDescription>Enter and submit final course grades for students.</CardDescription>
            </CardHeader>
            <CardContent>
              <FinalGradesSubmission scheduledCourseId={scheduledCourseId} studentsRoster={students} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

