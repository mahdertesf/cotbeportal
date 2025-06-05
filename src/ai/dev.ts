import { config } from 'dotenv';
config();

import '@/ai/flows/ask-gemini-about-course.ts';
import '@/ai/flows/get-gemini-academic-insights.ts';
import '@/ai/flows/get-gemini-assessment-ideas.ts';
import '@/ai/flows/get-gemini-feedback-suggestions.ts';
import '@/ai/flows/get-gemini-log-summary.ts';
import '@/ai/flows/get-gemini-portal-help.ts';
import '@/ai/flows/draft-gemini-announcement.ts';