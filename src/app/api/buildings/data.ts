// src/app/api/buildings/data.ts
export interface Building {
  id: string | number;
  name: string;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
}

export let buildingsStore: Building[] = [
  { id: 'bldg-1', name: 'Main Engineering Building', address: '1 Engineering Drive, CoTBE Campus', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'bldg-2', name: 'Technology Hall', address: '2 Innovation Avenue, CoTBE Campus', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];
