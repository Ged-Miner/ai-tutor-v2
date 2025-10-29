import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PendingTranscriptsTable } from '@/components/teacher/pending-transcripts-table';

export default async function PendingTranscriptsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'TEACHER') {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pending Transcripts</h1>
        <p className="text-muted-foreground mt-2">
          Review and create lessons from uploaded transcripts
        </p>
      </div>

      <PendingTranscriptsTable />
    </div>
  );
}
