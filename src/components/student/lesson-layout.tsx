'use client';

import { useState, useCallback } from 'react';
import { LessonSummary } from './lesson-summary';
import { ChatInterface } from './chat-interface';
import { ChatSessionSelector } from './chat-session-selector';
import type { Message } from '@prisma/client';

interface ChatSessionWithMessages {
  id: string;
  name: string;
  lessonId: string;
  studentId: string;
  messages: Message[];
  _count: {
    messages: number;
  };
}

interface LessonLayoutProps {
  lessonId: string;
  studentId: string;
  lessonTitle: string;
  lessonSummary: string | null;
  initialSessions: ChatSessionWithMessages[];
  maxMessagesPerChat: number | null;
}

export function LessonLayout({
  lessonId,
  studentId,
  lessonTitle,
  lessonSummary,
  initialSessions,
  maxMessagesPerChat,
}: LessonLayoutProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'chat'>('summary');
  const [chatSessions, setChatSessions] = useState<ChatSessionWithMessages[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    initialSessions[0]?.id ?? null
  );
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const activeSession = chatSessions.find(s => s.id === activeSessionId);

  // Handle creating a new session
  const handleCreateSession = useCallback(async () => {
    setIsCreatingSession(true);
    try {
      const response = await fetch('/api/student/chat-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const newSession = await response.json();
      // Add empty messages array for the new session
      const sessionWithMessages: ChatSessionWithMessages = {
        ...newSession,
        messages: [],
      };
      setChatSessions(prev => [...prev, sessionWithMessages]);
      setActiveSessionId(newSession.id);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create new chat. Please try again.');
    } finally {
      setIsCreatingSession(false);
    }
  }, [lessonId]);

  // Handle renaming a session
  const handleRenameSession = useCallback(async (sessionId: string, newName: string) => {
    try {
      const response = await fetch(`/api/student/chat-sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename session');
      }

      setChatSessions(prev =>
        prev.map(s => (s.id === sessionId ? { ...s, name: newName } : s))
      );
    } catch (error) {
      console.error('Error renaming session:', error);
      alert('Failed to rename chat. Please try again.');
    }
  }, []);

  // Handle deleting a session
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/student/chat-sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      setChatSessions(prev => {
        const filtered = prev.filter(s => s.id !== sessionId);
        // If we deleted the active session, switch to the first remaining one
        if (activeSessionId === sessionId && filtered.length > 0) {
          setActiveSessionId(filtered[0].id);
        }
        return filtered;
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete chat. Please try again.');
    }
  }, [activeSessionId]);

  // Handle when message limit is reached - prompt to create new session
  const handleSessionLimitReached = useCallback(() => {
    const createNew = window.confirm(
      'You\'ve reached the message limit for this chat. Would you like to start a new chat?'
    );
    if (createNew) {
      handleCreateSession();
    }
  }, [handleCreateSession]);

  // Session selector component (shared between mobile and desktop)
  const sessionSelector = (
    <ChatSessionSelector
      sessions={chatSessions.map(s => ({
        id: s.id,
        name: s.name,
        _count: s._count,
      }))}
      activeSessionId={activeSessionId}
      maxMessages={maxMessagesPerChat}
      onSelectSession={setActiveSessionId}
      onCreateSession={handleCreateSession}
      onRenameSession={handleRenameSession}
      onDeleteSession={handleDeleteSession}
      isCreating={isCreatingSession}
    />
  );

  // Chat interface with current session
  const chatInterface = activeSession ? (
    <ChatInterface
      key={activeSession.id} // Force remount when session changes
      chatSessionId={activeSession.id}
      studentId={studentId}
      initialMessages={activeSession.messages}
      onSessionLimitReached={handleSessionLimitReached}
    />
  ) : (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      No chat session selected
    </div>
  );

  return (
    <>
      {/* Mobile Tabs - Only visible below md breakpoint */}
      <div className="md:hidden flex border-b-2 border-gray-300 shadow-xl bg-background">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'summary'
              ? 'bg-primary text-white'
              : 'bg-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'chat'
              ? 'bg-primary text-white'
              : 'bg-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          AI Tutor
        </button>
      </div>

      {/* Mobile Content - Only visible below md breakpoint */}
      <div className="md:hidden flex-1 overflow-hidden">
        {activeTab === 'summary' ? (
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              <LessonSummary title={lessonTitle} summary={lessonSummary} />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col bg-muted/30">
            {sessionSelector}
            <div className="flex-1 overflow-hidden">
              {chatInterface}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Two-Panel Layout - Only visible at md breakpoint and above */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Left Panel - Lesson Summary */}
        <div className="w-1/2 border-r overflow-y-auto">
          <div className="p-6">
            <LessonSummary title={lessonTitle} summary={lessonSummary} />
          </div>
        </div>

        {/* Right Panel - Chat Interface */}
        <div className="w-1/2 flex flex-col bg-muted/30">
          {sessionSelector}
          <div className="flex-1 overflow-hidden">
            {chatInterface}
          </div>
        </div>
      </div>
    </>
  );
}
