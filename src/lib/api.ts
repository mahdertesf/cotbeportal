
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
      phone_number: '0977654321',
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

export async function handleChangePassword(userId: string | number, currentPassword_hash: string, newPassword_hash: string) {
  console.log('Changing password for user:', userId);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  // Simulate password change logic
  // In a real app, you'd verify currentPassword_hash against the stored hash
  if (currentPassword_hash === "wrong_password") { // Simple mock check
    return { success: false, error: 'Incorrect current password.' };
  }
  if (newPassword_hash.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }
  // Simulate successful password update
  return { success: true, message: 'Password changed successfully.' };
}


// --- User Management (Staff) ---
export async function fetchAllUsers(): Promise<UserProfile[]> {
  console.log('Fetching all users');
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  return [
    { user_id: 'stud1', username: 'student.one', email: 's1@cotbe.edu', role: 'Student', first_name: 'Abebe', last_name: 'Bekele', is_active: true, date_joined: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(), last_login: new Date().toISOString(), department_id: 'dept-1', department_name: "Computer Science", enrollment_date: "2022-09-01", date_of_birth: "2003-05-10", address: "Arat Kilo, Addis Ababa", phone_number: "0911111111" },
    { user_id: 'teach1', username: 'teacher.one', email: 't1@cotbe.edu', role: 'Teacher', first_name: 'Chaltu', last_name: 'Lemma', is_active: true, date_joined: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(), last_login: new Date().toISOString(), department_id: 'dept-2', department_name: "Electrical Engineering", office_location: "Block C, Room 203", phone_number: "0922222222" },
    { user_id: 'staff1', username: 'staff.one', email: 'staff1@cotbe.edu', role: 'Staff Head', first_name: 'Kebede', last_name: 'Tadesse', is_active: true, date_joined: new Date(Date.now() - 1000 * 24 * 60 * 60 * 1000).toISOString(), last_login: new Date().toISOString(), job_title: "Registry Head", phone_number: "0933221100" },
    { user_id: 'stud2', username: 'student.two', email: 's2@cotbe.edu', role: 'Student', first_name: 'Hana', last_name: 'Girma', is_active: true, date_joined: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(), last_login: new Date().toISOString(), department_id: 'dept-1', department_name: "Computer Science", enrollment_date: "2023-03-15", date_of_birth: "2004-01-20", address: "Bole, Addis Ababa", phone_number: "0933333333" },
    { user_id: 'stud3', username: 'student.three', email: 's3@cotbe.edu', role: 'Student', first_name: 'Yonas', last_name: 'Ayele', is_active: false, date_joined: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), last_login: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), department_id: 'dept-3', department_name: "Civil Engineering", enrollment_date: "2023-09-01", date_of_birth: "2002-11-05", address: "Piassa, Addis Ababa", phone_number: "0944444444" },
  ];
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
    date_joined: new Date().toISOString(),
    last_login: new Date().toISOString(),
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
    return { success: true, data: { ...await fetchTeacherProfile(userId), ...data } };
}

// --- Staff Head ---
export async function fetchStaffProfile(userId: string | number) {
    console.log('Fetching staff profile for:', userId);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return {
        user_id: userId,
        username: 'teststaff',
        email: 'teststaff@cotbe.edu',
        first_name: 'Test',
        last_name: 'Staff',
        role: 'Staff Head',
        job_title: 'Head of Administration',
        phone_number: '0977654321',
        is_active: true,
        date_joined: new Date().toISOString(),
        last_login: new Date().toISOString(),
    } as UserProfile;
}

