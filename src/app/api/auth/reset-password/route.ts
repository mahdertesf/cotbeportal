import { NextResponse, type NextRequest } from 'next/server';
import { usersStore } from '@/app/api/users/data'; // Use the shared user store

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ message: 'Token and new password are required' }, { status: 400 });
    }
    if (newPassword.length < 6) { // Basic validation
        return NextResponse.json({ message: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    console.log('Resetting password with token:', token);
    // TODO: In a real app, validate the token against the database (find user by token, check expiry).
    // For this mock, we'll assume the token is valid and find a user to update.
    // This is highly insecure for a real app. We'll just pick the first user for demo.
    
    // A more realistic mock might try to find a user by some part of the token if it encoded a username,
    // or simply assume the token points to a valid user who can be updated.
    // For simplicity, we'll just update the first user's password in the store if one exists.
    // THIS IS NOT SECURE AND ONLY FOR DEMONSTRATION.
    const userToUpdate = usersStore.find(u => u.username === token); // Simple mock: token is username

    if (userToUpdate) {
        const userIndex = usersStore.findIndex(u => u.user_id === userToUpdate.user_id);
        if (userIndex !== -1) {
            usersStore[userIndex].password_hash = `hashed_${newPassword}`;
            usersStore[userIndex].updated_at = new Date().toISOString();
            return NextResponse.json({ success: true, message: 'Password has been reset successfully.' });
        }
    }
    
    return NextResponse.json({ success: false, error: 'Invalid or expired token, or user not found.' }, { status: 400 });

  } catch (error) {
    console.error("Reset password error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error resetting password', error: errorMessage }, { status: 500 });
  }
}
