// src/app/api/courses/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { coursesStore } from '../data'; 

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const course = coursesStore.find(c => String(c.id) === String(id));
    if (course) {
      return NextResponse.json(course);
    }
    return NextResponse.json({ message: 'Course not found' }, { status: 404 });
  } catch (error) {
    console.error(`Error fetching course ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error fetching course', error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const courseData = await request.json();
    const courseIndex = coursesStore.findIndex(c => String(c.id) === String(id));
    if (courseIndex !== -1) {
      // Ensure course_code uniqueness if it's being changed
      if (courseData.course_code && courseData.course_code !== coursesStore[courseIndex].course_code) {
        if (coursesStore.some(c => c.course_code === courseData.course_code && String(c.id) !== String(id))) {
          return NextResponse.json({ message: `Course code "${courseData.course_code}" already exists.` }, { status: 409 });
        }
      }
      coursesStore[courseIndex] = {
        ...coursesStore[courseIndex],
        ...courseData,
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json(coursesStore[courseIndex]);
    }
    return NextResponse.json({ message: 'Course not found' }, { status: 404 });
  } catch (error) {
    console.error(`Error updating course ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error updating course', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const initialLength = coursesStore.length;
    const courseIndex = coursesStore.findIndex(c => String(c.id) === String(id));

    if (courseIndex === -1) {
        return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }
    
    coursesStore.splice(courseIndex, 1);

    if (coursesStore.length < initialLength) {
      return NextResponse.json({ success: true, message: 'Course deleted successfully' }, { status: 200 });
    }
    return NextResponse.json({ success: false, message: 'Course not found or deletion failed' }, { status: 404 });
  } catch (error) {
    console.error(`Error deleting course ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, message: 'Error deleting course', error: errorMessage }, { status: 500 });
  }
}