export async function updateStaffProfile(userId: string | number, data: Partial<UserProfile>) {
    console.log('Updating staff profile for:', userId, 'with data:', data);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return { success: true, data: { ...await fetchStaffProfile(userId), ...data } };
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

export async function fetchStudentRoster(scheduledCourseId: string): Promise<Array<{ student_id: string; first_name: string; last_name: string; email: string; }>> {
    console.log('Fetching student roster for course:', scheduledCourseId);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    // Mock data based on a known scheduledCourseId, e.g. 'sc10' from fetchTeacherAssignedCourses
    if (scheduledCourseId === 'sc10' || scheduledCourseId === 'sc11' || scheduledCourseId === 'sc12') {
        return [
            { student_id: 'stud1', first_name: 'Abebe', last_name: 'Bekele', email: 'abebe@example.com' },
            { student_id: 'stud2', first_name: 'Chaltu', last_name: 'Lemma', email: 'chaltu@example.com' },
            { student_id: 'stud3', first_name: 'Kebede', last_name: 'Tadesse', email: 'kebede@example.com' },
        ];
    }
    return [];
}

export async function createCourseMaterial(scheduledCourseId: string, materialData: any) {
    console.log('Creating course material for course:', scheduledCourseId, 'data:', materialData);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return { success: true, data: { id: `cm-${Math.random()}`, ...materialData } };
}

// Used by TeacherCourseManagementPage - FinalGradesSubmission
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
  // This should ideally fetch from registrations table and join with student names
  // For mock, let's use the student roster and add registration details
  const roster = await fetchStudentRoster(scheduledCourseId); // student_id, first_name, last_name, email
  const existingFinalGrades = await fetchStudentFinalGradesForCourse(scheduledCourseId); // registration_id, student_id, final_grade, grade_points

  return roster.map(student => {
    const finalGradeInfo = existingFinalGrades.find(fg => fg.student_id === student.student_id);
    return {
      registration_id: finalGradeInfo?.registration_id || `reg-${scheduledCourseId}-${student.student_id}`, // Ensure a registration_id
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      current_final_grade: finalGradeInfo?.final_grade || null,
      current_grade_points: finalGradeInfo?.grade_points || null,
    };
  });
}

// Used by TeacherCourseManagementPage - FinalGradesSubmission
export async function fetchAllStudentAssessmentScoresForCourse(scheduledCourseId: string): Promise<Record<string, Record<string, { score: number | null; feedback: string | null }>>> {
  console.log('Fetching all student assessment scores for course:', scheduledCourseId);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));

  const mockScores: Record<string, Record<string, { score: number | null; feedback: string | null }>> = {};

  if (scheduledCourseId === 'sc10' || scheduledCourseId === 'sc11' || scheduledCourseId === 'sc12') {
    const courseAssessments = await fetchItems(`assessments?courseId=${scheduledCourseId}`);
    const students = ['stud1', 'stud2', 'stud3']; // From fetchStudentRoster

    students.forEach(studentId => {
      mockScores[studentId] = {};
      courseAssessments.forEach((asm: any) => {
        const maxScore = typeof asm.max_score === 'number' ? asm.max_score : 0;
        let score: number | null = null;
        let feedback: string | null = "Mock feedback.";

        if (studentId === 'stud1') { // stud1 has all scores
          score = Math.floor(Math.random() * (maxScore * 0.8) + maxScore * 0.2); // Score between 20% and 100% of max
        } else if (studentId === 'stud2') {
          if (asm.id === (courseAssessments[0] as any)?.id) { // Score for first assessment
             score = Math.floor(Math.random() * (maxScore * 0.7) + maxScore * 0.1); // Score between 10% and 80%
          } else { // Missing score for other assessments for stud2
            score = null;
            feedback = null;
          }
        } else if (studentId === 'stud3') { // stud3 has varied scores, some missing
           if (asm.id === (courseAssessments[0] as any)?.id) {
             score = Math.floor(Math.random() * (maxScore * 0.5)); // Lower score for first assessment
           } else {
             score = null; // Missing for others
             feedback = null;
           }
        }
        mockScores[studentId][asm.id] = { score, feedback };
      });
    });
  }
  return mockScores;
}


