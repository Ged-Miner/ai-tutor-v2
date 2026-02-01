import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { uploadTranscriptSchema } from '@/lib/validations/transcript';
import { applyRateLimit, transcriptUploadLimiter } from '@/lib/rate-limit';

/**
 * CORS headers for transcript uploads
 * Allows requests from any source since the endpoint validates:
 * - courseCode through database lookup
 * - Data structure through Zod schema validation
 * - Request rate limiting
 */
function getCorsHeaders(origin: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

/**
 * OPTIONS /api/transcript/upload
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

/**
 * POST /api/transcript/upload
 * Receive transcript uploads from any source (Chrome extension, web app, CLI tool, etc.)
 * Public endpoint (no auth) but validates courseCode and applies rate limiting
 */
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(request.clone(), transcriptUploadLimiter);

    if (!rateLimitResult.allowed && rateLimitResult.response) {
      // Rate limit exceeded - add CORS headers to error response
      const response = rateLimitResult.response;
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

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
        {
          status: 400,
          headers: {
            ...corsHeaders,
            ...rateLimitResult.headers,
          },
        }
      );
    }

    const { courseCode, courseName, lessonTitle, transcript, capturedAt, metadata } = validationResult.data;

    // Find course by course code
    const course = await prisma.course.findUnique({
      where: {
        courseCode: courseCode,
      },
      select: {
        id: true,
        teacherId: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Invalid course code - course not found' },
        {
          status: 404,
          headers: {
            ...corsHeaders,
            ...rateLimitResult.headers,
          },
        }
      );
    }

    // Check if there's an existing pending transcript with same details (for appending)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const existingPending = await prisma.pendingTranscript.findFirst({
      where: {
        teacherId: course.teacherId,
        courseCode: courseCode,
        courseName: {
          equals: courseName,
          mode: 'insensitive',
        },
        lessonTitle: {
          equals: lessonTitle,
          mode: 'insensitive',
        },
        processed: false,
        capturedAt: {
          gte: twoHoursAgo,
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
          capturedAt: capturedAt,
          metadata: metadata || (existingPending.metadata ?? Prisma.JsonNull),
        },
      });

      return NextResponse.json({
        success: true,
        action: 'appended',
        message: 'Transcript appended to existing pending transcript',
        pendingTranscriptId: updated.id,
      }, {
        status: 200,
        headers: {
          ...corsHeaders,
          ...rateLimitResult.headers,
        },
      });
    } else {
      // CREATE NEW: No existing pending transcript found
      const newPending = await prisma.pendingTranscript.create({
        data: {
          teacherId: course.teacherId,
          courseCode,
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
      }, {
        status: 201,
        headers: {
          ...corsHeaders,
          ...rateLimitResult.headers,
        },
      });
    }

  } catch (error) {
    console.error('Error uploading transcript:', error);
    return NextResponse.json(
      { error: 'Failed to upload transcript' },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
