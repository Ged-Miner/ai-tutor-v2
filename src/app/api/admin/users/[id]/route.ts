import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { updateUserSchema } from '@/lib/validations/user';
import { Prisma } from '@prisma/client';

/**
 * GET /api/admin/users/[id]
 * Fetch a single user by ID (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        teacherCode: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            courses: true,
            enrollments: true,
            chatSessions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update a user (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateUserSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { email, name, password, role, teacherCode } = validationResult.data;

    // Check if email is being changed and already exists
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // Handle teacher code validation
    let finalTeacherCode = existingUser.teacherCode;

    if (role !== undefined) {
      if (role === 'TEACHER') {
        // If changing to TEACHER, need a teacher code
        if (teacherCode !== undefined) {
          if (!teacherCode) {
            return NextResponse.json(
              { error: 'Teacher code is required for teachers' },
              { status: 400 }
            );
          }

          // Check if teacherCode already exists (and it's not the current user's code)
          if (teacherCode !== existingUser.teacherCode) {
            const existingTeacherCode = await prisma.user.findUnique({
              where: { teacherCode },
            });

            if (existingTeacherCode) {
              return NextResponse.json(
                { error: 'Teacher code already exists' },
                { status: 409 }
              );
            }
          }

          finalTeacherCode = teacherCode;
        } else if (!existingUser.teacherCode) {
          // Changing to TEACHER but no code provided and user doesn't have one
          return NextResponse.json(
            { error: 'Teacher code is required for teachers' },
            { status: 400 }
          );
        }
      } else {
        // If changing away from TEACHER, remove teacher code
        finalTeacherCode = null;
      }
    } else if (teacherCode !== undefined && existingUser.role === 'TEACHER') {
      // Not changing role, but updating teacher code
      if (!teacherCode) {
        return NextResponse.json(
          { error: 'Teacher code is required for teachers' },
          { status: 400 }
        );
      }

      if (teacherCode !== existingUser.teacherCode) {
        const existingTeacherCode = await prisma.user.findUnique({
          where: { teacherCode },
        });

        if (existingTeacherCode) {
          return NextResponse.json(
            { error: 'Teacher code already exists' },
            { status: 409 }
          );
        }
      }

      finalTeacherCode = teacherCode;
    }

    // Prepare update data
    const updateData: Prisma.UserUpdateInput = {};

    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Only update teacherCode if role logic determined a change
    if (role !== undefined || teacherCode !== undefined) {
      updateData.teacherCode = finalTeacherCode;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        teacherCode: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'User updated successfully',
        user: updatedUser
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Prevent admin from deleting themselves
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            courses: true,
            enrollments: true,
            chatSessions: true,
          },
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has related data (optional: you could allow cascade delete)
    const hasRelatedData =
      existingUser._count.courses > 0 ||
      existingUser._count.enrollments > 0 ||
      existingUser._count.chatSessions > 0;

    if (hasRelatedData) {
      return NextResponse.json(
        {
          error: 'Cannot delete user with existing courses, enrollments, or chat sessions',
          details: {
            courses: existingUser._count.courses,
            enrollments: existingUser._count.enrollments,
            chatSessions: existingUser._count.chatSessions,
          }
        },
        { status: 409 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