// --- Generic CRUD placeholders ---
export async function fetchItems(entity: string, filters?: any) {
  console.log(`Fetching ${entity} with filters:`, filters);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  if (entity === 'departments') {
    return [
        {id: 'dept-1', name: 'Computer Science', description: 'Department of Computer Science and Engineering.'}, 
        {id: 'dept-2', name: 'Electrical Engineering', description: 'Department of Electrical and Computer Engineering.'},
        {id: 'dept-3', name: 'Mechanical Engineering', description: 'Department of Mechanical and Industrial Engineering.'},
        {id: 'dept-4', name: 'Civil Engineering', description: 'Department of Civil and Environmental Engineering.'},
        {id: 'dept-5', name: 'Biomedical Engineering', description: 'Department of Biomedical Engineering.'},
    ];
  }
  if (entity === 'courses') {
    return [
        {id: 'course-1', course_code: 'CS101', title: 'Introduction to Programming', description: 'Fundamentals of programming using Python.', credits: 3, department_id: 'dept-1'},
        {id: 'course-2', course_code: 'EE201', title: 'Circuit Theory I', description: 'Basic electric circuit analysis.', credits: 4, department_id: 'dept-2'},
        {id: 'course-3', course_code: 'MECH210', title: 'Statics', description: 'Principles of engineering mechanics.', credits: 3, department_id: 'dept-3'},
        {id: 'course-4', course_code: 'CS350', title: 'Software Engineering', description: 'Software development lifecycle and methodologies.', credits: 3, department_id: 'dept-1'},
    ];
  }
  if (entity.startsWith('assessments?courseId=')) { 
    const courseId = entity.split('=')[1];
    if (courseId === 'sc10' || courseId === 'sc11' || courseId === 'sc12') { // Example course IDs
        return [
            { id: `asm-${courseId}-1`, scheduledCourseId: courseId, name: `Quiz 1 (${courseId})`, description: 'Covers week 1-3.', max_score: 20, due_date: '2024-09-15T23:59:00Z', type: 'Quiz' },
            { id: `asm-${courseId}-2`, scheduledCourseId: courseId, name: `Midterm Project (${courseId})`, description: 'Practical application.', max_score: 30, due_date: '2024-10-15T23:59:00Z', type: 'Project' },
            { id: `asm-${courseId}-3`, scheduledCourseId: courseId, name: `Final Exam (${courseId})`, description: 'Comprehensive final.', max_score: 50, due_date: '2024-11-15T23:59:00Z', type: 'Exam' },
        ];
    }
    // Default for other courses
    return [
        { id: 'asm-generic-1', scheduledCourseId: courseId, name: 'Generic Quiz 1', description: 'Basics', max_score: 20, due_date: '2024-08-15T23:59:00Z', type: 'Quiz' },
        { id: 'asm-generic-2', scheduledCourseId: courseId, name: 'Generic Assignment 1', description: 'Looping', max_score: 50, due_date: '2024-08-30T23:59:00Z', type: 'Assignment' },
    ];
  }
  if (entity === 'scheduledCourses') { // For Staff Dashboard
    return [
        { id: 'sc1', course_code: 'CS101', title: 'Intro to Programming', current_enrollment: 45 },
        { id: 'sc2', course_code: 'MA202', title: 'Calculus II', current_enrollment: 28 },
        { id: 'sc10', course_code: 'EE305', title: 'Digital Logic Design', current_enrollment: 30 },
    ];
  }
  return [];
}

