
import { NextResponse, type NextRequest } from 'next/server';
import { scheduledCoursesStore } from '../data';
// Import registrationsStore if cascade delete is needed for in-memory
// import { registrationsStore } from '../../registrations/data'; 

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const scheduledCourse = scheduledCoursesStore.find(sc => sc.scheduled_course_id === id);
    if (scheduledCourse) {
      // Optionally enrich here if needed for a single view, similar to GET all
      return NextResponse.json(scheduledCourse);
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
    const initialLength = scheduledCoursesStore.length;
    // It's important to reassign the filtered array back to the original store variable
    // if it's imported and mutated elsewhere (like in registrations API).
    // For this simple mock, we'll assume direct mutation is okay if `data.ts` exports `let`.
    let found = false;
    const newStore = scheduledCoursesStore.filter(sc => {
        if (sc.scheduled_course_id === id) {
            found = true;
            return false;
        }
        return true;
    });

    if (found) {
      // Update the actual store if it's exported as `let`
      // This direct reassignment won't work if it's a const import.
      // A better pattern for mutable stores is to use functions to modify them.
      // For now, this implies `scheduledCoursesStore` in `../data` is `let`.
      // To ensure this works:
      // 1. Make sure `scheduledCoursesStore` is `export let`.
      // 2. Or, modify the array in place:
      const indexToDelete = scheduledCoursesStore.findIndex(sc => sc.scheduled_course_id === id);
      if (indexToDelete > -1) {
          scheduledCoursesStore.splice(indexToDelete, 1);
          // If registrationsStore was imported, you'd filter it here too
          // registrationsStore = registrationsStore.filter(reg => reg.scheduled_course_id !== id);
          return NextResponse.json({ success: true, message: 'Scheduled course deleted' });
      }
    }
    return NextResponse.json({ message: 'Scheduled course not found' }, { status: 404 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error deleting scheduled course', error: errorMessage }, { status: 500 });
  }
}
