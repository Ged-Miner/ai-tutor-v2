import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { LessonSummary } from '@/components/student/lesson-summary';
import { ChatInterface } from '@/components/student/chat-interface';

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
    <div className="flex flex-col h-screen">
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
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
      </div>

      {/* Two-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Lesson Summary */}
        <div className="w-1/2 border-r overflow-y-auto">
          <div className="p-6">
            <LessonSummary
              title={lesson.title}
              summary={lesson.summary}
            />
          </div>
        </div>

        {/* Right Panel - Chat Interface */}
        <div className="w-1/2 flex flex-col bg-muted/30">
          <div className="border-b bg-background px-6 py-3">
            <h2 className="font-semibold">AI Tutor</h2>
            <p className="text-xs text-muted-foreground">
              Ask questions about this lesson
            </p>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              lessonId={lesson.id}
              studentId={session.user.id}  // ADD THIS LINE
              initialMessages={chatSession.messages}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
