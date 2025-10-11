import { prisma } from '@/lib/prisma';

/**
 * Generate a unique lesson code in the format LESSON###
 * e.g., LESSON001, LESSON002, etc.
 *
 * @returns A unique lesson code
 */
export async function generateLessonCode(): Promise<string> {
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate random 3-digit number
    const randomNum = Math.floor(Math.random() * 1000);
    const lessonCode = `LESSON${randomNum.toString().padStart(3, '0')}`;

    // Check if this code already exists
    const existing = await prisma.lesson.findUnique({
      where: { lessonCode },
    });

    // If code is available, return it
    if (!existing) {
      return lessonCode;
    }
  }

  // Fallback: Use timestamp if all random attempts failed
  const timestamp = Date.now().toString().slice(-6);
  const fallbackCode = `LESSON${timestamp}`;

  // Check fallback code
  const existing = await prisma.lesson.findUnique({
    where: { lessonCode: fallbackCode },
  });

  if (!existing) {
    return fallbackCode;
  }

  // Ultimate fallback: Add random suffix
  return `LESSON${timestamp}${Math.floor(Math.random() * 100)}`;
}
