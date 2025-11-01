import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateLessonCode } from '@/lib/utils/generate-lesson-code';
import { generateAndUpdateLessonSummary } from '@/lib/openai-summary';

// Validation schema for processing request
const processTranscriptSchema = z.object({
  courseId: z.string().cuid('Invalid course ID format'),
  customTitle: z.string().optional(), // Optional: override lesson title
});

/**
 * POST /api/teacher/pending-transcripts/[id]/process
 * Process a pending transcript into a lesson
 * Teacher must select which course to create the lesson in
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized - Teacher access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = processTranscriptSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { courseId, customTitle } = validationResult.data;

    // Fetch the pending transcript
    const pendingTranscript = await prisma.pendingTranscript.findUnique({
      where: {
        id,
      },
    });

    if (!pendingTranscript) {
      return NextResponse.json(
        { error: 'Pending transcript not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (pendingTranscript.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to process this transcript' },
        { status: 403 }
      );
    }

    // Check if already processed
    if (pendingTranscript.processed) {
      return NextResponse.json(
        { error: 'This transcript has already been processed' },
        { status: 400 }
      );
    }

    // Verify the course exists and belongs to this teacher
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

    // Generate unique lesson code
    const lessonCode = await generateLessonCode();

    // Get the next position for this course
    const lastLesson = await prisma.lesson.findFirst({
      where: { courseId },
      orderBy: { position: 'desc' },
    });
    const position = lastLesson ? lastLesson.position + 1 : 0;

    // Create the lesson with raw transcript
    const lesson = await prisma.lesson.create({
      data: {
        title: customTitle || pendingTranscript.lessonTitle,
        rawTranscript: pendingTranscript.rawTranscript,
        summary: null, // Will be generated asynchronously
        summaryStatus: 'GENERATING',
        lessonCode,
        position,
        courseId,
      },
    });

    // Mark pending transcript as processed
    await prisma.pendingTranscript.update({
      where: { id },
      data: { processed: true },
    });

    // Generate summary asynchronously (don't await - let it run in background)
    generateAndUpdateLessonSummary(lesson.id).catch((error) => {
      console.error(`Background summary generation failed for lesson ${lesson.id}:`, error);
    });

    return NextResponse.json({
      success: true,
      message: 'Lesson created successfully. Summary is being generated.',
      lesson: {
        id: lesson.id,
        title: lesson.title,
        lessonCode: lesson.lessonCode,
        courseId: lesson.courseId,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error processing transcript:', error);
    return NextResponse.json(
      { error: 'Failed to process transcript' },
      { status: 500 }
    );
  }
}
