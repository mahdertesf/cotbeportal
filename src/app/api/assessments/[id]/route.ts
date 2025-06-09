
import { NextResponse, type NextRequest } from 'next/server';
import { assessmentsStore } from '../data';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const assessment = assessmentsStore.find(a => a.id === id);
    if (assessment) {
      return NextResponse.json(assessment);
    }
    return NextResponse.json({ success: false, message: 'Assessment not found' }, { status: 404 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message: 'Error fetching assessment', error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const data = await request.json();
    const index = assessmentsStore.findIndex(a => a.id === id);
    if (index !== -1) {
      assessmentsStore[index] = { ...assessmentsStore[index], ...data, updated_at: new Date().toISOString() };
      return NextResponse.json({ success: true, data: assessmentsStore[index] });
    }
    return NextResponse.json({ success: false, message: 'Assessment not found' }, { status: 404 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message: 'Error updating assessment', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const initialLength = assessmentsStore.length;
    const indexToDelete = assessmentsStore.findIndex(a => a.id === id);
    if (indexToDelete > -1) {
        assessmentsStore.splice(indexToDelete, 1);
        return NextResponse.json({ success: true, message: 'Assessment deleted successfully' });
    }
    return NextResponse.json({ success: false, message: 'Assessment not found' }, { status: 404 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message: 'Error deleting assessment', error: errorMessage }, { status: 500 });
  }
}
