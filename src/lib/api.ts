

// Placeholder API functions
// These functions simulate backend calls and should be replaced with actual API calls.

import type { UserRole, UserProfile } from '@/stores/appStore';

const MOCK_API_DELAY = 1000; // 1 second delay

// --- Auth ---
export async function handleLogin(username: string, password_hash: string, role: UserRole) {
  console.log('Attempting login for:', { username, role });
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));

  const user = mockDatabases.users.find(u => u.username === username && u.role === role);

  if (user) {
    // In a real app, compare password_hash with stored hash
    // For mock, if user found by username and role, assume password matches
    // Especially since default password is username
    if (user.password_hash === `hashed_${password_hash}` || password_hash === user.username) {
      if (!user.is_active) {
        return { success: false, error: "Account is inactive. Please contact support.", data: null };
      }
       // Update last_login timestamp
      const userIndex = mockDatabases.users.findIndex(u => u.user_id === user.user_id);
      if (userIndex !== -1) {
        mockDatabases.users[userIndex].last_login = new Date().toISOString();
      }
      return { success: true, data: { ...user, last_login: new Date().toISOString() }, error: null };
    }
    return { success: false, error: "Invalid username or password.", data: null };
  }

  // TEMPORARY DEVELOPMENT BYPASS LOGIC (if user not found in mock)
  if (!role) {
    return { success: false, error: "Role not selected", data: null };
  }
  console.warn("User not found in mock database for login, attempting dev bypass for role:", role);

  const mockUserId = Math.floor(Math.random() * 10000);
  let mockUserData: UserProfile = {
    user_id: `user-${mockUserId}`,
    username: username || `mock${role?.toLowerCase().replace(' ', '')}${mockUserId}`,
    email: `${username || 'mock'}@cotbe.edu`,
    role: role,
    first_name: 'Mock',
    last_name: role || 'User',
    is_active: true,
    date_joined: new Date().toISOString(),
    last_login: new Date().toISOString(),
  };

  if (role === 'Student') {
    mockUserData = {
      ...mockUserData,
      department_id: `dept-${Math.floor(Math.random() * 5) + 1}`,
      department_name: `Department of Mock Studies ${Math.floor(Math.random() * 5) + 1}`,
      enrollment_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), 
      date_of_birth: '2002-05-15',
      address: '123 Mockingbird Lane, Addis Ababa',
      phone_number: '0912345678',
    };
  } else if (role === 'Teacher') {
    mockUserData = {
      ...mockUserData,
      user_id: `teacher-${mockUserId}`, 
      department_id: `dept-${Math.floor(Math.random() * 5) + 1}`,
      department_name: `Department of Advanced Mocking ${Math.floor(Math.random() * 5) + 1}`,
      office_location: `Building ${Math.floor(Math.random() * 10) + 1}, Room ${Math.floor(Math.random() * 100) + 100}`,
      phone_number: '0987654321',
    };
  } else if (role === 'Staff Head' || role === 'Admin') {
    mockUserData = {
      ...mockUserData,
      job_title: role === 'Admin' ? 'Portal Administrator' : 'Head of Mock Operations',
      phone_number: role === 'Admin' ? '0900000000' : '0977654321',
    };
  }
  
  return { success: true, data: mockUserData, error: null };
}

export async function handleForgotPassword(email: string) {
  console.log('Forgot password for email:', email);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  if (email.includes('@')) {
    return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' };
  }
  return { success: false, error: 'Invalid email address.' };
}

export async function handleResetPassword(token: string, newPassword_hash: string) {
  console.log('Resetting password with token:', token);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  if (token && newPassword_hash) {
    // Find user by a mock token mechanism if desired, or just succeed
    return { success: true, message: 'Password has been reset successfully.' };
  }
  return { success: false, error: 'Invalid token or password.' };
}

export async function handleChangePassword(userId: string | number, currentPassword_hash: string, newPassword_hash: string) {
  console.log('Changing password for user:', userId);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  const userIndex = mockDatabases.users.findIndex(u => String(u.user_id) === String(userId));

  if (userIndex === -1) {
    return { success: false, error: 'User not found.' };
  }
  const user = mockDatabases.users[userIndex];

  // Mock password check: current password should be the username or the actual "hashed" password
  if (user.password_hash !== `hashed_${currentPassword_hash}` && currentPassword_hash !== user.username) {
    return { success: false, error: 'Incorrect current password.' };
  }
  if (newPassword_hash.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }
  
  mockDatabases.users[userIndex].password_hash = `hashed_${newPassword_hash}`; // Simulate hashing
  return { success: true, message: 'Password changed successfully.' };
}


