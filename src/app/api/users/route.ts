import { NextResponse, type NextRequest } from 'next/server';
import { usersStore } from './data';
import type { UserProfile } from '@/stores/appStore';

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement filtering if needed based on query parameters
    return NextResponse.json(usersStore);
  } catch (error) {
    console.error("Error fetching users:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error fetching users', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json() as Partial<UserProfile>;

    if (!userData.username || !userData.email || !userData.first_name || !userData.last_name || !userData.role) {
      return NextResponse.json({ message: 'Missing required user fields' }, { status: 400 });
    }

    if (usersStore.some(u => u.username === userData.username)) {
      return NextResponse.json({ message: `Username/ID "${userData.username}" already exists.` }, { status: 409 });
    }
    if (usersStore.some(u => u.email === userData.email)) {
      return NextResponse.json({ message: `Email "${userData.email}" already exists.` }, { status: 409 });
    }

    const newUser: UserProfile = {
      user_id: userData.username, // Use username as user_id for mock
      username: userData.username,
      email: userData.email,
      role: userData.role,
      first_name: userData.first_name,
      last_name: userData.last_name,
      is_active: userData.is_active !== undefined ? userData.is_active : true,
      date_joined: new Date().toISOString(),
      last_login: null,
      password_hash: `hashed_${userData.username}`, // Default password is username
      department_id: userData.department_id,
      department_name: userData.department_name,
      enrollment_date: userData.enrollment_date,
      date_of_birth: userData.date_of_birth,
      address: userData.address,
      phone_number: userData.phone_number,
      office_location: userData.office_location,
      job_title: userData.job_title,
    };

    usersStore.push(newUser);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: 'Error creating user', error: errorMessage }, { status: 500 });
  }
}
