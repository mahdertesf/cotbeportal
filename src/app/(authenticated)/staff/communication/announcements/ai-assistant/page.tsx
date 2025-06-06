
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { draftGeminiAnnouncement, type DraftGeminiAnnouncementInput } from '@/ai/flows/draft-gemini-announcement';
import { Loader2, Megaphone, Wand2, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const announcementFormSchema = z.object({
  keyPoints: z.string().min(10, "Please provide at least 10 characters for key points.").max(1000, "Key points are too long."),
  targetAudience: z.string().min(1, "Target audience is required."),
  desiredTone: z.string().min(1, "Desired tone is required."),
  coTBEContext: z.string().max(500, "CoTBE context is too long.").optional(),
});

type AnnouncementFormData = z.infer<typeof announcementFormSchema>;

const targetAudienceOptions = [
  "All Portal Users",
  "All Students",
  "All Teachers",
  "All Staff",
  "Specific Department Students", // You'd need logic to select a department if this is chosen
  "Specific Department Faculty",  // You'd need logic to select a department if this is chosen
];

const desiredToneOptions = [
  "Formal",
  "Informative",
  "Urgent",
  "Celebratory",
  "Friendly",
  "Encouraging",
];

export default function AiAnnouncementGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [announcementDraft, setAnnouncementDraft] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const { toast } = useToast();

  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      keyPoints: '',
      targetAudience: '',
      desiredTone: '',
      coTBEContext: 'Addis Ababa University College of Technology and Built Environment (CoTBE)',
    },
  });

  const onSubmit = async (data: AnnouncementFormData) => {
    setIsLoading(true);
    setAnnouncementDraft(null);
    try {
      const result = await draftGeminiAnnouncement(data);
      setAnnouncementDraft(result.announcementDraft);
      toast({ title: "Draft Generated", description: "AI has drafted an announcement for your review." });
    } catch (error) {
      console.error("Error generating announcement draft:", error);
      toast({ title: "Error", description: "Failed to generate announcement draft.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!announcementDraft) {
        toast({ title: "No Draft", description: "Generate a draft first before saving.", variant: "destructive"});
        return;
    }
    setIsSavingDraft(true);
    // Placeholder for actual save logic
    // In a real app, you'd call an API like:
    // await createItem('announcements', { 
    //   title: "AI Drafted: " + form.getValues('keyPoints').substring(0,30) + "...", // derive a title
    //   content: announcementDraft, 
    //   author_id: user.user_id, // Assuming user object is available in scope
    //   target_audience: form.getValues('targetAudience'),
    //   desired_tone: form.getValues('desiredTone'),
    //   status: 'Draft' 
    // });
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Draft Saved (Mock)", description: "Your announcement draft has been notionally saved."});
    setIsSavingDraft(false);
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <Megaphone className="mr-3 h-7 w-7 text-primary" /> AI Announcement Assistant
          </CardTitle>
          <CardDescription>Generate CoTBE announcements with AI assistance. Review and edit the draft before saving or publishing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="keyPoints">Key Points / Topic</Label>
              <Textarea
                id="keyPoints"
                placeholder="e.g., Upcoming workshop on AI, New library hours, Semester registration deadline"
                {...form.register('keyPoints')}
                rows={4}
              />
              {form.formState.errors.keyPoints && <p className="text-sm text-destructive mt-1">{form.formState.errors.keyPoints.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Select onValueChange={(value) => form.setValue('targetAudience', value)} defaultValue={form.getValues('targetAudience')}>
                  <SelectTrigger id="targetAudience">
                    <SelectValue placeholder="Select target audience" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetAudienceOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.targetAudience && <p className="text-sm text-destructive mt-1">{form.formState.errors.targetAudience.message}</p>}
              </div>

              <div>
                <Label htmlFor="desiredTone">Desired Tone</Label>
                <Select onValueChange={(value) => form.setValue('desiredTone', value)} defaultValue={form.getValues('desiredTone')}>
                  <SelectTrigger id="desiredTone">
                    <SelectValue placeholder="Select desired tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {desiredToneOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.desiredTone && <p className="text-sm text-destructive mt-1">{form.formState.errors.desiredTone.message}</p>}
              </div>
            </div>
            
            <div>
              <Label htmlFor="coTBEContext">CoTBE Context / Boilerplate (Optional)</Label>
              <Textarea
                id="coTBEContext"
                placeholder="e.g., Standard CoTBE branding guidelines or introductory phrases."
                {...form.register('coTBEContext')}
                rows={2}
              />
              {form.formState.errors.coTBEContext && <p className="text-sm text-destructive mt-1">{form.formState.errors.coTBEContext.message}</p>}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generate Draft
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
          <Card>
            <CardHeader><CardTitle className="font-headline">AI Generated Draft</CardTitle></CardHeader>
            <CardContent>
                <Skeleton className="h-6 w-1/4 mb-2" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-24 mt-4" />
            </CardContent>
          </Card>
      )}

      {announcementDraft && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">AI Generated Draft</CardTitle>
            <CardDescription>Review the draft below. You can edit it directly before saving.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md text-sm mb-4">
                <AlertTriangle className="inline mr-2 h-4 w-4" />
                This draft is AI-generated. Always review and edit for accuracy and appropriateness before publishing.
            </div>
            <Textarea
              value={announcementDraft}
              onChange={(e) => setAnnouncementDraft(e.target.value)}
              rows={10}
              className="text-base"
            />
            <Button onClick={handleSaveDraft} disabled={isSavingDraft} className="mt-4">
              {isSavingDraft ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Draft (Mock)
            </Button>
             <p className="text-xs text-muted-foreground mt-1">Saving to database requires backend implementation and an 'Announcements' table.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
