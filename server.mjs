import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
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
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || `http://localhost:${port}`,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io/',
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
        });

        if (!chatSession) {
          chatSession = await prisma.chatSession.create({
            data: {
              lessonId,
              studentId,
            },
          });
        }

        // Save message to database
        const message = await prisma.message.create({
          data: {
            chatSessionId: chatSession.id,
            content,
            role,
          },
        });

        console.log('✅ Message saved to database:', message.id);

        // Broadcast message to everyone in the lesson room
        io.to(`lesson:${lessonId}`).emit('receive_message', {
          id: message.id,
          content: message.content,
          role: message.role,
          createdAt: message.createdAt.toISOString(),
        });
      } catch (error) {
        console.error('❌ Error saving message:', error);
        socket.emit('message_error', {
          error: 'Failed to save message',
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
  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`
🚀 Server ready!
   - Local:    http://localhost:${port}
   - Network:  http://${hostname}:${port}
   - Socket.io path: /socket.io/
    `);
  });

  // Start server
  httpServer.listen(port, (err) => {
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
