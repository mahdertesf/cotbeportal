// In-memory store for departments for API route demonstration
// This data will reset when the server restarts.

interface Department {
  id: string | number;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export let departmentsStore: Department[] = [
    {id: 'dept-1', name: 'Computer Science', description: 'Department of Computer Science and Engineering.', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
    {id: 'dept-2', name: 'Electrical Engineering', description: 'Department of Electrical and Computer Engineering.', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
    {id: 'dept-3', name: 'Mechanical Engineering', description: 'Department of Mechanical and Industrial Engineering.', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
    {id: 'dept-4', name: 'Civil Engineering', description: 'Department of Civil and Environmental Engineering.', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
    {id: 'dept-5', name: 'Biomedical Engineering', description: 'Department of Biomedical Engineering.', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
];
