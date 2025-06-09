
import { NextResponse, type NextRequest } from 'next/server';
import { courseMaterialsStore, type CourseMaterial } from './data';

export async function GET(request: NextRequest) {
  try {
    const scheduledCourseId = request.nextUrl.searchParams.get('scheduledCourseId');
    if (!scheduledCourseId) {
      return NextResponse.json({ success: false, message: 'scheduledCourseId is required' }, { status: 400 });
    }
    // console.log('API GET courseMaterials for scheduledCourseId:', scheduledCourseId);
    const filteredMaterials = courseMaterialsStore.filter(m => String(m.scheduled_course_id) === String(scheduledCourseId));
    // console.log('API GET courseMaterials filtered:', filteredMaterials.length);
    return NextResponse.json(filteredMaterials);
  } catch (error) {
    console.error("Error fetching course materials:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, message: 'Error fetching course materials', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const materialData = await request.json();
    const { title, description, material_type, url, file_path_mock, scheduled_course_id } = materialData;

    if (!title || !scheduled_course_id || !material_type) {
      return NextResponse.json({ success: false, message: 'Title, material_type, and scheduled_course_id are required' }, { status: 400 });
    }
    if (material_type === 'Link' && !url) {
        return NextResponse.json({ success: false, message: 'URL is required for Link type material' }, { status: 400 });
    }


    const newMaterial: CourseMaterial = {
      id: `cm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      description: description || '',
      material_type,
      file_path: material_type === 'File' ? (file_path_mock || `/uploads/mock/${title.replace(/\s+/g, '_')}.pdf`) : null,
      url: material_type === 'Link' ? url : null,
      scheduled_course_id: String(scheduled_course_id), // Ensure it's stored as string if IDs are mixed
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    courseMaterialsStore.push(newMaterial);
    return NextResponse.json({ success: true, data: newMaterial }, { status: 201 });
  } catch (error) {
    console.error("Error creating course material:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, message: 'Error creating course material', error: errorMessage }, { status: 500 });
  }
}
