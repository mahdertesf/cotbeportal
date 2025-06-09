
import type { UserRole, UserProfile } from '@/stores/appStore';

// --- Auth ---
export async function handleLogin(username: string, password_hash: string, role: UserRole) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: password_hash, role }),
  });
  if (!response.ok) { // Improved error handling for login
    const errorData = await response.json().catch(() => ({error: 'Login failed, server error'}));
    return { success: false, error: errorData.error || 'Login failed', data: null };
  }
  return response.json();
}

export async function handleForgotPassword(email: string) {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return response.json();
}

export async function handleResetPassword(token: string, newPassword_hash: string) {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword: newPassword_hash }),
  });
  return response.json();
}

export async function handleChangePassword(userId: string | number, currentPassword_hash: string, newPassword_hash: string) {
  const response = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, currentPassword: currentPassword_hash, newPassword: newPassword_hash }),
  });
  return response.json();
}


// --- User Management ---
export async function fetchAllUsers(): Promise<UserProfile[]> {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

// --- Profile Fetching ---
export async function fetchStudentProfile(userId: string | number): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch student profile');
  const user = await response.json();
  if (user.role !== 'Student') throw new Error('User is not a student');
  return user;
}

export async function fetchTeacherProfile(userId: string | number): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch teacher profile');
  const user = await response.json();
  if (user.role !== 'Teacher') throw new Error('User is not a teacher');
  return user;
}

export async function fetchStaffProfile(userId: string | number): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch staff profile');
  const user = await response.json();
  if (user.role !== 'Staff Head' && user.role !== 'Admin') throw new Error('User is not staff or admin');
  return user;
}

// --- Profile Updating ---
export async function updateStudentProfile(userId: string | number, data: Partial<UserProfile>) {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({error: 'Failed to update student profile'}));
    return { success: false, error: errorData.message || errorData.error, data: null };
  }
  return { success: true, data: await response.json() };
}

export async function updateTeacherProfile(userId: string | number, data: Partial<UserProfile>) {
   const response = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
   if (!response.ok) {
    const errorData = await response.json().catch(() => ({error: 'Failed to update teacher profile'}));
    return { success: false, error: errorData.message || errorData.error, data: null };
  }
  return { success: true, data: await response.json() };
}

export async function updateStaffProfile(userId: string | number, data: Partial<UserProfile>) {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({error: 'Failed to update staff profile'}));
    return { success: false, error: errorData.message || errorData.error, data: null };
  }
  return { success: true, data: await response.json() };
}


// --- Generic CRUD section ---
export let mockDatabases: Record<string, any[]> = {
  // Users, Departments, Courses, Semesters, Buildings, Rooms are now managed by API routes
  scheduledCourses: [
    { scheduled_course_id: 'sc-fall24-cs101-a', course_id: 'course-1', semester_id: 'sem-1', teacher_id: 'teacher-2', room_id: 'room-1', section_number: 'A', max_capacity: 50, current_enrollment: 2, days_of_week: 'MWF', start_time: '09:00', end_time: '09:50' },
    { scheduled_course_id: 'sc-fall24-ee305-a', course_id: 'course-5', semester_id: 'sem-1', teacher_id: 'teacher-1', room_id: 'room-2', section_number: 'A', max_capacity: 30, current_enrollment: 1, days_of_week: 'TTH', start_time: '13:00', end_time: '14:15' },
  ],
  registrations: [
    { registration_id: 'reg-1', student_id: 'stud1', scheduled_course_id: 'sc-fall24-cs101-a', registration_date: new Date().toISOString(), status: 'Registered', final_grade: null, grade_points: null },
    { registration_id: 'reg-2', student_id: 'stud2', scheduled_course_id: 'sc-fall24-cs101-a', registration_date: new Date().toISOString(), status: 'Registered', final_grade: null, grade_points: null },
    { registration_id: 'reg-3', student_id: 'stud1', scheduled_course_id: 'sc-fall24-ee305-a', registration_date: new Date().toISOString(), status: 'Registered', final_grade: null, grade_points: null },
  ],
  assessments: {}, // Will be keyed by `assessments?courseId=SC_ID`
  announcements: [
    { announcement_id: 'anno-1', title: 'Welcome Fall 2024!', content: 'Welcome to CoTBE!', author_id: 'staff1', target_audience: 'All Portal Users', status: 'Published', publish_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), department_id: null },
    { announcement_id: 'anno-2', title: 'CS Dept Meeting', content: 'CS students meeting Sep 5th.', author_id: 'teacher-2', target_audience: 'Specific Department Students', status: 'Published', publish_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), department_id: 'dept-1' },
  ],
  courseMaterials: [
    { material_id: 'cm-1', scheduled_course_id: 'sc-fall24-cs101-a', title: 'CS101 Syllabus', description: 'Course outline', material_type: 'File', file_path: '/mock/cs101_syllabus.pdf', uploaded_by: 'teacher-2' },
  ],
  auditLogs: [
    { id: 'log1', timestamp: new Date(Date.now() - Math.random()*100000000).toISOString(), username: 'staff1', action_type: 'USER_LOGIN', target_entity_type: 'USER', target_entity_id: 'staff1', ip_address: '192.168.1.10', details: 'User logged in successfully' },
  ],
};

