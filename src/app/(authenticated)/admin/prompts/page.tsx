import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import CreatePromptButton from '@/components/admin/create-prompt-button';
import PromptsTable from '@/components/admin/prompts-table';

export default async function AdminPromptsPage() {
  // Check authentication and authorization
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch all system prompts
  const prompts = await prisma.systemPrompt.findMany({
    orderBy: [
      { isActive: 'desc' }, // Active prompts first
      { createdAt: 'desc' },
    ],
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Prompts</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage AI system prompts and their configurations
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="mt-4 flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li className="text-gray-900 font-medium">System Prompts</li>
        </ol>
      </nav>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{prompts.length}</div>
          <p className="text-sm text-muted-foreground">Total Prompts</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">
            {prompts.filter(p => p.isActive).length}
          </div>
          <p className="text-sm text-muted-foreground">Active Prompts</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">
            {prompts.reduce((sum, p) => sum + p.version, 0)}
          </div>
          <p className="text-sm text-muted-foreground">Total Versions</p>
        </div>
      </div>

      {/* Prompts Table */}
      <PromptsTable prompts={prompts} />
      <CreatePromptButton />
    </div>
  );
}
