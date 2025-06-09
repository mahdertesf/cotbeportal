
import { NextResponse, type NextRequest } from 'next/server';
import { scheduledCoursesStore } from '../data';
import { coursesStore } from '../../courses/data';
import { semestersStore } from '../../semesters/data';
import { usersStore } from '../../users/data';
import { roomsStore } from '../../rooms/data';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const scheduledCourse = scheduledCoursesStore.find(sc => sc.scheduled_course_id === id);
    
    if (scheduledCourse) {
      const course = coursesStore.find(c => String(c.id) === String(scheduledCourse.course_id));
      const semester = semestersStore.find(s => String(s.id) === String(scheduledCourse.semester_id));
      const teacher = usersStore.find(u => String(u.user_id) === String(scheduledCourse.teacher_id) && u.role === 'Teacher');
      const room = roomsStore.find(r => String(r.id) === String(scheduledCourse.room_id));
      
      const enrichedScheduledCourse = {
        ...scheduledCourse,
        course_code: course?.course_code,
        title: course?.title,
        credits: course?.credits,
        description: course?.description,
        prerequisites: [], // Placeholder
        semester_name: semester?.name,
        teacher_name: teacher ? `${teacher.first_name} ${teacher.last_name}` : 'N/A',
        room_display_name: room ? `${room.room_number} (${room.building_name || 'N/A'})` : 'N/A',
        schedule: `${scheduledCourse.days_of_week || ''} ${scheduledCourse.start_time || ''}-${scheduledCourse.end_time || ''}`.trim(),
      };
      return NextResponse.json(enrichedScheduledCourse);
    }
    return NextResponse.json({ message: 'Scheduled course not found' }, { status: 404 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error fetching scheduled course', error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const data = await request.json();
    const index = scheduledCoursesStore.findIndex(sc => sc.scheduled_course_id === id);
    if (index !== -1) {
      const current = scheduledCoursesStore[index];
      const updatedCourseId = data.course_id !== undefined ? String(data.course_id) : String(current.course_id);
      const updatedSemesterId = data.semester_id !== undefined ? String(data.semester_id) : String(current.semester_id);
      const updatedSectionNumber = data.section_number !== undefined ? data.section_number : current.section_number;

      if ( (data.course_id !== undefined && String(data.course_id) !== String(current.course_id)) ||
           (data.semester_id !== undefined && String(data.semester_id) !== String(current.semester_id)) ||
           (data.section_number !== undefined && data.section_number !== current.section_number) ) {
            if (scheduledCoursesStore.some(sc => 
                String(sc.course_id) === updatedCourseId &&
                String(sc.semester_id) === updatedSemesterId &&
                sc.section_number === updatedSectionNumber &&
                sc.scheduled_course_id !== id
            )) {
                return NextResponse.json({ success: false, error: `Section "${updatedSectionNumber}" for this course in this semester already exists.` }, { status: 409 });
            }
      }
      
      scheduledCoursesStore[index] = { ...scheduledCoursesStore[index], ...data, updated_at: new Date().toISOString() };
      return NextResponse.json({success: true, data: scheduledCoursesStore[index]});
    }
    return NextResponse.json({ message: 'Scheduled course not found' }, { status: 404 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error updating scheduled course', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    const indexToDelete = scheduledCoursesStore.findIndex(sc => sc.scheduled_course_id === id);
    if (indexToDelete > -1) {
        scheduledCoursesStore.splice(indexToDelete, 1);
        // Note: In a real DB, ON DELETE CASCADE would handle related registrations.
        // For in-memory, if registrationsStore was managed here, you'd filter it.
        return NextResponse.json({ success: true, message: 'Scheduled course deleted' });
    }
    return NextResponse.json({ message: 'Scheduled course not found' }, { status: 404 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error deleting scheduled course', error: errorMessage }, { status: 500 });
  }
}