// Initialize mock assessments for scheduled courses dynamically
mockDatabases.scheduledCourses.forEach(sc => {
    const courseIdKey = `assessments?courseId=${sc.scheduled_course_id}`;
    if (!mockDatabases.assessments[courseIdKey]) {
        mockDatabases.assessments[courseIdKey] = [
            { id: `asm-${sc.scheduled_course_id}-1`, scheduledCourseId: sc.scheduled_course_id, name: `Quiz 1 (${sc.course_id})`, description: 'Covers week 1-3 materials.', max_score: 20, due_date: '2024-09-15T23:59:00Z', type: 'Quiz' },
            { id: `asm-${sc.scheduled_course_id}-2`, scheduledCourseId: sc.scheduled_course_id, name: `Midterm Exam (${sc.course_id})`, description: 'Comprehensive Midterm Examination.', max_score: 30, due_date: '2024-10-15T23:59:00Z', type: 'Exam' },
        ];
    }
});


export async function fetchItems(entity: string, filters?: any) {
  console.log(`Fetching ${entity} with filters:`, filters);
  
  const entityToApiMap: Record<string, string> = {
    'users': '/api/users',
    'departments': '/api/departments',
    'courses': '/api/courses',
    'semesters': '/api/semesters',
    'buildings': '/api/buildings',
    'rooms': '/api/rooms',
  };

  if (entityToApiMap[entity]) {
    const response = await fetch(entityToApiMap[entity]);
    if (!response.ok) throw new Error(`Failed to fetch ${entity} from API`);
    return response.json();
  }
  
  // Fallback to mockDatabases for entities not yet migrated
  if (mockDatabases[entity]) {
    return JSON.parse(JSON.stringify(mockDatabases[entity]));
  }
  if (entity === 'teachers') { 
    const response = await fetch('/api/users?role=Teacher');
    if (!response.ok) throw new Error('Failed to fetch teachers');
    const allUsers = await response.json();
    return allUsers.filter((user: UserProfile) => user.role === 'Teacher')
                   .map((user: UserProfile) => ({ user_id: user.user_id, first_name: user.first_name, last_name: user.last_name, department_id: user.department_id }));
  }
  if (entity.startsWith('assessments?courseId=')) { 
    return JSON.parse(JSON.stringify(mockDatabases.assessments[entity] || []));
  }
  console.warn(`fetchItems: Entity "${entity}" not found in API routes or mockDatabases.`);
  return [];
}


