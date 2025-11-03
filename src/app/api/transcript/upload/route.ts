import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { uploadTranscriptSchema } from '@/lib/validations/transcript';
import { applyRateLimit, transcriptUploadLimiter } from '@/lib/rate-limit';

/**
 * CORS headers for Chrome extension
 */
function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = [
    process.env.NEXTAUTH_URL || 'http://localhost:3000',
  ];

  // Allow chrome-extension:// origins
  const isChromeExtension = origin?.startsWith('chrome-extension://');
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);

  if (isChromeExtension || isAllowedOrigin) {
    return {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    };
  }

  return {};
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
 * Receive transcript uploads from Chrome extension
 * Public endpoint (no auth) but validates teacherCode and applies rate limiting
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

    const { teacherCode, courseName, lessonTitle, transcript, capturedAt, metadata } = validationResult.data;

    // Find teacher by teacher code
    const teacher = await prisma.user.findUnique({
      where: {
        teacherCode: teacherCode,
        role: 'TEACHER',
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Invalid teacher code - teacher not found' },
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
        teacherId: teacher.id,
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
