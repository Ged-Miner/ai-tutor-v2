'use server';

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";

export async function validateAndSignIn(email: string, password: string) {
  try {
    // Validate inputs
    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: 'No account found with this email address' };
    }

    // Check if user has a password (vs OAuth only)
    if (!user.password) {
      return { error: 'This account uses a different sign-in method. Please try signing in with Google.' };
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return { error: 'Incorrect password' };
    }

    // If all validations pass, attempt sign in
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: 'Authentication failed. Please try again.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Sign in validation error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