export async function createItem(entity: string, data: any) {
  console.log(`Creating ${entity}:`, data);

  const entityToApiMap: Record<string, string> = {
    'users': '/api/users',
    'departments': '/api/departments',
    'courses': '/api/courses',
    'semesters': '/api/semesters',
    'buildings': '/api/buildings',
    'rooms': '/api/rooms',
  };

  if (entityToApiMap[entity]) {
    const response = await fetch(entityToApiMap[entity], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({error: `Failed to create ${entity}`}));
      return { success: false, error: errorData.message || errorData.error, data: null };
    }
    return { success: true, data: await response.json() };
  }
  
  // Fallback to direct mock manipulation for entities not yet migrated
  await new Promise(resolve => setTimeout(resolve, 100)); 
  let newItem = { ...data };
  const idKey = entity === 'scheduledCourses' ? 'scheduled_course_id' : entity === 'announcements' ? 'announcement_id' : 'id';
  
  if (!data[idKey] && idKey === 'id') { 
     newItem.id = `${entity.slice(0,4)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  
  if (entity === 'scheduledCourses') {
    newItem.scheduled_course_id = `sc-${Date.now()}`;
    newItem.current_enrollment = 0;
  } else if (entity === 'announcements') {
     newItem.announcement_id = `anno-${Date.now()}`;
     newItem.status = 'Draft';
     newItem.created_at = new Date().toISOString();
     newItem.updated_at = new Date().toISOString();
  }

  if (mockDatabases[entity]) {
    mockDatabases[entity].push(newItem);
  } else if (entity.startsWith('assessments?courseId=')) {
      if (!mockDatabases.assessments[entity]) mockDatabases.assessments[entity] = [];
      newItem.id = `asm-${entity.split('=')[1]}-${Date.now()}`; 
      mockDatabases.assessments[entity].push(newItem);
  } else {
    console.warn(`createItem: Entity "${entity}" not explicitly handled for mock DB, using generic push.`);
    if (!mockDatabases[entity]) mockDatabases[entity] = [];
    mockDatabases[entity].push(newItem);
  }
  return { success: true, data: newItem, error: null };
}

export async function updateItem(entity: string, id: string | number, data: any) {
  console.log(`Updating ${entity} ${id}:`, data);

  const entityToApiMap: Record<string, string> = {
    'users': `/api/users/${id}`,
    'departments': `/api/departments/${id}`,
    'courses': `/api/courses/${id}`,
    'semesters': `/api/semesters/${id}`,
    'buildings': `/api/buildings/${id}`,
    'rooms': `/api/rooms/${id}`,
  };

  if (entityToApiMap[entity]) {
    const response = await fetch(entityToApiMap[entity], {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({error: `Failed to update ${entity}`}));
      return { success: false, error: errorData.message || errorData.error, data: null };
    }
    return { success: true, data: await response.json() };
  }

  // Fallback to direct mock manipulation
  await new Promise(resolve => setTimeout(resolve, 100));
  let itemUpdated = false;
  let updatedItemData = null;
  const idKey = entity === 'scheduledCourses' ? 'scheduled_course_id' : entity === 'announcements' ? 'announcement_id' : 'id';

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
  if (!itemUpdated) return { success: false, error: "Item not found", data: null };
  return { success: true, data: updatedItemData, error: null};
}

export async function deleteItem(entity: string, id: string | number) {
  console.log(`Deleting ${entity} ${id}`);
  
  const entityToApiMap: Record<string, string> = {
    'users': `/api/users/${id}`,
    'departments': `/api/departments/${id}`,
    'courses': `/api/courses/${id}`,
    'semesters': `/api/semesters/${id}`,
    'buildings': `/api/buildings/${id}`,
    'rooms': `/api/rooms/${id}`,
  };

  if (entityToApiMap[entity]) {
    const response = await fetch(entityToApiMap[entity], { method: 'DELETE' });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({error: `Failed to delete ${entity}`}));
        return { success: false, error: errorData.message || "Failed to delete from API" };
    }
    return { success: true, message: (await response.json()).message };
  }

  // Fallback to direct mock manipulation
  await new Promise(resolve => setTimeout(resolve, 100));
  const idKey = entity === 'scheduledCourses' ? 'scheduled_course_id' : entity === 'announcements' ? 'announcement_id' : 'id';

  if (mockDatabases[entity]) {
    const initialLength = mockDatabases[entity].length;
    mockDatabases[entity] = mockDatabases[entity].filter((item: any) => String(item[idKey]) !== String(id));
    if (mockDatabases[entity].length < initialLength) return { success: true };
  } else if (entity.startsWith('assessments?courseId=')) {
      if (mockDatabases.assessments[entity]) {
          const initialLength = mockDatabases.assessments[entity].length;
          mockDatabases.assessments[entity] = mockDatabases.assessments[entity].filter((item: any) => String(item.id) !== String(id));
          if (mockDatabases.assessments[entity].length < initialLength) return { success: true };
      }
  }
  return { success: false, error: "Item not found" };
}

// --- Specific fetch functions still using MOCK or needing API route migration ---

export async function fetchAvailableCourses(filters?: any) {
  console.log('Fetching available courses with filters:', filters);
  // TODO: Migrate to /api/available-courses or similar
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
  
  // These should now fetch from their respective API endpoints or in-memory stores if already migrated.
  const allScheduled = mockDatabases.scheduledCourses; // Keep mock for now
  const catalogResponse = await fetch('/api/courses');
  const catalog = await catalogResponse.json();
  
  const usersResponse = await fetch('/api/users');
  const allUsers = await usersResponse.json();
  const teachers = allUsers.filter((u: UserProfile) => u.role === 'Teacher');
  
  const roomsResponse = await fetch('/api/rooms');
  const rooms = await roomsResponse.json();

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
  // TODO: Migrate to POST /api/registrations
  await new Promise(resolve => setTimeout(resolve, 100));
  // Mock logic: find student (assume 'stud1' for demo), check if already registered, add to registrations
  const studentId = 'stud1'; // Placeholder
  const existing = mockDatabases.registrations.find(r => r.student_id === studentId && r.scheduled_course_id === scheduledCourseId);
  if (existing) return { success: false, error: "Already registered or waitlisted." };
  
  const sc = mockDatabases.scheduledCourses.find(c => c.scheduled_course_id === scheduledCourseId);
  if (!sc) return { success: false, error: "Course not found." };
  if (sc.current_enrollment >= sc.max_capacity) return { success: false, error: "Course is full." };

  mockDatabases.registrations.push({
      registration_id: `reg-${Date.now()}`, student_id: studentId, scheduled_course_id: scheduledCourseId,
      registration_date: new Date().toISOString(), status: 'Registered', final_grade: null, grade_points: null
  });
  sc.current_enrollment++;
  return { success: true, message: `Successfully registered for course ${scheduledCourseId}.` };
}

export async function handleDropCourse(registrationId: string) {
  console.log('Dropping course registration:', registrationId);
  // TODO: Migrate to DELETE /api/registrations/:id or PUT /api/registrations/:id (update status)
  await new Promise(resolve => setTimeout(resolve, 100));
  const regIndex = mockDatabases.registrations.findIndex(r => r.registration_id === registrationId);
  if (regIndex === -1) return { success: false, error: "Registration not found." };
  
  const reg = mockDatabases.registrations[regIndex];
  const sc = mockDatabases.scheduledCourses.find(c => c.scheduled_course_id === reg.scheduled_course_id);
  if (sc && reg.status === 'Registered') sc.current_enrollment = Math.max(0, sc.current_enrollment - 1);
  
  mockDatabases.registrations[regIndex].status = 'Dropped';
  // Or: mockDatabases.registrations.splice(regIndex, 1);
  return { success: true, message: `Successfully dropped course ${registrationId}.` };
}

export async function fetchStudentRegisteredCourses(studentId: string | number) {
  console.log('Fetching registered courses for student:', studentId);
  // TODO: Migrate to GET /api/students/:studentId/registrations or /api/registrations?studentId=...
  await new Promise(resolve => setTimeout(resolve, 100));
  const studentRegs = mockDatabases.registrations.filter(reg => String(reg.student_id) === String(studentId));
  const scheduledCourses = mockDatabases.scheduledCourses; 
  
  const catalogResponse = await fetch('/api/courses'); // API Call
  const catalog = await catalogResponse.json();

  return studentRegs.map(reg => {
    const sc = scheduledCourses.find(s => String(s.scheduled_course_id) === String(reg.scheduled_course_id));
    const courseInfo = sc ? catalog.find((c:any) => String(c.id) === String(sc.course_id)) : null;
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
  // TODO: Migrate to GET /api/scheduled-courses/:id/materials
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockDatabases.courseMaterials?.filter((m: any) => String(m.scheduled_course_id) === String(scheduledCourseId)) || [];
}

export async function fetchStudentAssessments(scheduledCourseId: string, studentId: string | number) {
    console.log('Fetching assessments for student:', studentId, 'in course:', scheduledCourseId);
    // TODO: Migrate to GET /api/students/:studentId/courses/:scheduledCourseId/assessments (or similar)
    await new Promise(resolve => setTimeout(resolve, 100));
    const courseAssessmentsKey = `assessments?courseId=${scheduledCourseId}`;
    const courseAssessments = mockDatabases.assessments[courseAssessmentsKey] || [];
    return courseAssessments.map((asm: any) => ({
        assessment_id: asm.id, name: asm.name, max_score: asm.max_score,
        // Mock scores for demo
        score: Math.random() > 0.5 ? Math.floor(Math.random() * asm.max_score) : null,
        feedback: Math.random() > 0.5 ? 'Mock feedback.' : null,
    }));
}

export async function fetchAcademicHistory(studentId: string | number) {
  console.log('Fetching academic history for student:', studentId);
  // TODO: Migrate to GET /api/students/:studentId/academic-history
  await new Promise(resolve => setTimeout(resolve, 100));
    const coursesSem1Year1 = [ { course_code: 'CS101', title: 'Intro to Programming', credits: 3, final_grade: 'A', grade_points: 12.0 }, { course_code: 'MA101', title: 'Calculus I', credits: 4, final_grade: 'B+', grade_points: 13.2 }, ];
  const totalCreditsSem1Year1 = coursesSem1Year1.reduce((sum, c) => sum + c.credits, 0);
  const totalGradePointsSem1Year1 = coursesSem1Year1.reduce((sum, c) => sum + c.grade_points, 0);
  const gpaSem1Year1 = totalCreditsSem1Year1 > 0 ? totalGradePointsSem1Year1 / totalCreditsSem1Year1 : 0;
  const coursesSem2Year1 = [ { course_code: 'CS201', title: 'Data Structures', credits: 3, final_grade: 'A-', grade_points: 11.1 }, { course_code: 'PHY101', title: 'Physics I', credits: 4, final_grade: 'B', grade_points: 12.0 }, ];
  const totalCreditsSem2Year1 = coursesSem2Year1.reduce((sum, c) => sum + c.credits, 0);
  const totalGradePointsSem2Year1 = coursesSem2Year1.reduce((sum, c) => sum + c.grade_points, 0);
  const gpaSem2Year1 = totalCreditsSem2Year1 > 0 ? totalGradePointsSem2Year1 / totalCreditsSem2Year1 : 0;
  const annualGPAYear1 = (totalCreditsSem1Year1 + totalCreditsSem2Year1) > 0 ? (totalGradePointsSem1Year1 + totalGradePointsSem2Year1) / (totalCreditsSem1Year1 + totalCreditsSem2Year1) : 0;
  const coursesSem1Year2 = [ { course_code: 'EE202', title: 'Circuit Theory', credits: 3, final_grade: 'A', grade_points: 12.0 }, { course_code: 'STAT210', title: 'Probability & Statistics', credits: 3, final_grade: 'C+', grade_points: 6.9 }, ];
  const totalCreditsSem1Year2 = coursesSem1Year2.reduce((sum, c) => sum + c.credits, 0);
  const totalGradePointsSem1Year2 = coursesSem1Year2.reduce((sum, c) => sum + c.grade_points, 0);
  const gpaSem1Year2 = totalCreditsSem1Year2 > 0 ? totalGradePointsSem1Year2 / totalCreditsSem1Year2 : 0;
  const coursesSem2Year2 = [ { course_code: 'MECH250', title: 'Thermodynamics', credits: 3, final_grade: 'B', grade_points: 9.0 }, { course_code: 'EE205', title: 'Digital Logic', credits: 3, final_grade: 'A-', grade_points: 11.1 }, ];
  const totalCreditsSem2Year2 = coursesSem2Year2.reduce((sum, c) => sum + c.credits, 0);
  const totalGradePointsSem2Year2 = coursesSem2Year2.reduce((sum, c) => sum + c.grade_points, 0);
  const gpaSem2Year2 = totalCreditsSem2Year2 > 0 ? totalGradePointsSem2Year2 / totalCreditsSem2Year2 : 0;
  const annualGPAYear2 = (totalCreditsSem1Year2 + totalCreditsSem2Year2) > 0 ? (totalGradePointsSem1Year2 + totalGradePointsSem2Year2) / (totalCreditsSem1Year2 + totalCreditsSem2Year2) : 0;
  const allCourses = [...coursesSem1Year1, ...coursesSem2Year1, ...coursesSem1Year2, ...coursesSem2Year2];
  const totalCumulativeCredits = allCourses.reduce((sum, c) => sum + c.credits, 0);
  const totalCumulativeGradePoints = allCourses.reduce((sum, c) => sum + c.grade_points, 0);
  const cumulativeGPA = totalCumulativeCredits > 0 ? totalCumulativeGradePoints / totalCumulativeCredits : 0;
  return { academic_years: [ { year: "Academic Year 2022-2023", semesters: [ { name: "Semester One" as const, courses: coursesSem1Year1, semesterGPA: gpaSem1Year1, }, { name: "Semester Two" as const, courses: coursesSem2Year1, semesterGPA: gpaSem2Year1, }, ], annualGPA: annualGPAYear1, }, { year: "Academic Year 2023-2024", semesters: [ { name: "Semester One" as const, courses: coursesSem1Year2, semesterGPA: gpaSem1Year2, }, { name: "Semester Two" as const, courses: coursesSem2Year2, semesterGPA: gpaSem2Year2, } ], annualGPA: annualGPAYear2, } ], cumulativeGPA: cumulativeGPA, };
}

export async function fetchTeacherAssignedCourses(teacherId: string | number, semesterId?: string | number) {
    console.log('Fetching assigned courses for teacher:', teacherId, 'semester:', semesterId);
    // TODO: Migrate to /api/teachers/:teacherId/courses?semesterId=...
    await new Promise(resolve => setTimeout(resolve, 100));
    const allScheduled = mockDatabases.scheduledCourses; // Keep mock for now
    
    const coursesResponse = await fetch('/api/courses'); // API call
    const courses = await coursesResponse.json();

    return allScheduled
      .filter((sc: any) => String(sc.teacher_id) === String(teacherId) && (semesterId ? String(sc.semester_id) === String(semesterId) : true))
      .map((sc: any) => {
        const courseInfo = courses.find((c:any) => String(c.id) === String(sc.course_id));
        return { scheduled_course_id: sc.scheduled_course_id, course_code: courseInfo?.course_code || 'N/A', title: courseInfo?.title || 'N/A', section: sc.section_number };
      });
}

export async function fetchStudentRoster(scheduledCourseId: string): Promise<Array<{ student_id: string; first_name: string; last_name: string; email: string; }>> {
    console.log('Fetching student roster for course:', scheduledCourseId);
    // TODO: Migrate to /api/scheduled-courses/:id/roster
    await new Promise(resolve => setTimeout(resolve, 100));
    const registrationsForCourse = mockDatabases.registrations.filter( reg => String(reg.scheduled_course_id) === String(scheduledCourseId) && reg.status === 'Registered' );
    const studentIds = registrationsForCourse.map(reg => reg.student_id);
    
    const allAppUsersResponse = await fetch('/api/users'); // API call
    const allAppUsers = await allAppUsersResponse.json();

    const roster = allAppUsers
      .filter((user: UserProfile) => user.role === 'Student' && studentIds.includes(String(user.user_id)))
      .map((studentUser: UserProfile) => ({ student_id: String(studentUser.user_id), first_name: studentUser.first_name, last_name: studentUser.last_name, email: studentUser.email }));
    return roster;
}

export async function createCourseMaterial(scheduledCourseId: string, materialData: any) {
    console.log('Creating course material for course:', scheduledCourseId, 'data:', materialData);
    // TODO: Migrate to POST /api/scheduled-courses/:id/materials
    await new Promise(resolve => setTimeout(resolve, 100));
    const newMaterial = { material_id: `cm-${Date.now()}`, scheduled_course_id: scheduledCourseId, uploaded_by: 'teacher-1', ...materialData };
    if (!mockDatabases.courseMaterials) mockDatabases.courseMaterials = [];
    mockDatabases.courseMaterials.push(newMaterial);
    return { success: true, data: newMaterial };
}

export async function fetchStudentRegistrationsForCourseGrading(scheduledCourseId: string): Promise<Array<{ registration_id: string; student_id: string; first_name: string; last_name: string; email: string; current_final_grade: string | null; current_grade_points: number | null;}>> {
  console.log('Fetching student registrations for grading, course:', scheduledCourseId);
  // TODO: Migrate this complex query to an API route
  await new Promise(resolve => setTimeout(resolve, 100));
  const registrationsForCourse = mockDatabases.registrations.filter( reg => String(reg.scheduled_course_id) === String(scheduledCourseId) );
  
  const allAppUsersResponse = await fetch('/api/users'); // API call
  const allAppUsers = await allAppUsersResponse.json();

  return registrationsForCourse.map(reg => {
    const studentInfo = allAppUsers.find((u: UserProfile) => String(u.user_id) === String(reg.student_id));
    return {
      registration_id: reg.registration_id, student_id: reg.student_id,
      first_name: studentInfo?.first_name || 'Unknown', last_name: studentInfo?.last_name || 'Student',
      email: studentInfo?.email || 'unknown@example.com',
      current_final_grade: reg.final_grade || null, current_grade_points: reg.grade_points || null,
    };
  });
}

export async function fetchAllStudentAssessmentScoresForCourse(scheduledCourseId: string): Promise<Record<string, Record<string, { score: number | null; feedback: string | null }>>> {
  console.log('Fetching all student assessment scores for course:', scheduledCourseId);
  // TODO: Migrate this to an API. This is a complex data shape to mock simply.
  await new Promise(resolve => setTimeout(resolve, 100));
  const mockScores: Record<string, Record<string, { score: number | null; feedback: string | null }>> = {};
  const courseAssessmentsKey = `assessments?courseId=${scheduledCourseId}`;
  const courseAssessments = mockDatabases.assessments[courseAssessmentsKey] || [];
  const registrations = mockDatabases.registrations.filter(r => String(r.scheduled_course_id) === String(scheduledCourseId));

  registrations.forEach(reg => {
      mockScores[reg.student_id] = {};
      courseAssessments.forEach((asm: any) => {
        const maxScore = typeof asm.max_score === 'number' ? asm.max_score : 0;
        mockScores[reg.student_id][asm.id] = {
            score: Math.random() > 0.2 ? Math.floor(Math.random() * maxScore * 0.7 + maxScore * 0.3) : null, // 80% chance of having a score
            feedback: Math.random() > 0.5 ? "This is mock feedback." : null
        };
      });
    });
  return mockScores;
}

export async function fetchAuditLogs(filters?: any) {
    console.log('Fetching audit logs with filters:', filters);
    // TODO: Migrate to /api/audit-logs
    await new Promise(resolve => setTimeout(resolve, 100));
    const limit = filters?.limit || 50;
    return mockDatabases.auditLogs.slice(0, limit);
}

export async function handleManualStudentRegistration(studentId: string, scheduledCourseId: string) {
  console.log(`Manually registering student ${studentId} for scheduled course ${scheduledCourseId}`);
  // TODO: Migrate to POST /api/registrations/manual (or similar)
  await new Promise(resolve => setTimeout(resolve, 100));
  const existingRegistration = mockDatabases.registrations.find( reg => String(reg.student_id) === String(studentId) && String(reg.scheduled_course_id) === String(scheduledCourseId) );
  if (existingRegistration) return { success: false, error: "Student is already registered or waitlisted." };
  const sc = mockDatabases.scheduledCourses.find(c => String(c.scheduled_course_id) === String(scheduledCourseId));
  if (!sc) return { success: false, error: "Scheduled course not found." };
  let message = `Student successfully registered for course.`;
  if (sc.current_enrollment >= sc.max_capacity) message += ` (Capacity exceeded by manual override).`;
  
  const newRegistration = { registration_id: `reg-${Date.now()}`, student_id: studentId, scheduled_course_id: scheduledCourseId, registration_date: new Date().toISOString(), status: 'Registered', final_grade: null, grade_points: null, };
  mockDatabases.registrations.push(newRegistration);
  const scIndex = mockDatabases.scheduledCourses.findIndex(c => String(c.scheduled_course_id) === String(scheduledCourseId));
  if (scIndex !== -1) mockDatabases.scheduledCourses[scIndex].current_enrollment += 1;
  return { success: true, message: message };
}

export async function fetchAnnouncements({ role, departmentId }: { role: UserRole, departmentId?: string | number }) {
  console.log(`Fetching announcements for role: ${role}, departmentId: ${departmentId}`);
  // TODO: Migrate to /api/announcements with query params for role/dept
  await new Promise(resolve => setTimeout(resolve, 100));
  const now = new Date();
  const publishedAnnouncements = mockDatabases.announcements.filter(ann => ann.status === 'Published' && new Date(ann.publish_date) <= now);
  let relevantAnnouncements = publishedAnnouncements.filter(ann => {
    if (ann.target_audience === 'All Portal Users') return true;
    if (role === 'Student' && ann.target_audience === 'All Students') return true;
    if (role === 'Teacher' && ann.target_audience === 'All Teachers') return true;
    if ((role === 'Staff Head' || role === 'Admin') && ann.target_audience === 'All Staff') return true;
    if (role === 'Student' && ann.target_audience === 'Specific Department Students' && String(ann.department_id) === String(departmentId)) return true;
    if (role === 'Teacher' && ann.target_audience === 'Specific Department Faculty' && String(ann.department_id) === String(departmentId)) return true;
    return false;
  });
  relevantAnnouncements.sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());
  return relevantAnnouncements;
}
