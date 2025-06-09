// src/app/api/courses/data.ts
export interface Course {
  id: string | number;
  course_code: string;
  title: string;
  description?: string | null;
  credits: number;
  department_id: string | number;
  created_at?: string;
  updated_at?: string;
}

export let coursesStore: Course[] = [
  {id: 'course-1', course_code: 'CS101', title: 'Introduction to Programming', description: 'Fundamentals of programming using Python.', credits: 3, department_id: 'dept-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
  {id: 'course-2', course_code: 'EE201', title: 'Circuit Theory I', description: 'Basic electric circuit analysis.', credits: 4, department_id: 'dept-2', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
  {id: 'course-3', course_code: 'MECH210', title: 'Statics', description: 'Principles of engineering mechanics.', credits: 3, department_id: 'dept-3', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
  {id: 'course-4', course_code: 'CS350', title: 'Software Engineering', description: 'Software development lifecycle and methodologies.', credits: 3, department_id: 'dept-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
  {id: 'course-5', course_code: 'EE305', title: 'Digital Logic Design', description: 'Design and analysis of digital circuits.', credits: 3, department_id: 'dept-2', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
];
