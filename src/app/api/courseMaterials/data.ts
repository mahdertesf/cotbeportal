
// src/app/api/courseMaterials/data.ts
export interface CourseMaterial {
  id: string;
  title: string;
  description?: string | null;
  material_type: 'File' | 'Link';
  file_path?: string | null;
  url?: string | null;
  scheduled_course_id: string | number;
  created_at?: string;
  updated_at?: string;
}

export let courseMaterialsStore: CourseMaterial[] = [
  { id: 'cm-1', title: 'Lecture 1 Slides', description: 'Introduction to CS101', material_type: 'File', file_path: '/materials/cs101_lec1.pdf', scheduled_course_id: 'sc-fall24-cs101-a', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cm-2', title: 'Syllabus CS101', material_type: 'File', file_path: '/materials/cs101_syllabus.pdf', scheduled_course_id: 'sc-fall24-cs101-a', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cm-3', title: 'Digital Logic Gates Tutorial', material_type: 'Link', url: 'https://example.com/digital-logic-tutorial', scheduled_course_id: 'sc-fall24-ee305-a', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cm-4', title: 'Thermodynamics Notes Chapter 1', material_type: 'File', file_path: '/materials/mech210_ch1.pdf', scheduled_course_id: 'sc-spring25-mech210-a', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];
