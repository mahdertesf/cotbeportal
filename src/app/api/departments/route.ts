
import { NextResponse, type NextRequest } from 'next/server';

// In-memory store for departments for API route demonstration
// TODO: Replace this with actual database interaction and ensure it's shared or sourced correctly
// if multiple API route files need to access the same live data.
let departmentsStore: any[] = [
    {id: 'dept-1', name: 'Computer Science', description: 'Department of Computer Science and Engineering.', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
    {id: 'dept-2', name: 'Electrical Engineering', description: 'Department of Electrical and Computer Engineering.', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
    {id: 'dept-3', name: 'Mechanical Engineering', description: 'Department of Mechanical and Industrial Engineering.', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
    {id: 'dept-4', name: 'Civil Engineering', description: 'Department of Civil and Environmental Engineering.', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
    {id: 'dept-5', name: 'Biomedical Engineering', description: 'Department of Biomedical Engineering.', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
];

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement database logic here to fetch all departments
    // For now, returning mock data from the in-memory store
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
    // TODO: Implement database logic here to create a new department
    // For now, adding to mock data
    const newDepartment = {
      id: `dept-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // More unique mock ID
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
