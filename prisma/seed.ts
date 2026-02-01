import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in development only!)
  console.log('🗑️  Clearing existing data...')
  await prisma.message.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemPrompt.deleteMany();

  // Create Admin User
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@aitutor.com',
      name: 'Admin User',
      role: Role.ADMIN,
      password: adminPassword,
    },
  });

  console.log(`${admin} created.`)


  // Create System Prompts
  console.log('💬 Creating system prompts...');
  await prisma.systemPrompt.create({
    data: {
      name: 'default_tutor_prompt',
      content: `You are an AI tutor assistant helping students understand their course material.

Your role is to:
- Answer questions about the lesson content
- Provide explanations and examples
- Help students work through problems step-by-step
- Encourage critical thinking
- Be patient and supportive

Guidelines:
- Base your answers on the lesson content provided
- If a question is outside the lesson scope, politely redirect to the lesson topics
- Never give direct answers to homework problems; instead guide students to find solutions
- Use clear, simple language appropriate for the student's level
- Encourage students to ask follow-up questions

Remember: Your goal is to help students learn and understand, not just provide answers.`,
      isActive: true,
    },
  });

  await prisma.systemPrompt.create({
    data: {
      name: 'transcript_summarizer_prompt',
      content: `You are an AI assistant that converts raw classroom transcripts into well-formatted lesson summaries.

Your task:
1. Read the raw transcript with timestamps
2. Identify main topics and key concepts
3. Organize content into clear sections with headers
4. Format the summary in Markdown
5. Preserve important examples and explanations
6. Create a logical flow that's easy to study from

Format guidelines:
- Use # for main title, ## for sections, ### for subsections
- Use bullet points for lists
- Use code blocks for code examples
- Bold important terms on first mention
- Keep language clear and concise
- Include all key information from the transcript

Output a complete, well-structured Markdown document that students can use for review and reference.`,
      isActive: true,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Admin users: 1`);
  console.log(`- System Prompts: 2`);

}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
