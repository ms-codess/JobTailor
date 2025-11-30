
'use server';

/**
 * @fileOverview This file contains a Genkit flow for suggesting a career path based on a resume.
 *
 * - suggestCareerPath - A function that takes resume text and suggests career paths, certifications, and job positions.
 * - SuggestCareerPathInput - The input type for the suggestCareerPath function.
 * - SuggestCareerPathOutput - The return type for the suggestCareerPath function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestCareerPathInputSchema = z.object({
  resumeText: z.string().describe('The text content of the user\'s resume.'),
});
export type SuggestCareerPathInput = z.infer<typeof SuggestCareerPathInputSchema>;

const SuggestCareerPathOutputSchema = z.object({
  careerSuggestions: z.array(z.object({
    pathTitle: z.string().describe('The title of the suggested career path (e.g., "Senior Frontend Developer").'),
    pathDescription: z.string().describe('A brief explanation of why this path is a good fit for the user.'),
  })).describe('A list of suggested career paths based on the resume.'),
  suggestedCertifications: z.array(z.object({
    name: z.string().describe('The name of the suggested course or certification.'),
    url: z.string().url().describe('A relevant URL to find the course (e.g., on Coursera, Udemy, or an official site).')
  })).describe('A list of suggested courses or certifications to help the user advance.'),
  possibleJobPositions: z.array(z.string()).describe('A list of concrete job titles the user could apply for within the suggested paths.'),
});
export type SuggestCareerPathOutput = z.infer<typeof SuggestCareerPathOutputSchema>;

export async function suggestCareerPath(
  input: SuggestCareerPathInput
): Promise<SuggestCareerPathOutput> {
  return suggestCareerPathFlow(input);
}


const prompt = ai.definePrompt({
  name: 'suggestCareerPathPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: SuggestCareerPathInputSchema },
  output: { schema: SuggestCareerPathOutputSchema },
  prompt: `You are an expert career advisor. Analyze the following resume text and provide actionable career guidance.

Resume Text:
{{{resumeText}}}

Based on the resume, provide the following in a structured JSON format:
1.  **Career Suggestions**: Identify 2-3 potential career paths that align with the user's experience and skills. For each path, provide a title and a brief description of why it's a good match.
2.  **Possible Job Positions**: List several concrete job titles that the user could search for right now.
3.  **Suggested Certifications**: Recommend relevant certifications or courses that would strengthen the user's profile for these career paths. Provide a name and a direct, reputable URL for each (no placeholders or generic homepages).
`,
});

const suggestCareerPathFlow = ai.defineFlow(
  {
    name: 'suggestCareerPathFlow',
    inputSchema: SuggestCareerPathInputSchema,
    outputSchema: SuggestCareerPathOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
