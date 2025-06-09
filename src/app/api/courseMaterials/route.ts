
// src/app/api/courseMaterials/route.ts
import { NextResponse, type NextRequest } from 'next/server';

// START: Embedded data structures (replacing import from './data')
export interface CourseMaterial {
  id: string;
  title: string;
  description?: string | null;
  material_type: 'File' | 'Link';
  file_path?: string | null;
  url?: string | null;
  scheduled_course_id: string | number;
  created_at?: string;
  updated_at?: string;
}

export let courseMaterialsStore: CourseMaterial[] = [
  { id: 'cm-1', title: 'Lecture 1 Slides', description: 'Introduction to CS101', material_type: 'File', file_path: '/materials/cs101_lec1.pdf', scheduled_course_id: 'sc-fall24-cs101-a', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cm-2', title: 'Syllabus CS101', material_type: 'File', file_path: '/materials/cs101_syllabus.pdf', scheduled_course_id: 'sc-fall24-cs101-a', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cm-3', title: 'Digital Logic Gates Tutorial', material_type: 'Link', url: 'https://example.com/digital-logic-tutorial', scheduled_course_id: 'sc-fall24-ee305-a', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cm-4', title: 'Thermodynamics Notes Chapter 1', material_type: 'File', file_path: '/materials/mech210_ch1.pdf', scheduled_course_id: 'sc-spring25-mech210-a', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];
// END: Embedded data structures

export async function GET(request: NextRequest) {
  try {
    const scheduledCourseId = request.nextUrl.searchParams.get('scheduledCourseId');
    if (!scheduledCourseId) {
      return NextResponse.json({ success: false, message: 'scheduledCourseId is required' }, { status: 400 });
    }
    
    const filteredMaterials = courseMaterialsStore.filter(m => {
      return m && typeof m.scheduled_course_id !== 'undefined' && String(m.scheduled_course_id) === String(scheduledCourseId);
    });
    
    return NextResponse.json({ success: true, data: filteredMaterials });
  } catch (error) {
    console.error("Detailed error in GET /api/courseMaterials:", error); 
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, message: 'Server error fetching course materials.', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const materialData = await request.json();
    const { title, description, material_type, url, file_path, scheduled_course_id } = materialData;

    if (!title || !scheduled_course_id || !material_type) {
      return NextResponse.json({ success: false, message: 'Title, material_type, and scheduled_course_id are required' }, { status: 400 });
    }
    if (material_type === 'Link' && !url) {
        return NextResponse.json({ success: false, message: 'URL is required for Link type material' }, { status: 400 });
    }
    
    const newMaterial: CourseMaterial = {
      id: `cm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      description: description || null,
      material_type,
      file_path: material_type === 'File' ? (file_path || `/uploads/mock/${title.replace(/\s+/g, '_')}.pdf`) : null,
      url: material_type === 'Link' ? url : null,
      scheduled_course_id: String(scheduled_course_id),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    courseMaterialsStore.push(newMaterial);
    return NextResponse.json({ success: true, data: newMaterial }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error("Detailed error in POST /api/courseMaterials:", error);
    return NextResponse.json({ success: false, message: 'Server error creating course material.', error: errorMessage }, { status: 500 });
  }
}

// Individual material GET, PUT, DELETE by ID
export async function GETById(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const material = courseMaterialsStore.find(m => m.id === id);
    if (material) {
      return NextResponse.json({success: true, data: material });
    }
    return NextResponse.json({ success: false, message: 'Course material not found' }, { status: 404 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message: 'Error fetching course material', error: errorMessage }, { status: 500 });
  }
}

export async function PUTById(request: NextRequest, { params }: { params: { id: string } }) {
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

export async function DELETEById(request: NextRequest, { params }: { params: { id: string } }) {
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
