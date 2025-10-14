'use client';

import ReactMarkdown from 'react-markdown';
import { Card } from '@/components/ui/card';

interface LessonSummaryProps {
  title: string;
  summary: string | null;
}

export function LessonSummary({ title, summary }: LessonSummaryProps) {
  if (!summary) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="text-muted-foreground">
          <p>No summary available for this lesson yet.</p>
          <p className="mt-2 text-sm">
            The summary will be automatically generated when the teacher uploads the transcript.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="prose">
      <ReactMarkdown>{summary}</ReactMarkdown>
    </div>
  );
}
