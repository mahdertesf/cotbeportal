
import { NextResponse, type NextRequest } from 'next/server';
import { courseMaterialsStore } from '../data';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const material = courseMaterialsStore.find(m => m.id === id);
    if (material) {
      return NextResponse.json(material);
    }
    return NextResponse.json({ success: false, message: 'Course material not found' }, { status: 404 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message: 'Error fetching course material', error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const data = await request.json();
    const index = courseMaterialsStore.findIndex(m => m.id === id);
    if (index !== -1) {
      courseMaterialsStore[index] = { ...courseMaterialsStore[index], ...data, updated_at: new Date().toISOString() };
      return NextResponse.json({ success: true, data: courseMaterialsStore[index] });
    }
    return NextResponse.json({ success: false, message: 'Course material not found' }, { status: 404 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message: 'Error updating course material', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const initialLength = courseMaterialsStore.length;
    const indexToDelete = courseMaterialsStore.findIndex(m => m.id === id);
    if (indexToDelete > -1) {
        courseMaterialsStore.splice(indexToDelete, 1);
        return NextResponse.json({ success: true, message: 'Course material deleted successfully' });
    }
    return NextResponse.json({ success: false, message: 'Course material not found' }, { status: 404 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message: 'Error deleting course material', error: errorMessage }, { status: 500 });
  }
}