// --- User Management (Staff) ---
export async function fetchAllUsers(): Promise<UserProfile[]> {
  console.log('Fetching all users');
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  if (!mockDatabases.users || mockDatabases.users.length === 0) {
     mockDatabases.users = [
      { user_id: 'admin', username: 'admin', email: 'admin@cotbe.edu', role: 'Admin', first_name: 'Portal', last_name: 'Admin', is_active: true, date_joined: new Date(Date.now() - 1000 * 24 * 60 * 60 * 1000).toISOString(), last_login: new Date().toISOString(), job_title: "System Administrator", phone_number: "0900000000", password_hash: "hashed_admin" },
      { user_id: 'stud1', username: 'stud1', email: 's1@cotbe.edu', role: 'Student', first_name: 'Abebe', last_name: 'Bekele', is_active: true, date_joined: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(), last_login: new Date().toISOString(), department_id: 'dept-1', department_name: "Computer Science", enrollment_date: "2022-09-01", date_of_birth: "2003-05-10", address: "Arat Kilo, Addis Ababa", phone_number: "0911111111", password_hash: "hashed_stud1" },
      { user_id: 'teacher-1', username: 'teacher-1', email: 't1@cotbe.edu', role: 'Teacher', first_name: 'Chaltu', last_name: 'Lemma', is_active: true, date_joined: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(), last_login: new Date().toISOString(), department_id: 'dept-2', department_name: "Electrical Engineering", office_location: "Block C, Room 203", phone_number: "0922222222", password_hash: "hashed_teacher-1" },
      { user_id: 'staff1', username: 'staff1', email: 'staff1@cotbe.edu', role: 'Staff Head', first_name: 'Kebede', last_name: 'Tadesse', is_active: true, date_joined: new Date(Date.now() - 1000 * 24 * 60 * 60 * 1000).toISOString(), last_login: new Date().toISOString(), job_title: "Registry Head", phone_number: "0933221100", password_hash: "hashed_staff1" },
      { user_id: 'stud2', username: 'stud2', email: 's2@cotbe.edu', role: 'Student', first_name: 'Hana', last_name: 'Girma', is_active: true, date_joined: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(), last_login: new Date().toISOString(), department_id: 'dept-1', department_name: "Computer Science", enrollment_date: "2023-03-15", date_of_birth: "2004-01-20", address: "Bole, Addis Ababa", phone_number: "0933333333", password_hash: "hashed_stud2" },
      { user_id: 'stud3', username: 'stud3', email: 's3@cotbe.edu', role: 'Student', first_name: 'Yonas', last_name: 'Ayele', is_active: false, date_joined: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), last_login: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), department_id: 'dept-3', department_name: "Civil Engineering", enrollment_date: "2023-09-01", date_of_birth: "2002-11-05", address: "Piassa, Addis Ababa", phone_number: "0944444444", password_hash: "hashed_stud3" },
      { user_id: 'teacher-2', username: 'teacher-2', email: 't2@cotbe.edu', role: 'Teacher', first_name: 'Solomon', last_name: 'Gizaw', is_active: true, date_joined: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(), last_login: new Date().toISOString(), department_id: 'dept-1', department_name: "Computer Science", office_location: "Block A, Room 105", phone_number: "0912987654", password_hash: "hashed_teacher-2" },
    ];
  }
  return JSON.parse(JSON.stringify(mockDatabases.users));
}


// --- Student ---
export async function fetchStudentProfile(userId: string | number) {
  console.log('Fetching student profile for:', userId);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  const user = (await fetchAllUsers()).find(u => String(u.user_id) === String(userId) && u.role === 'Student');
  if (user) return user;
  return {
    user_id: userId,
    username: 'teststudent',
    email: 'teststudent@cotbe.edu',
    first_name: 'Test',
    last_name: 'Student',
    role: 'Student',
    department_id: 'dept-1',
    department_name: 'Computer Science',
    enrollment_date: '2022-09-01',
    date_of_birth: '2003-01-01',
    address: '123 Main St, Addis Ababa',
    phone_number: '0911223344',
    is_active: true,
    date_joined: new Date().toISOString(),
    last_login: new Date().toISOString(),
  } as UserProfile;
}

export async function updateStudentProfile(userId: string | number, data: Partial<UserProfile>) {
  console.log('Updating student profile for:', userId, 'with data:', data);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  const userIndex = mockDatabases.users.findIndex(u => String(u.user_id) === String(userId) && u.role === 'Student');
  if (userIndex !== -1) {
      mockDatabases.users[userIndex] = { ...mockDatabases.users[userIndex], ...data };
      return { success: true, data: mockDatabases.users[userIndex] };
  }
  return { success: false, error: "Student not found", data: null };
}

export async function fetchAvailableCourses(filters?: any) {
  console.log('Fetching available courses with filters:', filters);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  const allScheduled = await fetchItems('scheduledCourses');
  const catalog = await fetchItems('courses');
  const teachers = await fetchItems('teachers');
  const rooms = await fetchItems('rooms');

  return allScheduled.map((sc: any) => {
    const courseDetail = catalog.find((c:any) => String(c.id) === String(sc.course_id));
    const teacherDetail = teachers.find((t:any) => String(t.user_id) === String(sc.teacher_id));
    const roomDetail = rooms.find((r:any) => String(r.id) === String(sc.room_id));
    return {
      id: sc.scheduled_course_id, 
      course_code: courseDetail?.course_code || 'N/A',
      title: courseDetail?.title || 'N/A',
      credits: courseDetail?.credits || 0,
      section_number: sc.section_number,
      teacher_name: teacherDetail ? `${teacherDetail.first_name} ${teacherDetail.last_name}` : 'N/A',
      room_name: roomDetail ? `${roomDetail.room_number} (${roomDetail.building_name})` : 'N/A',
      schedule: `${sc.days_of_week || ''} ${sc.start_time || ''}-${sc.end_time || ''}`.trim(),
      max_capacity: sc.max_capacity,
      current_enrollment: sc.current_enrollment,
      description: courseDetail?.description || '',
      prerequisites: [], 
    };
  });
}

export async function handleRegisterCourse(scheduledCourseId: string) {
  console.log('Registering for course:', scheduledCourseId);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  return { success: true, message: `Successfully registered for course ${scheduledCourseId}.` };
}

export async function handleDropCourse(registrationId: string) {
  console.log('Dropping course registration:', registrationId);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  return { success: true, message: `Successfully dropped course ${registrationId}.` };
}

