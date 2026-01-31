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
  chatSessionId: string;
  studentId: string;
  initialMessages?: Message[];
  onSessionLimitReached?: () => void;
}

// Track streaming message state
interface StreamingMessage {
  tempId: string;
  content: string;
}

export function ChatInterface({ chatSessionId, studentId, initialMessages = [], onSessionLimitReached }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [awaitingUserMessage, setAwaitingUserMessage] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<StreamingMessage | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle incoming messages from Socket.io (non-streaming)
  const handleMessageReceived = useCallback((message: Message) => {
    setMessages(prev => {
      // Avoid duplicates by checking if message already exists
      const exists = prev.some(m => m.id === message.id);
      if (exists) return prev;
      return [...prev, message];
    });

    // If we just received the USER message we sent, now show loading
    if (message.role === 'USER' && awaitingUserMessage) {
      setAwaitingUserMessage(false);
      setIsLoading(true);
    }
    // If we received an ASSISTANT message, stop loading
    else if (message.role === 'ASSISTANT') {
      setIsLoading(false);
    }
  }, [awaitingUserMessage]);

  // Handle streaming start
  const handleStreamStart = useCallback(({ tempId }: { tempId: string; chatSessionId: string }) => {
    setIsLoading(false); // Stop showing "Thinking..." since we're now streaming
    setStreamingMessage({ tempId, content: '' });
  }, []);

  // Handle streaming delta (new chunk of text)
  const handleStreamDelta = useCallback(({ tempId, delta }: { tempId: string; delta: string }) => {
    setStreamingMessage(prev => {
      if (!prev || prev.tempId !== tempId) return prev;
      return { ...prev, content: prev.content + delta };
    });
  }, []);

  // Handle streaming end
  const handleStreamEnd = useCallback(({ tempId, message }: { tempId: string; message: Message }) => {
    setStreamingMessage(prev => {
      // Only clear if it matches the current streaming message
      if (prev?.tempId === tempId) {
        return null;
      }
      return prev;
    });

    // Add the final message to the messages list
    setMessages(prev => {
      const exists = prev.some(m => m.id === message.id);
      if (exists) return prev;
      return [...prev, message];
    });
  }, []);

  // Handle message errors (including limit reached)
  const handleMessageError = useCallback((error: { error: string; code?: string; limit?: number }) => {
    setAwaitingUserMessage(false);
    setIsLoading(false);

    if (error.code === 'LIMIT_REACHED') {
      setLimitReached(true);
      setMessageError(`Message limit reached (${error.limit} messages). Please create a new chat.`);
      // Notify parent component so it can offer to create a new session
      onSessionLimitReached?.();
    } else {
      setMessageError(error.error);
      // Clear non-limit errors after 5 seconds
      setTimeout(() => setMessageError(null), 5000);
    }
  }, [onSessionLimitReached]);

  const { sendMessage, isConnected, error } = useChatSocket({
    chatSessionId,
    studentId,
    onMessageReceived: handleMessageReceived,
    onStreamStart: handleStreamStart,
    onStreamDelta: handleStreamDelta,
    onStreamEnd: handleStreamEnd,
    onMessageError: handleMessageError,
  });

  // Auto-scroll to bottom when new messages arrive or streaming content updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading || !isConnected) return;

    const userMessage = input.trim();
    setInput('');
    setAwaitingUserMessage(true);

    // Send message via Socket.io (don't add optimistically)
    const sent = sendMessage(userMessage, 'USER');

    if (!sent) {
      // If sending failed, re-enable input and show error
      setInput(userMessage); // Restore the message
      setAwaitingUserMessage(false);
      alert('Failed to send message. Please check your connection.');
    }

    // Note: Message will appear when server broadcasts it back via 'receive_message'
    // Loading state will be set to true when USER message is received
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
          Connection error: {error}
        </div>
      )}
      {messageError && (
        <div className={`px-4 py-2 text-sm ${
          limitReached
            ? 'bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100'
            : 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100'
        }`}>
          {messageError}
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

        {streamingMessage && (
          <div className="flex justify-start">
            <Card className="max-w-[80%] p-3 bg-muted">
              <p className="text-sm whitespace-pre-wrap">
                {streamingMessage.content}
                <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        {limitReached ? (
          <div className="text-center text-muted-foreground py-2">
            <p className="text-sm">This chat session has reached its message limit. Please create a new chat.</p>
          </div>
        ) : (
          <>
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
                className="min-h-15 max-h-50 resize-none"
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
          </>
        )}
      </div>
    </div>
  );
}
