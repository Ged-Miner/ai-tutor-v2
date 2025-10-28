import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { uploadTranscriptSchema } from '@/lib/validations/transcript';

/**
 * POST /api/transcript/upload
 * Receive transcript uploads from Chrome extension
 * Public endpoint (no auth) but validates teacherCode
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate with Zod
    const validationResult = uploadTranscriptSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { teacherCode, courseName, lessonTitle, transcript, capturedAt, metadata } = validationResult.data;

    // Find teacher by teacher code
    const teacher = await prisma.user.findUnique({
      where: {
        teacherCode: teacherCode,
        role: 'TEACHER', // Ensure user is actually a teacher
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Invalid teacher code - teacher not found' },
        { status: 404 }
      );
    }

    // Check if there's an existing pending transcript with same details (for appending)
    // We consider it the "same lesson" if: same teacher + same course + same lesson title + captured within last 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const existingPending = await prisma.pendingTranscript.findFirst({
      where: {
        teacherId: teacher.id,
        courseName: {
          equals: courseName,
          mode: 'insensitive', // Case-insensitive match
        },
        lessonTitle: {
          equals: lessonTitle,
          mode: 'insensitive',
        },
        processed: false,
        capturedAt: {
          gte: twoHoursAgo, // Only append if within 2 hours
        },
      },
      orderBy: {
        capturedAt: 'desc',
      },
    });

    if (existingPending) {
      // APPEND: Add new transcript to existing one
      const updatedTranscript = `${existingPending.rawTranscript}\n\n--- Continued ---\n\n${transcript}`;

      const updated = await prisma.pendingTranscript.update({
        where: {
          id: existingPending.id,
        },
        data: {
          rawTranscript: updatedTranscript,
          capturedAt: capturedAt, // Update to latest capture time
          metadata: metadata || (existingPending.metadata ?? Prisma.JsonNull),
        },
      });

      return NextResponse.json({
        success: true,
        action: 'appended',
        message: 'Transcript appended to existing pending transcript',
        pendingTranscriptId: updated.id,
      }, { status: 200 });
    } else {
      // CREATE NEW: No existing pending transcript found
      const newPending = await prisma.pendingTranscript.create({
        data: {
          teacherId: teacher.id,
          teacherCode,
          courseName,
          lessonTitle,
          rawTranscript: transcript,
          capturedAt,
          metadata: metadata || undefined,
          processed: false,
        },
      });

      return NextResponse.json({
        success: true,
        action: 'created',
        message: 'New pending transcript created',
        pendingTranscriptId: newPending.id,
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error uploading transcript:', error);
    return NextResponse.json(
      { error: 'Failed to upload transcript' },
      { status: 500 }
    );
  }
}