export async function fetchStudentRegisteredCourses(studentId: string | number) {
  console.log('Fetching registered courses for student:', studentId);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  const studentRegs = mockDatabases.registrations.filter(reg => String(reg.student_id) === String(studentId));
  const scheduledCourses = await fetchItems('scheduledCourses');
  const catalog = await fetchItems('courses');

  return studentRegs.map(reg => {
    const sc = scheduledCourses.find(s => String(s.scheduled_course_id) === String(reg.scheduled_course_id));
    const courseInfo = sc ? catalog.find(c => String(c.id) === String(sc.course_id)) : null;
    return {
      registrationId: reg.registration_id,
      scheduledCourseId: reg.scheduled_course_id,
      course_code: courseInfo?.course_code || 'N/A',
      title: courseInfo?.title || 'N/A',
      status: reg.status,
      final_grade: reg.final_grade || null,
    };
  });
}

export async function fetchStudentCourseMaterials(scheduledCourseId: string) {
  console.log('Fetching course materials for:', scheduledCourseId);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  return [
    { id: 'cm1', title: 'Syllabus', description: 'Course outline and policies', material_type: 'File', file_path: '/path/to/syllabus.pdf', url: null },
    { id: 'cm2', title: 'Lecture 1 Slides', description: 'Introduction to Python', material_type: 'File', file_path: '/path/to/lecture1.pdf', url: null },
    { id: 'cm3', title: 'Python Documentation', description: 'Official Python docs', material_type: 'Link', file_path: null, url: 'https://docs.python.org' },
  ];
}

export async function fetchStudentAssessments(scheduledCourseId: string, studentId: string | number) {
    console.log('Fetching assessments for student:', studentId, 'in course:', scheduledCourseId);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const courseAssessments = await fetchItems(`assessments?courseId=${scheduledCourseId}`);
    return courseAssessments.map((asm: any) => ({
        assessment_id: asm.id,
        name: asm.name,
        max_score: asm.max_score,
        score: Math.random() > 0.5 ? Math.floor(Math.random() * asm.max_score) : null,
        feedback: Math.random() > 0.5 ? 'Mock feedback.' : null,
    }));
}

export async function fetchAcademicHistory(studentId: string | number) {
  console.log('Fetching academic history for student:', studentId);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  
  const coursesSem1Year1 = [
    { course_code: 'CS101', title: 'Intro to Programming', credits: 3, final_grade: 'A', grade_points: 12.0 },
    { course_code: 'MA101', title: 'Calculus I', credits: 4, final_grade: 'B+', grade_points: 13.2 },
  ];
  const totalCreditsSem1Year1 = coursesSem1Year1.reduce((sum, c) => sum + c.credits, 0);
  const totalGradePointsSem1Year1 = coursesSem1Year1.reduce((sum, c) => sum + c.grade_points, 0);
  const gpaSem1Year1 = totalCreditsSem1Year1 > 0 ? totalGradePointsSem1Year1 / totalCreditsSem1Year1 : 0;

  const coursesSem2Year1 = [
    { course_code: 'CS201', title: 'Data Structures', credits: 3, final_grade: 'A-', grade_points: 11.1 },
    { course_code: 'PHY101', title: 'Physics I', credits: 4, final_grade: 'B', grade_points: 12.0 },
  ];
  const totalCreditsSem2Year1 = coursesSem2Year1.reduce((sum, c) => sum + c.credits, 0);
  const totalGradePointsSem2Year1 = coursesSem2Year1.reduce((sum, c) => sum + c.grade_points, 0);
  const gpaSem2Year1 = totalCreditsSem2Year1 > 0 ? totalGradePointsSem2Year1 / totalCreditsSem2Year1 : 0;
  
  const annualGPAYear1 = (totalCreditsSem1Year1 + totalCreditsSem2Year1) > 0 ? (totalGradePointsSem1Year1 + totalGradePointsSem2Year1) / (totalCreditsSem1Year1 + totalCreditsSem2Year1) : 0;

  const coursesSem1Year2 = [
    { course_code: 'EE202', title: 'Circuit Theory', credits: 3, final_grade: 'A', grade_points: 12.0 },
    { course_code: 'STAT210', title: 'Probability & Statistics', credits: 3, final_grade: 'C+', grade_points: 6.9 },
  ];
  const totalCreditsSem1Year2 = coursesSem1Year2.reduce((sum, c) => sum + c.credits, 0);
  const totalGradePointsSem1Year2 = coursesSem1Year2.reduce((sum, c) => sum + c.grade_points, 0);
  const gpaSem1Year2 = totalCreditsSem1Year2 > 0 ? totalGradePointsSem1Year2 / totalCreditsSem1Year2 : 0;

   const coursesSem2Year2 = [
    { course_code: 'MECH250', title: 'Thermodynamics', credits: 3, final_grade: 'B', grade_points: 9.0 },
    { course_code: 'EE205', title: 'Digital Logic', credits: 3, final_grade: 'A-', grade_points: 11.1 },
  ];
  const totalCreditsSem2Year2 = coursesSem2Year2.reduce((sum, c) => sum + c.credits, 0);
  const totalGradePointsSem2Year2 = coursesSem2Year2.reduce((sum, c) => sum + c.grade_points, 0);
  const gpaSem2Year2 = totalCreditsSem2Year2 > 0 ? totalGradePointsSem2Year2 / totalCreditsSem2Year2 : 0;
  const annualGPAYear2 = (totalCreditsSem1Year2 + totalCreditsSem2Year2) > 0 ? (totalGradePointsSem1Year2 + totalGradePointsSem2Year2) / (totalCreditsSem1Year2 + totalCreditsSem2Year2) : 0;

  const allCourses = [...coursesSem1Year1, ...coursesSem2Year1, ...coursesSem1Year2, ...coursesSem2Year2];
  const totalCumulativeCredits = allCourses.reduce((sum, c) => sum + c.credits, 0);
  const totalCumulativeGradePoints = allCourses.reduce((sum, c) => sum + c.grade_points, 0);
  const cumulativeGPA = totalCumulativeCredits > 0 ? totalCumulativeGradePoints / totalCumulativeCredits : 0;

  return {
    academic_years: [
      {
        year: "Academic Year 2022-2023",
        semesters: [
          {
            name: "Semester One" as const,
            courses: coursesSem1Year1,
            semesterGPA: gpaSem1Year1,
          },
          {
            name: "Semester Two" as const,
            courses: coursesSem2Year1,
            semesterGPA: gpaSem2Year1,
          },
        ],
        annualGPA: annualGPAYear1,
      },
      {
        year: "Academic Year 2023-2024",
        semesters: [
          {
            name: "Semester One" as const,
            courses: coursesSem1Year2,
            semesterGPA: gpaSem1Year2,
          },
          {
            name: "Semester Two" as const,
            courses: coursesSem2Year2,
            semesterGPA: gpaSem2Year2,
          }
        ],
        annualGPA: annualGPAYear2,
      }
    ],
    cumulativeGPA: cumulativeGPA,
  };
}


