import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
// import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function StudentCourseLessonsPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'STUDENT') {
    redirect('/auth/signin');
  }

  const { courseId } = await params;

  // Verify student is enrolled in this course
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: session.user.id,
      courseId,
    },
    include: {
      course: {
        include: {
          teacher: {
            select: {
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
  });

  if (!enrollment) {
    redirect('/student/courses');
  }

  const course = enrollment.course;

  // Fetch lessons for this course
  const lessons = await prisma.lesson.findMany({
    where: {
      courseId,
    },
    orderBy: {
      position: 'asc',
    },
    select: {
      id: true,
      title: true,
      position: true,
      createdAt: true,
      summary: true,
    },
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/student/courses" className="hover:text-gray-900">
          My Courses
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{course.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {course.description || 'No description'}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Taught by {course.teacher.name || course.teacher.email}
          </p>
        </div>
        {/* <Link href="/student/courses">
          <Button variant="outline">Back to Courses</Button>
        </Link> */}
      </div>

      {/* Lessons List */}
      {lessons.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Lessons</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/student/courses/${courseId}/lessons/${lesson.id}`}
              >
                <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base line-clamp-2">
                          {lesson.position + 1}. {lesson.title}
                        </CardTitle>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        {new Date(lesson.createdAt).toLocaleDateString()}
                      </span>
                      {lesson.summary && (
                        <span className="flex items-center gap-1">
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Summary available
                        </span>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No lessons yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Your teacher hasn&apos;t added any lessons to this course yet.
          </p>
        </div>
      )}
    </div>
  );
}
