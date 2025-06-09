
import { NextResponse, type NextRequest } from 'next/server';
import { registrationsStore, type Registration } from './data';
import { scheduledCoursesStore } from '../scheduledCourses/data';
import { coursesStore } from '../courses/data';
import { usersStore } from '../users/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const scheduledCourseIdParam = searchParams.get('scheduledCourseId');

    let results = [...registrationsStore];

    if (studentId) {
      results = results.filter(reg => String(reg.student_id) === String(studentId));
      results = results.map(reg => {
        const sc = scheduledCoursesStore.find(s => String(s.scheduled_course_id) === String(reg.scheduled_course_id));
        const course = sc ? coursesStore.find(c => String(c.id) === String(sc.course_id)) : null;
        return {
          ...reg,
          course_code: course?.course_code,
          title: course?.title,
        };
      });
    } else if (scheduledCourseIdParam) {
      results = results.filter(reg => String(reg.scheduled_course_id) === String(scheduledCourseIdParam));
       results = results.map(reg => {
        const student = usersStore.find(u => String(u.user_id) === String(reg.student_id));
        return {
            ...reg,
            first_name: student?.first_name,
            last_name: student?.last_name,
            email: student?.email,
            // Include existing grade details if already present in registration record
            current_final_grade: reg.final_grade,
            current_grade_points: reg.grade_points,
        };
      });
    }
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error fetching registrations', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { student_id, scheduled_course_id, manualOverride = false } = data;

    if (!student_id || !scheduled_course_id) {
      return NextResponse.json({ success: false, error: 'Student ID and Scheduled Course ID are required' }, { status: 400 });
    }

    if (registrationsStore.some(reg => String(reg.student_id) === String(student_id) && String(reg.scheduled_course_id) === String(scheduled_course_id) && (reg.status === 'Registered' || reg.status === 'Waitlisted'))) {
      return NextResponse.json({ success: false, error: 'Student already registered or waitlisted for this course.' }, { status: 409 });
    }

    const scIndex = scheduledCoursesStore.findIndex(sc => String(sc.scheduled_course_id) === String(scheduled_course_id));
    if (scIndex === -1) {
        return NextResponse.json({ success: false, error: 'Scheduled course not found.' }, { status: 404 });
    }
    
    const courseToRegister = scheduledCoursesStore[scIndex];
    let registrationStatus: Registration['status'] = 'Registered';
    let message = `Student successfully registered for course.`;

    if (!manualOverride) {
        // TODO: Add checks for registration period from Semesters API if needed
        if (courseToRegister.current_enrollment >= courseToRegister.max_capacity) {
            return NextResponse.json({ success: false, error: 'Course is full.' }, { status: 409 });
        }
    } else {
        if (courseToRegister.current_enrollment >= courseToRegister.max_capacity) {
            message += ` (Capacity may be exceeded by manual override).`;
        }
    }

    const newRegistration: Registration = {
      registration_id: `reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      student_id: String(student_id),
      scheduled_course_id: String(scheduled_course_id),
      registration_date: new Date().toISOString(),
      status: registrationStatus,
      updated_at: new Date().toISOString(),
    };
    registrationsStore.push(newRegistration);

    if (registrationStatus === 'Registered') {
        scheduledCoursesStore[scIndex].current_enrollment += 1;
    }

    return NextResponse.json({ success: true, message: message, data: newRegistration }, { status: 201 });
  } catch (error) {
    console.error("Error creating registration:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error creating registration', error: errorMessage }, { status: 500 });
  }
}
