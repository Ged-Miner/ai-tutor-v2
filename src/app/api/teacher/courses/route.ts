import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createCourseSchema } from '@/lib/validations/course';
import { Prisma } from '@prisma/client';

/**
 * GET /api/teacher/courses
 * Fetch all courses for the logged-in teacher
 */
export async function GET() {
  try {
    const session = await auth();

    // Check authentication and role
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized - Teacher access required' },
        { status: 401 }
      );
    }

    // Fetch teacher's courses with counts
    const courses = await prisma.course.findMany({
      where: {
        teacherId: session.user.id,
      },
      include: {
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Newest first
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teacher/courses
 * Create a new course for the logged-in teacher
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    // Check authentication and role
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized - Teacher access required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createCourseSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { name, description, settings } = validationResult.data;

    // Create course
    const course = await prisma.course.create({
      data: {
        name,
        description: description || null,
        settings: settings ? settings : Prisma.JsonNull,
        teacherId: session.user.id,
      },
      include: {
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
