// src/ai/flows/draft-gemini-announcement.ts
'use server';

/**
 * @fileOverview A flow to draft CoTBE announcements with AI assistance.
 *
 * - draftGeminiAnnouncement - A function that handles the announcement drafting process.
 * - DraftGeminiAnnouncementInput - The input type for the draftGeminiAnnouncement function.
 * - DraftGeminiAnnouncementOutput - The return type for the draftGeminiAnnouncement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DraftGeminiAnnouncementInputSchema = z.object({
  keyPoints: z.string().describe('Key points or topic of the announcement.'),
  targetAudience: z.string().describe('Target audience for the announcement (e.g., All Students, Specific Department, Faculty).'),
  desiredTone: z.string().describe('Desired tone of the announcement (e.g., Formal, Informative, Urgent, Celebratory).'),
  coTBEContext: z.string().optional().describe('Boilerplate or branding guidelines for CoTBE.'),
});

export type DraftGeminiAnnouncementInput = z.infer<typeof DraftGeminiAnnouncementInputSchema>;

const DraftGeminiAnnouncementOutputSchema = z.object({
  announcementDraft: z.string().describe('The drafted announcement content.'),
});

export type DraftGeminiAnnouncementOutput = z.infer<typeof DraftGeminiAnnouncementOutputSchema>;

export async function draftGeminiAnnouncement(input: DraftGeminiAnnouncementInput): Promise<DraftGeminiAnnouncementOutput> {
  return draftGeminiAnnouncementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'draftGeminiAnnouncementPrompt',
  input: {schema: DraftGeminiAnnouncementInputSchema},
  output: {schema: DraftGeminiAnnouncementOutputSchema},
  prompt: `You are an AI assistant specialized in drafting announcements for Addis Ababa University College of Technology and Built Environment (CoTBE).

  Based on the provided key points, target audience, desired tone, and CoTBE context, generate a draft announcement.

  Key Points/Topic: {{{keyPoints}}}
  Target Audience: {{{targetAudience}}}
  Desired Tone: {{{desiredTone}}}
  CoTBE Context: {{{coTBEContext}}}

  Draft Announcement:`,
});

const draftGeminiAnnouncementFlow = ai.defineFlow(
  {
    name: 'draftGeminiAnnouncementFlow',
    inputSchema: DraftGeminiAnnouncementInputSchema,
    outputSchema: DraftGeminiAnnouncementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
