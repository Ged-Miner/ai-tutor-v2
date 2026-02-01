'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ChatSession {
  id: string;
  name: string;
  _count: {
    messages: number;
  };
}

interface ChatSessionSelectorProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  maxMessages: number | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => Promise<void>;
  onRenameSession: (sessionId: string, newName: string) => Promise<void>;
  onDeleteSession: (sessionId: string) => Promise<void>;
  isCreating?: boolean;
}

export function ChatSessionSelector({
  sessions,
  activeSessionId,
  maxMessages,
  onSelectSession,
  onCreateSession,
  onRenameSession,
  onDeleteSession,
  isCreating = false,
}: ChatSessionSelectorProps) {
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const isAtLimit = (session: ChatSession) => {
    if (maxMessages === null) return false;
    return session._count.messages >= maxMessages;
  };

  const handleOpenManageDialog = () => {
    if (activeSession) {
      setEditingName(activeSession.name);
      setManageDialogOpen(true);
    }
  };

  const handleRename = async () => {
    if (!activeSession || !editingName.trim()) return;
    setIsRenaming(true);
    try {
      await onRenameSession(activeSession.id, editingName.trim());
      setManageDialogOpen(false);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!activeSession) return;
    setIsDeleting(true);
    try {
      await onDeleteSession(activeSession.id);
      setDeleteDialogOpen(false);
      setManageDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-background">
      {/* Session Selector */}
      <div className="flex-1 min-w-0">
        <Select value={activeSessionId || ''} onValueChange={onSelectSession}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a chat" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                <div className="flex items-center gap-2">
                  <span className="truncate">{session.name}</span>
                  <Badge variant={isAtLimit(session) ? 'destructive' : 'secondary'} className="text-xs">
                    {session._count.messages}{maxMessages ? `/${maxMessages}` : ''}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Manage Button */}
      {activeSession && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenManageDialog}
          title="Manage chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>
          </svg>
        </Button>
      )}

      {/* New Chat Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onCreateSession}
        disabled={isCreating}
        title="New chat"
      >
        {isCreating ? (
          <span className="animate-spin">...</span>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M5 12h14"/>
              <path d="M12 5v14"/>
            </svg>
            New
          </>
        )}
      </Button>

      {/* Manage Dialog */}
      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Chat</DialogTitle>
            <DialogDescription>
              Rename or delete this chat session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="chat-name" className="text-sm font-medium">
                Chat Name
              </label>
              <Input
                id="chat-name"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder="Enter chat name"
                maxLength={50}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={sessions.length <= 1}
              className="sm:mr-auto"
            >
              Delete Chat
            </Button>
            <Button variant="outline" onClick={() => setManageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={isRenaming || !editingName.trim()}>
              {isRenaming ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{activeSession?.name}&rdquo;? This will permanently delete all messages in this chat. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