// --- Teacher ---
export async function fetchTeacherProfile(userId: string | number) {
    console.log('Fetching teacher profile for:', userId);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const user = (await fetchAllUsers()).find(u => String(u.user_id) === String(userId) && u.role === 'Teacher');
    if (user) return user;
    return {
        user_id: userId,
        username: 'testteacher',
        email: 'testteacher@cotbe.edu',
        first_name: 'Test',
        last_name: 'Teacher',
        role: 'Teacher',
        department_id: 'dept-2',
        department_name: 'Electrical Engineering',
        office_location: 'Tech Building, Room 305',
        phone_number: '0912345679',
        is_active: true,
        date_joined: new Date().toISOString(),
        last_login: new Date().toISOString(),
    } as UserProfile;
}

export async function updateTeacherProfile(userId: string | number, data: Partial<UserProfile>) {
    console.log('Updating teacher profile for:', userId, 'with data:', data);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const userIndex = mockDatabases.users.findIndex(u => String(u.user_id) === String(userId) && u.role === 'Teacher');
    if (userIndex !== -1) {
        mockDatabases.users[userIndex] = { ...mockDatabases.users[userIndex], ...data };
        return { success: true, data: mockDatabases.users[userIndex] };
    }
    return { success: false, error: "Teacher not found", data: null };
}

// --- Staff Head / Admin ---
export async function fetchStaffProfile(userId: string | number) {
    console.log('Fetching staff/admin profile for:', userId);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const user = (await fetchAllUsers()).find(u => String(u.user_id) === String(userId) && (u.role === 'Staff Head' || u.role === 'Admin'));
    if (user) return user;
    // Generic fallback, role should be correct from fetchAllUsers
    return {
        user_id: userId,
        username: 'teststaffadmin',
        email: 'teststaffadmin@cotbe.edu',
        first_name: 'Test',
        last_name: 'StaffAdmin',
        role: 'Staff Head', // Default if not found
        job_title: 'Portal Admin',
        phone_number: '0977654321',
        is_active: true,
        date_joined: new Date().toISOString(),
        last_login: new Date().toISOString(),
    } as UserProfile;
}

export async function updateStaffProfile(userId: string | number, data: Partial<UserProfile>) {
    console.log('Updating staff/admin profile for:', userId, 'with data:', data);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const userIndex = mockDatabases.users.findIndex(u => String(u.user_id) === String(userId) && (u.role === 'Staff Head' || u.role === 'Admin'));
    if (userIndex !== -1) {
        mockDatabases.users[userIndex] = { ...mockDatabases.users[userIndex], ...data };
        return { success: true, data: mockDatabases.users[userIndex] };
    }
    return { success: false, error: "Staff/Admin user not found", data: null };
}


export async function fetchTeacherAssignedCourses(teacherId: string | number, semesterId?: string | number) {
    console.log('Fetching assigned courses for teacher:', teacherId, 'semester:', semesterId);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const allScheduled = await fetchItems('scheduledCourses');
    const courses = await fetchItems('courses');
    
    return allScheduled
      .filter((sc: any) => String(sc.teacher_id) === String(teacherId) && (semesterId ? String(sc.semester_id) === String(semesterId) : true))
      .map((sc: any) => {
        const courseInfo = courses.find((c:any) => String(c.id) === String(sc.course_id));
        return {
          scheduled_course_id: sc.scheduled_course_id,
          course_code: courseInfo?.course_code || 'N/A',
          title: courseInfo?.title || 'N/A',
          section: sc.section_number,
        };
      });
}

