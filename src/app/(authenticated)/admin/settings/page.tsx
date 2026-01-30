import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { AISettingsForm } from '@/components/admin/ai-settings-form';
import type { AIModel, ReasoningLevel, VerbosityLevel } from '@/lib/validations/ai-settings';

// Default settings with proper types
const DEFAULT_SETTINGS: {
  model: AIModel;
  reasoning: ReasoningLevel;
  verbosity: VerbosityLevel;
} = {
  model: 'gpt-5-nano',
  reasoning: 'minimal',
  verbosity: 'medium',
};

export default async function AdminSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch current AI settings
  const [transcriptSettings, chatbotSettings] = await Promise.all([
    prisma.aISettings.findUnique({ where: { type: 'TRANSCRIPT' } }),
    prisma.aISettings.findUnique({ where: { type: 'CHATBOT' } }),
  ]);

  const initialSettings = {
    transcript: {
      model: (transcriptSettings?.model ?? DEFAULT_SETTINGS.model) as AIModel,
      reasoning: (transcriptSettings?.reasoning ?? DEFAULT_SETTINGS.reasoning) as ReasoningLevel,
      verbosity: (transcriptSettings?.verbosity ?? DEFAULT_SETTINGS.verbosity) as VerbosityLevel,
    },
    chatbot: {
      model: (chatbotSettings?.model ?? DEFAULT_SETTINGS.model) as AIModel,
      reasoning: (chatbotSettings?.reasoning ?? DEFAULT_SETTINGS.reasoning) as ReasoningLevel,
      verbosity: (chatbotSettings?.verbosity ?? DEFAULT_SETTINGS.verbosity) as VerbosityLevel,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Configure application settings
        </p>
      </div>

      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li className="text-gray-900 font-medium">Settings</li>
        </ol>
      </nav>

      {/* AI Settings Section */}
      <div className="rounded-lg border bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">AI Model Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Configure the AI models used for transcript summarization and student chat
          </p>
        </div>
        <div className="p-6">
          <AISettingsForm initialSettings={initialSettings} />
        </div>
      </div>
    </div>
  );
}
