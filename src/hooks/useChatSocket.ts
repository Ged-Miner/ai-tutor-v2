'use client';

import { useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';

interface Message {
  id: string;
  content: string;
  role: 'USER' | 'ASSISTANT';
  createdAt: Date;
}

interface UseChatSocketProps {
  lessonId: string;
  onMessageReceived: (message: Message) => void;
}

export function useChatSocket({ lessonId, onMessageReceived }: UseChatSocketProps) {
  const { socket, isConnected, error } = useSocket();

  // Join the lesson room when connected
  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log(`📚 Joining lesson room: ${lessonId}`);
    socket.emit('join_lesson', lessonId);

    // Leave room on unmount
    return () => {
      console.log(`👋 Leaving lesson room: ${lessonId}`);
      socket.emit('leave_lesson', lessonId);
    };
  }, [socket, isConnected, lessonId]);

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

  // Function to send a message
  const sendMessage = useCallback((content: string, role: 'USER' | 'ASSISTANT' = 'USER') => {
    if (!socket || !isConnected) {
      console.error('❌ Cannot send message: Socket not connected');
      return false;
    }

    console.log('📤 Sending message:', { lessonId, content, role });
    socket.emit('send_message', {
      lessonId,
      content,
      role,
    });

    return true;
  }, [socket, isConnected, lessonId]);

  return {
    sendMessage,
    isConnected,
    error,
  };
}
