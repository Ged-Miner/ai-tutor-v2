import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { LessonTabs } from '@/components/student/lesson-tabs';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function StudentLessonViewPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'STUDENT') {
    redirect('/auth/signin');
  }

  const { courseId, lessonId } = await params;

  // Verify student is enrolled in this course
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: session.user.id,
      courseId,
    },
  });

  if (!enrollment) {
    redirect('/student/courses');
  }

  // Fetch the lesson
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      courseId,
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          teacher: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    redirect(`/student/courses/${courseId}/lessons`);
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/student/courses" className="hover:text-gray-900">
          My Courses
        </Link>
        <span>/</span>
        <Link
          href={`/student/courses/${courseId}/lessons`}
          className="hover:text-gray-900"
        >
          {lesson.course.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{lesson.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              Lesson {lesson.position + 1}: {lesson.title}
            </h1>
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
            <span>
              Course: {lesson.course.name}
            </span>
            <span>•</span>
            <span>
              Code: <code className="bg-gray-100 px-2 py-1 rounded">{lesson.lessonCode}</code>
            </span>
            <span>•</span>
            <span>
              {new Date(lesson.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <Link href={`/student/courses/${courseId}/lessons`}>
          <Button variant="outline">Back to Lessons</Button>
        </Link>
      </div>

      {/* Lesson Content with Tabs */}
      <LessonTabs
        summary={lesson.summary}
        rawTranscript={lesson.rawTranscript}
      />
    </div>
  );
}
