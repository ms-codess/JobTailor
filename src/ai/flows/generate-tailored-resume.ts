'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  GenerateTailoredResumeInputSchema,
  GenerateTailoredResumeOutputSchema,
  GenerateTailoredResumeInput,
  GenerateTailoredResumeOutput,
  AtsScoreBreakdownSchema,
  CoverLetterOutputSchema,
  CoverLetterOutput,
  SkillAnalysisOutputSchema,
  SkillAnalysisOutput,
  InterviewPrepOutputSchema,
  InterviewPrepOutput,
} from '../schemas/tailored-resume-schema';

import { GenerateStructuredResumeOutputSchema } from '../schemas/resume-schema';

/* -------------------------------------------------------------------------- */
/*                               SCHEMA FIXES                                  */
/* -------------------------------------------------------------------------- */

const Num = z.union([
  z.number(),
  z.string().regex(/^\d+$/, 'Expected numeric string').transform(Number),
]);

const TailoredResumeModelOutputSchema = z.object({
  initialAtsScore: Num,
  tailoredAtsScore: Num,
  atsScoreBreakdown: AtsScoreBreakdownSchema,
  tailoredResumeJson: z.string().describe("STRINGIFIED JSON ONLY"),
});

/* -------------------------------------------------------------------------- */
/*                                MAIN PROMPT                                 */
/* -------------------------------------------------------------------------- */

const resumePrompt = ai.definePrompt({
  name: 'generateTailoredResumePrompt',
  model: 'googleai/gemini-2.5-flash',
  config: { temperature: 0.2 },
  input: { schema: GenerateTailoredResumeInputSchema },
  output: { schema: TailoredResumeModelOutputSchema },
  prompt: `
You are an expert resume tailor and career coach. Follow a strict NO-HALLUCINATION policy.

INPUT RESUME:
{{{resumeText}}}

JOB DESCRIPTION:
{{{jobDescription}}}

YOUR TASKS:

1) ATS SCORE — ORIGINAL RESUME
- Provide "initialAtsScore" as a number (0–100).
- Provide "atsScoreBreakdown" with numeric sub-scores and 1–2 sentence explanations.

2) TAILOR THE RESUME — BASED SOLELY ON REAL DATA IN THE PROVIDED RESUME
- NEVER invent employers, dates, job titles, degrees, certifications, or tools.
- You MAY rephrase, restructure, or bulletize existing content.
- You MAY add job-description keywords ONLY if supported by real responsibilities from the resume.
- Do NOT fabricate achievements, numbers, or technologies.
- Experiences must contain meaningful bullet points extracted or reworded from the candidate resume.

3) OUTPUT THE TAILORED RESUME
Provide:
"tailoredResumeJson": "<STRINGIFIED_JSON>"

The JSON string MUST parse into this exact structure:
{
  "basics": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "summary": "",
    "photo": "",
    "links": [{ "label": "", "url": "" }]
  },
  "education": [{ "school": "", "degree": "", "year": "" }],
  "experience": [{ 
     "company": "", 
     "role": "", 
     "years": "", 
     "description": "- bullet1\\n- bullet2"
  }],
  "skills": [],
  "certifications": [],
  "languages": [],
  "customSections": [{ "title": "", "content": "" }]
}

STRICT OUTPUT RULES:
- DO NOT wrap JSON in backticks.
- DO NOT prepend explanations.
- DO NOT include markdown.
- DO NOT include extra text before or after the object keys.
- "tailoredResumeJson" MUST be a valid JSON STRING containing ONLY a JSON object.

4) ATS SCORE — TAILORED RESUME
- Provide "tailoredAtsScore" based on your rewritten resume.
  `,
});

/* -------------------------------------------------------------------------- */
/*                            JSON CLEANING UTILS                             */
/* -------------------------------------------------------------------------- */

