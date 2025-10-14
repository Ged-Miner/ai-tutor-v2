'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  autoConnect?: boolean;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = true } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't create socket if autoConnect is false
    if (!autoConnect) return;

    // Create socket connection
    const socket = io({
      path: '/socket.io/',
      transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err);
      setError(err.message);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [autoConnect]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
  };
}
