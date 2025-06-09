
import { NextResponse, type NextRequest } from 'next/server';
import { usersStore } from '@/app/api/users/data'; 
import type { UserRole, UserProfile } from '@/stores/appStore';

export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json();

    if (!username || !password || !role) {
      return NextResponse.json({ success: false, error: 'Username, password, and role are required' }, { status: 400 });
    }

    const user = usersStore.find(u => u.username === username && u.role === (role as UserRole));

    if (user) {
      // Mock password check: password is username OR pre-hashed value
      if (user.password_hash === `hashed_${password}` || password === user.username) {
        if (!user.is_active) {
          return NextResponse.json({ success: false, error: "Account is inactive. Please contact support." }, { status: 403 });
        }
        // Update last_login timestamp (in-memory)
        const userIndex = usersStore.findIndex(u => u.user_id === user.user_id);
        if (userIndex !== -1) {
          usersStore[userIndex].last_login = new Date().toISOString();
        }
        // Return a copy of the user object without the password_hash
        const { password_hash, ...userWithoutPassword } = usersStore[userIndex];
        return NextResponse.json({ success: true, data: userWithoutPassword });
      }
    }

    // If user not found or password incorrect
    return NextResponse.json({ success: false, error: "Invalid username, password, or role." }, { status: 401 });

  } catch (error) {
    console.error("Login error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
