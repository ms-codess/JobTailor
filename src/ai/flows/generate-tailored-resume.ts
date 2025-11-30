
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
import {z} from 'zod';
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
  AtsScoreBreakdownSchema,
} from '../schemas/tailored-resume-schema';
import {GenerateStructuredResumeOutputSchema} from '../schemas/resume-schema';

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
const TailoredResumeModelOutputSchema = z.object({
  initialAtsScore: z.number().describe('ATS score for the original resume.'),
  tailoredAtsScore: z.number().describe('ATS score for the tailored resume.'),
  atsScoreBreakdown: AtsScoreBreakdownSchema.describe('Breakdown of initial ATS score.'),
  tailoredResumeJson: z
    .string()
    .describe(
      'A JSON string matching the GenerateStructuredResumeOutputSchema format (basics, education, experience, skills, certifications, languages, customSections).'
    ),
});

const resumePrompt = ai.definePrompt({
  name: 'generateTailoredResumePrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: GenerateTailoredResumeInputSchema},
  output: {schema: TailoredResumeModelOutputSchema},
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
    - Use all relevant text in the provided resume; do not drop bullets, sections, or details that map to the schema. If a detail fits an existing section, keep it there rather than creating a new section. Every job must keep its original task bullets; do not leave experience descriptions empty. Tailor by rewording/ordering the existing bullets, NOT by inventing new ones. Preserve extra sections like Honors & Activities/Projects by placing them in customSections.
    - If the resume contains a thesis/dissertation, place it under the corresponding education entry (e.g., master’s degree) as inline text; do NOT create a separate section or bold title for it.
    - Only create a 'customSections' entry when content truly does not belong elsewhere. Do not create empty honors/activities; omit the section if there is no content.
    - For links (LinkedIn, portfolio, etc.), ONLY include links explicitly present in the provided resume text. Do not invent or alter URLs. If no links are present, leave the links array empty.
    - Fill every section of the schema using only the user-provided resume data (basics, education, experience, skills, certifications, languages). Do NOT create new sections; use 'customSections' only when content truly does not belong in the standard sections. If no content exists for a section, leave it as an empty array/string rather than inventing content.
    - The output for 'tailoredResumeJson' MUST be a JSON string. It must parse into an object with keys: basics { name, email, phone, location, summary, photo?, links: [{label,url}] }, education [{school, degree, year}], experience [{company, role, years, description (each bullet on new line starting with "- ")}], skills [], certifications [], languages [], customSections [{title, content}].
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
    const { output } = await resumePrompt(input);
    if (!output || !output.atsScoreBreakdown || !output.tailoredResumeJson) {
      throw new Error('AI returned incomplete output for resume generation.');
    }
    try {
      const raw = (() => {
        try {
          return JSON.parse(output.tailoredResumeJson);
        } catch {
          return {};
        }
      })();
      const repaired = repairTailoredResume(raw);
      const parsed = GenerateStructuredResumeOutputSchema.safeParse(repaired);
      if (!parsed.success) {
        console.error('Tailored resume failed validation after repair', parsed.error);
        throw new Error('AI returned an invalid tailored resume JSON structure.');
      }
      const parsedResume = parsed.data;
      return {
        initialAtsScore: output.initialAtsScore,
        tailoredAtsScore: output.tailoredAtsScore,
        atsScoreBreakdown: output.atsScoreBreakdown,
        tailoredResume: parsedResume,
      };
    } catch (err) {
      console.error('Failed to parse tailored resume JSON from AI.', err);
      throw new Error('AI returned an invalid tailored resume JSON structure.');
    }
  }
);

