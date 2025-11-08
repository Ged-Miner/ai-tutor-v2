'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { CheckCircle2, HelpCircle } from 'lucide-react';
import { ProcessTranscriptModal } from './process-transcript-modal';
import type { PendingTranscript } from '@/types/transcript';

function CourseInfo({
  courseName,
  suggestedCourse,
}: {
  courseName: string;
  suggestedCourse: { name: string } | null;
}) {
  if (suggestedCourse) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm">
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
        <span className="text-foreground">{suggestedCourse.name}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">{courseName}</span>
    </span>
  );
}

export function PendingTranscriptsTable() {
  const router = useRouter();
  const [transcripts, setTranscripts] = useState<PendingTranscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTranscript, setSelectedTranscript] = useState<PendingTranscript | null>(null);

  // Fetch pending transcripts
  useEffect(() => {
    async function fetchTranscripts() {
      try {
        const response = await fetch('/api/teacher/pending-transcripts');

        if (!response.ok) {
          throw new Error('Failed to fetch pending transcripts');
        }

        const data = await response.json();
        setTranscripts(data.pendingTranscripts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchTranscripts();
  }, []);

  const handleProcessSuccess = () => {
    // Refresh the list
    setSelectedTranscript(null);
    router.refresh();

    // Re-fetch transcripts
    setLoading(true);
    fetch('/api/teacher/pending-transcripts')
      .then(res => res.json())
      .then(data => {
        setTranscripts(data.pendingTranscripts);
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading pending transcripts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (transcripts.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No pending transcripts. Upload a transcript from the Chrome extension to get started.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lesson Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead className="hidden lg:table-cell">Captured</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transcripts.map((transcript) => (
              <TableRow key={transcript.id}>
                <TableCell className="font-medium">
                  {transcript.lessonTitle}
                </TableCell>
                <TableCell>
                  <CourseInfo
                    courseName={transcript.courseName}
                    suggestedCourse={transcript.suggestedCourse}
                  />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {new Date(transcript.capturedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="max-w-3xs truncate text-muted-foreground">
                  {transcript.rawTranscript.substring(0, 100)}...
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => setSelectedTranscript(transcript)}
                  >
                    Create Lesson
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {transcripts.map((transcript) => (
          <Card key={transcript.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{transcript.lessonTitle}</h3>
                  <div className="flex flex-col gap-2 mt-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Course</span>
                      <div className="mt-1">
                        <CourseInfo
                          courseName={transcript.courseName}
                          suggestedCourse={transcript.suggestedCourse}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="text-xs font-medium">Captured:</span> {new Date(transcript.capturedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setSelectedTranscript(transcript)}
                  className="shrink-0"
                >
                  Create Lesson
                </Button>
              </div>
              <div className="text-sm text-muted-foreground line-clamp-2 border-t pt-2">
                {transcript.rawTranscript}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedTranscript && (
        <ProcessTranscriptModal
          transcript={selectedTranscript}
          onClose={() => setSelectedTranscript(null)}
          onSuccess={handleProcessSuccess}
        />
      )}
    </>
  );
}
