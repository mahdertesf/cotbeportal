
import { NextResponse, type NextRequest } from 'next/server';
import { assessmentsStore, type Assessment } from './data';

export async function GET(request: NextRequest) {
  try {
    const scheduledCourseIdParam = request.nextUrl.searchParams.get('scheduledCourseId');
    if (!scheduledCourseIdParam) {
      return NextResponse.json({ success: false, message: 'scheduledCourseId is required' }, { status: 400 });
    }
    // console.log('API GET assessments for scheduledCourseId:', scheduledCourseIdParam);
    const filteredAssessments = assessmentsStore.filter(a => String(a.scheduledCourseId) === String(scheduledCourseIdParam));
    // console.log('API GET assessments filtered:', filteredAssessments.length);
    return NextResponse.json(filteredAssessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, message: 'Error fetching assessments', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, description, max_score, due_date, type, scheduledCourseId } = data;

    if (!name || max_score === undefined || !due_date || !type || !scheduledCourseId) {
      return NextResponse.json({ success: false, message: 'Name, max_score, due_date, type, and scheduledCourseId are required' }, { status: 400 });
    }

    const newAssessment: Assessment = {
      id: `asm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      description: description || '',
      max_score: Number(max_score),
      due_date,
      type,
      scheduledCourseId: String(scheduledCourseId),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    assessmentsStore.push(newAssessment);
    return NextResponse.json({ success: true, data: newAssessment }, { status: 201 });
  } catch (error) {
    console.error("Error creating assessment:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, message: 'Error creating assessment', error: errorMessage }, { status: 500 });
  }
}
