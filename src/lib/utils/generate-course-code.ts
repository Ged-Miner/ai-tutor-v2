import { prisma } from '@/lib/prisma';

/**
 * Generates a unique 7-character alphanumeric course code
 * Format: Uppercase letters and numbers (e.g., 'A3X9K2M')
 *
 * Character set: A-Z (26) + 0-9 (10) = 36 characters
 * Combinations: 36^7 = ~78 billion possible codes
 *
 * @returns Promise<string> - Unique course code
 * @throws Error if unable to generate unique code after max attempts
 */
export async function generateCourseCode(): Promise<string> {
  const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const CODE_LENGTH = 7;
  const MAX_ATTEMPTS = 20;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Generate random 7-character code
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * CHARSET.length);
      code += CHARSET[randomIndex];
    }

    // Check uniqueness in database
    const existing = await prisma.course.findUnique({
      where: { courseCode: code },
    });

    if (!existing) {
      return code;
    }
  }

  throw new Error('Failed to generate unique course code after maximum attempts');
}
