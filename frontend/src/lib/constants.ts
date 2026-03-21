export const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;
export const COOKIE_NAME = 'lms_token'; // Note: Usually handled by backend, but good to have reference

export const ROUTES = {
  PUBLIC: {
    LOGIN: '/login',
    SIGNUP: '/signup',
  },
  PROTECTED: {
    PENDING_APPROVAL: '/pending-approval',
    ADMIN: '/admin/registration-requests',
    STUDENT: '/student',
    INSTRUCTOR: '/instructor',
  }
};
