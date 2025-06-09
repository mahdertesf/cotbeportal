
import { NextResponse, type NextRequest } from 'next/server';
import { courseMaterialsStore, type CourseMaterial } from './data';

export async function GET(request: NextRequest) {
  try {
    const scheduledCourseId = request.nextUrl.searchParams.get('scheduledCourseId');
    if (!scheduledCourseId) {
      return NextResponse.json({ success: false, message: 'scheduledCourseId is required' }, { status: 400 });
    }
    
    const filteredMaterials = courseMaterialsStore.filter(m => {
      // Defensive check: ensure m and m.scheduled_course_id exist before comparison
      return m && typeof m.scheduled_course_id !== 'undefined' && String(m.scheduled_course_id) === String(scheduledCourseId);
    });
    
    return NextResponse.json({ success: true, data: filteredMaterials });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error("Detailed error in GET /api/courseMaterials:", error); // More detailed server log
    return NextResponse.json({ success: false, message: 'Server error fetching course materials.', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const materialData = await request.json();
    const { title, description, material_type, url, file_path, scheduled_course_id } = materialData; // file_path instead of file_path_mock

    if (!title || !scheduled_course_id || !material_type) {
      return NextResponse.json({ success: false, message: 'Title, material_type, and scheduled_course_id are required' }, { status: 400 });
    }
    if (material_type === 'Link' && !url) {
        return NextResponse.json({ success: false, message: 'URL is required for Link type material' }, { status: 400 });
    }
    // For File type, file_path might be handled by a separate upload step in a real app
    // Here, we'll assume it's provided or mock it if `file_path` is sent.

    const newMaterial: CourseMaterial = {
      id: `cm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      description: description || '',
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
