import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateCourseCode } from '../src/lib/utils/generate-course-code';

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

  // Create Teacher Users
  console.log('👨‍🏫 Creating teacher users...');
  const teacher1Password = await bcrypt.hash(process.env.SEED_TEACHER_PASSWORD || 'teacher123', 10);
  const teacher1 = await prisma.user.create({
    data: {
      email: 'john.smith@university.edu',
      name: 'Prof. John Smith',
      role: Role.TEACHER,
      password: teacher1Password,
    },
  });

  const teacher2Password = await bcrypt.hash(process.env.SEED_TEACHER_PASSWORD || 'teacher123', 10);
  const teacher2 = await prisma.user.create({
    data: {
      email: 'sarah.jones@university.edu',
      name: 'Dr. Sarah Jones',
      role: Role.TEACHER,
      password: teacher2Password,
    },
  });

  // Create Student Users
  console.log('👨‍🎓 Creating student users...');
  const studentPassword = await bcrypt.hash(process.env.SEED_STUDENT_PASSWORD || 'student123', 10);
  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@student.edu',
        name: 'Alice Chen',
        role: Role.STUDENT,
        password: studentPassword,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@student.edu',
        name: 'Bob Wilson',
        role: Role.STUDENT,
        password: studentPassword,
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie@student.edu',
        name: 'Charlie Brown',
        role: Role.STUDENT,
        password: studentPassword,
      },
    }),
  ]);

  // Create Courses
  console.log('📚 Creating courses...');
  const course1 = await prisma.course.create({
    data: {
      teacherId: teacher1.id,
      courseCode: await generateCourseCode(),
      name: 'Introduction to Computer Science',
      description: 'Fundamentals of programming and computer science concepts',
      settings: {
        allowLateSubmissions: true,
        gradingScale: 'standard',
      },
    },
  });

  const course2 = await prisma.course.create({
    data: {
      teacherId: teacher1.id,
      courseCode: await generateCourseCode(),
      name: 'Data Structures and Algorithms',
      description: 'Advanced data structures and algorithmic problem solving',
      settings: {
        allowLateSubmissions: false,
        gradingScale: 'curved',
      },
    },
  });

  const course3 = await prisma.course.create({
    data: {
      teacherId: teacher2.id,
      courseCode: await generateCourseCode(),
      name: 'Web Development Fundamentals',
      description: 'HTML, CSS, JavaScript and modern web frameworks',
      settings: {
        allowLateSubmissions: true,
        gradingScale: 'standard',
      },
    },
  });

  // Create Enrollments
  console.log('📝 Creating enrollments...');
  await prisma.enrollment.createMany({
    data: [
      // Alice enrolled in all courses
      { studentId: students[0].id, courseId: course1.id },
      { studentId: students[0].id, courseId: course2.id },
      { studentId: students[0].id, courseId: course3.id },
      // Bob enrolled in two courses
      { studentId: students[1].id, courseId: course1.id },
      { studentId: students[1].id, courseId: course3.id },
      // Charlie enrolled in one course
      { studentId: students[2].id, courseId: course2.id },
    ],
  });

  // Create Lessons
  console.log('📖 Creating lessons...');
  const lesson1 = await prisma.lesson.create({
    data: {
      courseId: course1.id,
      title: 'Introduction to Programming',
      lessonCode: 'CS101-L001',
      position: 1,
      rawTranscript: `[00:00] Welcome to Introduction to Programming. Today we'll cover the basics of variables and data types.
[00:30] Let's start with variables. A variable is a container that stores data values.
[01:00] In most programming languages, you declare a variable by giving it a name and optionally a type.
[01:30] For example, in Python you might write: x = 5
[02:00] This creates a variable named x and assigns it the value 5.
[02:30] Now let's talk about data types. The most common types are integers, floats, strings, and booleans.
[03:00] An integer is a whole number like 5, 10, or -3.
[03:30] A float is a decimal number like 3.14 or -0.5.
[04:00] A string is text enclosed in quotes like "Hello World".
[04:30] A boolean is either True or False.
[05:00] That's all for today. Next class we'll cover operators and expressions.`,
      summary: `# Introduction to Programming

## Topics Covered
- Variables and declarations
- Data types overview

## Key Concepts

### Variables
A variable is a container that stores data values. You declare variables by giving them names and optionally types.

**Example:**
\`\`\`python
x = 5
\`\`\`

### Data Types
1. **Integer**: Whole numbers (5, 10, -3)
2. **Float**: Decimal numbers (3.14, -0.5)
3. **String**: Text in quotes ("Hello World")
4. **Boolean**: True or False values

## Next Class
We'll cover operators and expressions.`,
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      courseId: course1.id,
      title: 'Control Flow and Conditionals',
      lessonCode: 'CS101-L002',
      position: 2,
      rawTranscript: `[00:00] Today we're learning about control flow and conditional statements.
[00:30] Control flow determines the order in which code executes.
[01:00] The most basic form is the if statement.
[01:30] An if statement checks a condition and executes code only if the condition is true.
[02:00] For example: if x > 5: print("x is greater than 5")
[02:30] You can also use else to handle the case when the condition is false.
[03:00] And elif (else if) to check multiple conditions.
[03:30] Let's look at comparison operators: ==, !=, <, >, <=, >=
[04:00] You can combine conditions using logical operators: and, or, not
[04:30] Practice these concepts with the homework assignment.`,
      summary: `# Control Flow and Conditionals

## Topics Covered
- If statements
- Else and elif clauses
- Comparison operators
- Logical operators

## Key Concepts

### If Statements
Check conditions and execute code conditionally:
\`\`\`python
if x > 5:
    print("x is greater than 5")
\`\`\`

### Else and Elif
Handle alternative conditions:
\`\`\`python
if x > 10:
    print("Large")
elif x > 5:
    print("Medium")
else:
    print("Small")
\`\`\`

### Comparison Operators
- \`==\` equal to
- \`!=\` not equal to
- \`<\` less than
- \`>\` greater than
- \`<=\` less than or equal
- \`>=\` greater than or equal

### Logical Operators
- \`and\` - both conditions must be true
- \`or\` - at least one condition must be true
- \`not\` - inverts the condition`,
    },
  });

  console.log(`${lesson2} created.`)
  const lesson3 = await prisma.lesson.create({
    data: {
      courseId: course3.id,
      title: 'HTML Fundamentals',
      lessonCode: 'WEB101-L001',
      position: 1,
      rawTranscript: `[00:00] Welcome to Web Development. Today we're starting with HTML.
[00:30] HTML stands for HyperText Markup Language.
[01:00] It's the standard language for creating web pages.
[01:30] HTML uses tags to structure content.
[02:00] Tags are enclosed in angle brackets like <p> for paragraph.
[02:30] Most tags come in pairs: an opening tag and a closing tag.
[03:00] For example: <p>This is a paragraph</p>
[03:30] Some important tags include: html, head, body, h1-h6, p, div, span
[04:00] The html tag wraps the entire document.
[04:30] The head contains metadata and the body contains visible content.
[05:00] Practice creating a simple HTML page for homework.`,
      summary: `# HTML Fundamentals

## Topics Covered
- What is HTML
- HTML tag structure
- Basic HTML tags

## Key Concepts

### HTML Basics
HTML (HyperText Markup Language) is the standard language for creating web pages.

### Tag Structure
Tags are enclosed in angle brackets and usually come in pairs:
\`\`\`html
<tagname>Content goes here</tagname>
\`\`\`

### Document Structure
\`\`\`html
<html>
  <head>
    <!-- Metadata goes here -->
  </head>
  <body>
    <!-- Visible content goes here -->
  </body>
</html>
\`\`\`

### Common Tags
- \`<h1>\` to \`<h6>\` - Headings
- \`<p>\` - Paragraph
- \`<div>\` - Division/container
- \`<span>\` - Inline container`,
    },
  });

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

  // Create sample chat sessions with messages
  console.log('💬 Creating sample chat sessions with messages...');

  // Chat session 1: Alice asking about lesson 1 (Introduction to Programming)
  const chatSession1 = await prisma.chatSession.create({
    data: {
      lessonId: lesson1.id,
      studentId: students[0].id,
    },
  });

  // Chat session 2: Bob asking about lesson 1
  const chatSession2 = await prisma.chatSession.create({
    data: {
      lessonId: lesson1.id,
      studentId: students[1].id,
    },
  });

  // Chat session 3: Alice asking about lesson 3 (HTML)
  const chatSession3 = await prisma.chatSession.create({
    data: {
      lessonId: lesson3.id,
      studentId: students[0].id,
    },
  });

  // Create messages for chat session 1 (Alice's conversation about variables)
  await prisma.message.createMany({
    data: [
      {
        chatSessionId: chatSession1.id,
        content: 'Can you explain what a variable is in simpler terms?',
        role: 'USER',
      },
      {
        chatSessionId: chatSession1.id,
        content: 'Think of a variable like a labeled box. The label is the variable name, and inside the box you put data (like a number or text). Whenever you need that data, you just refer to the box by its label. For example, if you have a box labeled "age" with the number 25 inside, you can use "age" throughout your program and it will always refer to that value of 25.',
        role: 'ASSISTANT',
      },
      {
        chatSessionId: chatSession1.id,
        content: "What's the difference between an integer and a float?",
        role: 'USER',
      },
      {
        chatSessionId: chatSession1.id,
        content: 'Great question! An integer is a whole number without any decimal point - like 5, 100, or -7. A float (short for "floating point") is a number that can have decimal places - like 3.14, -0.5, or 2.0. Even though 2.0 looks whole, it\'s still a float because of the decimal point. Use integers for counting things (like 3 apples) and floats for measurements that need precision (like 3.75 inches).',
        role: 'ASSISTANT',
      },
    ],
  });

  // Create messages for chat session 2 (Bob's conversation)
  await prisma.message.createMany({
    data: [
      {
        chatSessionId: chatSession2.id,
        content: 'I\'m confused about strings. Do they always need double quotes?',
        role: 'USER',
      },
      {
        chatSessionId: chatSession2.id,
        content: 'Good question! In Python, you can use either single quotes (\') or double quotes (") for strings - they work the same way. For example, both "Hello" and \'Hello\' are valid strings. The main reason we have both is for convenience when your string contains quotes. If your string has a single quote in it (like "It\'s sunny"), using double quotes makes it easier!',
        role: 'ASSISTANT',
      },
    ],
  });

  // Create messages for chat session 3 (Alice learning HTML)
  await prisma.message.createMany({
    data: [
      {
        chatSessionId: chatSession3.id,
        content: 'Do all HTML tags need closing tags?',
        role: 'USER',
      },
      {
        chatSessionId: chatSession3.id,
        content: 'Great question! Most HTML tags need closing tags, but there are some exceptions called "self-closing" or "void" tags. These include <img>, <br>, <hr>, <input>, and a few others. These tags don\'t need closing tags because they don\'t contain content between opening and closing tags. For example: <img src="photo.jpg"> is complete without </img>.',
        role: 'ASSISTANT',
      },
      {
        chatSessionId: chatSession3.id,
        content: 'What\'s the difference between <div> and <span>?',
        role: 'USER',
      },
      {
        chatSessionId: chatSession3.id,
        content: 'Excellent question! The main difference is how they display:\n\n- <div> is a **block-level** element - it takes up the full width available and starts on a new line. Think of it like a paragraph break.\n- <span> is an **inline** element - it only takes up as much width as needed and stays in the same line.\n\nUse <div> for larger sections and layout structure. Use <span> when you want to style just part of a line of text.',
        role: 'ASSISTANT',
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Admin users: 1`);
  console.log(`- Teachers: 2`);
  console.log(`- Students: 3`);
  console.log(`- Courses: 3`);
  console.log(`- Lessons: 3`);
  console.log(`- Enrollments: 6`);
  console.log(`- System Prompts: 2`);
  console.log(`- Chat Sessions: 3`);
  console.log(`- Messages: 10`);

}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