// Kept for fetching student's own old grades if needed, but FinalGradesSubmission uses fetchStudentRegistrationsForCourseGrading
export async function fetchStudentFinalGradesForCourse(scheduledCourseId: string): Promise<Array<{ registration_id: string; student_id: string; final_grade: string | null; grade_points: number | null }>> {
  console.log('Fetching final grades for course:', scheduledCourseId);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  // Mock data: associate with students from fetchStudentRoster for consistency
  if (scheduledCourseId === 'sc10' || scheduledCourseId === 'sc11' || scheduledCourseId === 'sc12') {
    return [
      // Example: Assume stud1 has a previously saved A, stud2 a B+, stud3 nothing
      { registration_id: `reg-${scheduledCourseId}-stud1`, student_id: 'stud1', final_grade: 'A', grade_points: 4.00 },
      { registration_id: `reg-${scheduledCourseId}-stud2`, student_id: 'stud2', final_grade: 'B+', grade_points: 3.30 },
      { registration_id: `reg-${scheduledCourseId}-stud3`, student_id: 'stud3', final_grade: null, grade_points: null },
    ];
  }
  return [];
}


export async function createItem(entity: string, data: any) {
  console.log(`Creating ${entity}:`, data);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  const newId = `${entity.slice(0,4)}-${Math.floor(Math.random() * 100000)}`;
  if (entity === 'users') {
    const newUser: UserProfile = {
        user_id: newId,
        is_active: true,
        date_joined: new Date().toISOString(),
        last_login: new Date().toISOString(),
        ...data,
    };
    // Further tailor based on role if needed
    return { success: true, data: newUser, error: null};
  }
  return { success: true, data: { ...data, id: newId }, error: null};
}

export async function updateItem(entity: string, id: string | number, data: any) {
  console.log(`Updating ${entity} ${id}:`, data);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  if (entity === 'users') {
     const updatedUser: Partial<UserProfile> = { user_id: id, ...data };
     return { success: true, data: updatedUser, error: null};
  }
  if (entity === 'registrations') {
    console.log(`Mock DB: Registration ${id} updated with final_grade: ${data.final_grade}, grade_points: ${data.grade_points}`);
  }
  return { success: true, data: { id, ...data }, error: null};
}

export async function deleteItem(entity: string, id: string | number) {
  console.log(`Deleting ${entity} ${id}`);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  return { success: true };
}

export async function fetchAuditLogs(filters?: any) {
    console.log('Fetching audit logs with filters:', filters);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const defaultLogs = [
        { id: 'log1', timestamp: new Date(Date.now() - Math.random()*100000000).toISOString(), username: 'staff.one', action_type: 'USER_LOGIN', target_entity_type: 'USER', target_entity_id: 'staff1', ip_address: '192.168.1.10', details: 'User logged in successfully' },
        { id: 'log2', timestamp: new Date(Date.now() - Math.random()*100000000).toISOString(), username: 'teacher.one', action_type: 'COURSE_MATERIAL_UPLOAD', target_entity_type: 'COURSE_MATERIAL', target_entity_id: 'cm-123', ip_address: '10.0.0.5', details: 'Uploaded "Lecture 5.pdf" to EE305' },
        { id: 'log3', timestamp: new Date(Date.now() - Math.random()*100000000).toISOString(), username: 'student.one', action_type: 'COURSE_REGISTRATION', target_entity_type: 'REGISTRATION', target_entity_id: 'reg-sc1-stud1', ip_address: '203.0.113.45', details: 'Registered for CS101' },
        { id: 'log4', timestamp: new Date(Date.now() - Math.random()*100000000).toISOString(), username: 'staff.one', action_type: 'USER_UPDATE', target_entity_type: 'USER', target_entity_id: 'stud3', ip_address: '192.168.1.10', details: 'Deactivated user student.three' },
        { id: 'log5', timestamp: new Date(Date.now() - Math.random()*100000000).toISOString(), username: 'teacher.one', action_type: 'ASSESSMENT_GRADE_UPDATE', target_entity_type: 'STUDENT_ASSESSMENT', target_entity_id: 'sa-stud1-asmMock1', ip_address: '10.0.0.5', details: 'Graded Quiz 1 for Abebe Bekele in EE305' },
    ];
    const limit = filters?.limit || 50;
    return defaultLogs.slice(0, limit);
}
