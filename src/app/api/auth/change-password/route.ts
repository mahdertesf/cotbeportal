import { NextResponse, type NextRequest } from 'next/server';
import { usersStore } from '@/app/api/users/data';

export async function POST(request: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ message: 'User ID, current password, and new password are required' }, { status: 400 });
    }
    if (newPassword.length < 6) {
        return NextResponse.json({ message: 'New password must be at least 6 characters long.' }, { status: 400 });
    }

    const userIndex = usersStore.findIndex(u => String(u.user_id) === String(userId));

    if (userIndex === -1) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    const user = usersStore[userIndex];
    // Mock password check
    if (user.password_hash !== `hashed_${currentPassword}` && currentPassword !== user.username) {
      return NextResponse.json({ success: false, error: 'Incorrect current password.' }, { status: 403 });
    }

    usersStore[userIndex].password_hash = `hashed_${newPassword}`;
    usersStore[userIndex].updated_at = new Date().toISOString(); // Assuming UserProfile has updated_at

    return NextResponse.json({ success: true, message: 'Password changed successfully.' });

  } catch (error) {
    console.error("Change password error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
