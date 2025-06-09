
import { NextResponse, type NextRequest } from 'next/server';
import { registrationsStore, type Registration } from '../data';
import { scheduledCoursesStore } from '../../scheduledCourses/data';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // registration_id
    const registration = registrationsStore.find(reg => reg.registration_id === id);
    if (registration) {
      return NextResponse.json(registration);
    }
    return NextResponse.json({ message: 'Registration not found' }, { status: 404 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error fetching registration', error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // registration_id
    const data = await request.json(); // Can contain status, final_grade, grade_points
    const index = registrationsStore.findIndex(reg => reg.registration_id === id);

    if (index !== -1) {
      const oldStatus = registrationsStore[index].status;
      const newStatus = data.status || oldStatus;

      registrationsStore[index] = { 
        ...registrationsStore[index], 
        ...data, 
        updated_at: new Date().toISOString() 
      };

      if (oldStatus === 'Registered' && newStatus !== 'Registered') {
        const scIndex = scheduledCoursesStore.findIndex(sc => String(sc.scheduled_course_id) === String(registrationsStore[index].scheduled_course_id));
        if (scIndex !== -1) {
          scheduledCoursesStore[scIndex].current_enrollment = Math.max(0, scheduledCoursesStore[scIndex].current_enrollment - 1);
        }
      } else if (oldStatus !== 'Registered' && newStatus === 'Registered') {
         const scIndex = scheduledCoursesStore.findIndex(sc => String(sc.scheduled_course_id) === String(registrationsStore[index].scheduled_course_id));
        if (scIndex !== -1) {
          // Should ideally check capacity if changing *to* 'Registered', but PUT implies admin/grading action
          scheduledCoursesStore[scIndex].current_enrollment += 1;
        }
      }

      return NextResponse.json({success: true, data: registrationsStore[index]});
    }
    return NextResponse.json({ message: 'Registration not found' }, { status: 404 });
  } catch (error) {
    console.error("Error updating registration:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error updating registration', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // registration_id
    const regIndex = registrationsStore.findIndex(reg => reg.registration_id === id);

    if (regIndex === -1) {
        return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 });
    }
    
    const registration = registrationsStore[regIndex];
    
    registrationsStore.splice(regIndex, 1); // Remove the registration

    // Decrement enrollment count if it was a 'Registered' status
    if (registration.status === 'Registered') {
      const scIndex = scheduledCoursesStore.findIndex(sc => String(sc.scheduled_course_id) === String(registration.scheduled_course_id));
      if (scIndex !== -1) {
        scheduledCoursesStore[scIndex].current_enrollment = Math.max(0, scheduledCoursesStore[scIndex].current_enrollment - 1);
      }
    }
    return NextResponse.json({ success: true, message: 'Registration deleted successfully.' });
  } catch (error) {
    console.error("Error deleting registration:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error deleting registration', error: errorMessage }, { status: 500 });
  }
}
