import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createCourseSchema } from '@/lib/validations/course';
import { Prisma } from '@prisma/client';

/**
 * GET /api/teacher/courses
 * Fetch courses for the logged-in teacher OR all courses for admin
 */
export async function GET() {
  try {
    const session = await auth();

    // Check authentication and role
    if (!session?.user || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Teacher or Admin access required' },
        { status: 401 }
      );
    }

    // Build query based on role
    const whereClause = session.user.role === 'ADMIN'
      ? {} // Admin sees all courses
      : { teacherId: session.user.id }; // Teacher sees only their courses

    // Fetch courses with counts
    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
 * Create a new course for the logged-in teacher OR for admin to assign to a teacher
 * Teachers: Auto-assign to themselves
 * Admins: Must provide teacherId in request body
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    // Both teachers and admins can create courses
    if (!session?.user || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Teacher or Admin access required' },
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

    const { name, description, settings, teacherId } = validationResult.data;

    // Determine the teacher ID
    let courseTeacherId: string;

    if (session.user.role === 'ADMIN') {
      // Admin must provide a teacherId
      if (!teacherId) {
        return NextResponse.json(
          { error: 'teacherId is required for admin course creation' },
          { status: 400 }
        );
      }

      // Verify the teacher exists and has TEACHER role
      const teacher = await prisma.user.findUnique({
        where: { id: teacherId },
      });

      if (!teacher || teacher.role !== 'TEACHER') {
        return NextResponse.json(
          { error: 'Invalid teacherId - user must exist and have TEACHER role' },
          { status: 400 }
        );
      }

      courseTeacherId = teacherId;
    } else {
      // Teacher creates course for themselves
      courseTeacherId = session.user.id;
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        name,
        description: description || null,
        settings: settings ? settings : Prisma.JsonNull,
        teacherId: courseTeacherId,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
