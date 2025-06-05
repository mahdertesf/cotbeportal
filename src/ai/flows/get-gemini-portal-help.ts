'use server';
/**
 * @fileOverview A help assistant AI agent for the CoTBE portal.
 *
 * - getGeminiPortalHelp - A function that handles the help process.
 * - GetGeminiPortalHelpInput - The input type for the getGeminiPortalHelp function.
 * - GetGeminiPortalHelpOutput - The return type for the getGeminiPortalHelp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetGeminiPortalHelpInputSchema = z.object({
  userQuery: z.string().describe('The user query about how to use the CoTBE portal.'),
  portalFunctionalityContext: z.string().optional().describe('Context about the portal functionalities.'),
});
export type GetGeminiPortalHelpInput = z.infer<typeof GetGeminiPortalHelpInputSchema>;

const GetGeminiPortalHelpOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query.'),
});
export type GetGeminiPortalHelpOutput = z.infer<typeof GetGeminiPortalHelpOutputSchema>;

export async function getGeminiPortalHelp(input: GetGeminiPortalHelpInput): Promise<GetGeminiPortalHelpOutput> {
  return getGeminiPortalHelpFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getGeminiPortalHelpPrompt',
  input: {schema: GetGeminiPortalHelpInputSchema},
  output: {schema: GetGeminiPortalHelpOutputSchema},
  prompt: `You are the CoTBE Portal Help Assistant. A user has asked the following question about how to use the portal:\n\n{{userQuery}}\n\nHere is some context about the portal's functionalities:\n\n{{portalFunctionalityContext}}\n\nAnswer the user's question clearly and concisely.`,
});

const getGeminiPortalHelpFlow = ai.defineFlow(
  {
    name: 'getGeminiPortalHelpFlow',
    inputSchema: GetGeminiPortalHelpInputSchema,
    outputSchema: GetGeminiPortalHelpOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
