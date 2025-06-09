
import type { UserRole, UserProfile } from '@/stores/appStore';

// --- Auth ---
export async function handleLogin(username: string, password_hash: string, role: UserRole) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: password_hash, role }),
    cache: 'no-store',
  });
  return response.json();
}

export async function handleForgotPassword(email: string) {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    cache: 'no-store',
  });
  return response.json();
}

export async function handleResetPassword(token: string, newPassword_hash: string) {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword: newPassword_hash }),
    cache: 'no-store',
  });
  return response.json();
}

export async function handleChangePassword(userId: string | number, currentPassword_hash: string, newPassword_hash: string) {
  const response = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, currentPassword: currentPassword_hash, newPassword: newPassword_hash }),
    cache: 'no-store',
  });
  return response.json();
}


// --- User Management (delegated to API routes) ---
export async function fetchAllUsers(): Promise<UserProfile[]> {
  const response = await fetch('/api/users', { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

// --- Profile Fetching (delegated to API routes) ---
export async function fetchStudentProfile(userId: string | number): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}`, { cache: 'no-store' }); 
  if (!response.ok) throw new Error('Failed to fetch student profile');
  const user = await response.json();
  if (user.role !== 'Student') throw new Error('User is not a student');
  return user;
}

export async function fetchTeacherProfile(userId: string | number): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch teacher profile');
  const user = await response.json();
  if (user.role !== 'Teacher') throw new Error('User is not a teacher');
  return user;
}

export async function fetchStaffProfile(userId: string | number): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch staff profile');
  const user = await response.json();
  if (user.role !== 'Staff Head' && user.role !== 'Admin') throw new Error('User is not staff or admin');
  return user;
}

// --- Profile Updating (delegated to API routes) ---
export async function updateStudentProfile(userId: string | number, data: Partial<UserProfile>) {
  return updateItem('users', userId, data);
}

export async function updateTeacherProfile(userId: string | number, data: Partial<UserProfile>) {
   return updateItem('users', userId, data);
}

export async function updateStaffProfile(userId: string | number, data: Partial<UserProfile>) {
  return updateItem('users', userId, data);
}


// --- Generic CRUD section ---
export let mockDatabases: Record<string, any[]> = {
  auditLogs: [
    { id: 'log1', timestamp: new Date(Date.now() - Math.random()*100000000).toISOString(), username: 'staff1', action_type: 'USER_LOGIN', target_entity_type: 'USER', target_entity_id: 'staff1', ip_address: '192.168.1.10', details: 'User logged in successfully' },
  ],
   announcements: [
    { announcement_id: 'anno-1', title: 'Welcome Fall 2024!', content: 'Welcome to CoTBE!', author_id: 'staff1', target_audience: 'All Portal Users', status: 'Published', publish_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), department_id: null },
    { announcement_id: 'anno-2', title: 'CS Dept Meeting', content: 'CS students meeting Sep 5th.', author_id: 'teacher-2', target_audience: 'Specific Department Students', status: 'Published', publish_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), department_id: 'dept-1' },
  ],
};


export async function fetchItems(entityOrQuery: string, id?: string | number, filters?: any) {
  const entityToApiMap: Record<string, string> = {
    'users': '/api/users',
    'departments': '/api/departments',
    'courses': '/api/courses',
    'semesters': '/api/semesters',
    'buildings': '/api/buildings',
    'rooms': '/api/rooms',
    'scheduledCourses': '/api/scheduledCourses',
    'registrations': '/api/registrations', 
    'assessments': '/api/assessments',
    'courseMaterials': '/api/courseMaterials',
    'studentAssessments': '/api/studentAssessments',
  };
  
  let entityName = entityOrQuery;
  let queryParamsString = '';
  let isApiCall = false;
  let apiUrl = '';

  if (entityOrQuery.startsWith('/api/')) {
    apiUrl = entityOrQuery; // Use the full path directly
    isApiCall = true;
     if (id) { // This case should ideally not happen if full path is given with ID already
        apiUrl = `${apiUrl}/${id}`;
    }
  } else if (entityOrQuery.includes('?')) {
    const [path, query] = entityOrQuery.split('?');
    entityName = path;
    queryParamsString = query;
    apiUrl = entityToApiMap[entityName] || '';
    isApiCall = !!apiUrl;
  } else {
    entityName = entityOrQuery;
    apiUrl = entityToApiMap[entityName] || '';
    isApiCall = !!apiUrl;
    if (id && apiUrl) {
        apiUrl = `${apiUrl}/${id}`;
    }
  }


  if (isApiCall && apiUrl) {
    if (filters && Object.keys(filters).length > 0) {
        const queryParams = new URLSearchParams(filters as any);
        apiUrl = `${apiUrl}?${queryParams.toString()}`;
    } else if (queryParamsString && !apiUrl.includes('?')) { // only add if not already part of apiUrl
         apiUrl = `${apiUrl}?${queryParamsString}`;
    }

    try {
      const response = await fetch(apiUrl, { cache: 'no-store' });
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `API request failed for ${entityOrQuery} with status ${response.status}` }));
          const errorMessage = errorData.message || errorData.error || `Failed to fetch ${entityOrQuery}. Status: ${response.status}`;
          console.error(`Error fetching ${entityOrQuery} from API at ${apiUrl}. Status: ${response.status}, Error: ${errorMessage}, Response Body: ${JSON.stringify(errorData)}`);
          throw new Error(errorMessage);
      }
      return response.json();
    } catch (error) {
       console.error(`Network or parsing error fetching ${entityOrQuery} from API at ${apiUrl}:`, error);
       throw error; // Re-throw the error to be caught by the caller
    }
  }
  
  // Fallback to mockDatabases if no API route is mapped (should be phased out)
  if (mockDatabases[entityOrQuery]) {
    return JSON.parse(JSON.stringify(mockDatabases[entityOrQuery]));
  }
   if (entityOrQuery === 'teachers') { 
    const response = await fetch('/api/users?role=Teacher', { cache: 'no-store' }); 
    if (!response.ok) throw new Error('Failed to fetch teachers');
    const allUsers = await response.json();
    return allUsers.filter((user: UserProfile) => user.role === 'Teacher')
                   .map((user: UserProfile) => ({ user_id: user.user_id, first_name: user.first_name, last_name: user.last_name, department_id: user.department_id }));
  }
  console.warn(`fetchItems: Entity or Query "${entityOrQuery}" not found in API routes or local mockDatabases.`);
  return []; // Return empty array if no match
}


export async function createItem(entity: string, data: any): Promise<{ success: boolean, data?: any, error?: string, message?: string }> {
  const entityToApiMap: Record<string, string> = {
    'users': '/api/users',
    'departments': '/api/departments',
    'courses': '/api/courses',
    'semesters': '/api/semesters',
    'buildings': '/api/buildings',
    'rooms': '/api/rooms',
    'scheduledCourses': '/api/scheduledCourses',
    'registrations': '/api/registrations',
    'assessments': '/api/assessments',
    'courseMaterials': '/api/courseMaterials',
    'studentAssessments': '/api/studentAssessments',
  };

  if (entityToApiMap[entity]) {
    const response = await fetch(entityToApiMap[entity], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      cache: 'no-store',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `API request failed for creating ${entity} with status ${response.status}`}));
        console.error(`Error creating ${entity} via API. Status: ${response.status}, Body: ${JSON.stringify(errorData)}`);
        return { success: false, error: errorData.error || errorData.message || `Failed to create ${entity}.` };
    }
    return response.json();
  }
  
  // Fallback to mockDatabases (should be phased out)
  await new Promise(resolve => setTimeout(resolve, 100)); 
  let newItem = { ...data };
  const idKey = entity === 'announcements' ? 'announcement_id' : 'id';
  
  if (!data[idKey] && idKey === 'id') { 
     newItem.id = `${entity.slice(0,4)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  
  if (entity === 'announcements') {
     newItem.announcement_id = `anno-${Date.now()}`;
     newItem.status = 'Draft'; 
     newItem.created_at = new Date().toISOString();
     newItem.updated_at = new Date().toISOString();
  }

  if (mockDatabases[entity]) {
    mockDatabases[entity].push(newItem);
  } else {
    console.warn(`createItem: Entity "${entity}" not explicitly handled for mock DB, using generic push.`);
    if (!mockDatabases[entity]) mockDatabases[entity] = [];
    mockDatabases[entity].push(newItem);
  }
  return { success: true, data: newItem };
}

export async function updateItem(entity: string, id: string | number, data: any): Promise<{ success: boolean, data?: any, error?: string, message?: string }> {
  const entityToApiMap: Record<string, string> = {
    'users': `/api/users/${id}`,
    'departments': `/api/departments/${id}`,
    'courses': `/api/courses/${id}`,
    'semesters': `/api/semesters/${id}`,
    'buildings': `/api/buildings/${id}`,
    'rooms': `/api/rooms/${id}`,
    'scheduledCourses': `/api/scheduledCourses/${id}`,
    'registrations': `/api/registrations/${id}`,
    'assessments': `/api/assessments/${id}`,
    'courseMaterials': `/api/courseMaterials/${id}`,
    'studentAssessments': `/api/studentAssessments`, 
  };
  
  let apiUrl = entityToApiMap[entity];
  let method = 'PUT';

  if (entity === 'studentAssessments') { 
    method = 'POST'; // StudentAssessments use POST for upsert
    apiUrl = '/api/studentAssessments'; 
  }


  if (apiUrl) {
    const response = await fetch(apiUrl, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      cache: 'no-store',
    });
     if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `API request failed for updating ${entity} with status ${response.status}`}));
        console.error(`Error updating ${entity} via API. Status: ${response.status}, Body: ${JSON.stringify(errorData)}`);
        return { success: false, error: errorData.error || errorData.message || `Failed to update ${entity}.` };
    }
    return response.json();
  }

  // Fallback to mockDatabases (should be phased out)
  await new Promise(resolve => setTimeout(resolve, 100));
  let itemUpdated = false;
  let updatedItemData = null;
  const idKey = entity === 'announcements' ? 'announcement_id' : 'id'; 

  if (mockDatabases[entity]) {
    const index = mockDatabases[entity].findIndex((item: any) => String(item[idKey]) === String(id));
    if (index !== -1) {
      mockDatabases[entity][index] = { ...mockDatabases[entity][index], ...data, updated_at: new Date().toISOString() };
      updatedItemData = mockDatabases[entity][index];
      itemUpdated = true;
    }
  } 
  if (!itemUpdated) return { success: false, error: "Item not found in mock" };
  return { success: true, data: updatedItemData };
}

