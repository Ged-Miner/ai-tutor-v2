'use client';

import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';

export default function TestSocketPage() {
  const { socket, isConnected, error } = useSocket();
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for test messages
    socket.on('test_response', (message: string) => {
      setMessages(prev => [...prev, `Received: ${message}`]);
    });

    return () => {
      socket.off('test_response');
    };
  }, [socket]);

  const sendTestMessage = () => {
    if (!socket) return;

    const message = `Test message at ${new Date().toLocaleTimeString()}`;
    socket.emit('test_message', message);
    setMessages(prev => [...prev, `Sent: ${message}`]);
  };

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-6">Socket.io Connection Test</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className="space-y-2">
          <p>
            <strong>Connected:</strong>{' '}
            <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
              {isConnected ? '✅ Yes' : '❌ No'}
            </span>
          </p>
          {socket && (
            <p>
              <strong>Socket ID:</strong> <code>{socket.id || 'N/A'}</code>
            </p>
          )}
          {error && (
            <p className="text-red-600">
              <strong>Error:</strong> {error}
            </p>
          )}
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Messages</h2>
        <Button
          onClick={sendTestMessage}
          disabled={!isConnected}
          className="mb-4"
        >
          Send Test Message
        </Button>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No messages yet. Click the button to send a test message.
            </p>
          ) : (
            messages.map((msg, idx) => (
              <p key={idx} className="text-sm font-mono bg-muted p-2 rounded">
                {msg}
              </p>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Check that &quot;Connected&quot; shows ✅ Yes</li>
          <li>Check that you have a Socket ID</li>
          <li>Click &quot;Send Test Message&quot;</li>
          <li>Check your terminal/console for logs</li>
          <li>If all works, Socket.io is properly set up!</li>
        </ol>
      </Card>
    </div>
  );
}
