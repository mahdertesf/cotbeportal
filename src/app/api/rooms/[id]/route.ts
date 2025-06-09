// src/app/api/rooms/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { roomsStore } from '../data'; 
import { buildingsStore } from '../../buildings/data';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const room = roomsStore.find(r => String(r.id) === String(id));
    if (room) {
      const building = buildingsStore.find(b => String(b.id) === String(room.building_id));
      return NextResponse.json({ ...room, building_name: building ? building.name : 'Unknown Building'});
    }
    return NextResponse.json({ message: 'Room not found' }, { status: 404 });
  } catch (error) {
    console.error(`Error fetching room ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error fetching room', error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const roomData = await request.json();
    const roomIndex = roomsStore.findIndex(r => String(r.id) === String(id));
    if (roomIndex !== -1) {
      // Check for uniqueness if building_id and room_number are changing
      const newBuildingId = roomData.building_id || roomsStore[roomIndex].building_id;
      const newRoomNumber = roomData.room_number || roomsStore[roomIndex].room_number;
      if ((newBuildingId !== roomsStore[roomIndex].building_id || newRoomNumber !== roomsStore[roomIndex].room_number) &&
          roomsStore.some(r => String(r.building_id) === String(newBuildingId) && r.room_number === newRoomNumber && String(r.id) !== String(id))
      ) {
         return NextResponse.json({ message: `Room number "${newRoomNumber}" already exists in building ID ${newBuildingId}.` }, { status: 409 });
      }

      roomsStore[roomIndex] = {
        ...roomsStore[roomIndex],
        ...roomData,
        updated_at: new Date().toISOString(),
      };
      const building = buildingsStore.find(b => String(b.id) === String(roomsStore[roomIndex].building_id));
      return NextResponse.json({ ...roomsStore[roomIndex], building_name: building ? building.name : 'Unknown Building'});
    }
    return NextResponse.json({ message: 'Room not found' }, { status: 404 });
  } catch (error) {
    console.error(`Error updating room ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error updating room', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const initialLength = roomsStore.length;
    const roomIndex = roomsStore.findIndex(r => String(r.id) === String(id));

    if (roomIndex === -1) {
        return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    }
    
    roomsStore.splice(roomIndex, 1);

    if (roomsStore.length < initialLength) {
      return NextResponse.json({ success: true, message: 'Room deleted successfully' }, { status: 200 });
    }
    return NextResponse.json({ success: false, message: 'Room not found or deletion failed' }, { status: 404 });
  } catch (error) {
    console.error(`Error deleting room ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, message: 'Error deleting room', error: errorMessage }, { status: 500 });
  }
}