export async function fetchStudentRoster(scheduledCourseId: string): Promise<Array<{ student_id: string; first_name: string; last_name: string; email: string; }>> {
    console.log('Fetching student roster for course:', scheduledCourseId);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    
    const registrationsForCourse = mockDatabases.registrations.filter(
      reg => String(reg.scheduled_course_id) === String(scheduledCourseId) && reg.status === 'Registered'
    );
    const studentIds = registrationsForCourse.map(reg => reg.student_id);
    const allStudents = await fetchAllUsers(); 
    const roster = allStudents
      .filter(user => user.role === 'Student' && studentIds.includes(String(user.user_id)))
      .map(studentUser => ({
        student_id: String(studentUser.user_id),
        first_name: studentUser.first_name,
        last_name: studentUser.last_name,
        email: studentUser.email,
      }));
      
    if (roster.length > 0) return roster;

    if (scheduledCourseId === 'sc-fall24-cs101-a' || scheduledCourseId === 'sc-fall24-ee305-a' || scheduledCourseId === 'sc-fall24-ee305-b') {
        return [
            { student_id: 'stud1', first_name: 'Abebe', last_name: 'Bekele', email: 'abebe@example.com' },
            { student_id: 'stud2', first_name: 'Hana', last_name: 'Girma', email: 'hana@example.com' },
        ];
    }
    return [];
}

export async function createCourseMaterial(scheduledCourseId: string, materialData: any) {
    console.log('Creating course material for course:', scheduledCourseId, 'data:', materialData);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return { success: true, data: { id: `cm-${Math.random()}`, ...materialData } };
}

export async function fetchStudentRegistrationsForCourseGrading(scheduledCourseId: string): Promise<Array<{
  registration_id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  current_final_grade: string | null;
  current_grade_points: number | null;
}>> {
  console.log('Fetching student registrations for grading, course:', scheduledCourseId);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  
  const registrationsForCourse = mockDatabases.registrations.filter(
    reg => String(reg.scheduled_course_id) === String(scheduledCourseId)
  );

  const allStudents = await fetchAllUsers(); 

  return registrationsForCourse.map(reg => {
    const studentInfo = allStudents.find(u => String(u.user_id) === String(reg.student_id));
    return {
      registration_id: reg.registration_id,
      student_id: reg.student_id,
      first_name: studentInfo?.first_name || 'Unknown',
      last_name: studentInfo?.last_name || 'Student',
      email: studentInfo?.email || 'unknown@example.com',
      current_final_grade: reg.final_grade || null,
      current_grade_points: reg.grade_points || null,
    };
  });
}

export async function fetchAllStudentAssessmentScoresForCourse(scheduledCourseId: string): Promise<Record<string, Record<string, { score: number | null; feedback: string | null }>>> {
  console.log('Fetching all student assessment scores for course:', scheduledCourseId);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));

  const mockScores: Record<string, Record<string, { score: number | null; feedback: string | null }>> = {};
  const courseAssessments = await fetchItems(`assessments?courseId=${scheduledCourseId}`);
  const registrations = mockDatabases.registrations.filter(r => String(r.scheduled_course_id) === String(scheduledCourseId));

  registrations.forEach(reg => {
      mockScores[reg.student_id] = {};
      courseAssessments.forEach((asm: any) => {
        const maxScore = typeof asm.max_score === 'number' ? asm.max_score : 0;
        let score: number | null = null;
        let feedback: string | null = "Mock feedback provided.";
        if (Math.random() > 0.3) { 
            score = Math.floor(Math.random() * maxScore * 0.6 + maxScore * 0.4); 
        } else {
            feedback = null; 
        }
        mockScores[reg.student_id][asm.id] = { score, feedback };
      });
    });
  return mockScores;
}