function cleanJsonString(str: string): string {
  return str
    .trim()
    .replace(/^```json/i, '')
    .replace(/^```/, '')
    .replace(/```$/, '')
    .replace(/\n/g, '\\n')
    .trim();
}

/* -------------------------------------------------------------------------- */
/*                         TAILORED RESUME FLOW (MAIN)                        */
/* -------------------------------------------------------------------------- */

export async function generateTailoredResume(
  input: GenerateTailoredResumeInput
): Promise<GenerateTailoredResumeOutput> {
  return generateTailoredResumeFlow(input);
}

const generateTailoredResumeFlow = ai.defineFlow(
  {
    name: 'generateTailoredResumeFlow',
    inputSchema: GenerateTailoredResumeInputSchema,
    outputSchema: GenerateTailoredResumeOutputSchema,
  },
  async input => {
    const attempts = 2;
    let lastErr: any = null;

    for (let i = 0; i < attempts; i++) {
      try {
        const { output } = await resumePrompt(input);
        if (!output) throw new Error('AI returned empty output');

        // STEP 1 — CLEAN JSON STRING
        const cleaned = cleanJsonString(output.tailoredResumeJson);

        // STEP 2 — PARSE JSON
        let parsed;
        try {
          parsed = JSON.parse(cleaned);
        } catch (e) {
          throw new Error('Failed to parse JSON from tailoredResumeJson');
        }

        // STEP 3 — SCHEMA VALIDATION
        const validated = GenerateStructuredResumeOutputSchema.safeParse(parsed);

        if (!validated.success) {
          console.error("Resume validation failed", validated.error);
          throw new Error('AI returned invalid resume schema');
        }

        return {
          initialAtsScore: output.initialAtsScore,
          tailoredAtsScore: output.tailoredAtsScore,
          atsScoreBreakdown: output.atsScoreBreakdown,
          tailoredResume: validated.data,
        };
      } catch (err) {
        lastErr = err;
        console.warn(`Attempt ${i + 1} failed`, err);
        if (i === attempts - 1) throw err;
      }
    }

    throw lastErr;
  }
);

/* -------------------------------------------------------------------------- */
/*                       COVER LETTER / SKILL / INTERVIEW                     */
/* -------------------------------------------------------------------------- */

const coverLetterPrompt = ai.definePrompt({
  name: 'generateCoverLetterPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: GenerateTailoredResumeInputSchema },
  output: { schema: CoverLetterOutputSchema },
  prompt: `
You are an expert cover-letter writer. Write a concise, professional cover letter.
- Start with "Dear Hiring Manager," then a blank line.
- Use 3–4 short paragraphs separated by ONE blank line.
- Base everything ONLY on the resume and job description. No invented facts.
- Keep it left-aligned, plain text (no markdown).

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescription}}}
`,
});

export async function generateCoverLetter(input: GenerateTailoredResumeInput): Promise<CoverLetterOutput> {
  const { output } = await coverLetterPrompt(input);
  if (!output) throw new Error('AI returned no output for cover letter.');
  return output;
}

const skillAnalysisPrompt = ai.definePrompt({
  name: 'generateSkillAnalysisPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: GenerateTailoredResumeInputSchema },
  output: { schema: SkillAnalysisOutputSchema },
  prompt: `
You are an expert resume analyst. List integrated vs missing keywords and suggest real courses.

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescription}}}
`,
});

export async function generateSkillAnalysis(input: GenerateTailoredResumeInput): Promise<SkillAnalysisOutput> {
  const { output } = await skillAnalysisPrompt(input);
  if (!output) throw new Error('AI returned no output for skill analysis.');
  return output;
}

const interviewPrepPrompt = ai.definePrompt({
  name: 'generateInterviewPrepPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: GenerateTailoredResumeInputSchema },
  output: { schema: InterviewPrepOutputSchema },
  prompt: `
You are an expert interviewer. Generate concise Q&A pairs tailored to the resume and job.

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescription}}}
`,
});

export async function generateInterviewPrep(input: GenerateTailoredResumeInput): Promise<InterviewPrepOutput> {
  const { output } = await interviewPrepPrompt(input);
  if (!output) throw new Error('AI returned no output for interview prep.');
  return output;
}
