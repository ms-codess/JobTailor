
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-resume-polishing.ts';
import '@/ai/flows/generate-tailored-resume.ts';
import '@/ai/flows/generate-structured-resume.ts';
import '@/ai/flows/extract-text-from-image.ts';
import '@/ai/flows/suggest-career-path.ts';
import '@/ai/flows/instant-ats-preview.ts';
import '@/ai/schemas/resume-schema.ts';
import '@/ai/schemas/tailored-resume-schema.ts';
