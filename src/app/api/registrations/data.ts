
export interface Registration {
  registration_id: string;
  student_id: string | number;
  scheduled_course_id: string | number;
  registration_date: string;
  status: 'Registered' | 'Dropped' | 'Completed' | 'Waitlisted';
  final_grade?: string | null;
  grade_points?: number | null;
  updated_at?: string;
}

// Initial registrations based on the new scheduled_course_id structure.
// current_enrollment in scheduledCoursesStore should be 0 initially,
// and incremented by POST /api/registrations.
// For demo, manually set initial enrollments after defining registrations if needed for testing UI.
export let registrationsStore: Registration[] = [
  // Student 'stud1' (Abebe Bekele)
  { registration_id: 'reg-1', student_id: 'stud1', scheduled_course_id: 'sc-fall24-cs101-a', registration_date: new Date(Date.now() - 2*24*60*60*1000).toISOString(), status: 'Registered', final_grade: null, grade_points: null, updated_at: new Date().toISOString() },
  { registration_id: 'reg-3', student_id: 'stud1', scheduled_course_id: 'sc-fall24-ee305-a', registration_date: new Date(Date.now() - 1*24*60*60*1000).toISOString(), status: 'Registered', final_grade: null, grade_points: null, updated_at: new Date().toISOString() },
  
  // Student 'stud2' (Hana Girma)
  { registration_id: 'reg-2', student_id: 'stud2', scheduled_course_id: 'sc-fall24-cs101-a', registration_date: new Date(Date.now() - 2*24*60*60*1000).toISOString(), status: 'Registered', final_grade: null, grade_points: null, updated_at: new Date().toISOString() },
];

// Initialize current_enrollment in scheduledCoursesStore based on these initial registrations
// This is a helper for mock data setup. In a real DB, this would be handled by triggers or aggregates.
import { scheduledCoursesStore } from '../scheduledCourses/data';

function initializeEnrollmentCounts() {
  scheduledCoursesStore.forEach(sc => {
    sc.current_enrollment = registrationsStore.filter(reg => 
      reg.scheduled_course_id === sc.scheduled_course_id && reg.status === 'Registered'
    ).length;
  });
}
initializeEnrollmentCounts();
