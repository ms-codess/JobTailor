
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing an instant ATS preview.
 *
 * The flow takes a resume and job description as input, and returns an ATS score and example fixes.
 * - instantAtsPreview - The main function to call the flow.
 * - InstantAtsPreviewInput - The input type for the instantAtsPreview function.
 * - InstantAtsPreviewOutput - The return type for the instantAtsPreview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InstantAtsPreviewInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescription: z.string().describe('The job description to tailor the resume to.'),
});
export type InstantAtsPreviewInput = z.infer<typeof InstantAtsPreviewInputSchema>;

const InstantAtsPreviewOutputSchema = z.object({
  atsScore: z.number().describe('A numerical score representing the ATS compatibility of the resume (0-100).'),
  exampleFixes: z.array(z.string()).describe('A list of 2-3 example fixes/snippets to improve the resume.'),
});
export type InstantAtsPreviewOutput = z.infer<typeof InstantAtsPreviewOutputSchema>;

export async function instantAtsPreview(input: InstantAtsPreviewInput): Promise<InstantAtsPreviewOutput> {
  return instantAtsPreviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'instantAtsPreviewPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: InstantAtsPreviewInputSchema},
  output: {schema: InstantAtsPreviewOutputSchema},
  prompt: `You are an AI resume expert providing an instant preview of the Applicant Tracking System (ATS) score and example fixes for a given resume and job description.

  Analyze the following resume and job description to determine the ATS score (0-100) and provide 2-3 actionable, high-impact example fixes/snippets.

  Resume:
  {{{resumeText}}}

  Job Description:
  {{{jobDescription}}}

  Respond with a JSON object including the ATS score and example fixes.
  The ATS score should be a number between 0 and 100. Example fixes should be an array of strings.
  `,
});

const instantAtsPreviewFlow = ai.defineFlow(
  {
    name: 'instantAtsPreviewFlow',
    inputSchema: InstantAtsPreviewInputSchema,
    outputSchema: InstantAtsPreviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
