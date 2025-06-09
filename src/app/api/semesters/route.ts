// src/app/api/semesters/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { semestersStore, type Semester } from './data';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(semestersStore);
  } catch (error) {
    console.error("Error fetching semesters:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error fetching semesters', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const semesterData = await request.json();
    // Add more robust validation as needed
    if (!semesterData.name || !semesterData.academic_year || !semesterData.term || !semesterData.start_date || !semesterData.end_date) {
        return NextResponse.json({ message: 'Required semester fields are missing' }, { status: 400 });
    }
    
    if (semestersStore.some(s => s.name === semesterData.name)) {
        return NextResponse.json({ message: `Semester name "${semesterData.name}" already exists.` }, { status: 409 });
    }

    const newSemester: Semester = {
      id: `sem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...semesterData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    semestersStore.push(newSemester);
    return NextResponse.json(newSemester, { status: 201 });
  } catch (error) {
    console.error("Error creating semester:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error creating semester', error: errorMessage }, { status: 500 });
  }
}
