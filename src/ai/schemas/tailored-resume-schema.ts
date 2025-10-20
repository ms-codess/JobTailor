
import { z } from 'zod';
import { GenerateStructuredResumeOutputSchema } from './resume-schema';

export const GenerateTailoredResumeInputSchema = z.object({
  resumeText: z.string().describe("The text content of the user's resume."),
  jobDescription: z.string().describe('The job description for resume tailoring.'),
});
export type GenerateTailoredResumeInput = z.infer<typeof GenerateTailoredResumeInputSchema>;

export const AtsScoreBreakdownSchema = z.object({
  roleMatch: z.object({
    score: z.number().min(0).max(100).describe("A score from 0-100 representing how well the resume's job titles match the desired role."),
    analysis: z.string().describe('A brief, 1-2 sentence analysis of the role match.'),
  }),
  experienceMatch: z.object({
    score: z.number().min(0).max(100).describe("A score from 0-100 representing how well the resume's experience aligns with the job requirements."),
    analysis: z.string().describe('A brief, 1-2 sentence analysis of the experience match.'),
  }),
  skillsMatch: z.object({
    score: z.number().min(0).max(100).describe('A score from 0-100 representing the keyword and skill alignment.'),
    analysis: z.string().describe('A brief, 1-2 sentence analysis of the skills match.'),
  }),
});

export const GenerateTailoredResumeOutputSchema = z.object({
  initialAtsScore: z.number().describe('A numerical score from 0-100 for the ORIGINAL resume against the job description.'),
  tailoredAtsScore: z.number().describe('A numerical score from 0-100 for the NEWLY TAILORED resume against the job description.'),
  atsScoreBreakdown: AtsScoreBreakdownSchema.describe("A structured breakdown of the initial ATS score, analyzing role, experience, and skills."),
  tailoredResume: GenerateStructuredResumeOutputSchema,
});
export type GenerateTailoredResumeOutput = z.infer<typeof GenerateTailoredResumeOutputSchema>;

export const CoverLetterOutputSchema = z.object({
  coverLetter: z.string().describe('A concise, natural-sounding cover letter tailored to the job description. It should be professional but not sound like it was written by an AI.'),
});
export type CoverLetterOutput = z.infer<typeof CoverLetterOutputSchema>;

export const SkillAnalysisOutputSchema = z.object({
  integratedKeywords: z.array(z.string()).describe('A concise list of key skills and keywords from the job description that have been integrated into the tailored resume.'),
  missingKeywords: z.array(z.string()).describe('A concise list of important skills from the job description that could not be realistically integrated into the resume.'),
  suggestedCertifications: z.array(z.object({
    name: z.string().describe('The name of the suggested course or certification.'),
    url: z.string().url().describe('A relevant URL to find the course (e.g., on Coursera, Udemy, or an official site).')
  })).describe('A list of suggested courses or certifications with links, based on the identified skill gaps.'),
});
export type SkillAnalysisOutput = z.infer<typeof SkillAnalysisOutputSchema>;

export const InterviewPrepOutputSchema = z.object({
    interviewQA: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).describe('A list of potential interview questions and answers based on the job and resume.'),
});
export type InterviewPrepOutput = z.infer<typeof InterviewPrepOutputSchema>;
