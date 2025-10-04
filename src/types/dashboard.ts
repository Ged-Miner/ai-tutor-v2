import { Course, Enrollment, User } from "@prisma/client";

export type CourseWithCounts = Course & {
  _count: {
    lessons: number;
    enrollments: number;
  };
};

export type EnrollmentWithCourse = Enrollment & {
  course: Course & {
    teacher: {
      name: string | null;
    };
    _count: {
      lessons: number;
    };
  };
};

export type AdminStats = {
  users: number;
  courses: number;
  lessons: number;
  chatSessions: number;
};

export type DashboardData = {
  courses?: CourseWithCounts[];
  enrollments?: EnrollmentWithCourse[];
  stats?: AdminStats;
};
