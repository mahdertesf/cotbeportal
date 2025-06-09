import { NextResponse, type NextRequest } from 'next/server';
import { usersStore } from '@/app/api/users/data'; // Use the shared user store
import type { UserRole, UserProfile } from '@/stores/appStore';

export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json();

    if (!username || !password || !role) {
      return NextResponse.json({ message: 'Username, password, and role are required' }, { status: 400 });
    }

    const user = usersStore.find(u => u.username === username && u.role === (role as UserRole));

    if (user) {
      // Mock password check: password is username OR pre-hashed value
      if (user.password_hash === `hashed_${password}` || password === user.username) {
        if (!user.is_active) {
          return NextResponse.json({ message: "Account is inactive. Please contact support." }, { status: 403 });
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
      return NextResponse.json({ success: false, error: "Invalid username or password." }, { status: 401 });
    }

    // Fallback for development bypass if user not found by exact match in mock for specific roles (as in original lib/api.ts)
    // This part should ideally be removed for production, but kept for demo continuity
    const mockUserId = Math.floor(Math.random() * 10000);
    let mockUserData: UserProfile = {
      user_id: `user-${mockUserId}`,
      username: username || `mock${role?.toLowerCase().replace(' ', '')}${mockUserId}`,
      email: `${username || 'mock'}@cotbe.edu`,
      role: role as UserRole,
      first_name: 'Mock',
      last_name: (role as string) || 'User',
      is_active: true,
      date_joined: new Date().toISOString(),
      last_login: new Date().toISOString(),
      password_hash: `hashed_${username || 'mock'}` // For consistency with other users
    };
     // Apply role-specific mock data as before
    if (role === 'Student') {
        mockUserData = { ...mockUserData, department_id: `dept-${Math.floor(Math.random() * 5) + 1}`, department_name: `Department of Mock Studies ${Math.floor(Math.random() * 5) + 1}`, enrollment_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), date_of_birth: '2002-05-15', address: '123 Mockingbird Lane, Addis Ababa', phone_number: '0912345678' };
    } else if (role === 'Teacher') {
        mockUserData = { ...mockUserData, user_id: `teacher-${mockUserId}`, department_id: `dept-${Math.floor(Math.random() * 5) + 1}`, department_name: `Department of Advanced Mocking ${Math.floor(Math.random() * 5) + 1}`, office_location: `Building ${Math.floor(Math.random() * 10) + 1}, Room ${Math.floor(Math.random() * 100) + 100}`, phone_number: '0987654321' };
    } else if (role === 'Staff Head' || role === 'Admin') {
        mockUserData = { ...mockUserData, job_title: role === 'Admin' ? 'Portal Administrator' : 'Head of Mock Operations', phone_number: role === 'Admin' ? '0900000000' : '0977654321' };
    }
    const { password_hash, ...userWithoutPasswordDev } = mockUserData; // Don't send password_hash here either

    return NextResponse.json({ success: true, data: userWithoutPasswordDev });

  } catch (error) {
    console.error("Login error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Login failed', error: errorMessage }, { status: 500 });
  }
}
