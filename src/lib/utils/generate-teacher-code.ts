import { prisma } from '@/lib/prisma';

/**
 * Generates a unique teacher code in the format TEACH###
 * where ### is a number from 001 to 999
 *
 * @returns Promise<string> - Unique teacher code (e.g., "TEACH042")
 * @throws Error if no available codes (unlikely with 999 possibilities)
 */
export async function generateTeacherCode(): Promise<string> {
  const MAX_ATTEMPTS = 10;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Generate random number between 1 and 999
    const randomNum = Math.floor(Math.random() * 999) + 1;

    // Format as TEACH### (e.g., TEACH001, TEACH042, TEACH999)
    const code = `TEACH${randomNum.toString().padStart(3, '0')}`;

    // Check if code already exists
    const existingCode = await prisma.user.findUnique({
      where: { teacherCode: code },
    });

    if (!existingCode) {
      return code;
    }
  }

  // If we've tried 10 times and all were taken, find the next available
  return await findNextAvailableCode();
}

/**
 * Fallback: Find the next sequential available teacher code
 * This is used if random generation fails (very unlikely)
 */
async function findNextAvailableCode(): Promise<string> {
  // Get all existing teacher codes
  const existingTeachers = await prisma.user.findMany({
    where: {
      teacherCode: {
        not: null,
      },
    },
    select: {
      teacherCode: true,
    },
  });

  // Extract the numbers from existing codes
  const usedNumbers = existingTeachers
    .map(t => {
      if (!t.teacherCode) return null;
      const match = t.teacherCode.match(/^TEACH(\d{3})$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((num): num is number => num !== null);

  // Find first available number from 1 to 999
  for (let i = 1; i <= 999; i++) {
    if (!usedNumbers.includes(i)) {
      return `TEACH${i.toString().padStart(3, '0')}`;
    }
  }

  // If all 999 codes are taken (extremely unlikely)
  throw new Error('No available teacher codes. Maximum capacity reached (999 teachers).');
}
