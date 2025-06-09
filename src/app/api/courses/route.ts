// src/app/api/courses/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { coursesStore, type Course } from './data';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(coursesStore);
  } catch (error) {
    console.error("Error fetching courses:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error fetching courses', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const courseData = await request.json();
    if (!courseData.course_code || !courseData.title || !courseData.credits || !courseData.department_id) {
        return NextResponse.json({ message: 'Course code, title, credits, and department ID are required' }, { status: 400 });
    }
    
    if (coursesStore.some(c => c.course_code === courseData.course_code)) {
        return NextResponse.json({ message: `Course code "${courseData.course_code}" already exists.` }, { status: 409 });
    }

    const newCourse: Course = {
      id: `course-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      course_code: courseData.course_code,
      title: courseData.title,
      description: courseData.description || null,
      credits: courseData.credits,
      department_id: courseData.department_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    coursesStore.push(newCourse);
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error creating course', error: errorMessage }, { status: 500 });
  }
}
