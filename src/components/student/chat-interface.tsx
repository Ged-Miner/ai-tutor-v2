'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useChatSocket } from '@/hooks/useChatSocket';

interface Message {
  id: string;
  content: string;
  role: 'USER' | 'ASSISTANT';
  createdAt: Date;
}

interface ChatInterfaceProps {
  lessonId: string;
  studentId: string;
  initialMessages?: Message[];
}

export function ChatInterface({ lessonId, studentId, initialMessages = [] }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle incoming messages from Socket.io
  const handleMessageReceived = useCallback((message: Message) => {
    setMessages(prev => {
      // Avoid duplicates by checking if message already exists
      const exists = prev.some(m => m.id === message.id);
      if (exists) return prev;
      return [...prev, message];
    });
    setIsLoading(false);
  }, []);

  const { sendMessage, isConnected, error } = useChatSocket({
    lessonId, studentId,
    onMessageReceived: handleMessageReceived,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading || !isConnected) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Send message via Socket.io (don't add optimistically)
    const sent = sendMessage(userMessage, 'USER');

    if (!sent) {
      // If sending failed, re-enable input and show error
      setInput(userMessage); // Restore the message
      setIsLoading(false);
      alert('Failed to send message. Please check your connection.');
    }

    // Note: Message will appear when server broadcasts it back via 'receive_message'
  };

  return (
    <div className="flex flex-col h-full">
      {/* Connection Status Bar */}
      {!isConnected && (
        <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 px-4 py-2 text-sm">
          ⚠️ Disconnected - trying to reconnect...
        </div>
      )}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 px-4 py-2 text-sm">
          ❌ Error: {error}
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-lg font-medium mb-2">Start a conversation</p>
            <p className="text-sm">Ask questions about this lesson and I&apos;ll help you understand the material.</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                <Card
                  className={`max-w-[80%] p-3 ${
                    message.role === 'USER'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                </Card>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="max-w-[80%] p-3 bg-muted">
              <p className="text-sm text-muted-foreground">Thinking...</p>
            </Card>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask a question about this lesson..."
            className="min-h-[60px] max-h-[200px] resize-none"
            disabled={isLoading || !isConnected}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading || !isConnected}
            className="self-end"
          >
            Send
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