export async function deleteItem(entity: string, id: string | number): Promise<{ success: boolean, message?: string, error?: string }> {
  const entityToApiMap: Record<string, string> = {
    'users': `/api/users/${id}`,
    'departments': `/api/departments/${id}`,
    'courses': `/api/courses/${id}`,
    'semesters': `/api/semesters/${id}`,
    'buildings': `/api/buildings/${id}`,
    'rooms': `/api/rooms/${id}`,
    'scheduledCourses': `/api/scheduledCourses/${id}`,
    'registrations': `/api/registrations/${id}`,
    'assessments': `/api/assessments/${id}`,
    'courseMaterials': `/api/courseMaterials/${id}`,
  };

  if (entityToApiMap[entity]) {
    const response = await fetch(entityToApiMap[entity], { method: 'DELETE', cache: 'no-store' });
     if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `API request failed for deleting ${entity} with status ${response.status}`}));
        console.error(`Error deleting ${entity} via API. Status: ${response.status}, Body: ${JSON.stringify(errorData)}`);
        return { success: false, error: errorData.error || errorData.message || `Failed to delete ${entity}.` };
    }
    return response.json();
  }

  // Fallback to mockDatabases (should be phased out)
  await new Promise(resolve => setTimeout(resolve, 100));
  const idKey = entity === 'announcements' ? 'announcement_id' : 'id';

  if (mockDatabases[entity]) {
    const initialLength = mockDatabases[entity].length;
    mockDatabases[entity] = mockDatabases[entity].filter((item: any) => String(item[idKey]) !== String(id));
    if (mockDatabases[entity].length < initialLength) return { success: true, message: 'Item deleted from mock.' };
  }
  return { success: false, error: "Item not found in mock" };
}

