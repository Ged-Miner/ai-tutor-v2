'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MockExtensionPage() {
  const [formData, setFormData] = useState({
    teacherCode: 'TEACH001',
    courseName: 'Introduction to Biology',
    lessonTitle: 'Cell Structure and Function',
    transcript: `00:00 - Welcome to today's lesson on cell structure. We'll be covering the basic building blocks of life.

02:30 - The cell is the fundamental unit of all living organisms. Every living thing is made up of one or more cells.

05:00 - There are two main types of cells: prokaryotic and eukaryotic cells.

07:30 - Prokaryotic cells are simpler. They don't have a nucleus. Bacteria are examples of prokaryotic organisms.

10:00 - Eukaryotic cells are more complex. They have a nucleus that contains DNA. Plants, animals, and fungi all have eukaryotic cells.

12:30 - Let's talk about the cell membrane. This is the outer boundary of the cell that controls what goes in and out.

15:00 - Inside the cell, we have cytoplasm - a gel-like substance where all the cellular components float.

17:30 - The nucleus is like the control center. It contains the genetic material - DNA - which holds all the instructions for the cell.

20:00 - Mitochondria are the powerhouses of the cell. They produce energy through cellular respiration.

22:30 - In plant cells, we also have chloroplasts. These are where photosynthesis happens - converting sunlight into energy.

25:00 - The endoplasmic reticulum is like a highway system in the cell, transporting materials around.

27:30 - Ribosomes are the protein factories. They read the instructions from DNA and build proteins.

30:00 - The Golgi apparatus packages and ships proteins to where they need to go.

32:30 - Let's review the key structures: membrane, cytoplasm, nucleus, mitochondria, and in plant cells, chloroplasts.

35:00 - For homework, please read chapter 3 in your textbook and complete the cell diagram worksheet.

37:00 - Next class, we'll do a lab where you'll observe cells under a microscope. Make sure to bring your lab notebook.

40:00 - Any questions before we end? Remember, understanding cell structure is crucial for everything else we'll learn in biology.

42:00 - Great questions everyone! See you next class.`,
    duration: 45,
    source: 'mock-extension-test',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    action?: string;
    pendingTranscriptId?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/transcript/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherCode: formData.teacherCode,
          courseName: formData.courseName,
          lessonTitle: formData.lessonTitle,
          transcript: formData.transcript,
          capturedAt: new Date().toISOString(),
          metadata: {
            duration: formData.duration,
            source: formData.source,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          action: data.action,
          pendingTranscriptId: data.pendingTranscriptId,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Upload failed',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Mock Chrome Extension - Transcript Upload</CardTitle>
            <CardDescription>
              Simulate transcript uploads from the Chrome extension for testing purposes.
              This form mimics what the real Chrome extension will do.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Teacher Code */}
              <div>
                <Label htmlFor="teacherCode">Teacher Code *</Label>
                <Input
                  id="teacherCode"
                  value={formData.teacherCode}
                  onChange={(e) =>
                    setFormData({ ...formData, teacherCode: e.target.value })
                  }
                  placeholder="TEACH001"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: TEACH### (e.g., TEACH001, TEACH123)
                </p>
              </div>

              {/* Course Name */}
              <div>
                <Label htmlFor="courseName">Course Name *</Label>
                <Input
                  id="courseName"
                  value={formData.courseName}
                  onChange={(e) =>
                    setFormData({ ...formData, courseName: e.target.value })
                  }
                  placeholder="Introduction to Biology"
                  required
                />
              </div>

              {/* Lesson Title */}
              <div>
                <Label htmlFor="lessonTitle">Lesson Title *</Label>
                <Input
                  id="lessonTitle"
                  value={formData.lessonTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, lessonTitle: e.target.value })
                  }
                  placeholder="Cell Structure and Function"
                  required
                />
              </div>

              {/* Transcript */}
              <div>
                <Label htmlFor="transcript">Transcript *</Label>
                <Textarea
                  id="transcript"
                  value={formData.transcript}
                  onChange={(e) =>
                    setFormData({ ...formData, transcript: e.target.value })
                  }
                  placeholder="00:00 - Lesson content here..."
                  rows={12}
                  required
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include timestamps for better organization (e.g., &quot;00:00 - Introduction&quot;)
                </p>
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="45"
                />
              </div>

              {/* Source */}
              <div>
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                  placeholder="google-docs-voice-typing"
                />
              </div>

              {/* Result Alert */}
              {result && (
                <Alert
                  variant={result.success ? 'default' : 'destructive'}
                  className={
                    result.success ? 'border-green-200 bg-green-50' : ''
                  }
                >
                  <AlertDescription>
                    {result.success ? (
                      <div className="space-y-2">
                        <p className="font-medium text-green-900">
                          ✅ {result.message}
                        </p>
                        {result.action && (
                          <p className="text-sm text-green-700">
                            Action: <strong>{result.action}</strong>
                          </p>
                        )}
                        {result.pendingTranscriptId && (
                          <p className="text-sm text-green-700">
                            Pending Transcript ID: {result.pendingTranscriptId}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p>❌ {result.message}</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Uploading...' : 'Upload Transcript'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      teacherCode: 'TEACH001',
                      courseName: 'Introduction to Biology',
                      lessonTitle: 'Cell Structure and Function',
                      transcript: formData.transcript,
                      duration: 45,
                      source: 'mock-extension-test',
                    });
                    setResult(null);
                  }}
                >
                  Reset
                </Button>
              </div>
            </form>

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-medium text-blue-900 mb-2">
                Testing Instructions:
              </h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Use a valid teacher code from your database (e.g., TEACH001)</li>
                <li>Fill in course name and lesson title</li>
                <li>The transcript is pre-filled with sample content</li>
                <li>Click &quot;Upload Transcript&quot; to test</li>
                <li>
                  Log in as the teacher to see the pending transcript and create
                  a lesson
                </li>
                <li>
                  Upload the same lesson again within 2 hours to test the
                  &quot;append&quot; functionality
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
