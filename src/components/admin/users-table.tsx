'use client';

import { useState } from 'react';
import EditUserModal from './edit-user-modal';
import DeleteUserModal from './delete-user-modal';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
// import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  teacherCode: string | null;
  createdAt: Date;
  _count: {
    courses: number;
    enrollments: number;
    chatSessions: number;
  };
}

interface UsersTableProps {
  users: User[];
}

export default function UsersTable({ users }: UsersTableProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  return (
    <>
      <Card className="max-w-xl">
        <Table >
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">User</TableHead>
              {/* <TableHead>Role</TableHead> */}
              {/* <TableHead>Teacher Code</TableHead> */}
              {/* <TableHead>Activity</TableHead> */}
              {/* <TableHead>Joined</TableHead> */}
              <TableHead className="text-right px-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <svg className="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium">No users</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new user.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
                        <span className="text-sm font-semibold text-white">
                          {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  {/* <TableCell>
                    <Badge
                      variant={
                        user.role === 'ADMIN'
                          ? 'default'
                          : user.role === 'TEACHER'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.teacherCode ? (
                      <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                        {user.teacherCode}
                      </code>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell> */}
                  {/* <TableCell>
                    <div className="flex gap-3 text-sm">
                      {user._count.courses > 0 && (
                        <span title="Courses">📚 {user._count.courses}</span>
                      )}
                      {user._count.enrollments > 0 && (
                        <span title="Enrollments">🎓 {user._count.enrollments}</span>
                      )}
                      {user._count.chatSessions > 0 && (
                        <span title="Chat Sessions">💬 {user._count.chatSessions}</span>
                      )}
                      {user._count.courses === 0 && user._count.enrollments === 0 && user._count.chatSessions === 0 && (
                        <span className="text-muted-foreground">No activity</span>
                      )}
                    </div>
                  </TableCell> */}
                  {/* <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell> */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                        title="Edit user"
                      >
                        <Pencil className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingUser(user)}
                        title="Delete user"
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

      {/* Edit Modal */}
      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
      />
      {/* Delete Modal */}
      <DeleteUserModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        user={deletingUser}
      />
    </>
  );
}
