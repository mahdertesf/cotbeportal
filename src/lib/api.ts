// Placeholder API functions
// These functions simulate backend calls and should be replaced with actual API calls.

import type { UserRole, UserProfile } from '@/stores/appStore';

const MOCK_API_DELAY = 1000; // 1 second delay

// --- Auth ---
export async function handleLogin(username: string, password_hash: string, role: UserRole) {
  console.log('Attempting login for:', { username, role });
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));

  // TEMPORARY DEVELOPMENT BYPASS LOGIC
  if (!role) {
    return { success: false, error: "Role not selected", data: null };
  }

  const mockUserId = Math.floor(Math.random() * 10000);
  let mockUserData: UserProfile = {
    user_id: `user-${mockUserId}`,
    username: username || `mock${role.toLowerCase().replace(' ', '')}${mockUserId}`,
    email: `${username || 'mock'}@cotbe.edu`,
    role: role,
    first_name: 'Mock',
    last_name: role,
    is_active: true,
    date_joined: new Date().toISOString(),
    last_login: new Date().toISOString(),
  };

  if (role === 'Student') {
    mockUserData = {
      ...mockUserData,
      department_id: `dept-${Math.floor(Math.random() * 5) + 1}`,
      department_name: `Department of Mock Studies ${Math.floor(Math.random() * 5) + 1}`,
      enrollment_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // Enrolled 1 year ago
      date_of_birth: '2002-05-15',
      address: '123 Mockingbird Lane, Addis Ababa',
      phone_number: '0912345678',
    };
  } else if (role === 'Teacher') {
    mockUserData = {
      ...mockUserData,
      department_id: `dept-${Math.floor(Math.random() * 5) + 1}`,
      department_name: `Department of Advanced Mocking ${Math.floor(Math.random() * 5) + 1}`,
      office_location: `Building ${Math.floor(Math.random() * 10) + 1}, Room ${Math.floor(Math.random() * 100) + 100}`,
      phone_number: '0987654321',
    };
  } else if (role === 'Staff Head') {
    mockUserData = {
      ...mockUserData,
      job_title: 'Head of Mock Operations',
    };
  }
  
  return { success: true, data: mockUserData, error: null };
}

export async function handleForgotPassword(email: string) {
  console.log('Forgot password for email:', email);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  // Simulate sending a reset link
  if (email.includes('@')) {
    return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' };
  }
  return { success: false, error: 'Invalid email address.' };
}

export async function handleResetPassword(token: string, newPassword_hash: string) {
  console.log('Resetting password with token:', token);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  // Simulate resetting password
  if (token && newPassword_hash) {
    return { success: true, message: 'Password has been reset successfully.' };
  }
  return { success: false, error: 'Invalid token or password.' };
}

// --- Student ---
export async function fetchStudentProfile(userId: string | number) {
  console.log('Fetching student profile for:', userId);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  // Return mock student profile data
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
  } as UserProfile;
}

export async function updateStudentProfile(userId: string | number, data: Partial<UserProfile>) {
  console.log('Updating student profile for:', userId, 'with data:', data);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  return { success: true, data: { ...await fetchStudentProfile(userId), ...data } };
}

export async function fetchAvailableCourses(filters?: any) {
  console.log('Fetching available courses with filters:', filters);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  return [
    { id: 'sc1', course_code: 'CS101', title: 'Intro to Programming', credits: 3, section_number: 'A', teacher_name: 'Dr. T. Alemayehu', room_name: 'B1-R101', schedule: 'MWF 9-10AM', max_capacity: 50, current_enrollment: 45, description: 'Fundamentals of programming.', prerequisites: [] },
    { id: 'sc2', course_code: 'MA202', title: 'Calculus II', credits: 4, section_number: 'B', teacher_name: 'Prof. S. Kebede', room_name: 'C2-R205', schedule: 'TTH 1-3PM', max_capacity: 30, current_enrollment: 28, description: 'Advanced calculus topics.', prerequisites: ['MA101 Calculus I'] },
  ];
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
   return [
    { registrationId: 'reg1', scheduledCourseId: 'sc1', course_code: 'CS101', title: 'Intro to Programming', status: 'Registered', final_grade: null },
    { registrationId: 'reg2', scheduledCourseId: 'sc3', course_code: 'ENGL100', title: 'Communicative English', status: 'Registered', final_grade: null },
  ];
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
    return [
        { assessment_id: 'asm1', name: 'Quiz 1', max_score: 20, score: 18, feedback: 'Good job!' },
        { assessment_id: 'asm2', name: 'Midterm Exam', max_score: 100, score: 85, feedback: 'Well done on problem 3.' },
        { assessment_id: 'asm3', name: 'Project Proposal', max_score: 10, score: null, feedback: null },
    ];
}

