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
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
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
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Prevent self-deletion
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Get user with counts for confirmation display
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        courses: true,
        enrollments: true,
        chatSessions: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user - cascade will handle related records
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      deleted: {
        courses: user.courses.length,
        enrollments: user.enrollments.length,
        chatSessions: user.chatSessions.length,
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
