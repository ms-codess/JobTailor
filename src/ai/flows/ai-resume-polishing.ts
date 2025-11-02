
'use server';

/**
 * @fileOverview This file contains the AI resume polishing flow, which suggests stronger verbs/metrics and per-section regeneration.
 *
 * - aiResumePolishing - A function that enhances the language and content of a resume using AI.
 * - AiResumePolishingInput - The input type for the aiResumePolishing function.
 * - AiResumePolishingOutput - The return type for the aiResumePolishing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiResumePolishingInputSchema = z.object({
  resumeSection: z
    .string()
    .describe('The specific section of the resume to be polished.'),
  currentContent: z
    .string()
    .describe('The current content of the resume section.'),
});

export type AiResumePolishingInput = z.infer<typeof AiResumePolishingInputSchema>;

const AiResumePolishingOutputSchema = z.object({
  polishedContent: z
    .string()
    .describe('The AI-polished content of the resume section.'),
  suggestedVerbs: z
    .array(z.string())
    .describe('A list of suggested stronger verbs to use.'),
  suggestedMetrics: z
    .array(z.string())
    .describe('A list of suggested metrics to quantify achievements.'),
});

export type AiResumePolishingOutput = z.infer<typeof AiResumePolishingOutputSchema>;

export async function aiResumePolishing(input: AiResumePolishingInput): Promise<AiResumePolishingOutput> {
  return aiResumePolishingFlow(input);
}

const aiResumePolishingPrompt = ai.definePrompt({
  name: 'aiResumePolishingPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: AiResumePolishingInputSchema},
  output: {schema: AiResumePolishingOutputSchema},
  prompt: `You are an AI resume polishing expert. You will be given a section of a resume and its current content. Your goal is to enhance the language and content of the resume section while strictly avoiding hallucinations. Follow these rules and steps:

Rules (No Inventions):
 - Do NOT invent facts, employers, roles, dates, tools, or certifications that are not present in the provided content.
 - Do NOT add specific numbers/metrics that are not explicitly stated. You may suggest metrics separately, but do not insert speculative numbers into the polished content.
 - Keep all factual claims grounded in the original text; you may improve wording and clarity only.

Steps:
1.  Rewrite the content to be more impactful and clear while preserving facts.
2.  Suggest stronger verbs to use.
3.  Suggest metrics to quantify achievements (as ideas only, without adding them to the polished content unless they already exist in the original).

Section: {{{resumeSection}}}
Current Content: {{{currentContent}}}

Output:
`,
});

const aiResumePolishingFlow = ai.defineFlow(
  {
    name: 'aiResumePolishingFlow',
    inputSchema: AiResumePolishingInputSchema,
    outputSchema: AiResumePolishingOutputSchema,
  },
  async input => {
    const {output} = await aiResumePolishingPrompt(input);
    return output!;
  }
);
