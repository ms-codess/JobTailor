
import { z } from 'zod';

// This schema should match the FormData type in src/app/build/page.tsx
export const GenerateStructuredResumeOutputSchema = z.object({
  basics: z.object({
    name: z.string().describe("The user's full name."),
    email: z.string().describe("The user's email address."),
    phone: z.string().describe("The user's phone number."),
    location: z.string().describe("The user's city and state (e.g., 'San Francisco, CA')."),
    summary: z.string().describe("A 2-3 sentence professional summary."),
    photo: z.string().optional().describe("The user's photo as a data URI, if provided."),
    links: z.array(z.object({
      label: z.string().describe("The label for the link (e.g., 'LinkedIn', 'GitHub', 'Portfolio')."),
      url: z.string().url().describe("The URL for the link."),
    })).describe("An array of the user's social/professional links."),
  }),
  education: z.array(z.object({
    school: z.string().describe("The name of the school or university."),
    degree: z.string().describe("The degree or field of study."),
    year: z.string().describe("The year of graduation or expected graduation."),
  })).describe("An array of the user's educational background."),
  experience: z.array(z.object({
    company: z.string().describe("The name of the company."),
    role: z.string().describe("The user's job title or role."),
    years: z.string().describe("The start and end years of the employment (e.g., '2020 - 2022', '2023 - Present')."),
    description: z.string().describe("A description of responsibilities and achievements. Each task/bullet point must be on a new line and start with '- '."),
  })).describe("An array of the user's work experience."),
  skills: z.array(z.string()).describe("A list of the user's skills."),
  certifications: z.array(z.string()).describe("A list of the user's certifications."),
  languages: z.array(z.string()).describe("A list of the user's spoken languages."),
  customSections: z.array(z.object({
    title: z.string().describe("The title of the custom section (e.g., 'Projects', 'Volunteering')."),
    content: z.string().describe("The content of the custom section."),
  })).describe("An array of any custom sections that do not fit into the standard categories."),
});

export type GenerateStructuredResumeOutput = z.infer<typeof GenerateStructuredResumeOutputSchema>;
