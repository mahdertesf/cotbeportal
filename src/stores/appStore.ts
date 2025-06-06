import { create } from 'zustand';

export type UserRole = 'Student' | 'Teacher' | 'Staff Head' | 'Admin' | null;

export interface UserProfile {
  // Common fields from Users table
  user_id: number | string;
  username: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined?: string;
  last_login?: string;

  // Role-specific fields
  // Student specific
  department_id?: number | string | null; // Can be string if using mock IDs
  department_name?: string;
  enrollment_date?: string;
  date_of_birth?: string;
  address?: string;
  phone_number?: string; // Also in Teacher

  // Teacher specific
  office_location?: string;
  // phone_number is common with Student

  // Staff specific (and Admin)
  job_title?: string;
}

interface AppState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  loginUser: (userData: UserProfile) => void;
  logoutUser: () => void;
  setLoading: (loadingStatus: boolean) => void;
  setError: (errorMessage: string | null) => void;
  updateUserProfile: (updatedProfileData: Partial<UserProfile>) => void;
}

const useAppStore = create<AppState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  loginUser: (userData) => set({ user: userData, isLoading: false, error: null }),
  logoutUser: () => {
    // Potentially clear other persisted data if any
    set({ user: null, isLoading: false, error: null });
  },
  setLoading: (loadingStatus) => set({ isLoading: loadingStatus }),
  setError: (errorMessage) => set({ error: errorMessage, isLoading: false }),
  updateUserProfile: (updatedProfileData) => set((state) => ({
    user: state.user ? { ...state.user, ...updatedProfileData } : null,
  })),
}));

export default useAppStore;
