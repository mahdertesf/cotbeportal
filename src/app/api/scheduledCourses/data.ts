
export interface ScheduledCourse {
  scheduled_course_id: string;
  course_id: string | number;
  semester_id: string | number;
  teacher_id: string | number;
  room_id?: string | number | null;
  section_number: string;
  max_capacity: number;
  current_enrollment: number;
  days_of_week?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Initialize with default enrollment count, which will be updated by registrations
export let scheduledCoursesStore: ScheduledCourse[] = [
  { scheduled_course_id: 'sc-fall24-cs101-a', course_id: 'course-1', semester_id: 'sem-1', teacher_id: 'teacher-2', room_id: 'room-1', section_number: 'A', max_capacity: 50, current_enrollment: 0, days_of_week: 'MWF', start_time: '09:00', end_time: '09:50', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { scheduled_course_id: 'sc-fall24-ee305-a', course_id: 'course-5', semester_id: 'sem-1', teacher_id: 'teacher-1', room_id: 'room-2', section_number: 'A', max_capacity: 30, current_enrollment: 0, days_of_week: 'TTH', start_time: '13:00', end_time: '14:15', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];
