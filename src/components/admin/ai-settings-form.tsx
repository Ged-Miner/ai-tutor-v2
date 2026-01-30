'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  updateAISettingsSchema,
  AI_MODELS,
  REASONING_LEVELS,
  VERBOSITY_LEVELS,
  type UpdateAISettingsInput,
} from '@/lib/validations/ai-settings';

interface AISettingsFormProps {
  initialSettings: UpdateAISettingsInput;
}

export function AISettingsForm({ initialSettings }: AISettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const form = useForm<UpdateAISettingsInput>({
    resolver: zodResolver(updateAISettingsSchema),
    defaultValues: initialSettings,
  });

  const onSubmit = async (data: UpdateAISettingsInput) => {
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/settings/ai', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Transcript AI Settings */}
      <div className="space-y-4">
        <h3 className="text-md font-medium border-b pb-2">Transcript Summarizer AI</h3>
        <p className="text-sm text-muted-foreground">
          Used for automatically generating lesson summaries from transcripts
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="transcript-model">Model</Label>
            <Select
              value={form.watch('transcript.model')}
              onValueChange={(value) => form.setValue('transcript.model', value as typeof AI_MODELS[number])}
            >
              <SelectTrigger id="transcript-model">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transcript-reasoning">Reasoning</Label>
            <Select
              value={form.watch('transcript.reasoning')}
              onValueChange={(value) => form.setValue('transcript.reasoning', value as typeof REASONING_LEVELS[number])}
            >
              <SelectTrigger id="transcript-reasoning">
                <SelectValue placeholder="Select reasoning" />
              </SelectTrigger>
              <SelectContent>
                {REASONING_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transcript-verbosity">Verbosity</Label>
            <Select
              value={form.watch('transcript.verbosity')}
              onValueChange={(value) => form.setValue('transcript.verbosity', value as typeof VERBOSITY_LEVELS[number])}
            >
              <SelectTrigger id="transcript-verbosity">
                <SelectValue placeholder="Select verbosity" />
              </SelectTrigger>
              <SelectContent>
                {VERBOSITY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Chatbot AI Settings */}
      <div className="space-y-4">
        <h3 className="text-md font-medium border-b pb-2">Tutor Chatbot AI</h3>
        <p className="text-sm text-muted-foreground">
          Used for responding to student questions in lesson chat
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="chatbot-model">Model</Label>
            <Select
              value={form.watch('chatbot.model')}
              onValueChange={(value) => form.setValue('chatbot.model', value as typeof AI_MODELS[number])}
            >
              <SelectTrigger id="chatbot-model">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chatbot-reasoning">Reasoning</Label>
            <Select
              value={form.watch('chatbot.reasoning')}
              onValueChange={(value) => form.setValue('chatbot.reasoning', value as typeof REASONING_LEVELS[number])}
            >
              <SelectTrigger id="chatbot-reasoning">
                <SelectValue placeholder="Select reasoning" />
              </SelectTrigger>
              <SelectContent>
                {REASONING_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chatbot-verbosity">Verbosity</Label>
            <Select
              value={form.watch('chatbot.verbosity')}
              onValueChange={(value) => form.setValue('chatbot.verbosity', value as typeof VERBOSITY_LEVELS[number])}
            >
              <SelectTrigger id="chatbot-verbosity">
                <SelectValue placeholder="Select verbosity" />
              </SelectTrigger>
              <SelectContent>
                {VERBOSITY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-900">
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
}
