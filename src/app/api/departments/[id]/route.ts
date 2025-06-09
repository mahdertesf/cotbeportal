import { NextResponse, type NextRequest } from 'next/server';
import { departmentsStore } from '../data'; // Import from the shared data file

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
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
    const initialLength = departmentsStore.length;
    const departmentIndex = departmentsStore.findIndex(d => String(d.id) === String(id));

    if (departmentIndex === -1) {
        return NextResponse.json({ message: 'Department not found' }, { status: 404 });
    }
    
    departmentsStore.splice(departmentIndex, 1);

    if (departmentsStore.length < initialLength) {
      return NextResponse.json({ message: 'Department deleted successfully' }, { status: 200 });
    }
    return NextResponse.json({ message: 'Department not found or deletion failed' }, { status: 404 }); // Should not be reached if index was found
  } catch (error) {
    console.error(`Error deleting department ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error deleting department', error: errorMessage }, { status: 500 });
  }
}
