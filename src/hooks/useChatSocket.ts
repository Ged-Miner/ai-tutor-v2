'use client';

import { useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';

interface Message {
  id: string;
  content: string;
  role: 'USER' | 'ASSISTANT';
  createdAt: Date;
}

interface StreamStartData {
  tempId: string;
  chatSessionId: string;
}

interface StreamDeltaData {
  tempId: string;
  delta: string;
}

interface StreamEndData {
  tempId: string;
  message: Message;
}

interface MessageError {
  error: string;
  code?: string;
  limit?: number;
}

interface UseChatSocketProps {
  chatSessionId: string;
  studentId: string;
  onMessageReceived: (message: Message) => void;
  // Streaming callbacks (optional)
  onStreamStart?: (data: StreamStartData) => void;
  onStreamDelta?: (data: StreamDeltaData) => void;
  onStreamEnd?: (data: StreamEndData) => void;
  // Error callback
  onMessageError?: (error: MessageError) => void;
}

export function useChatSocket({
  chatSessionId,
  studentId,
  onMessageReceived,
  onStreamStart,
  onStreamDelta,
  onStreamEnd,
  onMessageError,
}: UseChatSocketProps) {
  const { socket, isConnected, error } = useSocket();

  // Join the chat session room when connected
  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log(`💬 Joining session room: ${chatSessionId}`);
    socket.emit('join_session', chatSessionId);

    // Leave room on unmount
    return () => {
      console.log(`👋 Leaving session room: ${chatSessionId}`);
      socket.emit('leave_session', chatSessionId);
    };
  }, [socket, isConnected, chatSessionId]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message: Message) => {
      console.log('📨 Message received:', message);
      onMessageReceived({
        ...message,
        createdAt: new Date(message.createdAt),
      });
    };

    socket.on('receive_message', handleMessage);

    return () => {
      socket.off('receive_message', handleMessage);
    };
  }, [socket, onMessageReceived]);

  // Listen for streaming events
  useEffect(() => {
    if (!socket) return;

    const handleStreamStart = (data: StreamStartData) => {
      console.log('🔄 Stream started:', data);
      onStreamStart?.(data);
    };

    const handleStreamDelta = (data: StreamDeltaData) => {
      onStreamDelta?.(data);
    };

    const handleStreamEnd = (data: StreamEndData) => {
      console.log('✅ Stream ended:', data);
      onStreamEnd?.({
        ...data,
        message: {
          ...data.message,
          createdAt: new Date(data.message.createdAt),
        },
      });
    };

    socket.on('receive_message_stream_start', handleStreamStart);
    socket.on('receive_message_stream_delta', handleStreamDelta);
    socket.on('receive_message_stream_end', handleStreamEnd);

    return () => {
      socket.off('receive_message_stream_start', handleStreamStart);
      socket.off('receive_message_stream_delta', handleStreamDelta);
      socket.off('receive_message_stream_end', handleStreamEnd);
    };
  }, [socket, onStreamStart, onStreamDelta, onStreamEnd]);

  // Listen for message errors
  useEffect(() => {
    if (!socket) return;

    const handleMessageError = (error: MessageError) => {
      console.error('❌ Message error:', error);
      onMessageError?.(error);
    };

    socket.on('message_error', handleMessageError);

    return () => {
      socket.off('message_error', handleMessageError);
    };
  }, [socket, onMessageError]);

  // Function to send a message
  const sendMessage = useCallback((content: string, role: 'USER' | 'ASSISTANT' = 'USER') => {
    if (!socket || !isConnected) {
      console.error('❌ Cannot send message: Socket not connected');
      return false;
    }

    console.log('📤 Sending message:', { chatSessionId, studentId, content, role });
    socket.emit('send_message', {
      chatSessionId,
      studentId,
      content,
      role,
    });

    return true;
  }, [socket, isConnected, chatSessionId, studentId]);

  return {
    sendMessage,
    isConnected,
    error,
  };
}
