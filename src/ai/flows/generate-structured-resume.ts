
'use server';

/**
 * @fileOverview This file contains a Genkit flow for generating a structured resume from raw text.
 *
 * - generateStructuredResume - A function that takes a raw string of resume information and returns a structured object.
 * - GenerateStructuredResumeInput - The input type for the generateStructuredResume function.
 * - GenerateStructuredResumeOutput - The return type for the generateStructuredResume function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GenerateStructuredResumeOutputSchema, GenerateStructuredResumeOutput } from '../schemas/resume-schema';

const GenerateStructuredResumeInputSchema = z.object({
  rawText: z.string().describe('The raw text content of the resume.'),
});
export type GenerateStructuredResumeInput = z.infer<typeof GenerateStructuredResumeInputSchema>;

export async function generateStructuredResume(
  input: GenerateStructuredResumeInput
): Promise<GenerateStructuredResumeOutput> {
  return generateStructuredResumeFlow(input);
}


const StructuredResumeModelOutputSchema = z.object({
  resumeJson: z
    .string()
    .describe(
      'A JSON string matching the GenerateStructuredResumeOutputSchema format (basics, education, experience, skills, certifications, languages, customSections).'
    ),
});

const prompt = ai.definePrompt({
  name: 'generateStructuredResumePrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: GenerateStructuredResumeInputSchema },
  output: { schema: StructuredResumeModelOutputSchema },
  prompt: `You are an expert resume parser. Analyze the following raw text and extract the information into a structured JSON object.

- The user's experience description must be a single string where each bullet point starts on a new line with '- '.
- Extract certifications into the 'certifications' array.
- Extract languages into the 'languages' array.
- If there are sections that don't fit into basics, education, experience, skills, certifications or languages, add them to the 'customSections' array.

Raw Resume Text:
{{{rawText}}}

Return a JSON object with a single field 'resumeJson' whose value is the structured resume as a JSON string following the specified format.
`,
});

const generateStructuredResumeFlow = ai.defineFlow(
  {
    name: 'generateStructuredResumeFlow',
    inputSchema: GenerateStructuredResumeInputSchema,
    outputSchema: GenerateStructuredResumeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output || !output.resumeJson) {
      throw new Error('AI returned no output for structured resume.');
    }
    try {
      return GenerateStructuredResumeOutputSchema.parse(
        JSON.parse(output.resumeJson)
      );
    } catch (err) {
      console.error('Failed to parse structured resume JSON from AI.', err);
      throw new Error('AI returned an invalid structured resume JSON format.');
    }
  }
);
