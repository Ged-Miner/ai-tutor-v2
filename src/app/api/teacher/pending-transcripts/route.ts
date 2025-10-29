import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/teacher/pending-transcripts
 * Fetch all unprocessed pending transcripts for the logged-in teacher
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized - Teacher access required' },
        { status: 401 }
      );
    }

    // Fetch all unprocessed pending transcripts for this teacher
    const pendingTranscripts = await prisma.pendingTranscript.findMany({
      where: {
        teacherId: session.user.id,
        processed: false,
      },
      orderBy: {
        capturedAt: 'desc', // Most recent first
      },
      select: {
        id: true,
        courseName: true,
        lessonTitle: true,
        rawTranscript: true,
        capturedAt: true,
        metadata: true,
        createdAt: true,
      },
    });

    // For each transcript, try to find matching course
    const transcriptsWithCourseMatch = await Promise.all(
      pendingTranscripts.map(async (transcript) => {
        // Try to find existing course with matching name (case-insensitive)
        const matchedCourse = await prisma.course.findFirst({
          where: {
            teacherId: session.user.id,
            name: {
              equals: transcript.courseName,
              mode: 'insensitive',
            },
          },
          select: {
            id: true,
            name: true,
          },
        });

        return {
          ...transcript,
          suggestedCourse: matchedCourse, // null if no match found
        };
      })
    );

    return NextResponse.json({
      pendingTranscripts: transcriptsWithCourseMatch,
      count: transcriptsWithCourseMatch.length,
    });
  } catch (error) {
    console.error('Error fetching pending transcripts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending transcripts' },
      { status: 500 }
    );
  }
}
