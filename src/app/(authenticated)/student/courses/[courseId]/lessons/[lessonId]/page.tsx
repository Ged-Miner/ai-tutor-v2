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

  // Fetch all chat sessions for this student and lesson
  let chatSessions = await prisma.chatSession.findMany({
    where: {
      lessonId: lesson.id,
      studentId: session.user.id,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // If no chat sessions exist, create the first one
  if (chatSessions.length === 0) {
    const newSession = await prisma.chatSession.create({
      data: {
        lessonId: lesson.id,
        studentId: session.user.id,
        name: 'Chat 1',
      },
      include: {
        messages: true,
        _count: {
          select: { messages: true },
        },
      },
    });
    chatSessions = [newSession];
  }

  // Fetch chatbot AI settings for maxMessagesPerChat
  const chatbotSettings = await prisma.aISettings.findUnique({
    where: { type: 'CHATBOT' },
  });
  const maxMessagesPerChat = chatbotSettings?.maxMessagesPerChat ?? null;

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
      </div>

      {/* Responsive Layout - Tabs on mobile, two-panel on desktop */}
      <LessonLayout
        lessonId={lesson.id}
        studentId={session.user.id}
        lessonTitle={lesson.title}
        lessonSummary={lesson.summary}
        initialSessions={chatSessions}
        maxMessagesPerChat={maxMessagesPerChat}
      />
    </div>
  );
}