// --- Specific fetch functions (some now use API routes, some still MOCK or need API route migration) ---

export async function fetchAvailableCourses(filters?: any) {
  let queryString = '';
  if (filters) {
    const params = new URLSearchParams();
    if (filters.semesterId) params.append('semesterId', filters.semesterId);
    if (filters.departmentId) params.append('departmentId', filters.departmentId);
    // Note: The /api/scheduledCourses GET endpoint does not currently support server-side filtering by semester/department.
    // This filtering would happen client-side after fetching all scheduled courses if needed.
    // For now, we'll just pass them if they exist, but the API won't use them.
    queryString = params.toString();
  }

  const scheduledCoursesFromApi = await fetchItems(`/api/scheduledCourses${queryString ? `?${queryString}` : ''}`);

  if (!Array.isArray(scheduledCoursesFromApi)) {
    console.error("fetchAvailableCourses: API did not return an array. Data:", scheduledCoursesFromApi);
    return [];
  }

  return scheduledCoursesFromApi.map((sc: any) => ({
      id: sc.scheduled_course_id, 
      course_code: sc.course_code,
      title: sc.title,
      credits: sc.credits,
      section_number: sc.section_number,
      teacher_name: sc.teacher_name,
      room_name: sc.room_display_name, 
      schedule: sc.schedule, 
      max_capacity: sc.max_capacity,
      current_enrollment: sc.current_enrollment,
      description: sc.description,
      prerequisites: sc.prerequisites || [], 
  }));
}


