// 'use server'
'use server';

/**
 * @fileOverview Retrieves AI insights on a student's academic progress.
 *
 * - getGeminiAcademicInsights - A function that generates AI insights based on a student's academic data.
 * - GeminiAcademicInsightsInput - The input type for the getGeminiAcademicInsights function.
 * - GeminiAcademicInsightsOutput - The return type for the getGeminiAcademicInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeminiAcademicInsightsInputSchema = z.object({
  studentProgressSummary: z.string().describe('A summary of the student\'s completed courses, grades, and credits.'),
  studentAcademicInterests: z.string().optional().describe('The student\'s academic interests.'),
});
export type GeminiAcademicInsightsInput = z.infer<typeof GeminiAcademicInsightsInputSchema>;

const GeminiAcademicInsightsOutputSchema = z.object({
  insights: z.string().describe('A natural language summary of the student\'s strengths, areas for improvement, and suggested courses.'),
});
export type GeminiAcademicInsightsOutput = z.infer<typeof GeminiAcademicInsightsOutputSchema>;

export async function getGeminiAcademicInsights(input: GeminiAcademicInsightsInput): Promise<GeminiAcademicInsightsOutput> {
  return getGeminiAcademicInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'geminiAcademicInsightsPrompt',
  input: {schema: GeminiAcademicInsightsInputSchema},
  output: {schema: GeminiAcademicInsightsOutputSchema},
  prompt: `You are an AI academic advisor providing insights to students based on their academic performance.

  Analyze the following student progress summary and identify strengths, areas for improvement, and suggest related courses for future semesters.
  \nStudent Progress Summary: {{{studentProgressSummary}}}\n
  {% if studentAcademicInterests %}
  Student Academic Interests: {{{studentAcademicInterests}}}
  {% endif %}
  \nProvide a concise and helpful summary.
  `,
});

const getGeminiAcademicInsightsFlow = ai.defineFlow(
  {
    name: 'getGeminiAcademicInsightsFlow',
    inputSchema: GeminiAcademicInsightsInputSchema,
    outputSchema: GeminiAcademicInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
