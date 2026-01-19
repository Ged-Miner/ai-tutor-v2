import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { LessonLayout } from '@/components/student/lesson-layout';

interface PageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default async function StudentLessonPage({ params }: PageProps) {
  const session = await auth();
  const { courseId, lessonId } = await params;

  if (!session?.user || session.user.role !== 'STUDENT') {
    redirect('/');
  }

  // Verify student is enrolled in this course
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: session.user.id,
        courseId: courseId,
      },
    },
  });

  if (!enrollment) {
    notFound();
  }

  // Fetch lesson details
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!lesson || lesson.courseId !== courseId) {
    notFound();
  }

  // Fetch or create chat session for this student and lesson
  let chatSession = await prisma.chatSession.findUnique({
    where: {
      lessonId_studentId: {
        lessonId: lesson.id,
        studentId: session.user.id,
      },
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  // If no chat session exists, create one
  if (!chatSession) {
    chatSession = await prisma.chatSession.create({
      data: {
        lessonId: lesson.id,
        studentId: session.user.id,
      },
      include: {
        messages: true,
      },
    });
  }

  return (
    <div className="flex flex-col h-full -m-4 sm:-m-6 lg:-m-8">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link
            href="/student/courses"
            className="hover:text-foreground transition-colors"
          >
            My Courses
          </Link>
          <span>/</span>
          <Link
            href={`/student/courses/${courseId}/lessons`}
            className="hover:text-foreground transition-colors"
          >
            {lesson.course.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">{lesson.title}</span>
        </div>
        {/* <h1 className="text-2xl font-bold">{lesson.title}</h1> */}
      </div>

      {/* Responsive Layout - Tabs on mobile, two-panel on desktop */}
      <LessonLayout
        lessonId={lesson.id}
        studentId={session.user.id}
        lessonTitle={lesson.title}
        lessonSummary={lesson.summary}
        initialMessages={chatSession.messages}
      />
    </div>
  );
}
