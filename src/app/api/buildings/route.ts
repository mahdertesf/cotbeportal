// src/app/api/buildings/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { buildingsStore, type Building } from './data';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(buildingsStore);
  } catch (error) {
    console.error("Error fetching buildings:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error fetching buildings', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const buildingData = await request.json();
    if (!buildingData.name) {
        return NextResponse.json({ message: 'Building name is required' }, { status: 400 });
    }

    if (buildingsStore.some(b => b.name === buildingData.name)) {
        return NextResponse.json({ message: `Building name "${buildingData.name}" already exists.` }, { status: 409 });
    }
    
    const newBuilding: Building = {
      id: `bldg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: buildingData.name,
      address: buildingData.address || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    buildingsStore.push(newBuilding);
    return NextResponse.json(newBuilding, { status: 201 });
  } catch (error) {
    console.error("Error creating building:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error creating building', error: errorMessage }, { status: 500 });
  }
}
