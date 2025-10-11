import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { updateLessonSchema } from '@/lib/validations/lesson';
import { Prisma } from '@prisma/client';

/**
 * GET /api/teacher/courses/[courseId]/lessons/[id]
 * Fetch a single lesson
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string; id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized - Teacher access required' },
        { status: 401 }
      );
    }

    const { courseId, id } = await params;

    // Verify teacher owns the course and lesson exists
    const lesson = await prisma.lesson.findFirst({
      where: {
        id,
        courseId,
        course: {
          teacherId: session.user.id,
        },
      },
      include: {
        _count: {
          select: {
            chatSessions: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/teacher/courses/[courseId]/lessons/[id]
 * Update a lesson
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string; id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized - Teacher access required' },
        { status: 401 }
      );
    }

    const { courseId, id } = await params;

    // Verify ownership
    const existingLesson = await prisma.lesson.findFirst({
      where: {
        id,
        courseId,
        course: {
          teacherId: session.user.id,
        },
      },
    });

    if (!existingLesson) {
      return NextResponse.json(
        { error: 'Lesson not found or access denied' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateLessonSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Prisma.LessonUpdateInput = {};

    if (validationResult.data.title !== undefined) {
      updateData.title = validationResult.data.title;
    }

    if (validationResult.data.rawTranscript !== undefined) {
      updateData.rawTranscript = validationResult.data.rawTranscript;
    }

    if (validationResult.data.summary !== undefined) {
      updateData.summary = validationResult.data.summary || null;
    }

    if (validationResult.data.customPrompt !== undefined) {
      updateData.customPrompt = validationResult.data.customPrompt || null;
    }

    if (validationResult.data.position !== undefined) {
      updateData.position = validationResult.data.position;
    }

    // Update lesson
    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            chatSessions: true,
          },
        },
      },
    });

    return NextResponse.json(updatedLesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/teacher/courses/[courseId]/lessons/[id]
 * Delete a lesson (cascade deletes chat sessions)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ courseId: string; id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized - Teacher access required' },
        { status: 401 }
      );
    }

    const { courseId, id } = await params;

    // Get lesson with counts for confirmation
    const lesson = await prisma.lesson.findFirst({
      where: {
        id,
        courseId,
        course: {
          teacherId: session.user.id,
        },
      },
      include: {
        _count: {
          select: {
            chatSessions: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found or access denied' },
        { status: 404 }
      );
    }

    // Delete lesson (cascade will handle chat sessions)
    await prisma.lesson.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      deleted: {
        chatSessions: lesson._count.chatSessions,
      }
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    );
  }
}
