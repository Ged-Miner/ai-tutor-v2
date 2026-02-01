import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CreateLessonButton } from '@/components/teacher/create-lesson-button';
import { LessonsTable } from '@/components/teacher/lessons-table';
// import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function AdminCourseLessonsPage({ params }: PageProps) {
  const session = await auth();

  // Verify user is an admin
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  const { courseId } = await params;

  // Fetch course (admin can access any course)
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
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
  });

  if (!course) {
    redirect('/admin/courses');
  }

  // Fetch lessons for this course
  const lessons = await prisma.lesson.findMany({
    where: {
      courseId,
    },
    include: {
      _count: {
        select: {
          chatSessions: true,
        },
      },
    },
    orderBy: {
      position: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/admin/courses" className="hover:text-gray-900">
          All Courses
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{course.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {course.description || 'No description'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Teacher: {course.teacher.name || course.teacher.email}
          </p>
          <p className="mt-4 rounded bg-gray-200 border border-gray-300 px-2 py-1 text-sm font-mono text-gray-900">
            Course Code: <span className="font-mono font-medium">{course.courseCode}</span>
          </p>
        </div>
        {/* <div className="flex gap-3">
          <Link href="/admin/courses">
            <Button variant="outline">Back to Courses</Button>
          </Link>
          <CreateLessonButton courseId={courseId} />
        </div> */}
      </div>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Total Lessons
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {lessons.length}
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Enrolled Students
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {course._count.enrollments}
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Total Chat Sessions
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {lessons.reduce((sum, lesson) => sum + lesson._count.chatSessions, 0)}
          </dd>
        </div>
      </div> */}

      {/* Lessons Table */}
      {lessons.length > 0 ? (
        <LessonsTable lessons={lessons} courseId={courseId} />
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No lessons yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            This course doesn&apos;t have any lessons yet.
          </p>
          <div className="mt-6">
            <CreateLessonButton courseId={courseId} />
          </div>
        </div>
      )}
    </div>
  );
}
