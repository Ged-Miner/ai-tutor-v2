import { prisma } from '@/lib/prisma';

/**
 * Generates a unique 4-digit PIN course code
 * Format: 4 digits (e.g., '1234', '0042')
 *
 * Character set: 0-9 (10 digits)
 * Combinations: 10^4 = 10,000 possible codes
 *
 * @returns Promise<string> - Unique course code
 * @throws Error if unable to generate unique code after max attempts
 */
export async function generateCourseCode(): Promise<string> {
  const CHARSET = '0123456789';
  const CODE_LENGTH = 4;
  const MAX_ATTEMPTS = 20;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Generate random 4-digit code
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
