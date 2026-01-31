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

    // Handle joining a chat session room
    socket.on('join_session', (chatSessionId) => {
      socket.join(`session:${chatSessionId}`);
      console.log(`💬 Socket ${socket.id} joined session:${chatSessionId}`);
    });

    // Handle leaving a chat session room
    socket.on('leave_session', (chatSessionId) => {
      socket.leave(`session:${chatSessionId}`);
      console.log(`👋 Socket ${socket.id} left session:${chatSessionId}`);
    });

    // Handle chat messages
    socket.on('send_message', async (data) => {
      console.log('💬 Message received:', data);

      try {
        const { chatSessionId, content, role, studentId } = data;

        // Find chat session by ID
        const chatSession = await prisma.chatSession.findUnique({
          where: { id: chatSessionId },
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
          socket.emit('message_error', {
            error: 'Chat session not found',
            code: 'SESSION_NOT_FOUND',
          });
          return;
        }

        // Verify ownership
        if (chatSession.studentId !== studentId) {
          socket.emit('message_error', {
            error: 'Access denied',
            code: 'ACCESS_DENIED',
          });
          return;
        }

        const lessonId = chatSession.lessonId;

        // Check message limit before saving
        const chatbotSettings = await prisma.aISettings.findUnique({
          where: { type: 'CHATBOT' },
        });
        const maxMessages = chatbotSettings?.maxMessagesPerChat;

        if (maxMessages !== null && maxMessages !== undefined) {
          const messageCount = await prisma.message.count({
            where: { chatSessionId: chatSession.id },
          });

          if (messageCount >= maxMessages) {
            console.log(`❌ Message limit reached: ${messageCount}/${maxMessages}`);
            socket.emit('message_error', {
              error: 'Message limit reached for this chat session',
              code: 'LIMIT_REACHED',
              limit: maxMessages,
            });
            return;
          }
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

        // Broadcast user message to everyone in the session room
        io.to(`session:${chatSessionId}`).emit('receive_message', {
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

          // Use chatbotSettings fetched earlier for limit check
          const streamingEnabled = chatbotSettings?.streaming ?? false;

          const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:${port}`;

          if (streamingEnabled) {
            // Use streaming API
            console.log('🔄 Using streaming mode...');

            // Generate a temporary ID for the streaming message
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

            // Emit stream start event
            io.to(`session:${chatSessionId}`).emit('receive_message_stream_start', {
              tempId,
              chatSessionId,
            });

            const streamApiUrl = `${baseUrl}/api/chat/generate-response-stream`;
            const streamResponse = await fetch(streamApiUrl, {
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

            if (!streamResponse.ok) {
              throw new Error(`Streaming API returned ${streamResponse.status}`);
            }

            // Process the SSE stream
            let fullContent = '';
            const reader = streamResponse.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || ''; // Keep incomplete line in buffer

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6).trim();
                  if (data === '[DONE]') {
                    continue;
                  }
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.type === 'delta') {
                      fullContent += parsed.content;
                      // Emit delta event
                      io.to(`session:${chatSessionId}`).emit('receive_message_stream_delta', {
                        tempId,
                        delta: parsed.content,
                      });
                    }
                  } catch (e) {
                    // Ignore parse errors for incomplete JSON
                  }
                }
              }
            }

            // Save the complete AI response to database
            const aiMessage = await prisma.message.create({
              data: {
                chatSessionId: chatSession.id,
                content: fullContent,
                role: 'ASSISTANT',
              },
            });

            console.log('✅ AI streaming response saved to database:', aiMessage.id);

            // Emit stream end event with the final message
            io.to(`session:${chatSessionId}`).emit('receive_message_stream_end', {
              tempId,
              message: {
                id: aiMessage.id,
                content: aiMessage.content,
                role: aiMessage.role,
                createdAt: aiMessage.createdAt.toISOString(),
              },
            });
          } else {
            // Use non-streaming API (original behavior)
            const apiUrl = `${baseUrl}/api/chat/generate-response`;
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

            // Broadcast AI response to everyone in the session room
            io.to(`session:${chatSessionId}`).emit('receive_message', {
              id: aiMessage.id,
              content: aiMessage.content,
              role: aiMessage.role,
              createdAt: aiMessage.createdAt.toISOString(),
            });
          }
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
