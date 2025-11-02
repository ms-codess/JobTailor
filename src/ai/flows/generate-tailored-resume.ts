
'use server';

/**
 * @fileOverview Generates a tailored resume, cover letter, ATS report, skill gaps analysis, and interview Q&A using AI.
 *
 * - generateTailoredResume - A function that generates tailored job application materials.
 * - generateCoverLetter - A function that generates a cover letter.
 * - generateSkillAnalysis - A function that generates a skill analysis.
 * - generateInterviewPrep - A function that generates interview prep materials.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateTailoredResumeInputSchema,
  GenerateTailoredResumeInput,
  GenerateTailoredResumeOutputSchema,
  GenerateTailoredResumeOutput,
  CoverLetterOutputSchema,
  CoverLetterOutput,
  SkillAnalysisOutputSchema,
  SkillAnalysisOutput,
  InterviewPrepOutputSchema,
  InterviewPrepOutput,
} from '../schemas/tailored-resume-schema';

// Re-export common types for convenience in UI components
export type {
  GenerateTailoredResumeInput,
  GenerateTailoredResumeOutput,
  CoverLetterOutput,
  SkillAnalysisOutput,
  InterviewPrepOutput,
} from '../schemas/tailored-resume-schema';


// Main function for initial report (Resume + Scores)
export async function generateTailoredResume(
  input: GenerateTailoredResumeInput
): Promise<GenerateTailoredResumeOutput> {
  return generateTailoredResumeFlow(input);
}

// Function for Cover Letter
export async function generateCoverLetter(input: GenerateTailoredResumeInput): Promise<CoverLetterOutput> {
    return generateCoverLetterFlow(input);
}

// Function for Skill Analysis
export async function generateSkillAnalysis(input: GenerateTailoredResumeInput): Promise<SkillAnalysisOutput> {
    return generateSkillAnalysisFlow(input);
}

// Function for Interview Prep
export async function generateInterviewPrep(input: GenerateTailoredResumeInput): Promise<InterviewPrepOutput> {
    return generateInterviewPrepFlow(input);
}


// Main prompt for Resume + Scores
const resumePrompt = ai.definePrompt({
  name: 'generateTailoredResumePrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: GenerateTailoredResumeInputSchema},
  output: {schema: GenerateTailoredResumeOutputSchema},
  prompt: `You are an expert resume tailor and career coach. Given a resume and a job description, you will generate a tailored resume and analyze its effectiveness.

Resume to be tailored:
{{{resumeText}}}

Job Description to tailor for:
{{{jobDescription}}}

Follow these instructions precisely (strict non-hallucination policy):

1.  **Calculate Initial ATS Score & Breakdown**: First, analyze the original resume against the job description.
    - Provide an overall ATS score from 0-100 for it in the 'initialAtsScore' field.
    - Provide a structured breakdown of this score in 'atsScoreBreakdown'. For each of 'roleMatch', 'experienceMatch', and 'skillsMatch', calculate a 0-100 score and write a brief 1-2 sentence analysis.
2.  **Generate Tailored Resume (No Inventions)**: Adapt the user's existing resume to better match the job description.
    - Preserve all factual information from the original resume (roles, companies, dates, education, certifications). Do NOT invent new employers, roles, dates, degrees, certifications, or projects.
    - Do NOT add new tools/technologies/skills unless they are already present or clearly implied by the user's existing responsibilities. If a keyword from the job description cannot be supported by the user's stated experience, do NOT include it.
    - Keep original responsibilities and achievements. You may lightly rephrase and weave in supported keywords, but do not remove content or fabricate outcomes.
    - The output for 'tailoredResume' MUST be a structured JSON object. Each task/bullet point in the experience description must start with '- ' and be on a new line.
3.  **Calculate Tailored ATS Score**: Analyze the NEWLY TAILORED resume you just created and provide a new ATS score for it in the 'tailoredAtsScore' field.

DO NOT generate a cover letter, skill gap analysis, or interview questions. Focus only on the resume and scores.
Never invent details not grounded in the provided resume text.
`,
});

const generateTailoredResumeFlow = ai.defineFlow(
  {
    name: 'generateTailoredResumeFlow',
    inputSchema: GenerateTailoredResumeInputSchema,
    outputSchema: GenerateTailoredResumeOutputSchema,
  },
  async input => {
    const {output} = await resumePrompt(input);
    if (!output || !output.atsScoreBreakdown) {
      throw new Error('AI returned incomplete output for resume generation.');
    }
    return output;
  }
);

// Prompt for Cover Letter
const coverLetterPrompt = ai.definePrompt({
    name: 'generateCoverLetterPrompt',
    model: 'googleai/gemini-2.5-flash',
    input: { schema: GenerateTailoredResumeInputSchema },
    output: { schema: CoverLetterOutputSchema },
    prompt: `You are an expert career coach. Given a resume and a job description, write a professional, concise, and natural-sounding cover letter. It must be tailored to the job description and highlight skills from the resume.

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescription}}}
`,
});

const generateCoverLetterFlow = ai.defineFlow({
    name: 'generateCoverLetterFlow',
    inputSchema: GenerateTailoredResumeInputSchema,
    outputSchema: CoverLetterOutputSchema,
}, async (input) => {
    const { output } = await coverLetterPrompt(input);
    if (!output) throw new Error('AI returned no output for cover letter.');
    return output;
});

// Prompt for Skill Analysis
const skillAnalysisPrompt = ai.definePrompt({
    name: 'generateSkillAnalysisPrompt',
    model: 'googleai/gemini-2.5-flash',
    input: { schema: GenerateTailoredResumeInputSchema },
    output: { schema: SkillAnalysisOutputSchema },
    prompt: `You are an expert resume analyst. Analyze the provided resume against the job description under a strict non-hallucination policy.

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescription}}}

Follow these instructions:
1.  **Analyze Skill Gaps**: Identify the critical skills and keywords present in the job description that were missing from the original resume.
2.  **Report on Integrated vs. Missing Keywords**: Assume a colleague has already created a 'tailored resume'. Based on the original resume and the job description, create a list of 'integratedKeywords' (skills that could be realistically added without inventing experience; must be supported or clearly implied by the resume) and 'missingKeywords' (skills that represent a genuine gap and should NOT be added).
3.  **Suggest Certifications with Links**: Based on the identified skill gaps, suggest relevant online courses or certifications. For each suggestion, provide a 'name' and a 'url'.
`,
});

const generateSkillAnalysisFlow = ai.defineFlow({
    name: 'generateSkillAnalysisFlow',
    inputSchema: GenerateTailoredResumeInputSchema,
    outputSchema: SkillAnalysisOutputSchema,
}, async (input) => {
    const { output } = await skillAnalysisPrompt(input);
    if (!output) throw new Error('AI returned no output for skill analysis.');
    return output;
});


// Prompt for Interview Prep
const interviewPrepPrompt = ai.definePrompt({
    name: 'generateInterviewPrepPrompt',
    model: 'googleai/gemini-2.5-flash',
    input: { schema: GenerateTailoredResumeInputSchema },
    output: { schema: InterviewPrepOutputSchema },
    prompt: `You are an expert career coach. Given a resume and a job description, create a list of likely interview questions and provide strong, concise answers.

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescription}}}
`,
});

const generateInterviewPrepFlow = ai.defineFlow({
    name: 'generateInterviewPrepFlow',
    inputSchema: GenerateTailoredResumeInputSchema,
    outputSchema: InterviewPrepOutputSchema,
}, async (input) => {
    const { output } = await interviewPrepPrompt(input);
    if (!output) throw new Error('AI returned no output for interview prep.');
    return output;
});
