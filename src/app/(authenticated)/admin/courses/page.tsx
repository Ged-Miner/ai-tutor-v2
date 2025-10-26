import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CoursesTable } from '@/components/admin/courses-table';
import { CreateCourseButton } from '@/components/admin/create-course-button';
import Link from 'next/link';

export default async function AdminCoursesPage() {
  const session = await auth();

  // Verify user is an admin
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  // Fetch ALL courses with teacher info and counts
  const courses = await prisma.course.findMany({
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage all courses across the platform
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="mt-4 flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li className="text-gray-900 font-medium">Courses</li>
        </ol>
      </nav>

      {/* Courses Table */}
      {courses.length > 0 ? (
        <CoursesTable courses={courses} />
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
            No courses have been created on the platform yet.
          </p>
          <div className="mt-6">
            <CreateCourseButton />
          </div>
        </div>
      )}
      <CreateCourseButton />
    </div>
  );
}
