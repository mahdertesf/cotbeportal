// src/app/api/semesters/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { semestersStore } from '../data'; 

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const semester = semestersStore.find(s => String(s.id) === String(id));
    if (semester) {
      return NextResponse.json(semester);
    }
    return NextResponse.json({ message: 'Semester not found' }, { status: 404 });
  } catch (error) {
    console.error(`Error fetching semester ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error fetching semester', error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const semesterData = await request.json();
    const semesterIndex = semestersStore.findIndex(s => String(s.id) === String(id));
    if (semesterIndex !== -1) {
      if (semesterData.name && semesterData.name !== semestersStore[semesterIndex].name) {
        if (semestersStore.some(s => s.name === semesterData.name && String(s.id) !== String(id))) {
          return NextResponse.json({ message: `Semester name "${semesterData.name}" already exists.` }, { status: 409 });
        }
      }
      semestersStore[semesterIndex] = {
        ...semestersStore[semesterIndex],
        ...semesterData,
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json(semestersStore[semesterIndex]);
    }
    return NextResponse.json({ message: 'Semester not found' }, { status: 404 });
  } catch (error) {
    console.error(`Error updating semester ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error updating semester', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const initialLength = semestersStore.length;
    const semesterIndex = semestersStore.findIndex(s => String(s.id) === String(id));

    if (semesterIndex === -1) {
        return NextResponse.json({ message: 'Semester not found' }, { status: 404 });
    }
    
    semestersStore.splice(semesterIndex, 1);

    if (semestersStore.length < initialLength) {
      return NextResponse.json({ success: true, message: 'Semester deleted successfully' }, { status: 200 });
    }
    return NextResponse.json({ success: false, message: 'Semester not found or deletion failed' }, { status: 404 });
  } catch (error) {
    console.error(`Error deleting semester ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, message: 'Error deleting semester', error: errorMessage }, { status: 500 });
  }
}
