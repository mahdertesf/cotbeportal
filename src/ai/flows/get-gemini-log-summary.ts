'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a summary of recent CoTBE activity from audit logs using the Gemini API.
 *
 * - getGeminiLogSummary - A function that takes a snippet of log data and returns a summary.
 * - GetGeminiLogSummaryInput - The input type for the getGeminiLogSummary function.
 * - GetGeminiLogSummaryOutput - The return type for the getGeminiLogSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetGeminiLogSummaryInputSchema = z.object({
  logDataSnippet: z.string().describe('A snippet of recent log entries from the CoTBE audit logs.'),
});
export type GetGeminiLogSummaryInput = z.infer<typeof GetGeminiLogSummaryInputSchema>;

const GetGeminiLogSummaryOutputSchema = z.object({
  summary: z.string().describe('A natural language summary of potential trends or anomalies from the log data.'),
});
export type GetGeminiLogSummaryOutput = z.infer<typeof GetGeminiLogSummaryOutputSchema>;

export async function getGeminiLogSummary(input: GetGeminiLogSummaryInput): Promise<GetGeminiLogSummaryOutput> {
  return getGeminiLogSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getGeminiLogSummaryPrompt',
  input: {schema: GetGeminiLogSummaryInputSchema},
  output: {schema: GetGeminiLogSummaryOutputSchema},
  prompt: `You are an AI assistant helping staff heads at CoTBE (Addis Ababa University College of Technology and Built Environment) to understand recent system activity.

You are provided with a snippet of recent audit log data. Your task is to generate a concise and informative summary highlighting any potential trends, anomalies, or notable events.

Log Data Snippet:
{{logDataSnippet}}

Summary:
`,
});

const getGeminiLogSummaryFlow = ai.defineFlow(
  {
    name: 'getGeminiLogSummaryFlow',
    inputSchema: GetGeminiLogSummaryInputSchema,
    outputSchema: GetGeminiLogSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
