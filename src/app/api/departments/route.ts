import { NextResponse, type NextRequest } from 'next/server';
import { departmentsStore } from './data'; // Import from the shared data file

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(departmentsStore);
  } catch (error) {
    console.error("Error fetching departments:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error fetching departments', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const departmentData = await request.json();
    if (!departmentData.name) {
        return NextResponse.json({ message: 'Department name is required' }, { status: 400 });
    }
    
    const newDepartment = {
      id: `dept-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: departmentData.name,
      description: departmentData.description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    departmentsStore.push(newDepartment);
    return NextResponse.json(newDepartment, { status: 201 });
  } catch (error) {
    console.error("Error creating department:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error creating department', error: errorMessage }, { status: 500 });
  }
}
