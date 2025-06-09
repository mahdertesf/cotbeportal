// src/app/api/rooms/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { roomsStore, type Room } from './data';
import { buildingsStore } from '../buildings/data'; // To get building_name

export async function GET(request: NextRequest) {
  try {
    // Enrich rooms with building_name
    const enrichedRooms = roomsStore.map(room => {
        const building = buildingsStore.find(b => String(b.id) === String(room.building_id));
        return {
            ...room,
            building_name: building ? building.name : 'Unknown Building'
        };
    });
    return NextResponse.json(enrichedRooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error fetching rooms', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const roomData = await request.json();
    if (!roomData.building_id || !roomData.room_number || roomData.capacity === undefined) {
        return NextResponse.json({ message: 'Building ID, room number, and capacity are required' }, { status: 400 });
    }

    if (roomsStore.some(r => String(r.building_id) === String(roomData.building_id) && r.room_number === roomData.room_number)) {
        return NextResponse.json({ message: `Room number "${roomData.room_number}" already exists in this building.` }, { status: 409 });
    }
    
    const newRoom: Room = {
      id: `room-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      building_id: roomData.building_id,
      room_number: roomData.room_number,
      capacity: roomData.capacity,
      type: roomData.type || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    roomsStore.push(newRoom);
    
    const building = buildingsStore.find(b => String(b.id) === String(newRoom.building_id));
    return NextResponse.json({ ...newRoom, building_name: building ? building.name : 'Unknown Building' }, { status: 201 });
  } catch (error) {
    console.error("Error creating room:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error creating room', error: errorMessage }, { status: 500 });
  }
}
