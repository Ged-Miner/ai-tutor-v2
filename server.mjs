import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // changed from 'localhost'
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Create Socket.io server
  // CORS configuration for Socket.io
  const allowedOrigins = [
    process.env.NEXTAUTH_URL || 'http://localhost:3000',
    'chrome-extension://*', // Allow any Chrome extension
  ];

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, or curl)
        if (!origin) return callback(null, true);

        // Check if origin matches allowed patterns
        const isAllowed = allowedOrigins.some(allowedOrigin => {
          if (allowedOrigin.includes('*')) {
            // Pattern matching for chrome-extension://*
            const pattern = allowedOrigin.replace(/\*/g, '.*');
            return new RegExp(`^${pattern}$`).test(origin);
          }
          return origin === allowedOrigin;
        });

        if (isAllowed) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    },
  });

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    // Handle joining a lesson room
    socket.on('join_lesson', (lessonId) => {
      socket.join(`lesson:${lessonId}`);
      console.log(`📚 Socket ${socket.id} joined lesson:${lessonId}`);
    });

    // Handle leaving a lesson room
    socket.on('leave_lesson', (lessonId) => {
      socket.leave(`lesson:${lessonId}`);
      console.log(`👋 Socket ${socket.id} left lesson:${lessonId}`);
    });

    // Handle chat messages
    socket.on('send_message', async (data) => {
      console.log('💬 Message received:', data);

      try {
        const { lessonId, content, role, studentId } = data;

        // Find or create chat session
        let chatSession = await prisma.chatSession.findUnique({
          where: {
            lessonId_studentId: {
              lessonId,
              studentId,
            },
          },
          include: {
            messages: {
              orderBy: {
                createdAt: 'asc',
              },
              take: 20, // Include last 20 messages for context
            },
          },
        });

        if (!chatSession) {
          chatSession = await prisma.chatSession.create({
            data: {
              lessonId,
              studentId,
            },
            include: {
              messages: true,
            },
          });
        }

        // Save user message to database
        const userMessage = await prisma.message.create({
          data: {
            chatSessionId: chatSession.id,
            content,
            role,
          },
        });

        console.log('✅ User message saved to database:', userMessage.id);

        // Broadcast user message to everyone in the lesson room
        io.to(`lesson:${lessonId}`).emit('receive_message', {
          id: userMessage.id,
          content: userMessage.content,
          role: userMessage.role,
          createdAt: userMessage.createdAt.toISOString(),
        });

        // Generate AI response for USER messages
        if (role === 'USER') {
          console.log('🤖 Generating AI response...');

          // Build conversation history for context
          const conversationHistory = chatSession.messages.map(msg => ({
            role: msg.role === 'USER' ? 'user' : 'assistant',
            content: msg.content,
          }));

          // Call API route to generate AI response
          const apiUrl = `${process.env.NEXTAUTH_URL || `http://localhost:${port}`}/api/chat/generate-response`;
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lessonId,
              conversationHistory,
              userMessage: content,
            }),
          });

          if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
          }

          const { response: aiResponseContent } = await response.json();

          // Save AI response to database
          const aiMessage = await prisma.message.create({
            data: {
              chatSessionId: chatSession.id,
              content: aiResponseContent,
              role: 'ASSISTANT',
            },
          });

          console.log('✅ AI response saved to database:', aiMessage.id);

          // Broadcast AI response to everyone in the lesson room
          io.to(`lesson:${lessonId}`).emit('receive_message', {
            id: aiMessage.id,
            content: aiMessage.content,
            role: aiMessage.role,
            createdAt: aiMessage.createdAt.toISOString(),
          });
        }
      } catch (error) {
        console.error('❌ Error handling message:', error);
        socket.emit('message_error', {
          error: 'Failed to process message',
        });
      }
    });

    // TEST: Handle test messages
    socket.on('test_message', (message) => {
      console.log('🧪 Test message received:', message);
      socket.emit('test_response', `Echo: ${message}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  // Start server
  httpServer.listen(port, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`
🚀 Server ready!
   - Local:    http://localhost:${port}
   - Network:  http://${hostname}:${port}
   - Socket.io path: /socket.io/
    `);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing server...');
    await prisma.$disconnect();
    process.exit(0);
  });
});