// --- Generic CRUD placeholders ---
let mockDatabases: Record<string, any[]> = {
  departments: [
    {id: 'dept-1', name: 'Computer Science', description: 'Department of Computer Science and Engineering.'}, 
    {id: 'dept-2', name: 'Electrical Engineering', description: 'Department of Electrical and Computer Engineering.'},
    {id: 'dept-3', name: 'Mechanical Engineering', description: 'Department of Mechanical and Industrial Engineering.'},
    {id: 'dept-4', name: 'Civil Engineering', description: 'Department of Civil and Environmental Engineering.'},
    {id: 'dept-5', name: 'Biomedical Engineering', description: 'Department of Biomedical Engineering.'},
  ],
  courses: [
    {id: 'course-1', course_code: 'CS101', title: 'Introduction to Programming', description: 'Fundamentals of programming using Python.', credits: 3, department_id: 'dept-1'},
    {id: 'course-2', course_code: 'EE201', title: 'Circuit Theory I', description: 'Basic electric circuit analysis.', credits: 4, department_id: 'dept-2'},
    {id: 'course-3', course_code: 'MECH210', title: 'Statics', description: 'Principles of engineering mechanics.', credits: 3, department_id: 'dept-3'},
    {id: 'course-4', course_code: 'CS350', title: 'Software Engineering', description: 'Software development lifecycle and methodologies.', credits: 3, department_id: 'dept-1'},
    {id: 'course-5', course_code: 'EE305', title: 'Digital Logic Design', description: 'Design and analysis of digital circuits.', credits: 3, department_id: 'dept-2'},
  ],
  semesters: [
    { id: 'sem-1', name: 'Fall 2024', academic_year: 2024, term: 'Semester One', start_date: '2024-09-02', end_date: '2024-12-20', registration_start_date: '2024-07-15T09:00', registration_end_date: '2024-08-30T17:00', add_drop_start_date: '2024-09-02T09:00', add_drop_end_date: '2024-09-09T17:00' },
    { id: 'sem-2', name: 'Spring 2025', academic_year: 2025, term: 'Semester Two', start_date: '2025-01-13', end_date: '2025-05-09', registration_start_date: '2024-11-15T09:00', registration_end_date: '2025-01-10T17:00', add_drop_start_date: '2025-01-13T09:00', add_drop_end_date: '2025-01-20T17:00' },
  ],
  buildings: [
    { id: 'bldg-1', name: 'Main Engineering Building', address: '1 Engineering Drive, CoTBE Campus' },
    { id: 'bldg-2', name: 'Technology Hall', address: '2 Innovation Avenue, CoTBE Campus' },
    { id: 'bldg-3', name: 'Architecture Pavilion', address: '3 Design Street, CoTBE Campus' },
    { id: 'bldg-4', name: 'Research Complex Alpha', address: '4 Discovery Road, CoTBE Campus' },
  ],
  rooms: [ 
    { id: 'room-1', building_id: 'bldg-1', room_number: '101', capacity: 50, type: 'Lecture Hall', building_name: 'Main Engineering Building' },
    { id: 'room-2', building_id: 'bldg-1', room_number: '102 Lab', capacity: 30, type: 'Computer Lab', building_name: 'Main Engineering Building' },
    { id: 'room-3', building_id: 'bldg-2', room_number: 'A205', capacity: 75, type: 'Lecture Hall', building_name: 'Technology Hall' },
    { id: 'room-4', building_id: 'bldg-3', room_number: 'Studio 1', capacity: 20, type: 'Design Studio', building_name: 'Architecture Pavilion' },
    { id: 'room-5', building_id: 'bldg-2', room_number: 'B101', capacity: 40, type: 'Classroom', building_name: 'Technology Hall' },
  ],
  scheduledCourses: [
    { scheduled_course_id: 'sc-fall24-cs101-a', course_id: 'course-1', semester_id: 'sem-1', teacher_id: 'teacher-2', room_id: 'room-1', section_number: 'A', max_capacity: 50, current_enrollment: 0, days_of_week: 'MWF', start_time: '09:00', end_time: '09:50' },
    { scheduled_course_id: 'sc-fall24-ee305-a', course_id: 'course-5', semester_id: 'sem-1', teacher_id: 'teacher-1', room_id: 'room-3', section_number: 'A', max_capacity: 30, current_enrollment: 0, days_of_week: 'TTH', start_time: '13:00', end_time: '14:15' },
    { scheduled_course_id: 'sc-fall24-ee305-b', course_id: 'course-5', semester_id: 'sem-1', teacher_id: 'teacher-1', room_id: 'room-5', section_number: 'B', max_capacity: 25, current_enrollment: 0, days_of_week: 'TTH', start_time: '10:00', end_time: '11:15' },
    { scheduled_course_id: 'sc-spring25-cs350-a', course_id: 'course-4', semester_id: 'sem-2', teacher_id: 'teacher-2', room_id: 'room-2', section_number: 'A', max_capacity: 30, current_enrollment: 0, days_of_week: 'MW', start_time: '14:00', end_time: '15:15' },
  ],
  users: [], 
  teachers: [], 
  assessments: {}, 
  registrations: [],
  announcements: [
    { announcement_id: 'anno-1', title: 'Welcome to Fall 2024 Semester!', content: 'We are excited to welcome all new and returning students to the Fall 2024 semester. Please check your course schedules and familiarize yourself with the portal.', author_id: 'staff1', target_audience: 'All Portal Users', status: 'Published', publish_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), department_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { announcement_id: 'anno-2', title: 'CS Department Meeting', content: 'There will be a mandatory meeting for all Computer Science students on September 5th at 2 PM in Room 101.', author_id: 'teacher-2', target_audience: 'Specific Department Students', status: 'Published', publish_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), department_id: 'dept-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { announcement_id: 'anno-3', title: 'Faculty Workshop on New Grading Policy', content: 'All faculty members are invited to a workshop on the new grading policy. Date: September 10th, 10 AM. Venue: Admin Conference Hall.', author_id: 'staff1', target_audience: 'All Teachers', status: 'Published', publish_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), department_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { announcement_id: 'anno-4', title: 'Portal Maintenance Downtime', content: 'The CoTBE portal will be down for scheduled maintenance on Saturday, September 7th, from 2 AM to 4 AM.', author_id: 'staff1', target_audience: 'All Portal Users', status: 'Published', publish_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), department_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { announcement_id: 'anno-5', title: 'Staff Training Session', content: 'A training session for all administrative staff on the new HR software will be held next Monday.', author_id: 'staff1', target_audience: 'All Staff', status: 'Draft', publish_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), department_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
};

mockDatabases.scheduledCourses.forEach(sc => {
    const courseIdKey = `assessments?courseId=${sc.scheduled_course_id}`;
    if (!mockDatabases.assessments[courseIdKey]) {
        mockDatabases.assessments[courseIdKey] = [
            { id: `asm-${sc.scheduled_course_id}-1`, scheduledCourseId: sc.scheduled_course_id, name: `Quiz 1 (${sc.course_id})`, description: 'Covers week 1-3.', max_score: 20, due_date: '2024-09-15T23:59:00Z', type: 'Quiz' },
            { id: `asm-${sc.scheduled_course_id}-2`, scheduledCourseId: sc.scheduled_course_id, name: `Midterm (${sc.course_id})`, description: 'Comprehensive Midterm.', max_score: 30, due_date: '2024-10-15T23:59:00Z', type: 'Exam' },
        ];
    }
});


export async function fetchItems(entity: string, filters?: any) {
  console.log(`Fetching ${entity} with filters:`, filters);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));

  if (mockDatabases[entity]) {
    return JSON.parse(JSON.stringify(mockDatabases[entity])); 
  }
  if (entity === 'teachers') { 
    const allUsers = await fetchAllUsers();
    return allUsers
        .filter(user => user.role === 'Teacher')
        .map(user => ({ user_id: user.user_id, first_name: user.first_name, last_name: user.last_name, department_id: user.department_id }));
  }
  if (entity.startsWith('assessments?courseId=')) { 
    return JSON.parse(JSON.stringify(mockDatabases.assessments[entity] || []));
  }
  return [];
}


