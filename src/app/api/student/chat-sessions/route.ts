import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createChatSessionSchema } from '@/lib/validations/chat-session';

/**
 * GET /api/student/chat-sessions?lessonId=xxx
 * Fetch all chat sessions for the logged-in student for a specific lesson
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized - Student access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) {
      return NextResponse.json(
        { error: 'lessonId is required' },
        { status: 400 }
      );
    }

    // Verify the lesson exists and student is enrolled in the course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          include: {
            enrollments: {
              where: { studentId: session.user.id },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    if (lesson.course.enrollments.length === 0) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      );
    }

    // Fetch all chat sessions for this student and lesson
    const chatSessions = await prisma.chatSession.findMany({
      where: {
        lessonId,
        studentId: session.user.id,
      },
      include: {
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(chatSessions);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/student/chat-sessions
 * Create a new chat session for the logged-in student
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized - Student access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = createChatSessionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { lessonId, name } = validationResult.data;

    // Verify the lesson exists and student is enrolled
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          include: {
            enrollments: {
              where: { studentId: session.user.id },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    if (lesson.course.enrollments.length === 0) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      );
    }

    // Count existing sessions to auto-generate name if not provided
    const existingSessionCount = await prisma.chatSession.count({
      where: {
        lessonId,
        studentId: session.user.id,
      },
    });

    const sessionName = name || `Chat ${existingSessionCount + 1}`;

    // Create new chat session
    const chatSession = await prisma.chatSession.create({
      data: {
        lessonId,
        studentId: session.user.id,
        name: sessionName,
      },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json(chatSession, { status: 201 });
  } catch (error) {
    console.error('Error creating chat session:', error);
    return NextResponse.json(
      { error: 'Failed to create chat session' },
      { status: 500 }
    );
  }
}
