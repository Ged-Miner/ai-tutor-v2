'use client';

import { useState } from 'react';
import EditPromptModal from './edit-prompt-modal';
import DeletePromptModal from './delete-prompt-modal';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';

interface SystemPrompt {
  id: string;
  name: string;
  content: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PromptsTableProps {
  prompts: SystemPrompt[];
}

export default function PromptsTable({ prompts }: PromptsTableProps) {
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null);
  const [deletingPrompt, setDeletingPrompt] = useState<SystemPrompt | null>(null);

  return (
    <>
      {/* Desktop Table */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prompts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <svg className="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium">No prompts</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new system prompt.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              prompts.map((prompt) => (
                <TableRow key={prompt.id}>
                  <TableCell>
                    <div className="font-medium">{prompt.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Updated {new Date(prompt.updatedAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">v{prompt.version}</Badge>
                  </TableCell>
                  <TableCell>
                    {prompt.isActive ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {prompt.content.substring(0, 60)}...
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPrompt(prompt)}
                        title="Edit prompt"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingPrompt(prompt)}
                        title="Delete prompt"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {prompts.length === 0 ? (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center">
              <svg className="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium">No prompts</h3>
              <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new system prompt.</p>
            </div>
          </Card>
        ) : (
          prompts.map((prompt) => (
            <Card key={prompt.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{prompt.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Updated {new Date(prompt.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPrompt(prompt)}
                      title="Edit prompt"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingPrompt(prompt)}
                      title="Delete prompt"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">v{prompt.version}</Badge>
                  {prompt.isActive ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {prompt.content}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Edit Modal */}
      <EditPromptModal
        isOpen={!!editingPrompt}
        onClose={() => setEditingPrompt(null)}
        prompt={editingPrompt}
      />

      {/* Delete Modal */}
      <DeletePromptModal
        isOpen={!!deletingPrompt}
        onClose={() => setDeletingPrompt(null)}
        prompt={deletingPrompt}
      />
    </>
  );
}
