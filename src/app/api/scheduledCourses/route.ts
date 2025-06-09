
import { NextResponse, type NextRequest } from 'next/server';
import { scheduledCoursesStore, type ScheduledCourse } from './data';
import { coursesStore } from '../courses/data';
import { semestersStore } from '../semesters/data';
import { usersStore } from '../users/data'; // Assuming usersStore contains teacher info
import { roomsStore } from '../rooms/data';   // Assuming roomsStore contains building_name

export async function GET(request: NextRequest) {
  try {
    // Enrich scheduled courses with details from related stores
    const enrichedScheduledCourses = scheduledCoursesStore.map(sc => {
        const course = coursesStore.find(c => String(c.id) === String(sc.course_id));
        const semester = semestersStore.find(s => String(s.id) === String(sc.semester_id));
        const teacher = usersStore.find(u => String(u.user_id) === String(sc.teacher_id) && u.role === 'Teacher');
        const room = roomsStore.find(r => String(r.id) === String(sc.room_id));
        return {
            ...sc,
            course_code: course?.course_code,
            title: course?.title,
            credits: course?.credits, // Added credits
            description: course?.description, // Added description
            prerequisites: [], // Placeholder for prerequisites,
            semester_name: semester?.name,
            teacher_name: teacher ? `${teacher.first_name} ${teacher.last_name}` : 'N/A',
            room_name: room ? `${room.room_number} (${room.building_name || 'N/A'})` : 'N/A', // Use room_name convention
            schedule: `${sc.days_of_week || ''} ${sc.start_time || ''}-${sc.end_time || ''}`.trim(), // Construct schedule string
        };
    });
    return NextResponse.json(enrichedScheduledCourses);
  } catch (error) {
    console.error("Error fetching scheduled courses:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error fetching scheduled courses', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.course_id || !data.semester_id || !data.teacher_id || !data.section_number || data.max_capacity === undefined) {
      return NextResponse.json({ message: 'Missing required fields for scheduled course' }, { status: 400 });
    }

    if (scheduledCoursesStore.some(sc => 
        String(sc.course_id) === String(data.course_id) &&
        String(sc.semester_id) === String(data.semester_id) &&
        sc.section_number === data.section_number
    )) {
        return NextResponse.json({ success: false, error: `Section "${data.section_number}" for this course in this semester already exists.` }, { status: 409 });
    }

    const newScheduledCourse: ScheduledCourse = {
      scheduled_course_id: `sc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      course_id: data.course_id,
      semester_id: data.semester_id,
      teacher_id: data.teacher_id,
      room_id: data.room_id || null,
      section_number: data.section_number,
      max_capacity: data.max_capacity,
      current_enrollment: data.current_enrollment || 0,
      days_of_week: data.days_of_week || null,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    scheduledCoursesStore.push(newScheduledCourse);
    return NextResponse.json({success: true, data: newScheduledCourse}, { status: 201 });
  } catch (error) {
    console.error("Error creating scheduled course:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error creating scheduled course', error: errorMessage }, { status: 500 });
  }
}