export async function handleRegisterCourse(scheduledCourseId: string, studentId: string | number) { 
  return createItem('registrations', { student_id: String(studentId), scheduled_course_id: String(scheduledCourseId) });
}

export async function handleDropCourse(registrationId: string) {
  // To drop, we update the status to 'Dropped'. Deleting might be too permanent.
  return updateItem('registrations', registrationId, { status: 'Dropped' });
}

export async function fetchStudentRegisteredCourses(studentId: string | number) {
  const registrations = await fetchItems(`registrations?studentId=${studentId}`);
  if (!Array.isArray(registrations)) {
      console.error("fetchStudentRegisteredCourses: API did not return an array. Data:", registrations);
      return [];
  }
  return registrations.map((reg: any) => ({
      registrationId: reg.registration_id,
      scheduledCourseId: reg.scheduled_course_id,
      course_code: reg.course_code,
      title: reg.title,
      status: reg.status,
      final_grade: reg.final_grade || null,
  }));
}


export async function fetchStudentCourseMaterials(scheduledCourseId: string) {
  return fetchItems(`courseMaterials?scheduledCourseId=${scheduledCourseId}`);
}

export async function fetchStudentAssessments(studentId: string | number, scheduledCourseId: string) {
    const courseAssessments = await fetchItems(`assessments?scheduledCourseId=${scheduledCourseId}`) as any[];
    
    const studentRegistrations = await fetchItems(`registrations?studentId=${studentId}`) as any[];
    const currentRegistration = studentRegistrations.find(reg => String(reg.scheduled_course_id) === String(scheduledCourseId));

    let studentScores: any[] = [];
    if (currentRegistration) {
        // Fetch scores for the specific registration
        studentScores = await fetchItems(`studentAssessments?registrationId=${currentRegistration.registration_id}`) as any[];
    }
    
    if (!Array.isArray(courseAssessments)) {
        console.error("fetchStudentAssessments: courseAssessments is not an array", courseAssessments);
        return [];
    }
    if (!Array.isArray(studentScores)) {
        console.error("fetchStudentAssessments: studentScores is not an array", studentScores);
        // Potentially set studentScores to [] here if it's not critical to have them
    }


    return courseAssessments.map(asm => {
        const scoreEntry = studentScores.find(sc => String(sc.assessment_id) === String(asm.id) && String(sc.registration_id) === String(currentRegistration?.registration_id));
        return {
            id: asm.id, // Assessment ID
            name: asm.name,
            description: asm.description,
            max_score: asm.max_score,
            due_date: asm.due_date,
            type: asm.type,
            scheduled_course_id: asm.scheduledCourseId, 
            student_assessment_id: scoreEntry?.student_assessment_id,
            registration_id: currentRegistration?.registration_id, 
            assessment_id: asm.id, 
            student_id: String(studentId), 
            student_score: scoreEntry?.score ?? null,
            student_feedback: scoreEntry?.feedback ?? null,
            submission_timestamp: scoreEntry?.submission_timestamp,
            graded_at: scoreEntry?.graded_at,
        };
    });
}

