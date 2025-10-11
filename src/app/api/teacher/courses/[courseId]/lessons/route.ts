import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createLessonSchema } from '@/lib/validations/lesson';
import { generateLessonCode } from '@/lib/utils/generate-lesson-code';
// import { Prisma } from '@prisma/client';

/**
 * GET /api/teacher/courses/[courseId]/lessons
 * Fetch all lessons for a specific course
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized - Teacher access required' },
        { status: 401 }
      );
    }

    const { courseId } = await params;

    // Verify teacher owns this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacherId: session.user.id,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found or access denied' },
        { status: 404 }
      );
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
        position: 'asc', // Order by position (0, 1, 2, etc.)
      },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teacher/courses/[courseId]/lessons
 * Create a new lesson in a course
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized - Teacher access required' },
        { status: 401 }
      );
    }

    const { courseId } = await params;

    // Verify teacher owns this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacherId: session.user.id,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found or access denied' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createLessonSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { title, rawTranscript, summary, customPrompt, position } = validationResult.data;

    // Generate unique lesson code
    const lessonCode = await generateLessonCode();

    // Determine position if not provided
    let lessonPosition = position;
    if (lessonPosition === undefined) {
      // Get the highest position in this course
      const lastLesson = await prisma.lesson.findFirst({
        where: { courseId },
        orderBy: { position: 'desc' },
      });
      lessonPosition = lastLesson ? lastLesson.position + 1 : 0;
    }

    // Create lesson
    const lesson = await prisma.lesson.create({
      data: {
        title,
        rawTranscript,
        summary: summary || null,
        customPrompt: customPrompt || null,
        lessonCode,
        position: lessonPosition,
        courseId,
      },
      include: {
        _count: {
          select: {
            chatSessions: true,
          },
        },
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}