function repairTailoredResume(raw: any) {
  const asString = (value: any, fallback = '') =>
    typeof value === 'string' ? value : fallback;
  const asArray = (value: any) => (Array.isArray(value) ? value : []);

  const basics = raw?.basics ?? {};
  const links = asArray(basics.links)
    .map((l: any, idx: number) => {
      const url = asString(l?.url ?? l?.href ?? '', '').trim();
      return {
        label: asString(l?.label, url ? l?.label ?? `Link ${idx + 1}` : ''),
        url,
      };
    })
    .filter((l: any) => l.url && /^(https?:\/\/|mailto:)/i.test(l.url));

  const normalizeExperience = asArray(raw?.experience).map((exp: any) => ({
    company: asString(exp?.company),
    role: asString(exp?.role),
    years: asString(exp?.years),
    description: (() => {
      const desc = asString(exp?.description, '');
      const lines = desc
        .split('\n')
        .map((line: string) => line.trim())
        .filter(Boolean);
      let bullets = lines.map(line => (line.startsWith('-') ? line : `- ${line}`));
      // If no line breaks provided, split sentences into bullets
      if (bullets.length === 1 && !bullets[0].includes('\n') && !bullets[0].startsWith('- ')) {
        const sentenceBullets = bullets[0]
          .split(/(?<=[.?!])\s+/)
          .map(s => s.trim())
          .filter(Boolean)
          .map(s => (s.startsWith('-') ? s : `- ${s}`));
        if (sentenceBullets.length > 0) bullets = sentenceBullets;
      }
      return bullets.join('\n');
    })(),
  }));

  const normalizeEducation = asArray(raw?.education).map((edu: any) => ({
    school: asString(edu?.school),
    degree: asString(edu?.degree),
    year: asString(edu?.year),
  }));

  let normalizeCustomSections = asArray(raw?.customSections)
    .map((section: any) => ({
      title: asString(section?.title),
      content: asString(section?.content),
    }))
    .filter((section: any) => section.title || section.content);

  // Move thesis content into matching education entry if present; keep bullets in a dedicated section
  const thesisIdx = normalizeCustomSections.findIndex(s =>
    (s.title || '').toLowerCase().includes('thesis')
  );
  if (thesisIdx >= 0 && normalizeEducation.length > 0) {
    const thesis = normalizeCustomSections[thesisIdx];
    const targetEduIdx =
      normalizeEducation.findIndex(e => e.degree.toLowerCase().includes('m.')) !== -1
        ? normalizeEducation.findIndex(e => e.degree.toLowerCase().includes('m.'))
        : 0;
    const edu = normalizeEducation[targetEduIdx];
    const thesisText = `${thesis.title}${thesis.content ? ` — ${thesis.content}` : ''}`;
    // Keep thesis inline and concise (single line) under degree
    normalizeEducation[targetEduIdx] = {
      ...edu,
      degree: edu.degree ? `${edu.degree} — Thesis: ${thesisText}` : `Thesis: ${thesisText}`,
    };
    // Drop detailed thesis section to avoid wall of text
    normalizeCustomSections = normalizeCustomSections.filter((_, idx) => idx !== thesisIdx);
  }

  const ensureHasBasics = (key: keyof typeof basics) => asString((basics as any)[key]);

  return {
    basics: {
      name: ensureHasBasics('name'),
      email: ensureHasBasics('email'),
      phone: ensureHasBasics('phone'),
      location: ensureHasBasics('location'),
      summary: ensureHasBasics('summary'),
      photo: basics.photo ? asString(basics.photo) : undefined,
      links,
    },
    education: normalizeEducation,
    experience: normalizeExperience,
    skills: asArray(raw?.skills).map((s: any) => asString(s)).filter(Boolean),
    certifications: asArray(raw?.certifications).map((c: any) => asString(c)).filter(Boolean),
    languages: asArray(raw?.languages).map((l: any) => asString(l)).filter(Boolean),
    customSections: normalizeCustomSections,
  };
}

function getEmptyResume(seed: Partial<ReturnType<typeof repairTailoredResume>>) {
  return {
    basics: {
      name: seed.basics?.name || '',
      email: seed.basics?.email || '',
      phone: seed.basics?.phone || '',
      location: seed.basics?.location || '',
      summary: seed.basics?.summary || '',
      photo: seed.basics?.photo,
      links: seed.basics?.links || [],
    },
    education: seed.education || [],
    experience: seed.experience || [],
    skills: seed.skills || [],
    certifications: seed.certifications || [],
    languages: seed.languages || [],
    customSections: seed.customSections || [],
  };
}

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
3.  **Suggest Certifications with Links**: Based on the identified skill gaps, suggest relevant online courses or certifications. For each suggestion, provide a 'name' and a 'url'. URLs must be real, direct, and from reputable providers (Coursera, edX, Udemy, vendor sites, etc.); do NOT use placeholders or generic homepages.
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
