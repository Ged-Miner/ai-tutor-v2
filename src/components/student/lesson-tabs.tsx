'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';

interface LessonTabsProps {
  summary: string | null;
  rawTranscript: string;
}

export function LessonTabs({ summary, rawTranscript }: LessonTabsProps) {
  const [activeTab, setActiveTab] = useState(summary ? 'summary' : 'transcript');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="summary" disabled={!summary}>
          📝 Summary
          {!summary && ' (Not Available)'}
        </TabsTrigger>
        <TabsTrigger value="transcript">
          📄 Full Transcript
        </TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="mt-6">
        {summary ? (
          <Card>
            <CardHeader>
              <CardTitle>Lesson Summary</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <p>No summary available for this lesson yet.</p>
              <p className="text-sm mt-2">
                Check back later or view the full transcript.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="transcript" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Full Lesson Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-6 rounded-lg">
              {rawTranscript}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
