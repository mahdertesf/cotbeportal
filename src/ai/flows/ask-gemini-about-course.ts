'use server';
/**
 * @fileOverview An AI agent that answers questions about course material.
 *
 * - askGeminiAboutCourse - A function that handles the question answering process.
 * - AskGeminiAboutCourseInput - The input type for the askGeminiAboutCourse function.
 * - AskGeminiAboutCourseOutput - The return type for the askGeminiAboutCourse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskGeminiAboutCourseInputSchema = z.object({
  questionText: z.string().describe('The question about the course material.'),
  courseMaterialContextText: z.string().describe('The relevant course material context.'),
});
export type AskGeminiAboutCourseInput = z.infer<typeof AskGeminiAboutCourseInputSchema>;

const AskGeminiAboutCourseOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the course material.'),
});
export type AskGeminiAboutCourseOutput = z.infer<typeof AskGeminiAboutCourseOutputSchema>;

export async function askGeminiAboutCourse(input: AskGeminiAboutCourseInput): Promise<AskGeminiAboutCourseOutput> {
  return askGeminiAboutCourseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askGeminiAboutCoursePrompt',
  input: {schema: AskGeminiAboutCourseInputSchema},
  output: {schema: AskGeminiAboutCourseOutputSchema},
  prompt: `You are a helpful AI assistant for students.  You are provided with the text of course materials, and the student will ask you questions about it.  Answer the question using the provided course materials.

Course Material:
{{courseMaterialContextText}}

Question:
{{questionText}}`,
});

const askGeminiAboutCourseFlow = ai.defineFlow(
  {
    name: 'askGeminiAboutCourseFlow',
    inputSchema: AskGeminiAboutCourseInputSchema,
    outputSchema: AskGeminiAboutCourseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
