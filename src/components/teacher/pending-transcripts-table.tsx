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
import { ProcessTranscriptModal } from './process-transcript-modal';
import type { PendingTranscript } from '@/types/transcript';

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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lesson Title</TableHead>
              <TableHead>Course Name</TableHead>
              <TableHead>Captured</TableHead>
              <TableHead>Suggested Course</TableHead>
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
                <TableCell>{transcript.courseName}</TableCell>
                <TableCell>
                  {new Date(transcript.capturedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {transcript.suggestedCourse ? (
                    <span className="text-green-600">
                      ✓ {transcript.suggestedCourse.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No match</span>
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
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
