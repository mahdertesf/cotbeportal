// src/app/api/semesters/data.ts
export interface Semester {
  id: string | number;
  name: string;
  academic_year: number;
  term: 'Semester One' | 'Semester Two' | 'Fall' | 'Spring' | 'Summer' | 'Winter';
  start_date: string; 
  end_date: string;   
  registration_start_date: string; 
  registration_end_date: string;   
  add_drop_start_date: string;     
  add_drop_end_date: string;       
  created_at?: string;
  updated_at?: string;
}

export let semestersStore: Semester[] = [
  { id: 'sem-1', name: 'Fall 2024', academic_year: 2024, term: 'Semester One', start_date: '2024-09-02', end_date: '2024-12-20', registration_start_date: '2024-07-15T09:00', registration_end_date: '2024-08-30T17:00', add_drop_start_date: '2024-09-02T09:00', add_drop_end_date: '2024-09-09T17:00', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sem-2', name: 'Spring 2025', academic_year: 2025, term: 'Semester Two', start_date: '2025-01-13', end_date: '2025-05-09', registration_start_date: '2024-11-15T09:00', registration_end_date: '2025-01-10T17:00', add_drop_start_date: '2025-01-13T09:00', add_drop_end_date: '2025-01-20T17:00', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];