export async function fetchAcademicHistory(studentId: string | number) {
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
    // console.log('[API LIB] Attempting to fetch courses for teacher ID:', teacherId, 'semester:', semesterId);
    let apiUrl = `/api/scheduledCourses`; 
    
    const allScheduledCourses = await fetchItems(apiUrl); 
    // console.log('[API LIB] Data received from /api/scheduledCourses:', JSON.stringify(allScheduledCourses, null, 2));

    if (!Array.isArray(allScheduledCourses)) {
        console.error('[API LIB] ERROR: allScheduledCourses is not an array! Received:', allScheduledCourses);
        return []; // Return empty if not an array to prevent filter error
    }
    
    // allScheduledCourses.forEach((sc: any, index: number) => {
    //     console.log(`[API LIB] Course ${index} - Original teacher_id:`, sc.teacher_id, `(Type: ${typeof sc.teacher_id})`);
    // });

    const filtered = allScheduledCourses
      .filter((sc: any) => sc.teacher_id && String(sc.teacher_id) === String(teacherId) && (semesterId ? String(sc.semester_id) === String(semesterId) : true));
      
    // console.log(`[API LIB] Filtered courses for teacher ${teacherId}:`, JSON.stringify(filtered, null, 2));

    return filtered.map((sc: any) => ({ 
          scheduled_course_id: sc.scheduled_course_id, 
          course_id: sc.course_id,
          course_code: sc.course_code || 'N/A', 
          title: sc.title || 'N/A', 
          section: sc.section_number,
          teacher_name: sc.teacher_name,
          semester_name: sc.semester_name,
          room_display_name: sc.room_display_name,
      }));
}

export async function fetchStudentRoster(scheduledCourseId: string): Promise<Array<{ student_id: string; first_name: string; last_name: string; email: string; }>> {
    const registrations = await fetchItems(`registrations?scheduledCourseId=${scheduledCourseId}`);
     if (!Array.isArray(registrations)) {
        console.error("fetchStudentRoster: API did not return an array. Data:", registrations);
        return [];
    }
    return registrations.map((reg: any) => ({
        student_id: String(reg.student_id),
        first_name: reg.first_name,
        last_name: reg.last_name,
        email: reg.email,
    }));
}

export async function createCourseMaterial(scheduledCourseId: string, materialData: any) {
    return createItem('courseMaterials', { ...materialData, scheduled_course_id: String(scheduledCourseId) });
}

export async function fetchStudentRegistrationsForCourseGrading(scheduledCourseId: string): Promise<Array<{ registration_id: string; student_id: string; first_name: string; last_name: string; email: string; final_grade: string | null; grade_points: number | null;}>> {
  return fetchItems(`registrations?scheduledCourseId=${scheduledCourseId}`); 
}

export async function fetchAllStudentAssessmentScoresForCourse(scheduledCourseId: string): Promise<Record<string, Record<string, { score: number | null; feedback: string | null }>>> {
  const studentEntries = await fetchItems(`studentAssessments?scheduledCourseId=${scheduledCourseId}`) as any[]; 
  
  const scoresMap: Record<string, Record<string, { score: number | null; feedback: string | null }>> = {};
  if (!Array.isArray(studentEntries)) {
      console.error("fetchAllStudentAssessmentScoresForCourse: studentEntries is not an array", studentEntries);
      return scoresMap;
  }
  studentEntries.forEach(entry => {
      if (!scoresMap[String(entry.student_id)]) {
          scoresMap[String(entry.student_id)] = {};
      }
      scoresMap[String(entry.student_id)][String(entry.assessment_id)] = { score: entry.score, feedback: entry.feedback };
  });
  return scoresMap;
}

export async function fetchAuditLogs(filters?: any) {
    await new Promise(resolve => setTimeout(resolve, 100)); 
    const limit = filters?.limit || 50;
    return mockDatabases.auditLogs.slice(0, limit);
}

export async function handleManualStudentRegistration(studentId: string, scheduledCourseId: string) {
  return createItem('registrations', { student_id: String(studentId), scheduled_course_id: String(scheduledCourseId), manualOverride: true });
}

export async function fetchAnnouncements({ role, departmentId }: { role: UserRole, departmentId?: string | number }) {
  await new Promise(resolve => setTimeout(resolve, 100)); 
  const now = new Date();
  const publishedAnnouncements = mockDatabases.announcements.filter((ann:any) => ann.status === 'Published' && new Date(ann.publish_date) <= now);
  
  let relevantAnnouncements = publishedAnnouncements.filter((ann:any) => {
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

export async function saveStudentAssessmentEntry(entry: { registration_id: string; assessment_id: string; score: number | null; feedback: string | null; student_id: string; student_assessment_id?: string; }) {
    const payload = {
        student_assessment_id: entry.student_assessment_id || undefined, 
        registration_id: String(entry.registration_id),
        assessment_id: String(entry.assessment_id),
        student_id: String(entry.student_id), 
        score: entry.score,
        feedback: entry.feedback,
    };
    return createItem('studentAssessments', payload); 
}

