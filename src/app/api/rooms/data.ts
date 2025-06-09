// src/app/api/rooms/data.ts
export interface Room {
  id: string | number;
  building_id: string | number;
  building_name?: string; // For display, denormalized or joined if from DB
  room_number: string;
  capacity: number;
  type?: string | null;
  created_at?: string;
  updated_at?: string;
}

export let roomsStore: Room[] = [ 
  { id: 'room-1', building_id: 'bldg-1', room_number: '101', capacity: 50, type: 'Lecture Hall', building_name: 'Main Engineering Building', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'room-2', building_id: 'bldg-2', room_number: 'A205', capacity: 75, type: 'Lecture Hall', building_name: 'Technology Hall', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];