export async function fetchStudentFinalGradesForCourse(scheduledCourseId: string): Promise<Array<{ registration_id: string; student_id: string; final_grade: string | null; grade_points: number | null }>> {
  console.log('Fetching final grades for course:', scheduledCourseId);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  
  const studentRegistrations = await fetchStudentRegistrationsForCourseGrading(scheduledCourseId);

  return studentRegistrations.map(reg => ({
    registration_id: reg.registration_id,
    student_id: reg.student_id,
    final_grade: reg.current_final_grade, 
    grade_points: reg.current_grade_points, 
  }));
}


export async function createItem(entity: string, data: any) {
  console.log(`Creating ${entity}:`, data);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  
  let newItem = { ...data };
  
  if (entity === 'users') {
    // Ensure username (ID) is unique for new users
    if (mockDatabases.users.some(u => u.username === data.username)) {
        return { success: false, error: `Username/ID "${data.username}" already exists.`, data: null };
    }
    newItem = {
        user_id: data.username, // Use username as user_id for new users as per requirement
        is_active: true,
        date_joined: new Date().toISOString(),
        last_login: null, // New user hasn't logged in
        password_hash: `hashed_${data.username}`, // Default password is username (mock hashed)
        ...data,
    } as UserProfile;
  } else if (entity === 'scheduledCourses') {
    const newId = `sc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    newItem = { scheduled_course_id: newId, current_enrollment: 0, ...data };
  } else if (entity === 'announcements') { 
     const newId = `anno-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
     newItem = { announcement_id: newId, status: 'Draft', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...data };
  } else {
    const newId = `${entity.slice(0,4)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    newItem = { ...data, id: newId }; 
  }

  if (mockDatabases[entity]) {
    mockDatabases[entity].push(newItem);
  } else if (entity.startsWith('assessments?courseId=')) {
      if (!mockDatabases.assessments[entity]) mockDatabases.assessments[entity] = [];
      newItem.id = `asm-${entity.split('=')[1]}-${Date.now()}`; 
      mockDatabases.assessments[entity].push(newItem);
  } else {
    console.warn(`Mock database for entity "${entity}" not explicitly handled for creation, using generic push.`);
    if (!mockDatabases[entity]) mockDatabases[entity] = [];
     mockDatabases[entity].push(newItem);
  }
  return { success: true, data: newItem, error: null};
}

export async function updateItem(entity: string, id: string | number, data: any) {
  console.log(`Updating ${entity} ${id}:`, data);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  
  let itemUpdated = false;
  let updatedItemData = null;
  const idKey = entity === 'users' ? 'user_id' : entity === 'scheduledCourses' ? 'scheduled_course_id' : entity === 'announcements' ? 'announcement_id' : 'id';

  if (mockDatabases[entity]) {
    const index = mockDatabases[entity].findIndex((item: any) => String(item[idKey]) === String(id));
    if (index !== -1) {
      mockDatabases[entity][index] = { ...mockDatabases[entity][index], ...data, updated_at: new Date().toISOString() };
      updatedItemData = mockDatabases[entity][index];
      itemUpdated = true;
    }
  } else if (entity.startsWith('assessments?courseId=')) {
      if (mockDatabases.assessments[entity]) {
          const index = mockDatabases.assessments[entity].findIndex((item: any) => String(item.id) === String(id));
           if (index !== -1) {
             mockDatabases.assessments[entity][index] = { ...mockDatabases.assessments[entity][index], ...data };
             updatedItemData = mockDatabases.assessments[entity][index];
             itemUpdated = true;
           }
      }
  }


  if (!itemUpdated) {
    console.warn(`Item with id ${id} not found in entity ${entity} for update.`);
    return { success: false, error: "Item not found", data: null };
  }
  
  return { success: true, data: updatedItemData, error: null};
}

export async function deleteItem(entity: string, id: string | number) {
  console.log(`Deleting ${entity} ${id}`);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  const idKey = entity === 'users' ? 'user_id' : entity === 'scheduledCourses' ? 'scheduled_course_id' : entity === 'announcements' ? 'announcement_id' : 'id';

  if (mockDatabases[entity]) {
    const initialLength = mockDatabases[entity].length;
    mockDatabases[entity] = mockDatabases[entity].filter((item: any) => String(item[idKey]) !== String(id));
    if (mockDatabases[entity].length < initialLength) {
      return { success: true };
    }
  } else if (entity.startsWith('assessments?courseId=')) {
      if (mockDatabases.assessments[entity]) {
          const initialLength = mockDatabases.assessments[entity].length;
          mockDatabases.assessments[entity] = mockDatabases.assessments[entity].filter((item: any) => String(item.id) !== String(id));
          if (mockDatabases.assessments[entity].length < initialLength) {
            return { success: true };
          }
      }
  }
  console.warn(`Item with id ${id} not found in entity ${entity} for deletion.`);
  return { success: false, error: "Item not found" };
}

export async function fetchAuditLogs(filters?: any) {
    console.log('Fetching audit logs with filters:', filters);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const defaultLogs = [
        { id: 'log1', timestamp: new Date(Date.now() - Math.random()*100000000).toISOString(), username: 'staff1', action_type: 'USER_LOGIN', target_entity_type: 'USER', target_entity_id: 'staff1', ip_address: '192.168.1.10', details: 'User logged in successfully' },
        { id: 'log2', timestamp: new Date(Date.now() - Math.random()*100000000).toISOString(), username: 'teacher-1', action_type: 'COURSE_MATERIAL_UPLOAD', target_entity_type: 'COURSE_MATERIAL', target_entity_id: 'cm-123', ip_address: '10.0.0.5', details: 'Uploaded "Lecture 5.pdf" to EE305' },
        { id: 'log3', timestamp: new Date(Date.now() - Math.random()*100000000).toISOString(), username: 'stud1', action_type: 'COURSE_REGISTRATION', target_entity_type: 'REGISTRATION', target_entity_id: 'reg-sc1-stud1', ip_address: '203.0.113.45', details: 'Registered for CS101' },
        { id: 'log4', timestamp: new Date(Date.now() - Math.random()*100000000).toISOString(), username: 'staff1', action_type: 'USER_UPDATE', target_entity_type: 'USER', target_entity_id: 'stud3', ip_address: '192.168.1.10', details: 'Deactivated user stud3' },
        { id: 'log5', timestamp: new Date(Date.now() - Math.random()*100000000).toISOString(), username: 'teacher-1', action_type: 'ASSESSMENT_GRADE_UPDATE', target_entity_type: 'STUDENT_ASSESSMENT', target_entity_id: 'sa-stud1-asmMock1', ip_address: '10.0.0.5', details: 'Graded Quiz 1 for Abebe Bekele in EE305' },
        { id: 'log6', timestamp: new Date(Date.now() - Math.random()*100000000).toISOString(), username: 'admin', action_type: 'USER_CREATE', target_entity_type: 'USER', target_entity_id: 'staff2', ip_address: '192.168.1.1', details: 'Admin created new staff user staff2' },
    ];
    const limit = filters?.limit || 50;
    return defaultLogs.slice(0, limit);
}

export async function handleManualStudentRegistration(studentId: string, scheduledCourseId: string) {
  console.log(`Manually registering student ${studentId} for scheduled course ${scheduledCourseId}`);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));

  const existingRegistration = mockDatabases.registrations.find(
    reg => String(reg.student_id) === String(studentId) && String(reg.scheduled_course_id) === String(scheduledCourseId)
  );
  if (existingRegistration) {
    return { success: false, error: "Student is already registered for this course or waitlisted." };
  }

  const scheduledCourse = mockDatabases.scheduledCourses.find(sc => String(sc.scheduled_course_id) === String(scheduledCourseId));
  if (!scheduledCourse) {
    return { success: false, error: "Scheduled course not found." };
  }

  let message = `Student successfully registered for course.`;
  if (scheduledCourse.current_enrollment >= scheduledCourse.max_capacity) {
    message += ` (Capacity exceeded by manual override).`;
    console.warn(`Manual registration for ${studentId} in ${scheduledCourseId} exceeded capacity.`);
  }
  
  const newRegistration = {
    registration_id: `reg-${Date.now()}`,
    student_id: studentId,
    scheduled_course_id: scheduledCourseId,
    registration_date: new Date().toISOString(),
    status: 'Registered', 
    final_grade: null,
    grade_points: null,
  };
  mockDatabases.registrations.push(newRegistration);

  const scIndex = mockDatabases.scheduledCourses.findIndex(sc => String(sc.scheduled_course_id) === String(scheduledCourseId));
  if (scIndex !== -1) {
    mockDatabases.scheduledCourses[scIndex].current_enrollment += 1;
  }
  
  return { success: true, message: message };
}

export async function fetchAnnouncements({ role, departmentId }: { role: UserRole, departmentId?: string | number }) {
  console.log(`Fetching announcements for role: ${role}, departmentId: ${departmentId}`);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));

  const now = new Date();
  const publishedAnnouncements = mockDatabases.announcements.filter(ann => {
    return ann.status === 'Published' && new Date(ann.publish_date) <= now;
  });

  let relevantAnnouncements = publishedAnnouncements.filter(ann => {
    if (ann.target_audience === 'All Portal Users') return true;
    if (role === 'Student' && ann.target_audience === 'All Students') return true;
    if (role === 'Teacher' && ann.target_audience === 'All Teachers') return true;
    if ((role === 'Staff Head' || role === 'Admin') && ann.target_audience === 'All Staff') return true; // Admin sees Staff announcements
    
    if (role === 'Student' && ann.target_audience === 'Specific Department Students' && String(ann.department_id) === String(departmentId)) return true;
    if (role === 'Teacher' && ann.target_audience === 'Specific Department Faculty' && String(ann.department_id) === String(departmentId)) return true;
    
    // Staff Heads and Admins should also see department specific announcements if they belong to that dept
    // This part might need more refined logic based on how staff/admin department affiliation is stored or determined.
    // For now, assume Staff Head/Admin don't filter by department for their own announcements but see all relevant to staff/all.

    return false;
  });

  relevantAnnouncements.sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());
  
  return relevantAnnouncements;
}
    
// Initialize mock users if empty
if (!mockDatabases.users || mockDatabases.users.length === 0) {
  fetchAllUsers(); // This will populate mockDatabases.users
}

