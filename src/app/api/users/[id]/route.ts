import { NextResponse, type NextRequest } from 'next/server';
import { usersStore } from '../data'; // Import from the shared data file
import type { UserProfile } from '@/stores/appStore';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const user = usersStore.find(u => String(u.user_id) === String(id));
    if (user) {
      return NextResponse.json(user);
    }
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  } catch (error) {
    console.error(`Error fetching user ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error fetching user', error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const updateData = await request.json() as Partial<UserProfile>;
    
    const userIndex = usersStore.findIndex(u => String(u.user_id) === String(id));

    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Prevent changing username/ID and role for simplicity in mock, handle password separately
    const { user_id, username, role, password_hash, ...allowedUpdates } = updateData;

    usersStore[userIndex] = {
      ...usersStore[userIndex],
      ...allowedUpdates,
      updated_at: new Date().toISOString(), // Assuming you add this field to UserProfile
    };
    
    // If password is being changed (e.g. via a specific field like 'newPassword')
    if (updateData.password_hash) { // Assuming password_hash field is used to signal new password for mock
        usersStore[userIndex].password_hash = updateData.password_hash;
    }


    return NextResponse.json(usersStore[userIndex]);
  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error updating user', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const initialLength = usersStore.length;
    const userIndex = usersStore.findIndex(u => String(u.user_id) === String(id));

    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Basic check to prevent deleting the only admin (in a real app, more robust checks)
    if (usersStore[userIndex].role === 'Admin') {
        const adminCount = usersStore.filter(u => u.role === 'Admin').length;
        if (adminCount <= 1) {
            return NextResponse.json({ message: 'Cannot delete the only Admin user.' }, { status: 403 });
        }
    }

    usersStore.splice(userIndex, 1);

    if (usersStore.length < initialLength) {
      return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    }
    // This case should not be reached if userIndex was found
    return NextResponse.json({ message: 'User not found or deletion failed' }, { status: 404 });
  } catch (error) {
    console.error(`Error deleting user ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error deleting user', error: errorMessage }, { status: 500 });
  }
}
