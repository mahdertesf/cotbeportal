// src/app/api/buildings/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { buildingsStore } from '../data'; 

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const building = buildingsStore.find(b => String(b.id) === String(id));
    if (building) {
      return NextResponse.json(building);
    }
    return NextResponse.json({ message: 'Building not found' }, { status: 404 });
  } catch (error) {
    console.error(`Error fetching building ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error fetching building', error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const buildingData = await request.json();
    const buildingIndex = buildingsStore.findIndex(b => String(b.id) === String(id));
    if (buildingIndex !== -1) {
      if (buildingData.name && buildingData.name !== buildingsStore[buildingIndex].name) {
         if (buildingsStore.some(b => b.name === buildingData.name && String(b.id) !== String(id))) {
            return NextResponse.json({ message: `Building name "${buildingData.name}" already exists.` }, { status: 409 });
        }
      }
      buildingsStore[buildingIndex] = {
        ...buildingsStore[buildingIndex],
        ...buildingData,
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json(buildingsStore[buildingIndex]);
    }
    return NextResponse.json({ message: 'Building not found' }, { status: 404 });
  } catch (error) {
    console.error(`Error updating building ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error updating building', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const initialLength = buildingsStore.length;
    const buildingIndex = buildingsStore.findIndex(b => String(b.id) === String(id));

    if (buildingIndex === -1) {
        return NextResponse.json({ message: 'Building not found' }, { status: 404 });
    }
    
    buildingsStore.splice(buildingIndex, 1);

    if (buildingsStore.length < initialLength) {
      return NextResponse.json({ success: true, message: 'Building deleted successfully' }, { status: 200 });
    }
    return NextResponse.json({ success: false, message: 'Building not found or deletion failed' }, { status: 404 });
  } catch (error) {
    console.error(`Error deleting building ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, message: 'Error deleting building', error: errorMessage }, { status: 500 });
  }
}