export async function fetchAcademicHistory(studentId: string | number) {
  console.log('Fetching academic history for student:', studentId);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  return {
    semesters: [
      { 
        name: 'Fall 2022', 
        courses: [
          { course_code: 'CS101', title: 'Intro to Programming', credits: 3, final_grade: 'A', grade_points: 12.0 },
          { course_code: 'MA101', title: 'Calculus I', credits: 4, final_grade: 'B+', grade_points: 13.2 },
        ],
        semesterGPA: 3.60,
      },
      { 
        name: 'Spring 2023', 
        courses: [
          { course_code: 'CS201', title: 'Data Structures', credits: 3, final_grade: 'A-', grade_points: 11.1 },
          { course_code: 'PHY101', title: 'Physics I', credits: 4, final_grade: 'B', grade_points: 12.0 },
        ],
        semesterGPA: 3.30,
      },
    ],
    cumulativeGPA: 3.45,
  };
}


// --- Teacher ---
export async function fetchTeacherProfile(userId: string | number) {
    console.log('Fetching teacher profile for:', userId);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
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
    } as UserProfile;
}

export async function updateTeacherProfile(userId: string | number, data: Partial<UserProfile>) {
    console.log('Updating teacher profile for:', userId, 'with data:', data);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return { success: true, data: { ...await fetchTeacherProfile(userId), ...data } };
}

export async function fetchTeacherAssignedCourses(teacherId: string | number, semesterId?: string | number) {
    console.log('Fetching assigned courses for teacher:', teacherId, 'semester:', semesterId);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return [
        { scheduled_course_id: 'sc10', course_code: 'EE305', title: 'Digital Logic Design', section: 'A' },
        { scheduled_course_id: 'sc11', course_code: 'EE305', title: 'Digital Logic Design', section: 'B' },
        { scheduled_course_id: 'sc12', course_code: 'EE450', title: 'Embedded Systems', section: 'A' },
    ];
}

export async function fetchStudentRoster(scheduledCourseId: string) {
    console.log('Fetching student roster for course:', scheduledCourseId);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return [
        { student_id: 'stud1', first_name: 'Abebe', last_name: 'Bekele', email: 'abebe@example.com' },
        { student_id: 'stud2', first_name: 'Chaltu', last_name: 'Lemma', email: 'chaltu@example.com' },
    ];
}

export async function createCourseMaterial(scheduledCourseId: string, materialData: any) {
    console.log('Creating course material for course:', scheduledCourseId, 'data:', materialData);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return { success: true, data: { id: `cm-${Math.random()}`, ...materialData } };
}
// ... other Teacher API placeholders

// --- Staff Head ---
// ... Staff Head API placeholders (CRUD operations for Users, Departments, Courses, etc.)
export async function fetchAllUsers(filters?: any) {
  console.log('Fetching all users with filters:', filters);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  return [
    { user_id: 'user-1', username: 'student1', email: 'student1@cotbe.edu', role: 'Student', first_name: 'Alice', last_name: 'Wonder', is_active: true },
    { user_id: 'user-2', username: 'teacher1', email: 'teacher1@cotbe.edu', role: 'Teacher', first_name: 'Bob', last_name: 'Marley', is_active: true },
    { user_id: 'user-3', username: 'staff1', email: 'staff1@cotbe.edu', role: 'Staff Head', first_name: 'Charlie', last_name: 'Chaplin', is_active: false },
  ];
}

export async function createUser(userData: any) {
  console.log('Creating user:', userData);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  return { success: true, data: { ...userData, user_id: `user-${Math.random()}` }};
}

// --- Generic CRUD placeholders ---
export async function fetchItems(entity: string, filters?: any) {
  console.log(`Fetching ${entity} with filters:`, filters);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  // This is a very generic mock. You'll need specific ones.
  if (entity === 'departments') {
    return [{id: 'dept-1', name: 'Computer Science', description: 'CS Department'}, {id: 'dept-2', name: 'Mechanical Engineering', description: 'ME Department'}];
  }
  return [];
}

export async function createItem(entity: string, data: any) {
  console.log(`Creating ${entity}:`, data);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  return { success: true, data: { ...data, id: `${entity.slice(0,4)}-${Math.random()}` }};
}

export async function updateItem(entity: string, id: string | number, data: any) {
  console.log(`Updating ${entity} ${id}:`, data);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  return { success: true, data: { id, ...data }};
}

export async function deleteItem(entity: string, id: string | number) {
  console.log(`Deleting ${entity} ${id}`);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  return { success: true };
}

export async function fetchAuditLogs(filters?: any) {
    console.log('Fetching audit logs with filters:', filters);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return [
        { id: 'log1', timestamp: new Date().toISOString(), username: 'staff1', action_type: 'USER_LOGIN', target_entity_type: 'USER', target_entity_id: 'staff1', ip_address: '192.168.1.10', details: 'User logged in successfully' },
        { id: 'log2', timestamp: new Date(Date.now() - 60000).toISOString(), username: 'teacher1', action_type: 'COURSE_MATERIAL_UPLOAD', target_entity_type: 'COURSE_MATERIAL', target_entity_id: 'cm-123', ip_address: '10.0.0.5', details: 'Uploaded "Lecture 5.pdf" to EE305' },
    ];
}
