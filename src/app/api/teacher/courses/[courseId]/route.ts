import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { updateCourseSchema } from '@/lib/validations/course';
import { Prisma } from '@prisma/client';

/**
 * GET /api/teacher/courses/[courseId]
 * Fetch a single course by ID
 * Teachers can only see their own courses, admins can see any course
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Teacher or Admin access required' },
        { status: 401 }
      );
    }

    const { courseId } = await params;

    // Build query based on role
    const whereClause = session.user.role === 'ADMIN'
      ? { id: courseId } // Admin can see any course
      : { id: courseId, teacherId: session.user.id }; // Teacher sees only their own

    const course = await prisma.course.findFirst({
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
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/teacher/courses/[courseId]
 * Update a course
 * Teachers can only update their own courses, admins can update any course
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Teacher or Admin access required' },
        { status: 401 }
      );
    }

    const { courseId } = await params;

    // Build query based on role
    const whereClause = session.user.role === 'ADMIN'
      ? { id: courseId } // Admin can update any course
      : { id: courseId, teacherId: session.user.id }; // Teacher updates only their own

    const existingCourse = await prisma.course.findFirst({
      where: whereClause,
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found or access denied' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validationResult = updateCourseSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const updateData: Prisma.CourseUpdateInput = {};

    if (validationResult.data.name !== undefined) {
      updateData.name = validationResult.data.name;
    }

    if (validationResult.data.description !== undefined) {
      updateData.description = validationResult.data.description || null;
    }

    if (validationResult.data.settings !== undefined) {
      updateData.settings = validationResult.data.settings
        ? validationResult.data.settings
        : Prisma.JsonNull;
    }

    // Allow admin to reassign course to different teacher
    if (validationResult.data.teacherId !== undefined && session.user.role === 'ADMIN') {
      // Verify the new teacher exists and has TEACHER role
      const teacher = await prisma.user.findUnique({
        where: { id: validationResult.data.teacherId },
      });

      if (!teacher || teacher.role !== 'TEACHER') {
        return NextResponse.json(
          { error: 'Invalid teacherId - user must exist and have TEACHER role' },
          { status: 400 }
        );
      }

      updateData.teacher = {
        connect: { id: validationResult.data.teacherId },
      };
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
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

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/teacher/courses/[courseId]
 * Delete a course (cascade deletes lessons, enrollments, chat sessions)
 * Teachers can only delete their own courses, admins can delete any course
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Teacher or Admin access required' },
        { status: 401 }
      );
    }

    const { courseId } = await params;

    // Build query based on role
    const whereClause = session.user.role === 'ADMIN'
      ? { id: courseId } // Admin can delete any course
      : { id: courseId, teacherId: session.user.id }; // Teacher deletes only their own

    const course = await prisma.course.findFirst({
      where: whereClause,
      include: {
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found or access denied' },
        { status: 404 }
      );
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({
      success: true,
      deleted: {
        lessons: course._count.lessons,
        enrollments: course._count.enrollments,
      }
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
