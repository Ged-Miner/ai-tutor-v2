'use client';

import { useState } from 'react';
import { LessonSummary } from './lesson-summary';
import { ChatInterface } from './chat-interface';
import type { Message } from '@prisma/client';

interface LessonLayoutProps {
  lessonId: string;
  studentId: string;
  lessonTitle: string;
  lessonSummary: string | null;
  initialMessages: Message[];
}

export function LessonLayout({
  lessonId,
  studentId,
  lessonTitle,
  lessonSummary,
  initialMessages,
}: LessonLayoutProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'chat'>('summary');

  return (
    <>
      {/* Mobile Tabs - Only visible below md breakpoint */}
      <div className="md:hidden flex border-b bg-background">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'summary'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'chat'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
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
            <div className="border-b bg-background px-6 py-3">
              <h2 className="font-semibold">AI Tutor</h2>
              <p className="text-xs text-muted-foreground">
                Ask questions about this lesson
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatInterface
                lessonId={lessonId}
                studentId={studentId}
                initialMessages={initialMessages}
              />
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
          <div className="border-b bg-background px-6 py-3">
            <h2 className="font-semibold">AI Tutor</h2>
            <p className="text-xs text-muted-foreground">
              Ask questions about this lesson
            </p>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              lessonId={lessonId}
              studentId={studentId}
              initialMessages={initialMessages}
            />
          </div>
        </div>
      </div>
    </>
  );
}
