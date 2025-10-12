/**
 * API Response Types
 * Define the shape of responses from our API endpoints
 */

// Course information returned in enrollment response
export interface EnrolledCourse {
  id: string;
  name: string;
}

// Enrollment API response
export interface EnrollmentResponse {
  success: boolean;
  enrolled: number;
  courses: EnrolledCourse[];
  message: string;
  alreadyEnrolled?: boolean;
}

// Error response from API
export interface ApiError {
  error: string;
  details?: unknown;
}
