import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CreateCourseButton } from '@/components/teacher/create-course-button';
import { CoursesTable } from '@/components/teacher/courses-table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default async function TeacherCoursesPage() {
  const session = await auth();

  // Verify user is a teacher
  if (!session?.user || session.user.role !== 'TEACHER') {
    redirect('/auth/signin');
  }

  // Fetch teacher's courses with counts
  const courses = await prisma.course.findMany({
    where: {
      teacherId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      description: true,
      courseCode: true,
      createdAt: true,
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

  const pendingTranscriptsCount = await prisma.pendingTranscript.count({
    where: {
      teacherId: session.user.id,
      processed: false,
    },
  });

  return (
    <div className="space-y-6">
      {/* Pending Transcripts Notification */}
      {pendingTranscriptsCount > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-blue-900">
                You have <strong>{pendingTranscriptsCount}</strong> pending transcript
                {pendingTranscriptsCount === 1 ? '' : 's'} awaiting review
              </span>
            </div>
            <Link
              href="/teacher/pending-transcripts"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
            >
              Review Now →
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name}!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {courses.length > 0
              ? `Managing ${courses.length} ${courses.length === 1 ? 'course' : 'courses'}`
              : 'Get started by creating your first course'}
          </p>
        </div>

      </div>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Total Courses
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
            Total Students
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {courses.reduce((sum, course) => sum + course._count.enrollments, 0)}
          </dd>
        </div>
      </div> */}

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
            Get started by creating your first course.
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
