'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import {
  updateAISettingsSchema,
  SUGGESTED_MODELS,
  REASONING_LEVELS,
  VERBOSITY_LEVELS,
  supportsNoneReasoning,
  type UpdateAISettingsInput,
} from '@/lib/validations/ai-settings';

interface AISettingsFormProps {
  initialSettings: UpdateAISettingsInput;
}

export function AISettingsForm({ initialSettings }: AISettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  // Local display state for max messages input (allows empty field while typing)
  const [maxMessagesDisplay, setMaxMessagesDisplay] = useState(
    initialSettings.chatbot.maxMessagesPerChat?.toString() ?? ''
  );

  const form = useForm<UpdateAISettingsInput>({
    resolver: zodResolver(updateAISettingsSchema),
    defaultValues: initialSettings,
  });

  // Watch for incompatible model/reasoning combinations
  const transcriptModel = form.watch('transcript.model');
  const transcriptReasoning = form.watch('transcript.reasoning');
  const chatbotModel = form.watch('chatbot.model');
  const chatbotReasoning = form.watch('chatbot.reasoning');

  const transcriptWarning =
    transcriptReasoning === 'none' && !supportsNoneReasoning(transcriptModel)
      ? `"${transcriptModel}" may not support 'none' reasoning. It will fall back to 'minimal' at runtime.`
      : null;

  const chatbotWarning =
    chatbotReasoning === 'none' && !supportsNoneReasoning(chatbotModel)
      ? `"${chatbotModel}" may not support 'none' reasoning. It will fall back to 'minimal' at runtime.`
      : null;

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
            <Input
              id="transcript-model"
              placeholder="e.g., gpt-5-nano"
              {...form.register('transcript.model')}
            />
            <p className="text-xs text-muted-foreground">
              Example models: {SUGGESTED_MODELS.join(', ')}
            </p>
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

        {/* Transcript compatibility warning */}
        {transcriptWarning && (
          <Alert className="border-yellow-200 bg-yellow-50 text-yellow-900">
            <AlertDescription>{transcriptWarning}</AlertDescription>
          </Alert>
        )}
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
            <Input
              id="chatbot-model"
              placeholder="e.g., gpt-5-nano"
              {...form.register('chatbot.model')}
            />
            <p className="text-xs text-muted-foreground">
              Example models: {SUGGESTED_MODELS.join(', ')}
            </p>
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

        {/* Chatbot compatibility warning */}
        {chatbotWarning && (
          <Alert className="border-yellow-200 bg-yellow-50 text-yellow-900">
            <AlertDescription>{chatbotWarning}</AlertDescription>
          </Alert>
        )}

        {/* Streaming Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-4 mt-4">
          <div className="space-y-0.5">
            <Label htmlFor="chatbot-streaming" className="text-base">
              Enable Streaming
            </Label>
            <p className="text-sm text-muted-foreground">
              Stream AI responses in real-time as they are generated rather than waiting for the complete response
            </p>
          </div>
          <Switch
            id="chatbot-streaming"
            checked={form.watch('chatbot.streaming')}
            onCheckedChange={(checked) => form.setValue('chatbot.streaming', checked)}
          />
        </div>

        {/* Max Messages Per Chat */}
        <div className="rounded-lg border p-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="chatbot-maxMessages" className="text-base">
                Max Messages Per Chat
              </Label>
              <p className="text-sm text-muted-foreground">
                Limit the total number of messages (user + AI) in each chat session
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="chatbot-unlimited"
                  checked={form.watch('chatbot.maxMessagesPerChat') === null}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setMaxMessagesDisplay('');
                      form.setValue('chatbot.maxMessagesPerChat', null);
                    } else {
                      setMaxMessagesDisplay('50');
                      form.setValue('chatbot.maxMessagesPerChat', 50);
                    }
                  }}
                />
                <Label htmlFor="chatbot-unlimited" className="text-sm font-normal">
                  Unlimited
                </Label>
              </div>
              {form.watch('chatbot.maxMessagesPerChat') !== null && (
                <Input
                  id="chatbot-maxMessages"
                  type="number"
                  min={0}
                  className="w-24"
                  value={maxMessagesDisplay}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setMaxMessagesDisplay(raw);
                    // Update form value when there's a valid positive number
                    const parsed = parseInt(raw, 10);
                    if (!isNaN(parsed) && parsed > 0) {
                      form.setValue('chatbot.maxMessagesPerChat', parsed);
                    }
                  }}
                  onBlur={() => {
                    // On blur: if empty or 0, toggle to unlimited
                    const parsed = parseInt(maxMessagesDisplay, 10);
                    if (!maxMessagesDisplay || isNaN(parsed) || parsed <= 0) {
                      setMaxMessagesDisplay('');
                      form.setValue('chatbot.maxMessagesPerChat', null);
                    }
                  }}
                />
              )}
            </div>
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
