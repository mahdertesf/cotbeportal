// 'use server'
'use server';

/**
 * @fileOverview An AI agent to provide feedback suggestions for student submissions.
 *
 * - getGeminiFeedbackSuggestions - A function that provides feedback suggestions for student submissions.
 * - GetGeminiFeedbackSuggestionsInput - The input type for the getGeminiFeedbackSuggestions function.
 * - GetGeminiFeedbackSuggestionsOutput - The return type for the getGeminiFeedbackSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetGeminiFeedbackSuggestionsInputSchema = z.object({
  submissionText: z
    .string()
    .describe('The text of the student submission to provide feedback on.'),
  assessmentCriteria: z
    .string()
    .optional()
    .describe('Optional assessment criteria or rubric for the submission.'),
});
export type GetGeminiFeedbackSuggestionsInput = z.infer<
  typeof GetGeminiFeedbackSuggestionsInputSchema
>;

const GetGeminiFeedbackSuggestionsOutputSchema = z.object({
  feedbackSuggestions: z
    .string()
    .describe('AI-generated suggestions for constructive feedback.'),
});
export type GetGeminiFeedbackSuggestionsOutput = z.infer<
  typeof GetGeminiFeedbackSuggestionsOutputSchema
>;

export async function getGeminiFeedbackSuggestions(
  input: GetGeminiFeedbackSuggestionsInput
): Promise<GetGeminiFeedbackSuggestionsOutput> {
  return getGeminiFeedbackSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getGeminiFeedbackSuggestionsPrompt',
  input: {schema: GetGeminiFeedbackSuggestionsInputSchema},
  output: {schema: GetGeminiFeedbackSuggestionsOutputSchema},
  prompt: `You are an AI assistant helping teachers provide constructive feedback to students on their submissions.

  Based on the student's submission text and the assessment criteria (if provided), generate feedback suggestions for the teacher to consider.

  The teacher will review, edit, and approve the feedback before giving it to the student, so provide detailed and specific suggestions.

  Submission Text: {{{submissionText}}}

  Assessment Criteria (Optional): {{{assessmentCriteria}}}
  `,
});

const getGeminiFeedbackSuggestionsFlow = ai.defineFlow(
  {
    name: 'getGeminiFeedbackSuggestionsFlow',
    inputSchema: GetGeminiFeedbackSuggestionsInputSchema,
    outputSchema: GetGeminiFeedbackSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
