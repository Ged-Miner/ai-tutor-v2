import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { StudentCourseCard } from '@/components/student/student-course-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function StudentCoursesPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'STUDENT') {
    redirect('/auth/signin');
  }

  // Fetch student's enrollments with course details
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId: session.user.id,
    },
    include: {
      course: {
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              lessons: true,
              enrollments: true,
            },
          },
        },
      },
    },
    orderBy: {
      enrolledAt: 'desc',
    },
  });

  const courses = enrollments.map(enrollment => ({
    ...enrollment.course,
    enrolledAt: enrollment.enrolledAt,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="mt-2 text-sm text-gray-600">
            Courses you&apos;re enrolled in
          </p>
        </div>
        <Link href="/student/enroll">
          <Button>
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Enroll in More Courses
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Enrolled Courses
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {courses.length}
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Total Lessons
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {courses.reduce((sum, course) => sum + course._count.lessons, 0)}
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Teachers
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {new Set(courses.map(c => c.teacher.id)).size}
          </dd>
        </div>
      </div>

      {/* Courses Grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <StudentCourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No courses yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by enrolling in a course using your teacher&apos;s code.
          </p>
          <div className="mt-6">
            <Link href="/student/enroll">
              <Button>Enroll in a Course</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
