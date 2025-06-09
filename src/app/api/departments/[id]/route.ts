
import { NextResponse, type NextRequest } from 'next/server';

// In-memory store for departments for API route demonstration
// TODO: Replace this with actual database interaction.
// Note: This store is separate from the one in `api/departments/route.ts` in this example.
// In a real application with a database, this wouldn't be an issue.
// For a shared in-memory mock across routes, a separate module would be needed.
let departmentsStore: any[] = [
    {id: 'dept-1', name: 'Computer Science', description: 'Department of Computer Science and Engineering.', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
    {id: 'dept-2', name: 'Electrical Engineering', description: 'Department of Electrical and Computer Engineering.', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
    {id: 'dept-3', name: 'Mechanical Engineering', description: 'Department of Mechanical and Industrial Engineering.', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
    {id: 'dept-4', name: 'Civil Engineering', description: 'Department of Civil and Environmental Engineering.', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
    {id: 'dept-5', name: 'Biomedical Engineering', description: 'Department of Biomedical Engineering.', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
];

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    // TODO: Implement database logic here to fetch a department by ID
    const department = departmentsStore.find(d => String(d.id) === String(id));
    if (department) {
      return NextResponse.json(department);
    }
    return NextResponse.json({ message: 'Department not found' }, { status: 404 });
  } catch (error) {
    console.error(`Error fetching department ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error fetching department', error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const departmentData = await request.json();
    // TODO: Implement database logic here to update a department by ID
    const departmentIndex = departmentsStore.findIndex(d => String(d.id) === String(id));
    if (departmentIndex !== -1) {
      departmentsStore[departmentIndex] = {
        ...departmentsStore[departmentIndex],
        name: departmentData.name || departmentsStore[departmentIndex].name,
        description: departmentData.description !== undefined ? departmentData.description : departmentsStore[departmentIndex].description,
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json(departmentsStore[departmentIndex]);
    }
    return NextResponse.json({ message: 'Department not found' }, { status: 404 });
  } catch (error) {
    console.error(`Error updating department ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error updating department', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    // TODO: Implement database logic here to delete a department by ID
    const initialLength = departmentsStore.length;
    departmentsStore = departmentsStore.filter(d => String(d.id) !== String(id));
    if (departmentsStore.length < initialLength) {
      return NextResponse.json({ message: 'Department deleted successfully' }, { status: 200 });
    }
    return NextResponse.json({ message: 'Department not found' }, { status: 404 });
  } catch (error) {
    console.error(`Error deleting department ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error deleting department', error: errorMessage }, { status: 500 });
  }
}
